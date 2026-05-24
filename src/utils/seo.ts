import {
  getContactEmail,
  getOgImageAlt,
  getOgImageUrl,
  getOrgName,
  getOrgSameAs,
  getSiteUrl,
  getTwitterCreator,
  getTwitterSite,
  HREFLANG_X_DEFAULT_LANG,
  SITE_NAME,
  SITE_ORG_LOGO_PATH,
  SITE_PREVIEW_IMAGE_PATH,
} from "../config/site";
import { getSeoFaqs, getSeoHowTo } from "../data/seoContent";
import { buildPathname, type AppLang } from "./routes";

/** Pages that are interactive calculators — get per-page SoftwareApplication schema. */
const CALCULATOR_PAGES = new Set([
  "basic", "interest", "deposit", "loan", "mortgage",
  "days", "vat", "emi", "bmi", "tax", "currency",
  "ti84", "salestax", "desmos",
]);

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
      "Free financial calculators: compound interest, loans, mortgage, EMI, VAT, tax, currency, BMI, and more. Accurate, fast, English & Russian.",
    keywords:
      "financial calculator, interest calculator, loan calculator, mortgage calculator, EMI calculator, VAT calculator, currency converter, BMI calculator, free calculator",
  },
  ru: {
    defaultDesc:
      "Бесплатные финансовые калькулятор: проценты, кредит, ипотека, EMI, НДС, налог, валюта, ИМТ. Точно и быстро, EN и RU.",
    keywords:
      "финансовый калькулятор, кредитный калькулятор, ипотека, EMI, НДС, конвертер валют, ИМТ, бесплатный калькулятор",
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

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function removeMeta(attr: "name" | "property", key: string) {
  document.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

let jsonLdId = "fc-jsonld-root";

export type BlogSeoPayload = {
  /** Path only, e.g. `/blog/compound-interest-guide` — page URL for OG / JSON-LD. */
  articlePath: string;
  alternateEnPath: string;
  alternateRuPath: string;
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

export function updatePageSeo(opts: {
  lang: AppLang;
  page: string;
  title: string;
  description: string;
  calculatorKeywords?: string;
  /** Breadcrumb first item label (e.g. localized "Home"). */
  breadcrumbHomeLabel?: string;
  /** Blog post: full Article / BlogPosting SEO + hreflang. */
  blogArticle?: BlogSeoPayload;
}) {
  const base = getSiteUrl();
  const defaultPath = buildPathname(opts.lang, opts.page, null);
  // Home page URL is bare origin (no trailing slash). Other pages use full path.
  const pathStr = defaultPath === "/" ? "" : defaultPath;
  const url = opts.blogArticle
    ? `${base}${opts.blogArticle.articlePath}`
    : pathStr
      ? `${base}${pathStr}`
      : base;
  const fullTitle = opts.blogArticle ? opts.title : `${opts.title} | ${SITE_NAME}`;
  const desc = opts.description || META[opts.lang].defaultDesc;
  const kw = opts.blogArticle
    ? [META[opts.lang].keywords, opts.blogArticle.keywords].filter(Boolean).join(", ")
    : [META[opts.lang].keywords, opts.calculatorKeywords].filter(Boolean).join(", ") ||
      META[opts.lang].keywords;

  const ogImageRaw = opts.blogArticle?.imageUrl ?? getOgImageUrl();
  const ogImage = normalizeSocialImage(ogImageRaw);
  const ogAlt = opts.blogArticle?.imageAlt ?? getOgImageAlt(opts.lang);
  const orgName = getOrgName();
  const homeLabel = opts.breadcrumbHomeLabel ?? "Home";

  document.documentElement.lang = opts.lang === "ru" ? "ru" : "en";
  document.title = fullTitle;

  setMeta("name", "description", desc);
  setMeta("name", "keywords", kw);
  const isNotFoundPage = opts.page === "notfound";
  const isNoindexPage = isNotFoundPage || opts.page === "privacy" || opts.page === "terms";
  setMeta(
    "name",
    "robots",
    isNoindexPage
      ? "noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  );

  setMeta("property", "og:type", opts.blogArticle ? "article" : "website");
  setMeta("property", "og:site_name", orgName);
  setMeta("property", "og:title", fullTitle);
  setMeta("property", "og:description", desc);
  setMeta("property", "og:url", url);
  setMeta("property", "og:locale", opts.lang === "ru" ? "ru_RU" : "en_US");
  setMeta("property", "og:image", ogImage);
  setMeta("property", "og:image:type", ogImageMimeType(ogImage));
  setMeta("property", "og:image:width", "1200");
  setMeta("property", "og:image:height", "630");
  setMeta("property", "og:image:alt", ogAlt);
  setMeta("property", "og:image:secure_url", ogImage);

  if (opts.blogArticle) {
    setMeta("property", "article:published_time", `${opts.blogArticle.datePublished}T08:00:00.000Z`);
    setMeta("property", "article:modified_time", `${opts.blogArticle.dateModified}T08:00:00.000Z`);
    setMeta("property", "article:author", opts.blogArticle.authorName);
    setMeta(
      "property",
      "article:section",
      opts.blogArticle.articleSection ?? "Personal finance",
    );
  } else {
    removeMeta("property", "article:published_time");
    removeMeta("property", "article:modified_time");
    removeMeta("property", "article:author");
    removeMeta("property", "article:section");
  }

  document.querySelectorAll('meta[property="og:locale:alternate"]').forEach(el => el.remove());
  if (opts.lang === "en") {
    const m = document.createElement("meta");
    m.setAttribute("property", "og:locale:alternate");
    m.content = "ru_RU";
    document.head.appendChild(m);
  } else {
    const m = document.createElement("meta");
    m.setAttribute("property", "og:locale:alternate");
    m.content = "en_US";
    document.head.appendChild(m);
  }

  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", fullTitle);
  setMeta("name", "twitter:description", desc);
  setMeta("name", "twitter:image", ogImage);
  setMeta("name", "twitter:image:alt", ogAlt);
  const twSite = getTwitterSite();
  const twCreator = getTwitterCreator();
  if (twSite) setMeta("name", "twitter:site", `@${twSite}`);
  else removeMeta("name", "twitter:site");
  if (twCreator) setMeta("name", "twitter:creator", `@${twCreator}`);
  else removeMeta("name", "twitter:creator");

  document.querySelectorAll('link[rel="canonical"]').forEach(el => el.remove());
  if (!isNotFoundPage) {
    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = url;
    document.head.appendChild(canonical);
  }

  document.querySelectorAll('link[data-fc-hreflang="1"]').forEach(el => el.remove());
  if (!isNotFoundPage) {
    const enPath = buildPathname("en", opts.page, null);
    const ruPath = buildPathname("ru", opts.page, null);
    const enUrl = opts.blogArticle
      ? `${base}${opts.blogArticle.alternateEnPath}`
      : enPath === "/" ? base : `${base}${enPath}`;
    const ruUrl = opts.blogArticle
      ? `${base}${opts.blogArticle.alternateRuPath}`
      : ruPath === "/" ? base : `${base}${ruPath}`;
    const xDefaultUrl = HREFLANG_X_DEFAULT_LANG === "ru" ? ruUrl : enUrl;
    for (const [hreflang, href] of [
      ["en", enUrl],
      ["ru", ruUrl],
      ["x-default", xDefaultUrl],
    ] as const) {
      const l = document.createElement("link");
      l.rel = "alternate";
      l.hreflang = hreflang;
      l.href = href;
      l.setAttribute("data-fc-hreflang", "1");
      document.head.appendChild(l);
    }
  }

  const faqs = opts.blogArticle ? [] : getSeoFaqs(opts.lang, opts.page);
  const howTo = opts.blogArticle ? null : getSeoHowTo(opts.lang, opts.page);
  injectJsonLd({
    base,
    lang: opts.lang,
    page: opts.page,
    pageTitle: opts.title,
    pageUrl: url,
    homeLabel,
    faqs,
    howTo,
    orgName,
    blogArticle: opts.blogArticle,
  });
}

function injectJsonLd(opts: {
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
}) {
  const existing = document.getElementById(jsonLdId);
  if (existing) existing.remove();

  const sameAs = getOrgSameAs();
  const email = getContactEmail();
  const orgLogoUrl = `${opts.base}${SITE_ORG_LOGO_PATH}`;
  const previewImageUrl = `${opts.base}${SITE_PREVIEW_IMAGE_PATH}`;

  const org: Record<string, unknown> = {
    "@type": "Organization",
    "@id": `${opts.base}/#org`,
    name: opts.orgName,
    url: opts.base,
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
    const contactPath = buildPathname(opts.lang, "contact", null);
    org.contactPoint = {
      "@type": "ContactPoint",
      contactType: "customer support",
      email,
      url: `${opts.base}${contactPath}`,
    };
  }

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": `${opts.base}/#website`,
      url: opts.base,
      name: opts.orgName,
      /* Russian listed first = primary market signal; both locales remain indexed via hreflang. */
      inLanguage: ["ru-RU", "en-US"],
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
    {
      "@type": "WebApplication",
      name: opts.orgName,
      url: opts.base,
      image: previewImageUrl,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      inLanguage: ["en-US", "ru-RU"],
    },
  ];

  if (opts.page === "home" && !opts.blogArticle) {
    graph.splice(1, 0, {
      "@type": "WebPage",
      "@id": `${opts.pageUrl}#webpage`,
      url: opts.pageUrl,
      name: opts.pageTitle,
      isPartOf: { "@id": `${opts.base}/#website` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: previewImageUrl,
        width: 1200,
        height: 630,
      },
    });
  }

  if (opts.blogArticle) {
    const homeUrl = `${opts.base}${buildPathname(opts.lang, "home") === "/" ? "" : buildPathname(opts.lang, "home")}`;
    const blogIndexPath = opts.lang === "ru" ? "/ru/blog" : "/blog";
    const blogIndexUrl = `${opts.base}${blogIndexPath}`;
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
    const imageList: Record<string, unknown>[] = [heroImageObject, ...extraImages];

    const blogPosting: Record<string, unknown> = {
      "@type": "BlogPosting",
      "@id": `${opts.pageUrl}#article`,
      url: opts.pageUrl,
      mainEntityOfPage: { "@type": "WebPage", "@id": `${opts.pageUrl}#webpage` },
      headline: opts.blogArticle.headline,
      description: opts.blogArticle.description,
      datePublished: `${opts.blogArticle.datePublished}T08:00:00.000Z`,
      dateModified: `${opts.blogArticle.dateModified}T08:00:00.000Z`,
      author: [
        { "@type": "Person", name: opts.blogArticle.authorName, url: `${opts.base}/about` },
        { "@type": "Organization", "@id": `${opts.base}/#org` },
      ],
      publisher: { "@id": `${opts.base}/#org` },
      image: imageList,
      inLanguage: opts.lang === "ru" ? "ru-RU" : "en-US",
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
    const homeUrl = `${opts.base}${buildPathname(opts.lang, "home") === "/" ? "" : buildPathname(opts.lang, "home")}`;
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${opts.pageUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: opts.homeLabel,
          item: homeUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: opts.pageTitle,
          item: opts.pageUrl,
        },
      ],
    });
  }

  // WebPage node for every non-home page (Google/Yandex require explicit WebPage for rich results).
  if (opts.page !== "home") {
    const webPageName = opts.blogArticle ? opts.blogArticle.headline : opts.pageTitle;
    const webPage: Record<string, unknown> = {
      "@type": "WebPage",
      "@id": `${opts.pageUrl}#webpage`,
      url: opts.pageUrl,
      name: webPageName,
      isPartOf: { "@id": `${opts.base}/#website` },
      breadcrumb: { "@id": `${opts.pageUrl}#breadcrumb` },
      inLanguage: opts.lang === "ru" ? "ru-RU" : "en-US",
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

  // Per-calculator SoftwareApplication node — richer signal for each tool page.
  if (!opts.blogArticle && CALCULATOR_PAGES.has(opts.page)) {
    graph.push({
      "@type": ["WebApplication", "SoftwareApplication"],
      "@id": `${opts.pageUrl}#app`,
      name: opts.pageTitle,
      url: opts.pageUrl,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      inLanguage: opts.lang === "ru" ? "ru-RU" : "en-US",
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

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = jsonLdId;
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  });
  document.head.appendChild(script);
}
