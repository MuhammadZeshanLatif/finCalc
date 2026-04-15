import type { AppLang } from "../../utils/routes";
import type { BlogArticle } from "./types";

export type BlogStatus = "draft" | "published";

export type BlogDbRow = {
  id: string;
  topic_key: string;
  slug: string;
  lang: AppLang;
  title: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  excerpt: string;
  date_published: string;
  date_modified: string;
  author: string;
  reading_time_minutes: number;
  hero: BlogArticle["hero"];
  key_phrases: string[];
  blocks: BlogArticle["blocks"];
  sources: BlogArticle["sources"];
  calc_link: string;
  article_section: string | null;
  smartmag_subtitle: string | null;
  external_link: { anchor: string; url: string } | null;
  image_plan: { filenameWebp: string; alt: string; caption: string; placement: string }[];
  status: BlogStatus;
  created_at: string;
  updated_at: string;
};

export function mapRowToArticle(row: BlogDbRow): BlogArticle {
  return {
    topicKey: row.topic_key,
    slug: row.slug,
    title: row.title,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    keywords: row.keywords,
    excerpt: row.excerpt,
    datePublished: row.date_published,
    dateModified: row.date_modified,
    author: row.author,
    readingTimeMinutes: row.reading_time_minutes,
    hero: row.hero,
    keyPhrases: row.key_phrases || [],
    blocks: row.blocks || [],
    sources: row.sources || [],
    calcLink: row.calc_link,
    ...(row.article_section ? { articleSection: row.article_section } : {}),
  };
}

export function mapArticleToInsert(row: {
  article: BlogArticle;
  lang: AppLang;
  status?: BlogStatus;
  smartmagSubtitle?: string;
  externalLink?: { anchor: string; url: string } | null;
  imagePlan?: { filenameWebp: string; alt: string; caption: string; placement: string }[];
}): Omit<BlogDbRow, "id" | "created_at" | "updated_at"> {
  const { article, lang } = row;
  return {
    topic_key: article.topicKey,
    slug: article.slug,
    lang,
    title: article.title,
    meta_title: article.metaTitle,
    meta_description: article.metaDescription,
    keywords: article.keywords,
    excerpt: article.excerpt,
    date_published: article.datePublished,
    date_modified: article.dateModified,
    author: article.author,
    reading_time_minutes: article.readingTimeMinutes,
    hero: article.hero,
    key_phrases: article.keyPhrases,
    blocks: article.blocks,
    sources: article.sources,
    calc_link: article.calcLink,
    article_section: article.articleSection || "Personal finance",
    smartmag_subtitle: row.smartmagSubtitle || null,
    external_link: row.externalLink || null,
    image_plan: row.imagePlan || [],
    status: row.status || "published",
  };
}

