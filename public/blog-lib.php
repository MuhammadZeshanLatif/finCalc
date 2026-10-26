<?php
// Shared helpers for blog-router.php and sitemap.php (Apache + PHP host, no build step).
// Keep render_body() in step with renderArticle() in src/lib/blogMarkdown.ts.

const FC_HTML_MARKER = '<!--fc-html-->';

function fc_config() {
  static $config = null;
  if ($config === null) $config = require __DIR__ . '/blog-config.php';
  return $config;
}

function esc($s) { return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

// Live posts only: published and due. Returns null when Supabase cannot be reached.
function fc_fetch_posts(array $query) {
  $c = fc_config();
  if ($c['anonKey'] === '' || strpos($c['anonKey'], '%%') === 0) return null;
  $query = array_merge(['select' => '*', 'status' => 'eq.published', 'published_at' => 'lte.' . gmdate('Y-m-d\TH:i:s\Z')], $query);
  $curl = curl_init($c['supabaseUrl'] . '/rest/v1/' . $c['table'] . '?' . http_build_query($query));
  curl_setopt_array($curl, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 8,
    CURLOPT_HTTPHEADER => ['apikey: ' . $c['anonKey'], 'Authorization: Bearer ' . $c['anonKey'], 'Accept: application/json'],
  ]);
  $body = curl_exec($curl);
  $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
  curl_close($curl);
  $rows = json_decode($body ?: 'null', true);
  if ($status !== 200 || !is_array($rows)) return null;
  return $rows;
}

function heading_id($text) {
  $id = trim(preg_replace('/[^a-z0-9]+/', '-', strtolower(strip_tags($text))), '-');
  return substr($id, 0, 80) ?: 'section';
}

function safe_href($url) {
  if (substr($url, 0, 2) === '//') return '';
  if ($url !== '' && ($url[0] === '/' || $url[0] === '#')) return $url;
  return preg_match('~^(https?:|mailto:|tel:)~i', $url) ? $url : '';
}

function emphasis($html) {
  $html = preg_replace('/\*\*(.+?)\*\*/', '<strong>$1</strong>', $html);
  return preg_replace('/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/', '$1<em>$2</em>', $html);
}

function inline_md($text) {
  $c = fc_config();
  $out = '';
  $cursor = 0;
  preg_match_all('/\[([^\]]+)\]\(([^)\s]+)\)/', $text, $matches, PREG_OFFSET_CAPTURE | PREG_SET_ORDER);
  foreach ($matches as $m) {
    $out .= emphasis(esc(substr($text, $cursor, $m[0][1] - $cursor)));
    $href = safe_href($m[2][0]);
    $label = emphasis(esc($m[1][0]));
    if ($href !== '') {
      $external = preg_match('~^https?:~i', $href) && strpos($href, $c['origin']) !== 0;
      $out .= '<a href="' . esc($href) . '"' . ($external ? ' target="_blank" rel="nofollow noopener noreferrer"' : '') . '>' . $label . '</a>';
    } else {
      $out .= $label;
    }
    $cursor = $m[0][1] + strlen($m[0][0]);
  }
  return $out . emphasis(esc(substr($text, $cursor)));
}

function md_cells($line) { return array_map('trim', explode('|', substr(trim($line), 1, -1))); }

// Returns ['html' => string, 'toc' => [['id','label']], 'faqs' => [['question','answer']]]
function render_body($content) {
  if (strpos(ltrim($content), FC_HTML_MARKER) === 0) {
    $html = preg_replace('~<script\b[\s\S]*?</script>~i', '', str_replace(FC_HTML_MARKER, '', $content));
    $toc = [];
    preg_match_all('~<h2[^>]*?(?:id="([^"]+)")?[^>]*>([\s\S]*?)</h2>~i', $html, $hs, PREG_SET_ORDER);
    foreach ($hs as $h) $toc[] = ['id' => $h[1] !== '' ? $h[1] : heading_id($h[2]), 'label' => trim(strip_tags($h[2]))];
    return ['html' => $html, 'toc' => $toc, 'faqs' => []];
  }
  $source = preg_replace('/^(#{2,3}\s+[^\n]+)\n(?!\n)/m', "$1\n\n", str_replace("\r\n", "\n", $content));
  $blocks = array_values(array_filter(array_map('trim', preg_split('/\n\s*\n/', $source)), 'strlen'));
  $html = '';
  $toc = [];
  $faqs = [];
  $used = [];
  $unique = function ($text) use (&$used) {
    $base = heading_id($text);
    $id = $base;
    for ($n = 2; isset($used[$id]); $n++) $id = $base . '-' . $n;
    $used[$id] = true;
    return $id;
  };
  $inFaq = false;
  for ($i = 0; $i < count($blocks); $i++) {
    $block = $blocks[$i];
    if (preg_match('/^(#{2,3})\s+(.+)$/', $block, $m)) {
      $level = strlen($m[1]);
      $text = trim($m[2]);
      if ($level === 2) $inFaq = (bool)preg_match('/frequently asked questions|\bfaqs?\b/i', $text);
      $next = $blocks[$i + 1] ?? null;
      if ($inFaq && $level === 3 && $next !== null && !preg_match('/^#{2,3}\s/', $next)) {
        $faqs[] = ['question' => $text, 'answer' => str_replace(['**', '*'], '', preg_replace('/\[([^\]]+)\]\([^)]+\)/', '$1', $next))];
        $html .= '<details class="fc-blog-faq-item mb-2" id="' . esc($unique('faq-' . $text)) . '"><summary class="fc-blog-faq-q">' . inline_md($text) . '</summary><p class="fc-blog-faq-a text-body-secondary lh-lg mb-0">' . str_replace("\n", '<br>', inline_md($next)) . '</p></details>';
        $i++;
        continue;
      }
      $id = $unique($text);
      if ($level === 2) {
        $toc[] = ['id' => $id, 'label' => $text];
        $html .= '<h2 id="' . esc($id) . '" class="fc-blog-h2 h4 text-dark mt-5 mb-3 scroll-mt-5">' . inline_md($text) . '</h2>';
      } else {
        $html .= '<h3 id="' . esc($id) . '" class="fc-blog-h3 h5 text-body mt-4 mb-2 scroll-mt-5">' . inline_md($text) . '</h3>';
      }
      continue;
    }
    if (preg_match('/^!\[([^\]]*)\]\(([^)\s]+)\)$/', $block, $m)) {
      $src = safe_href($m[2]);
      if ($src !== '') $html .= '<figure class="fc-blog-figure my-4"><img src="' . esc($src) . '" alt="' . esc($m[1]) . '" class="img-fluid rounded-3 w-100" width="1200" height="675" loading="lazy" decoding="async">' . ($m[1] !== '' ? '<figcaption class="small text-muted mt-2">' . esc($m[1]) . '</figcaption>' : '') . '</figure>';
      continue;
    }
    $lines = explode("\n", $block);
    $isTable = count($lines) >= 2
      && count(array_filter($lines, function ($l) { return preg_match('/^\|.*\|$/', trim($l)); })) === count($lines)
      && preg_match('/^(\|\s*:?-{3,}:?\s*)+\|$/', trim($lines[1]));
    if ($isTable) {
      $html .= '<figure class="fc-blog-table-wrap table-responsive my-4"><table class="table table-sm table-bordered align-middle fc-blog-table"><thead class="table-light"><tr>';
      foreach (md_cells($lines[0]) as $cell) $html .= '<th scope="col">' . inline_md($cell) . '</th>';
      $html .= '</tr></thead><tbody>';
      foreach (array_slice($lines, 2) as $row) {
        $html .= '<tr>';
        foreach (md_cells($row) as $cell) $html .= '<td>' . inline_md($cell) . '</td>';
        $html .= '</tr>';
      }
      $html .= '</tbody></table></figure>';
      continue;
    }
    $all = function ($pattern) use ($lines) { return count(array_filter($lines, function ($l) use ($pattern) { return preg_match($pattern, $l); })) === count($lines); };
    if ($all('/^[-*]\s+/')) {
      $html .= '<ul class="fc-blog-ul">';
      foreach ($lines as $l) $html .= '<li class="mb-2 text-body-secondary lh-lg">' . inline_md(preg_replace('/^[-*]\s+/', '', $l)) . '</li>';
      $html .= '</ul>';
      continue;
    }
    if ($all('/^\d+[.)]\s+/')) {
      $html .= '<ol class="fc-blog-ul">';
      foreach ($lines as $l) $html .= '<li class="mb-2 text-body-secondary lh-lg">' . inline_md(preg_replace('/^\d+[.)]\s+/', '', $l)) . '</li>';
      $html .= '</ol>';
      continue;
    }
    if ($all('/^>/')) {
      $html .= '<div class="alert my-4 fc-blog-callout alert-info text-dark" role="note"><div class="small mb-0 lh-lg">' . inline_md(implode(' ', array_map(function ($l) { return preg_replace('/^>\s?/', '', $l); }, $lines))) . '</div></div>';
      continue;
    }
    $html .= '<p class="fc-blog-p text-body-secondary lh-lg">' . implode('<br>', array_map('inline_md', $lines)) . '</p>';
  }
  return ['html' => $html, 'toc' => $toc, 'faqs' => $faqs];
}

// Links to /blog/<slug> posts that are not live (drafts, scheduled, deleted) become plain text.
// A slug is live if it is a published, due database post or a prerendered static page.
// Keep in step with unlinkDeadBlogLinks() in src/lib/blogMarkdown.ts.
function unlink_dead_blog_links($html) {
  if (strpos($html, '/blog/') === false) return $html;
  $rows = fc_fetch_posts(['select' => 'slug', 'limit' => 1000]);
  if ($rows === null) return $html; // Supabase unreachable: leave links as they are.
  $live = [];
  foreach ($rows as $row) $live[$row['slug']] = true;
  return preg_replace_callback('~<a href="(?:https://financcalculators\.com)?/blog/([a-z0-9-]+)/?(?:#[^"]*)?"[^>]*>([\s\S]*?)</a>~', function ($m) use ($live) {
    $slug = $m[1];
    if (isset($live[$slug]) || is_file(__DIR__ . '/blog/' . $slug . '/index.html')) return $m[0];
    return $m[2];
  }, $html);
}

function absolute_url($url) {
  $c = fc_config();
  return ($url !== '' && $url[0] === '/') ? $c['origin'] . $url : $url;
}

function read_minutes($content) {
  $words = preg_split('/\s+/', trim(strip_tags(str_replace(FC_HTML_MARKER, '', $content))));
  return max(1, (int)round(count(array_filter($words, 'strlen')) / 220));
}
