import {
  getContactEmail,
  getOgImageAlt,
  getOgImageUrl,
  getOrgName,
  getOrgSameAs,
  getSiteUrl,
  getTwitterCreator,
  getTwitterSite,
  SITE_NAME,
  SITE_ORG_LOGO_PATH,
  SITE_PREVIEW_IMAGE_PATH,
} from "../config/site";
import { getSeoFaqs, getSeoHowTo } from "../data/seoContent";
import {
  normalizeCanonicalUrl,
  normalizeMetaDescription,
  normalizeMetaTitle,
  withBrandSuffix,
} from "./metaLimits";
import { buildPathname, type AppLang } from "./routes";

/** Pages that are interactive calculators — get per-page SoftwareApplication schema. */
export const CALCULATOR_PAGES = new Set([
  "basic", "interest", "deposit", "loan", "mortgage",
  "days", "vat", "emi", "bmi", "tax", "currency",
  "ti84", "salestax", "desmos",
]);

const ROBOTS_INDEX = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const ROBOTS_NOINDEX = "noindex, follow";

function ogImageMimeType(url: string): string {
  const path = (url.split("?")[0] ?? "").toLowerCase();
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".gif")) return "image/gif";
  return "image/png";
}

const META = {
  en: {
    defaultDesc:
      "Free financial calculators for compound interest, loans, mortgage, EMI, VAT, tax, currency, BMI, and more. Fast, accurate tools — no sign-up required online.",
    keywords:
      "financial calculator, interest calculator, loan calculator, mortgage calculator, EMI calculator, VAT calculator, currency converter, BMI calculator, free calculator",
  },
} as const;

function normalizeSocialImage(url: string): string {
  const pathOnly = (url.split("?")[0] ?? url).toLowerCase();
  // SVG is unreliable in OG/Twitter crawlers; fall back to site default preview.
  // WebP blog heroes must pass through so each article keeps its real image in shares.
  if (pathOnly.endsWith(".svg")) {
    return getOgImageUrl();
  }
  return url;
}

const JSON_LD_ID = "fc-jsonld-root";

export type BlogSeoPayload = {
  /** Path only, e.g. `/blog/compound-interest-guide` — page URL for OG / JSON-LD. */
  articlePath: string;
  headline: string;
  description: string;
  keywords: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  imageUrl: string;
  imageAlt: string;
  /** In-article figures (absolute URLs) as ImageObject nodes after the hero. */
  articleImageGallery?: { url: string; caption?: string }[];
  blogListLabel: string;
  wordCountApprox?: number;
  videoYoutubeId?: string;
  /** VideoObject.name / iframe title */
  videoTitle?: string;
  /** BlogPosting.articleSection */
  articleSection?: string;
  faqs?: { q: string; a: string }[];
};

export type PageSeoOptions = {
  lang: AppLang;
  page: string;
  title: string;
  description: string;
  calculatorKeywords?: string;
  /** Breadcrumb first item label (e.g. localized "Home"). */
  breadcrumbHomeLabel?: string;
  /** Blog post: full Article / BlogPosting SEO. */
  blogArticle?: BlogSeoPayload;
};

export type SeoMetaTag = { attr: "name" | "property"; key: string; content: string };

/** Everything that goes into `<head>` for one route — shared by the browser and the prerender script. */
export type SeoHead = {
  lang: string;
  title: string;
  metas: SeoMetaTag[];
  canonical: string | null;
  jsonLd: Record<string, unknown>;
};

/** Meta keys this module owns; stale ones are removed on SPA navigation. */
const MANAGED_META: { attr: "name" | "property"; key: string }[] = [
  { attr: "property", key: "article:published_time" },
  { attr: "property", key: "article:modified_time" },
  { attr: "property", key: "article:author" },
  { attr: "property", key: "article:section" },
  { attr: "property", key: "og:image:width" },
  { attr: "property", key: "og:image:height" },
  { attr: "name", key: "twitter:site" },
  { attr: "name", key: "twitter:creator" },
];

export function buildSeoHead(opts: PageSeoOptions): SeoHead {
  const base = getSiteUrl();
  const isNotFoundPage = opts.page === "notfound";
  const defaultPath = buildPathname(opts.lang, opts.page, null);
  const url = normalizeCanonicalUrl(
    base,
    opts.blogArticle ? opts.blogArticle.articlePath : defaultPath,
  );
  const fullTitle = normalizeMetaTitle(withBrandSuffix(opts.title, SITE_NAME));
  const desc = normalizeMetaDescription(opts.description || META[opts.lang].defaultDesc);
  const kw = [
    META[opts.lang].keywords,
    opts.blogArticle ? opts.blogArticle.keywords : opts.calculatorKeywords,
  ]
    .filter(Boolean)
    .join(", ");

  const isDefaultImage = !opts.blogArticle?.imageUrl;
  const ogImage = normalizeSocialImage(opts.blogArticle?.imageUrl ?? getOgImageUrl());
  const ogAlt = opts.blogArticle?.imageAlt ?? getOgImageAlt();
  const orgName = getOrgName();

  const metas: SeoMetaTag[] = [];
  const add = (attr: "name" | "property", key: string, content: string) =>
    metas.push({ attr, key, content });

  add("name", "description", desc);
  add("name", "keywords", kw);
  add("name", "robots", isNotFoundPage ? ROBOTS_NOINDEX : ROBOTS_INDEX);

  add("property", "og:type", opts.blogArticle ? "article" : "website");
  add("property", "og:site_name", orgName);
  add("property", "og:title", fullTitle);
  add("property", "og:description", desc);
  add("property", "og:url", url);
  add("property", "og:locale", "en_US");
  add("property", "og:image", ogImage);
  add("property", "og:image:secure_url", ogImage);
  add("property", "og:image:type", ogImageMimeType(ogImage));
  // Only the default preview has known dimensions; blog heroes vary in size.
  if (isDefaultImage) {
    add("property", "og:image:width", "1200");
    add("property", "og:image:height", "630");
  }
  add("property", "og:image:alt", ogAlt);

  if (opts.blogArticle) {
    add("property", "article:published_time", `${opts.blogArticle.datePublished}T08:00:00.000Z`);
    add("property", "article:modified_time", `${opts.blogArticle.dateModified}T08:00:00.000Z`);
    add("property", "article:author", opts.blogArticle.authorName);
    add("property", "article:section", opts.blogArticle.articleSection ?? "Personal finance");
  }

  add("name", "twitter:card", "summary_large_image");
  add("name", "twitter:title", fullTitle);
  add("name", "twitter:description", desc);
  add("name", "twitter:image", ogImage);
  add("name", "twitter:image:alt", ogAlt);
  const twSite = getTwitterSite();
  const twCreator = getTwitterCreator();
  if (twSite) add("name", "twitter:site", `@${twSite}`);
  if (twCreator) add("name", "twitter:creator", `@${twCreator}`);

  const faqs = opts.blogArticle || isNotFoundPage ? [] : getSeoFaqs(opts.lang, opts.page);
  const howTo = opts.blogArticle || isNotFoundPage ? null : getSeoHowTo(opts.lang, opts.page);

  return {
    lang: "en",
    title: fullTitle,
    metas,
    canonical: isNotFoundPage ? null : url,
    jsonLd: buildJsonLd({
      base,
      lang: opts.lang,
      page: opts.page,
      pageTitle: opts.title,
      pageUrl: url,
      homeLabel: opts.breadcrumbHomeLabel ?? "Home",
      faqs,
      howTo,
      orgName,
      blogArticle: opts.blogArticle,
    }),
  };
}

/** Apply SEO for the current route to the live document (SPA navigation). */
export function updatePageSeo(opts: PageSeoOptions) {
  const head = buildSeoHead(opts);

  document.documentElement.lang = head.lang;
  document.title = head.title;

  const present = new Set(head.metas.map(m => `${m.attr}|${m.key}`));
  for (const m of MANAGED_META) {
    if (!present.has(`${m.attr}|${m.key}`)) {
      document.querySelector(`meta[${m.attr}="${m.key}"]`)?.remove();
    }
  }
  for (const m of head.metas) {
    let el = document.querySelector(`meta[${m.attr}="${m.key}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(m.attr, m.key);
      document.head.appendChild(el);
    }
    el.content = m.content;
  }

  document.querySelectorAll('link[rel="canonical"]').forEach(el => el.remove());
  if (head.canonical) {
    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = head.canonical;
    document.head.appendChild(canonical);
  }

  // English-only site: no hreflang / alternate locales. Clear any legacy tags.
  document.querySelectorAll('link[data-fc-hreflang="1"]').forEach(el => el.remove());
  document.querySelectorAll('meta[property="og:locale:alternate"]').forEach(el => el.remove());

  document.getElementById(JSON_LD_ID)?.remove();
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = JSON_LD_ID;
  script.textContent = JSON.stringify(head.jsonLd);
  document.head.appendChild(script);
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Serialize a SeoHead as static `<head>` markup (used by scripts/prerender.js). */
export function renderSeoHeadHtml(head: SeoHead): string {
  const lines = [`<title>${escapeAttr(head.title)}</title>`];
  for (const m of head.metas) {
    lines.push(`<meta ${m.attr}="${m.key}" content="${escapeAttr(m.content)}" />`);
  }
  if (head.canonical) lines.push(`<link rel="canonical" href="${escapeAttr(head.canonical)}" />`);
  // `<` escaped so article text can never close the script element early.
  const json = JSON.stringify(head.jsonLd).replace(/</g, "\\u003c");
  lines.push(`<script type="application/ld+json" id="${JSON_LD_ID}">${json}</script>`);
  return lines.join("\n    ");
}

function buildJsonLd(opts: {
  base: string;
  lang: AppLang;
  page: string;
  pageTitle: string;
  pageUrl: string;
  homeLabel: string;
  faqs: { q: string; a: string }[];
  howTo: { name: string; description: string; steps: string[] } | null;
  orgName: string;
  blogArticle?: BlogSeoPayload;
}): Record<string, unknown> {
  const sameAs = getOrgSameAs();
  const email = getContactEmail();
  const orgLogoUrl = `${opts.base}${SITE_ORG_LOGO_PATH}`;
  const previewImageUrl = `${opts.base}${SITE_PREVIEW_IMAGE_PATH}`;
  const homeUrl = normalizeCanonicalUrl(opts.base, "/");

  const org: Record<string, unknown> = {
    "@type": "Organization",
    "@id": `${opts.base}/#org`,
    name: opts.orgName,
    url: homeUrl,
    description: META[opts.lang].defaultDesc,
    logo: {
      "@type": "ImageObject",
      url: orgLogoUrl,
      width: 180,
      height: 180,
    },
  };
  if (sameAs.length) org.sameAs = sameAs;
  if (email) {
    org.contactPoint = {
      "@type": "ContactPoint",
      contactType: "customer support",
      email,
      url: `${opts.base}${buildPathname(opts.lang, "contact", null)}`,
    };
  }

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": `${opts.base}/#website`,
      url: homeUrl,
      name: opts.orgName,
      inLanguage: "en-US",
      description: META[opts.lang].defaultDesc,
      publisher: { "@id": `${opts.base}/#org` },
      image: {
        "@type": "ImageObject",
        url: previewImageUrl,
        width: 1200,
        height: 630,
      },
    },
    org,
  ];

  if (opts.page === "notfound") {
    return { "@context": "https://schema.org", "@graph": graph };
  }

  if (opts.page === "home" && !opts.blogArticle) {
    graph.push(
      {
        "@type": "WebPage",
        "@id": `${opts.pageUrl}#webpage`,
        url: opts.pageUrl,
        name: opts.pageTitle,
        isPartOf: { "@id": `${opts.base}/#website` },
        about: { "@id": `${opts.base}/#app` },
        inLanguage: "en-US",
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: previewImageUrl,
          width: 1200,
          height: 630,
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${opts.base}/#app`,
        name: opts.orgName,
        url: homeUrl,
        image: previewImageUrl,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@id": `${opts.base}/#org` },
        inLanguage: "en-US",
      },
    );
  }

  if (opts.blogArticle) {
    const blogIndexUrl = `${opts.base}${buildPathname(opts.lang, "blog", null)}`;
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${opts.pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: opts.homeLabel, item: homeUrl },
        { "@type": "ListItem", position: 2, name: opts.blogArticle.blogListLabel, item: blogIndexUrl },
        { "@type": "ListItem", position: 3, name: opts.blogArticle.headline, item: opts.pageUrl },
      ],
    });

    const heroImageObject = {
      "@type": "ImageObject",
      url: opts.blogArticle.imageUrl,
      caption: opts.blogArticle.imageAlt,
    };
    const gallery = opts.blogArticle.articleImageGallery ?? [];
    const extraImages = gallery
      .filter(g => g.url && g.url !== opts.blogArticle!.imageUrl)
      .map(g => ({
        "@type": "ImageObject" as const,
        url: g.url,
        ...(g.caption ? { caption: g.caption } : {}),
      }));

    const blogPosting: Record<string, unknown> = {
      "@type": "BlogPosting",
      "@id": `${opts.pageUrl}#article`,
      url: opts.pageUrl,
      mainEntityOfPage: { "@id": `${opts.pageUrl}#webpage` },
      headline: opts.blogArticle.headline,
      description: opts.blogArticle.description,
      keywords: opts.blogArticle.keywords,
      datePublished: `${opts.blogArticle.datePublished}T08:00:00.000Z`,
      dateModified: `${opts.blogArticle.dateModified}T08:00:00.000Z`,
      // Bylines are an editorial team, not a named individual — mark them as the Organization
      // (a Person named "… Editorial" is invalid author markup).
      author: {
        "@type": "Organization",
        "@id": `${opts.base}/#org`,
        name: opts.blogArticle.authorName,
        url: `${opts.base}${buildPathname(opts.lang, "about", null)}`,
      },
      publisher: { "@id": `${opts.base}/#org` },
      image: [heroImageObject, ...extraImages],
      inLanguage: "en-US",
      articleSection: opts.blogArticle.articleSection ?? "Personal finance",
      isAccessibleForFree: true,
    };
    if (opts.blogArticle.wordCountApprox) {
      blogPosting.wordCount = opts.blogArticle.wordCountApprox;
    }
    if (opts.blogArticle.videoYoutubeId) {
      const vid = opts.blogArticle.videoYoutubeId;
      const vName = opts.blogArticle.videoTitle?.trim() || opts.blogArticle.headline;
      blogPosting.video = {
        "@type": "VideoObject",
        "@id": `${opts.pageUrl}#video`,
        name: vName,
        description: opts.blogArticle.description,
        uploadDate: `${opts.blogArticle.datePublished}T08:00:00.000Z`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${vid}`,
        contentUrl: `https://www.youtube.com/watch?v=${vid}`,
        thumbnailUrl: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
        publisher: { "@id": `${opts.base}/#org` },
      };
    }
    graph.push(blogPosting);
    if (opts.blogArticle.faqs && opts.blogArticle.faqs.length > 0) {
      graph.push({
        "@type": "FAQPage",
        "@id": `${opts.pageUrl}#faq`,
        mainEntity: opts.blogArticle.faqs.map(f => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      });
    }
  } else if (opts.page !== "home") {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${opts.pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: opts.homeLabel, item: homeUrl },
        { "@type": "ListItem", position: 2, name: opts.pageTitle, item: opts.pageUrl },
      ],
    });
  }

  // WebPage node for every non-home page.
  if (opts.page !== "home") {
    const webPage: Record<string, unknown> = {
      "@type": opts.page === "about" ? "AboutPage" : opts.page === "contact" ? "ContactPage" : "WebPage",
      "@id": `${opts.pageUrl}#webpage`,
      url: opts.pageUrl,
      name: opts.blogArticle ? opts.blogArticle.headline : opts.pageTitle,
      isPartOf: { "@id": `${opts.base}/#website` },
      breadcrumb: { "@id": `${opts.pageUrl}#breadcrumb` },
      inLanguage: "en-US",
    };
    if (opts.blogArticle) {
      webPage.primaryImageOfPage = {
        "@type": "ImageObject",
        url: opts.blogArticle.imageUrl,
        caption: opts.blogArticle.imageAlt,
      };
    }
    graph.push(webPage);
  }

  // Per-calculator WebApplication node — richer signal for each tool page.
  if (!opts.blogArticle && CALCULATOR_PAGES.has(opts.page)) {
    graph.push({
      "@type": "WebApplication",
      "@id": `${opts.pageUrl}#app`,
      name: opts.pageTitle,
      url: opts.pageUrl,
      applicationCategory: opts.page === "bmi" ? "HealthApplication" : "FinanceApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": `${opts.base}/#org` },
      inLanguage: "en-US",
    });
  }

  if (opts.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${opts.pageUrl}#faq`,
      mainEntity: opts.faqs.map(f => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  if (opts.howTo && opts.howTo.steps.length > 0) {
    graph.push({
      "@type": "HowTo",
      "@id": `${opts.pageUrl}#howto`,
      name: opts.howTo.name,
      description: opts.howTo.description,
      totalTime: "PT3M",
      step: opts.howTo.steps.map((text, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: text.split(/[.!?]/)[0]?.trim().substring(0, 80) || `Step ${i + 1}`,
        text,
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
