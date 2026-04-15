import type { AppLang } from "../../utils/routes";
import { BLOG_POSTS_EN } from "./postsEn";
import { BLOG_POSTS_RU } from "./postsRu";
import type { BlogArticle } from "./types";

export * from "./types";
export { BLOG_POSTS_EN, BLOG_POSTS_RU };

const supabasePostsCache: Record<AppLang, BlogArticle[]> = {
  en: [],
  ru: [],
};

function signature(posts: BlogArticle[]): string {
  return posts
    .map(p => `${p.topicKey}::${p.slug}::${p.dateModified}::${p.datePublished}`)
    .join("|");
}

function dedupeBySlugAndTopic(posts: BlogArticle[]): BlogArticle[] {
  const seen = new Set<string>();
  const out: BlogArticle[] = [];
  for (const post of posts) {
    const key = `${post.topicKey}::${post.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(post);
  }
  return out;
}

export function setSupabaseBlogPosts(lang: AppLang, posts: BlogArticle[]): boolean {
  const next = dedupeBySlugAndTopic(posts);
  const changed = signature(supabasePostsCache[lang] || []) !== signature(next);
  supabasePostsCache[lang] = next;
  return changed;
}

export async function refreshSupabaseBlogPosts(lang: AppLang): Promise<boolean> {
  const response = await fetch(`/api/blogs?lang=${lang}&status=published`);
  let data: { ok?: boolean; posts?: { article?: BlogArticle }[] } | null = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.toLowerCase().includes("application/json")) {
    try {
      data = (await response.json()) as { ok?: boolean; posts?: { article?: BlogArticle }[] };
    } catch {
      data = null;
    }
  }
  if (!response.ok || !data?.ok) return false;
  const posts = Array.isArray(data.posts)
    ? data.posts
        .map((x: any) => x?.article)
        .filter(Boolean) as BlogArticle[]
    : [];
  return setSupabaseBlogPosts(lang, posts);
}

export function getBlogPosts(lang: AppLang): BlogArticle[] {
  const staticPosts = lang === "ru" ? BLOG_POSTS_RU : BLOG_POSTS_EN;
  const supabasePosts = supabasePostsCache[lang] || [];
  const supaKeys = new Set(supabasePosts.map(p => `${p.topicKey}::${p.slug}`));
  const staticOnly = staticPosts.filter(p => !supaKeys.has(`${p.topicKey}::${p.slug}`));
  return [...supabasePosts, ...staticOnly];
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
