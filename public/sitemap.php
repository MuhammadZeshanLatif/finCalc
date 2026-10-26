<?php
// /sitemap.xml = the static sitemap (built-in pages, written by scripts/prerender.js)
// + every live blog post from the admin dashboard.
// Scheduled posts appear automatically once their publish time has passed; drafts never do.
require __DIR__ . '/blog-lib.php';

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=600');

$static = file_get_contents(__DIR__ . '/sitemap-static.xml');
$rows = fc_fetch_posts(['select' => 'slug,updated_at,published_at', 'order' => 'published_at.desc', 'limit' => 1000]);
if (!$rows) exit($static);

$c = fc_config();
$extra = '';
foreach ($rows as $row) {
  $loc = $c['origin'] . '/blog/' . $row['slug'];
  if (strpos($static, '<loc>' . $loc . '</loc>') !== false) continue;
  $mod = (!empty($row['updated_at']) && strtotime($row['updated_at']) > strtotime($row['published_at'])) ? $row['updated_at'] : $row['published_at'];
  $lastmod = substr($mod, 0, 10);
  $extra .= "  <url>\n    <loc>" . esc($loc) . "</loc>\n    <lastmod>" . esc($lastmod) . "</lastmod>\n    <priority>0.7</priority>\n  </url>\n";
}
echo str_replace('</urlset>', $extra . '</urlset>', $static);
