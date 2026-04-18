import type { AppLang } from "../../utils/routes";
import { BLOG_POSTS_EN } from "./postsEn";
import { BLOG_POSTS_RU } from "./postsRu";
import type { BlogArticle } from "./types";

export * from "./types";
export { BLOG_POSTS_EN, BLOG_POSTS_RU };

export function getBlogPosts(lang: AppLang): BlogArticle[] {
  return lang === "ru" ? BLOG_POSTS_RU : BLOG_POSTS_EN;
}

export function getPostBySlug(lang: AppLang, slug: string): BlogArticle | undefined {
  return getBlogPosts(lang).find(p => p.slug === slug);
}

export function getPostByTopic(lang: AppLang, topicKey: string): BlogArticle | undefined {
  return getBlogPosts(lang).find(p => p.topicKey === topicKey);
}

export function getRelatedPosts(lang: AppLang, topicKey: string, limit = 4): BlogArticle[] {
  return getBlogPosts(lang)
    .filter(p => p.topicKey !== topicKey)
    .slice(0, limit);
}

export function getLatestPosts(lang: AppLang, limit = 5, excludeTopic?: string): BlogArticle[] {
  const all = [...getBlogPosts(lang)].sort(
    (a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime(),
  );
  return (excludeTopic ? all.filter(p => p.topicKey !== excludeTopic) : all).slice(0, limit);
}

/** Rough word count for schema.org (editorial body only). */
export function approxWordCount(post: BlogArticle): number {
  let n = 0;
  const wc = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
  for (const b of post.blocks) {
    if (b.t === "p" || b.t === "h2" || b.t === "h3") n += wc(b.text);
    if (b.t === "ul") n += b.items.reduce((a, x) => a + wc(x), 0);
    if (b.t === "callout") n += wc(b.text) + (b.title ? wc(b.title) : 0);
    if (b.t === "table") {
      n += wc(b.head.join(" "));
      n += b.rows.flat().join(" ").split(/\s+/).filter(Boolean).length;
    }
  }
  return Math.max(250, n);
}
