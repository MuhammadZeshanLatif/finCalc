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
} from "../config/site";
import { getSeoFaqs, getSeoHowTo } from "../data/seoContent";
import { buildPathname, type AppLang } from "./routes";

const META = {
  en: {
    defaultDesc:
      "Free financial calculators: compound interest, loans, mortgage, EMI, VAT, tax, currency, BMI, and more. Accurate, fast, English & Russian.",
    keywords:
      "financial calculator, interest calculator, loan calculator, mortgage calculator, EMI calculator, VAT calculator, currency converter, BMI calculator, free calculator",
  },
  ru: {
    defaultDesc:
      "Бесплатные финансовые калькуляторы: проценты, кредит, ипотека, EMI, НДС, налог, валюта, ИМТ. Точно и быстро, EN и RU.",
    keywords:
      "финансовый калькулятор, кредитный калькулятор, ипотека, EMI, НДС, конвертер валют, ИМТ, бесплатный калькулятор",
  },
} as const;

function normalizeSocialImage(url: string): string {
  const lower = url.toLowerCase();
  // Many share crawlers are inconsistent with SVG/WebP previews.
  if (lower.endsWith(".svg") || lower.endsWith(".webp")) {
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

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

let jsonLdId = "fc-jsonld-root";

export type BlogSeoPayload = {
  /** Path only, e.g. `/blog/compound-interest-guide` */
  canonicalPath: string;
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
  blogListLabel: string;
  wordCountApprox?: number;
  videoYoutubeId?: string;
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
  /** Blog post: full Article / BlogPosting SEO + correct canonical/hreflang. */
  blogArticle?: BlogSeoPayload;
}) {
  const base = getSiteUrl();
  const defaultPath = buildPathname(opts.lang, opts.page, null);
  // Home page canonical must be the bare origin (no trailing slash).
  // All other pages get their full path. Never produce a bare empty string.
  const pathStr = defaultPath === "/" ? "" : defaultPath;
  const url = opts.blogArticle
    ? `${base}${opts.blogArticle.canonicalPath}`
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
  setMeta("name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

  setMeta("property", "og:type", opts.blogArticle ? "article" : "website");
  setMeta("property", "og:site_name", orgName);
  setMeta("property", "og:title", fullTitle);
  setMeta("property", "og:description", desc);
  setMeta("property", "og:url", url);
  setMeta("property", "og:locale", opts.lang === "ru" ? "ru_RU" : "en_US");
  setMeta("property", "og:image", ogImage);
  setMeta("property", "og:image:type", "image/png");
  setMeta("property", "og:image:width", "1200");
  setMeta("property", "og:image:height", "630");
  setMeta("property", "og:image:alt", ogAlt);
  setMeta("property", "og:image:secure_url", ogImage);

  if (opts.blogArticle) {
    setMeta("property", "article:published_time", `${opts.blogArticle.datePublished}T08:00:00.000Z`);
    setMeta("property", "article:modified_time", `${opts.blogArticle.dateModified}T08:00:00.000Z`);
    setMeta("property", "article:author", opts.blogArticle.authorName);
    setMeta("property", "article:section", "Personal finance");
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

  setLink("canonical", url);

  document.querySelectorAll('link[data-fc-hreflang="1"]').forEach(el => el.remove());
  const enPath = buildPathname("en", opts.page, null);
  const ruPath = buildPathname("ru", opts.page, null);
  const enUrl = opts.blogArticle
    ? `${base}${opts.blogArticle.alternateEnPath}`
    : enPath === "/" ? base : `${base}${enPath}`;
  const ruUrl = opts.blogArticle
    ? `${base}${opts.blogArticle.alternateRuPath}`
    : ruPath === "/" ? base : `${base}${ruPath}`;
  for (const [hreflang, href] of [
    ["en", enUrl],
    ["ru", ruUrl],
    ["x-default", enUrl],
  ] as const) {
    const l = document.createElement("link");
    l.rel = "alternate";
    l.hreflang = hreflang;
    l.href = href;
    l.setAttribute("data-fc-hreflang", "1");
    document.head.appendChild(l);
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
  const logoUrl = `${opts.base}/favicon-48x48.png`;

  const org: Record<string, unknown> = {
    "@type": "Organization",
    "@id": `${opts.base}/#org`,
    name: opts.orgName,
    url: opts.base,
    logo: { "@type": "ImageObject", url: logoUrl },
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
      inLanguage: [opts.lang === "ru" ? "ru-RU" : "en-US", opts.lang === "ru" ? "en-US" : "ru-RU"],
      description: META[opts.lang].defaultDesc,
      publisher: { "@id": `${opts.base}/#org` },
    },
    org,
    {
      "@type": "WebApplication",
      name: opts.orgName,
      url: opts.base,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      inLanguage: ["en", "ru"],
    },
  ];

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

    const blogPosting: Record<string, unknown> = {
      "@type": "BlogPosting",
      "@id": `${opts.pageUrl}#article`,
      mainEntityOfPage: { "@type": "WebPage", "@id": opts.pageUrl },
      headline: opts.blogArticle.headline,
      description: opts.blogArticle.description,
      datePublished: `${opts.blogArticle.datePublished}T08:00:00.000Z`,
      dateModified: `${opts.blogArticle.dateModified}T08:00:00.000Z`,
      author: { "@type": "Organization", name: opts.blogArticle.authorName },
      publisher: { "@id": `${opts.base}/#org` },
      image: [opts.blogArticle.imageUrl],
      inLanguage: opts.lang === "ru" ? "ru-RU" : "en-US",
      articleSection: "Personal finance",
      isAccessibleForFree: true,
    };
    if (opts.blogArticle.wordCountApprox) {
      blogPosting.wordCount = opts.blogArticle.wordCountApprox;
    }
    if (opts.blogArticle.videoYoutubeId) {
      blogPosting.video = {
        "@type": "VideoObject",
        name: opts.blogArticle.headline,
        embedUrl: `https://www.youtube.com/embed/${opts.blogArticle.videoYoutubeId}`,
        thumbnailUrl: `https://i.ytimg.com/vi/${opts.blogArticle.videoYoutubeId}/hqdefault.jpg`,
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
