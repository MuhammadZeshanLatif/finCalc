/** Structured blog body — no raw HTML; rendered with escaping. */
export type BlogBlock =
  | { t: "h2"; id: string; text: string }
  | { t: "h3"; id: string; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "table"; caption?: string; head: string[]; rows: string[][] }
  | {
      t: "figure";
      src: string;
      alt: string;
      caption?: string;
      credit?: string;
      creditUrl?: string;
    }
  | { t: "callout"; variant: "note" | "disclaimer"; title?: string; text: string };

export type BlogArticle = {
  /** Stable id across locales (hreflang / related posts). */
  topicKey: string;
  slug: string;
  title: string;
  /** ≤ ~60 chars for SERP */
  metaTitle: string;
  /** ≤ ~160 chars */
  metaDescription: string;
  /** Comma-separated; topical, not stuffed */
  keywords: string;
  excerpt: string;
  datePublished: string;
  dateModified: string;
  author: string;
  readingTimeMinutes: number;
  hero: {
    src: string;
    alt: string;
    caption?: string;
    credit?: string;
    creditUrl?: string;
  };
  video?: { youtubeId: string; title: string };
  /** Visible “key phrases this page covers” — maps to headings, not density tricks */
  keyPhrases: string[];
  blocks: BlogBlock[];
  sources: { title: string; url: string }[];
  calcLink: string;
  /** Show ECB/Frankfurter snippet */
  hasLiveRates?: boolean;
};

export function tocFromBlocks(blocks: BlogBlock[]): { id: string; text: string; level: 2 | 3 }[] {
  return blocks
    .filter((b): b is Extract<BlogBlock, { t: "h2" } | { t: "h3" }> => b.t === "h2" || b.t === "h3")
    .map(b => ({ id: b.id, text: b.text, level: b.t === "h2" ? 2 : 3 }));
}
