import type { BlogArticle } from "./types";

const STORAGE_KEY = "fc_runtime_blog_posts_v1";

type RuntimePost = BlogArticle & { lang: "en" | "ru" };

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAll(): RuntimePost[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RuntimePost[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean);
  } catch {
    return [];
  }
}

function writeAll(posts: RuntimePost[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  window.dispatchEvent(new CustomEvent("fc-blog-updated"));
}

export function getRuntimeBlogPosts(lang: "en" | "ru"): BlogArticle[] {
  return readAll()
    .filter(p => p.lang === lang)
    .sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime())
    .map(({ lang: _lang, ...post }) => post);
}

export function upsertRuntimeBlogPost(lang: "en" | "ru", post: BlogArticle): BlogArticle {
  const all = readAll();
  const withoutDupes = all.filter(
    p => !(p.lang === lang && (p.slug === post.slug || p.topicKey === post.topicKey)),
  );
  const next: RuntimePost = { ...post, lang };
  writeAll([next, ...withoutDupes]);
  return post;
}
