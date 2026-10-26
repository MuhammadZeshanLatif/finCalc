<?php
// Server-renders blog posts published from the admin dashboard (Supabase) so crawlers get the
// full article, title, meta tags, canonical and JSON-LD on first load. React then takes over.
// .htaccess sends /blog/<slug> here only when no prerendered static page exists for that slug.
// blog-shell.html is written by scripts/prerender.js: the full site layout with placeholders.
require __DIR__ . '/blog-lib.php';

$c = fc_config();
$slug = isset($_GET['slug']) ? (string)$_GET['slug'] : '';

header('Content-Type: text/html; charset=utf-8');

function fc_not_found() {
  http_response_code(404);
  header('Cache-Control: no-store');
  readfile(__DIR__ . '/404.html');
  exit;
}

if (!preg_match('/^[a-z0-9]+(-[a-z0-9]+)*$/', $slug)) fc_not_found();

$rows = fc_fetch_posts(['slug' => 'eq.' . $slug, 'limit' => 1]);
if ($rows === null) {
  // Supabase unreachable: hand over to the client app, which retries the fetch itself.
  header('Cache-Control: no-store');
  readfile(__DIR__ . '/index.html');
  exit;
}
// Draft, scheduled (not yet due) or deleted: not public.
if (count($rows) === 0) fc_not_found();

$p = $rows[0];
$shell = file_get_contents(__DIR__ . '/blog-shell.html');
$url = $c['origin'] . '/blog/' . $p['slug'];
$canonical = !empty($p['canonical_url']) ? $p['canonical_url'] : $url;
$core = !empty($p['seo_title']) ? $p['seo_title'] : $p['title'];
$branded = $core . ' | ' . $c['siteName'];
$title = mb_strlen($branded) <= 65 ? $branded : $core;
$description = !empty($p['seo_description']) ? $p['seo_description'] : $p['excerpt'];
if (mb_strlen($description) > 160) $description = rtrim(mb_substr($description, 0, 157)) . '…';
$social = !empty($p['social_description']) ? $p['social_description'] : $description;
$image = absolute_url(!empty($p['og_image']) ? $p['og_image'] : (!empty($p['image']) ? $p['image'] : '/og-image.webp'));
$imageAlt = !empty($p['image_alt']) ? $p['image_alt'] : $p['title'];
$keywords = implode(', ', array_filter(array_merge([$p['primary_keyword'] ?? ''], $p['secondary_keywords'] ?? [], $p['tags'] ?? [])));
$author = !empty($p['author']) ? $p['author'] : 'FinanceCalculator Editorial Team';
$category = !empty($p['category']) ? $p['category'] : 'Personal Finance';
$rendered = render_body($p['content']);
$rendered['html'] = unlink_dead_blog_links($rendered['html']);
$published = $p['published_at'];
// A scheduled post was saved before it went live; never report a modified date earlier than publication.
$modified = (!empty($p['updated_at']) && strtotime($p['updated_at']) > strtotime($published)) ? $p['updated_at'] : $published;
$day = substr($published, 0, 10);

// ---- JSON-LD (mirrors buildJsonLd() in src/utils/seo.ts) ----
$org = [
  '@type' => 'Organization',
  '@id' => $c['origin'] . '/#org',
  'name' => $c['siteName'],
  'url' => $c['origin'] . '/',
  'logo' => ['@type' => 'ImageObject', 'url' => $c['origin'] . '/apple-touch-icon.png', 'width' => 180, 'height' => 180],
];
$graph = [
  ['@type' => 'WebSite', '@id' => $c['origin'] . '/#website', 'url' => $c['origin'] . '/', 'name' => $c['siteName'], 'inLanguage' => 'en-US', 'publisher' => ['@id' => $c['origin'] . '/#org']],
  $org,
  [
    '@type' => 'BreadcrumbList',
    '@id' => $url . '#breadcrumb',
    'itemListElement' => [
      ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => $c['origin'] . '/'],
      ['@type' => 'ListItem', 'position' => 2, 'name' => 'Blog', 'item' => $c['origin'] . '/blog'],
      ['@type' => 'ListItem', 'position' => 3, 'name' => $p['title'], 'item' => $url],
    ],
  ],
  [
    '@type' => 'BlogPosting',
    '@id' => $url . '#article',
    'url' => $url,
    'mainEntityOfPage' => ['@id' => $url . '#webpage'],
    'headline' => $p['title'],
    'description' => $description,
    'keywords' => $keywords,
    'image' => [['@type' => 'ImageObject', 'url' => $image, 'caption' => $imageAlt]],
    'inLanguage' => 'en-US',
    'datePublished' => $published,
    'dateModified' => $modified,
    'author' => ['@type' => 'Organization', '@id' => $c['origin'] . '/#org', 'name' => $author, 'url' => $c['origin'] . '/about'],
    'publisher' => ['@id' => $c['origin'] . '/#org'],
    'articleSection' => $category,
    'isAccessibleForFree' => true,
    'wordCount' => count(array_filter(preg_split('/\s+/', strip_tags($p['content'])), 'strlen')),
  ],
  [
    '@type' => 'WebPage',
    '@id' => $url . '#webpage',
    'url' => $url,
    'name' => $p['title'],
    'isPartOf' => ['@id' => $c['origin'] . '/#website'],
    'breadcrumb' => ['@id' => $url . '#breadcrumb'],
    'inLanguage' => 'en-US',
    'primaryImageOfPage' => ['@type' => 'ImageObject', 'url' => $image, 'caption' => $imageAlt],
  ],
];
if (count($rendered['faqs'])) {
  $graph[] = ['@type' => 'FAQPage', '@id' => $url . '#faq', 'mainEntity' => array_map(function ($f) {
    return ['@type' => 'Question', 'name' => $f['question'], 'acceptedAnswer' => ['@type' => 'Answer', 'text' => $f['answer']]];
  }, $rendered['faqs'])];
}
$jsonLd = json_encode(['@context' => 'https://schema.org', '@graph' => $graph], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP);

// ---- <head> (mirrors buildSeoHead() in src/utils/seo.ts) ----
$meta = function ($attr, $key, $content) { return '<meta ' . $attr . '="' . $key . '" content="' . esc($content) . '" />'; };
$head = implode("\n    ", [
  '<title>' . esc($title) . '</title>',
  $meta('name', 'description', $description),
  $meta('name', 'keywords', $keywords),
  $meta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'),
  $meta('property', 'og:type', 'article'),
  $meta('property', 'og:site_name', $c['siteName']),
  $meta('property', 'og:title', $title),
  $meta('property', 'og:description', $social),
  $meta('property', 'og:url', $url),
  $meta('property', 'og:locale', 'en_US'),
  $meta('property', 'og:image', $image),
  $meta('property', 'og:image:secure_url', $image),
  $meta('property', 'og:image:alt', $imageAlt),
  $meta('property', 'article:published_time', $published),
  $meta('property', 'article:modified_time', $modified),
  $meta('property', 'article:author', $author),
  $meta('property', 'article:section', $category),
  $meta('name', 'twitter:card', 'summary_large_image'),
  $meta('name', 'twitter:title', $title),
  $meta('name', 'twitter:description', $social),
  $meta('name', 'twitter:image', $image),
  $meta('name', 'twitter:image:alt', $imageAlt),
  $meta('name', 'twitter:site', '@fincalculat'),
  '<link rel="canonical" href="' . esc($canonical) . '" />',
  '<script type="application/ld+json" id="fc-jsonld-root">' . $jsonLd . '</script>',
]);

// ---- body: fill the layout placeholders (mirrors dbArticleView() in DatabaseArticlePage.tsx) ----
$hero = !empty($p['image'])
  ? '<img src="' . esc($p['image']) . '" alt="' . esc($imageAlt) . '" class="img-fluid rounded border w-100" width="1200" height="675" fetchpriority="high" decoding="async">'
  : '';
$toc = '';
foreach ($rendered['toc'] as $t) $toc .= '<li class="mb-1"><a href="#' . esc($t['id']) . '" class="text-decoration-none">' . esc($t['label']) . '</a></li>';

$html = strtr($shell, [
  '<!--FC_HEAD-->' => $head,
  '<!--FC_HERO-->' => $hero,
  '<!--FC_TOC-->' => $toc,
  '<!--FC_BODY-->' => $rendered['html'],
  '%%FC_TITLE%%' => esc($p['title']),
  '%%FC_EXCERPT%%' => esc($p['excerpt']),
  '%%FC_CATEGORY%%' => esc($category),
  '%%FC_AUTHOR%%' => esc($author),
  '%%FC_DATE_ISO%%' => esc($day),
  '%%FC_DATE%%' => esc($day),
  '%%FC_READ_MIN%%' => esc(read_minutes($p['content'])),
  '%%FC_CALC_HREF%%' => esc(!empty($p['calc_link']) ? '/' . $p['calc_link'] : '/'),
]);

header('Cache-Control: public, max-age=300');
echo $html;
