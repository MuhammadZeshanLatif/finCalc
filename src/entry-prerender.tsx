/**
 * Build-time entry for scripts/prerender.js (loaded through Vite SSR, never shipped to the browser).
 * Renders each route's real markup and <head> so crawlers that skip JavaScript see full content.
 */
import { renderToString } from "react-dom/server";
import App, { routeFromPathname } from "./App";
import { getSiteUrl } from "./config/site";
import { getBlogPosts } from "./data/blog";
import { translations } from "./data/translations";
import { resolvePageSeo } from "./utils/pageSeo";
import { buildPathname, ROUTE_PAGES } from "./utils/routes";
import { buildSeoHead, renderSeoHeadHtml } from "./utils/seo";

export type PrerenderRoute = {
  /** URL path, e.g. `/`, `/loan`, `/blog/compound-interest-guide`. */
  path: string;
  /** Output file relative to dist/. */
  file: string;
  /** Included in sitemap.xml (false for the 404 page). */
  indexable: boolean;
  /** YYYY-MM-DD for <lastmod>. */
  lastmod: string;
  priority: string;
};

/** Bump when calculator / static page content changes (sitemap <lastmod>). */
const PAGES_LASTMOD = "2026-10-26";

const PAGE_PRIORITY: Record<string, string> = {
  home: "1.0",
  blog: "0.8",
  about: "0.5",
  contact: "0.4",
  privacy: "0.3",
  terms: "0.3",
  disclaimer: "0.3",
  "editorial-policy": "0.4",
};

export function listRoutes(): PrerenderRoute[] {
  const posts = getBlogPosts("en");
  const newestPost = posts.reduce((m, p) => (p.dateModified > m ? p.dateModified : m), "");
  const routes: PrerenderRoute[] = [];

  for (const page of ROUTE_PAGES) {
    if (page === "notfound") continue;
    const path = buildPathname("en", page, null);
    routes.push({
      path,
      file: path === "/" ? "index.html" : `${path.slice(1)}/index.html`,
      indexable: true,
      lastmod: page === "blog" ? newestPost : page === "home" ? maxDate(PAGES_LASTMOD, newestPost) : PAGES_LASTMOD,
      priority: PAGE_PRIORITY[page] ?? "0.9",
    });
  }
  for (const post of posts) {
    const path = buildPathname("en", "blog", post.slug);
    routes.push({ path, file: `${path.slice(1)}/index.html`, indexable: true, lastmod: post.dateModified, priority: "0.7" });
  }
  routes.push({ path: "/404", file: "404.html", indexable: false, lastmod: PAGES_LASTMOD, priority: "0" });
  return routes;
}

function maxDate(a: string, b: string): string {
  return a > b ? a : b;
}

let lazyWarm: Promise<void> | null = null;

/**
 * React.lazy only renders synchronously once its import has settled. A throwaway render of each
 * lazy route starts the import; afterwards renderToString emits the full markup, not the fallback.
 */
function warmLazyRoutes(): Promise<void> {
  lazyWarm ??= (async () => {
    for (const page of ["ti84", "desmos"]) {
      renderToString(<App initialRoute={{ lang: "en", page, blogSlug: null }} />);
    }
    await Promise.all([
      import("./components/TI84CalculatorPage"),
      import("./components/DesmosCalculatorPage"),
    ]);
    await new Promise(r => setTimeout(r, 0));
  })();
  return lazyWarm;
}

export async function renderRoute(path: string): Promise<{ head: string; body: string }> {
  await warmLazyRoutes();
  const route = routeFromPathname(path);
  const seo = buildSeoHead(resolvePageSeo(route.lang, route.page, route.blogSlug));
  return {
    head: renderSeoHeadHtml(seo),
    body: renderToString(<App initialRoute={route} />),
  };
}

/**
 * Template for posts published from the admin dashboard: the full site layout with
 * %%FC_…%% / <!--FC_…--> placeholders that public/blog-router.php fills from Supabase.
 */
export async function renderDbBlogShell(): Promise<{ body: string }> {
  await warmLazyRoutes();
  return {
    body: renderToString(<App initialRoute={{ lang: "en", page: "blog", blogSlug: "fc-db-post" }} dbShell />),
  };
}

export function siteUrl(): string {
  return getSiteUrl();
}

/** llms.txt generated from live route + blog data so it never drifts from the site. */
export function renderLlmsTxt(): string {
  const base = getSiteUrl();
  const tr = translations.en;
  const ps = tr.pageSeo as Record<string, { title: string; desc: string }>;
  const calcIds = [...Object.keys(tr.calculators), "ti84", "desmos"];
  const lines = [
    "# FinanceCalculator",
    "",
    "> Free browser-based financial calculators (mortgage, loan, EMI, compound interest, deposit, VAT, sales tax, income tax, currency, BMI, date difference, scientific and graphing calculators) plus long-form personal-finance guides. No sign-up; calculations run locally in the browser.",
    "",
    "Results are educational estimates only — not financial, tax, medical, or legal advice. Currency rates are live ECB reference rates (via Frankfurter), refreshed daily, with a demo fallback when the rate API is unreachable.",
    "",
    "## Calculators",
    "",
    ...calcIds.map(id => `- [${ps[id]?.title ?? id}](${base}${buildPathname("en", id)}): ${ps[id]?.desc ?? ""}`),
    "",
    "## Guides",
    "",
    ...getBlogPosts("en").map(p => `- [${p.title}](${base}${buildPathname("en", "blog", p.slug)}): ${p.metaDescription}`),
    "",
    "## About",
    "",
    `- [About](${base}/about): ${ps.about.desc}`,
    `- [Contact](${base}/contact): ${ps.contact.desc}`,
    `- [Privacy Policy](${base}/privacy)`,
    `- [Terms of Use](${base}/terms)`,
    `- [Disclaimer](${base}/disclaimer)`,
    `- [Editorial Policy](${base}/editorial-policy): how articles are researched, reviewed and corrected`,
    "",
    "## Optional",
    "",
    `- [Sitemap](${base}/sitemap.xml)`,
    "",
  ];
  return lines.join("\n");
}
