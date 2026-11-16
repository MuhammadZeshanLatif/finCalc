/**
 * prerender.js — Generate static HTML for every route after `vite build`.
 *
 * Usage: node scripts/prerender.js  (run after vite build; `npm run build` does both)
 *
 * Loads src/entry-prerender.tsx through Vite SSR so titles, meta, canonical, JSON-LD and
 * page markup come from the same source the browser uses — nothing is hand-copied here.
 * Writes:
 *   - dist/<route>/index.html  (full <head> + server-rendered <div id="root">)
 *   - dist/404.html            (noindex; served by Apache ErrorDocument)
 *   - dist/sitemap.xml         (indexable routes, lastmod from content dates)
 *   - dist/llms.txt, dist/llm.txt
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { createServer, loadEnv } from 'vite';

const DIST = 'dist';
const templatePath = join(DIST, 'index.html');

if (!existsSync(templatePath)) {
  console.error('ERROR: dist/index.html not found. Run `vite build` first.');
  process.exit(1);
}

const template = readFileSync(templatePath, 'utf-8');
if (template.includes('id="fc-jsonld-root"')) {
  console.error('ERROR: dist/index.html is already prerendered. Run `npm run build` (vite build first).');
  process.exit(1);
}

const vite = await createServer({
  mode: 'production',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
});

function writeOut(relativePath, content) {
  const fullPath = join(DIST, relativePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, 'utf-8');
  console.log(`  ✓ ${relativePath}`);
}

/** Drop the template's generic head tags; the per-route block replaces them. */
function stripGenericHead(html) {
  return html
    .replace(/\s*<title>[\s\S]*?<\/title>/i, '')
    .replace(/\s*<meta\s+name=["'](description|keywords|robots)["'][^>]*>/gi, '');
}

function buildPage({ head, body }) {
  let html = stripGenericHead(template);
  html = html.replace('</head>', `    ${head}\n  </head>`);
  const rootTag = '<div id="root"></div>';
  if (!html.includes(rootTag)) throw new Error('Template is missing <div id="root"></div>');
  html = html.replace(rootTag, () => `<div id="root">${body}</div>`);
  return html;
}

function sitemapXml(routes, base) {
  const urls = routes
    .filter(r => r.indexable)
    .map(r => {
      const loc = r.path === '/' ? `${base}/` : `${base}${r.path}`;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${r.lastmod}</lastmod>\n    <priority>${r.priority}</priority>\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

try {
  const mod = await vite.ssrLoadModule('/src/entry-prerender.tsx');
  const routes = mod.listRoutes();
  const base = mod.siteUrl();

  console.log(`\nPrerendering ${routes.length} routes...`);
  for (const route of routes) {
    writeOut(route.file, buildPage(await mod.renderRoute(route.path)));
  }

  // Template for admin-dashboard posts (filled by public/blog-router.php) and the /admin app shell.
  const shell = await mod.renderDbBlogShell();
  writeOut('blog-shell.html', buildPage({ head: '<!--FC_HEAD-->', body: shell.body }));
  // Keep the shared GTM tag on every page, including admin; omit optional ad and GA4 tags.
  const adminPage = buildPage({
    head: '<title>Admin — FinanceCalculator</title>\n    <meta name="robots" content="noindex, nofollow" />',
    body: '',
  }).replace(/\s*<script[^>]*(?:scripts\.mediavine\.com|data-grow-initializer|googletagmanager\.com\/(?!gtm\.js\?id=GTM-TNFDVQS8))[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/\s*<script>window\.dataLayer[\s\S]*?<\/script>/g, '');
  writeOut('admin/index.html', adminPage);

  // PHP blog renderer reads the public anon key from blog-config.php (copied from public/).
  const env = loadEnv('production', process.cwd(), 'VITE_');
  const configPath = join(DIST, 'blog-config.php');
  if (existsSync(configPath)) {
    if (!env.VITE_SUPABASE_ANON_KEY) console.warn('  ! VITE_SUPABASE_ANON_KEY not set: admin-dashboard posts will not render server-side');
    writeOut('blog-config.php', readFileSync(configPath, 'utf-8').replace('%%VITE_SUPABASE_ANON_KEY%%', env.VITE_SUPABASE_ANON_KEY || ''));
  }

  console.log('\nWriting crawler files...');
  // sitemap.xml is the fallback; Apache serves /sitemap.xml from sitemap.php, which appends
  // live admin-dashboard posts to sitemap-static.xml.
  const sitemap = sitemapXml(routes, base);
  writeOut('sitemap.xml', sitemap);
  writeOut('sitemap-static.xml', sitemap);
  const llms = mod.renderLlmsTxt();
  writeOut('llms.txt', llms);
  writeOut('llm.txt', llms);

  console.log(`\n✅ Prerendering complete — ${routes.length} pages written to dist/\n`);
} finally {
  await vite.close();
}
