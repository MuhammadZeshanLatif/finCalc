import { getSiteUrl } from "../config/site";
import { renderArticle, stripHtmlMarker } from "../lib/blogMarkdown";
import type { DbPost } from "../lib/blogPosts";
import { approxWordCount, getPostBySlug } from "../data/blog";
import type { BlogBlock } from "../data/blog/types";
import { translations } from "../data/translations";
import { buildPathname, type AppLang } from "./routes";
import type { PageSeoOptions } from "./seo";

function extractFaqPairs(blocks: BlogBlock[]): { q: string; a: string }[] {
  const pairs: { q: string; a: string }[] = [];
  for (let i = 0; i < blocks.length - 1; i++) {
    const cur = blocks[i];
    const next = blocks[i + 1];
    if (cur.t !== "h3" || next.t !== "p") continue;
    if (!cur.id.startsWith("faq-")) continue;
    pairs.push({ q: cur.text, a: next.text });
  }
  return pairs;
}

/** Resolve title / description / schema inputs for a route. Unknown blog slugs resolve to `notfound`. */
export function resolvePageSeo(lang: AppLang, page: string, blogSlug: string | null): PageSeoOptions {
  const tr = translations[lang];
  const ps = tr.pageSeo as Record<string, { title: string; desc: string } | undefined>;
  const common = { lang, breadcrumbHomeLabel: tr.home };

  if (page === "home") {
    return {
      ...common,
      page,
      title: tr.homeSeoHeadline,
      description: tr.homeSeoDescription,
      calculatorKeywords: tr.homeSeoCalculatorKeywords,
    };
  }

  if (page === "blog" && blogSlug) {
    const post = getPostBySlug(lang, blogSlug);
    if (!post) {
      return { ...common, page: "notfound", title: ps.notfound!.title, description: ps.notfound!.desc };
    }
    const siteBase = getSiteUrl();
    const toAbsAsset = (u: string) =>
      /^https?:\/\//i.test(u) ? u : `${siteBase}${u.startsWith("/") ? "" : "/"}${u}`;
    return {
      ...common,
      page,
      title: post.metaTitle,
      description: post.metaDescription,
      blogArticle: {
        articlePath: buildPathname(lang, "blog", post.slug),
        headline: post.title,
        description: post.metaDescription,
        keywords: post.keywords,
        datePublished: post.datePublished,
        dateModified: post.dateModified,
        authorName: post.author,
        imageUrl: toAbsAsset(post.hero.srcWebp ?? post.hero.src),
        imageAlt: post.hero.alt,
        articleImageGallery: post.blocks
          .filter((b): b is Extract<BlogBlock, { t: "figure" }> => b.t === "figure")
          .map(b => ({ url: toAbsAsset(b.srcWebp ?? b.src), caption: b.alt })),
        blogListLabel: tr.blog,
        wordCountApprox: approxWordCount(post),
        videoYoutubeId: post.video?.youtubeId,
        videoTitle: post.video?.title,
        articleSection: post.articleSection,
        faqs: extractFaqPairs(post.blocks),
      },
    };
  }

  const entry = ps[page] ?? ps.notfound!;
  return { ...common, page: ps[page] ? page : "notfound", title: entry.title, description: entry.desc };
}

/** SEO for a post published from the admin dashboard. Keep in step with public/blog-router.php. */
export function resolveDbPostSeo(lang: AppLang, post: DbPost): PageSeoOptions {
  const tr = translations[lang];
  const siteBase = getSiteUrl();
  const toAbsAsset = (u: string) => (/^https?:\/\//i.test(u) ? u : `${siteBase}${u.startsWith("/") ? "" : "/"}${u}`);
  const description = post.seoDescription || post.excerpt;
  const { html, faqs } = renderArticle(post.content);
  const images = [...html.matchAll(/<img src="([^"]+)" alt="([^"]*)"/g)].map(m => ({ url: toAbsAsset(m[1]), caption: m[2] }));
  const day = (iso: string) => (iso || "").slice(0, 10);
  return {
    lang,
    page: "blog",
    breadcrumbHomeLabel: tr.home,
    title: post.seoTitle || post.title,
    description,
    blogArticle: {
      articlePath: buildPathname(lang, "blog", post.slug),
      headline: post.title,
      description,
      keywords: [post.primaryKeyword, ...post.secondaryKeywords, ...post.tags].filter(Boolean).join(", "),
      datePublished: day(post.publishedAt),
      dateModified: day(post.updatedAt || post.publishedAt),
      authorName: post.author,
      imageUrl: toAbsAsset(post.ogImage || post.image || "/og-image.webp"),
      imageAlt: post.imageAlt || post.title,
      articleImageGallery: images,
      blogListLabel: tr.blog,
      wordCountApprox: stripHtmlMarker(post.content).split(/\s+/).filter(Boolean).length,
      articleSection: post.category,
      faqs: faqs.map(f => ({ q: f.question, a: f.answer })),
    },
  };
}
