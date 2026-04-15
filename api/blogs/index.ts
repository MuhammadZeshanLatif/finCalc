import { mapArticleToInsert, mapRowToArticle, type BlogDbRow } from "../../src/data/blog/dbMapper";
import type { AppLang } from "../../src/utils/routes";
import { getSupabaseAdminClient, requireAdminEmail } from "../_lib/supabase";

type JsonRecord = Record<string, unknown>;

function parseJsonBody(rawBody: unknown): JsonRecord {
  if (!rawBody) return {};
  if (typeof rawBody === "string") {
    try {
      return JSON.parse(rawBody) as JsonRecord;
    } catch {
      return {};
    }
  }
  if (typeof rawBody === "object") return rawBody as JsonRecord;
  return {};
}

function normalizeLang(value: unknown): AppLang | null {
  const v = String(value || "").trim().toLowerCase();
  if (v === "en" || v === "ru") return v;
  return null;
}

function asArticlePayload(body: JsonRecord) {
  const article = body.article;
  if (!article || typeof article !== "object") return null;
  const row = article as Record<string, unknown>;
  const lang = normalizeLang(body.lang ?? row.lang);
  if (!lang) return null;
  const slug = String(row.slug || "").trim();
  const topicKey = String(row.topicKey || "").trim();
  const title = String(row.title || "").trim();
  const metaTitle = String(row.metaTitle || "").trim();
  const metaDescription = String(row.metaDescription || "").trim();
  if (!slug || !topicKey || !title || !metaTitle || !metaDescription) return null;
  return {
    article: {
      topicKey,
      slug,
      title,
      metaTitle,
      metaDescription,
      keywords: String(row.keywords || ""),
      excerpt: String(row.excerpt || ""),
      datePublished: String(row.datePublished || new Date().toISOString().slice(0, 10)),
      dateModified: String(row.dateModified || new Date().toISOString().slice(0, 10)),
      author: String(row.author || "FinanceCalculator Editorial"),
      readingTimeMinutes: Number(row.readingTimeMinutes || 5),
      hero: (row.hero || {}) as any,
      keyPhrases: Array.isArray(row.keyPhrases) ? row.keyPhrases.map(x => String(x)) : [],
      blocks: Array.isArray(row.blocks) ? (row.blocks as any[]) : [],
      sources: Array.isArray(row.sources) ? (row.sources as any[]) : [],
      calcLink: String(row.calcLink || "loan"),
      articleSection: String(row.articleSection || "Personal finance"),
    },
    lang,
    status: String(body.status || "draft").toLowerCase() === "published" ? "published" : "draft",
    smartmagSubtitle: String(body.smartmagSubtitle || ""),
    externalLink:
      body.externalLink && typeof body.externalLink === "object"
        ? (body.externalLink as { anchor: string; url: string })
        : null,
    imagePlan: Array.isArray(body.imagePlan) ? (body.imagePlan as any[]) : [],
  } as const;
}

export default async function handler(req: any, res: any) {
  const supabase = getSupabaseAdminClient();

  if (req.method === "GET") {
    try {
      const lang = normalizeLang(req.query?.lang);
      const statusRaw = String(req.query?.status || "published").trim().toLowerCase();
      const includeAll = statusRaw === "all";
      if (!lang) {
        res.status(400).json({ ok: false, message: "lang query param is required (en|ru)." });
        return;
      }
      if (!["all", "published"].includes(statusRaw)) {
        res.status(400).json({ ok: false, message: "status query param must be 'published' or 'all'." });
        return;
      }
      if (includeAll) await requireAdminEmail(req);

      let query = supabase
        .from("blogs")
        .select("*")
        .eq("lang", lang)
        .order("date_published", { ascending: false });
      if (!includeAll) {
        query = query.eq("status", "published");
      }
      const { data, error } = await query;
      if (error) {
        res.status(500).json({ ok: false, message: error.message });
        return;
      }
      const rows = (data || []) as BlogDbRow[];
      res.status(200).json({
        ok: true,
        posts: rows.map(row => ({
          id: row.id,
          lang: row.lang,
          status: row.status,
          smartmagSubtitle: row.smartmag_subtitle || "",
          externalLink: row.external_link || null,
          imagePlan: row.image_plan || [],
          article: mapRowToArticle(row),
        })),
      });
    } catch (err: unknown) {
      console.error("[blogs:list] error:", err);
      const message = err instanceof Error ? err.message : "Unauthorized";
      const code =
        message === "Forbidden." ||
        message === "Unauthorized." ||
        message === "Missing bearer token."
          ? 403
          : 400;
      res.status(code).json({ ok: false, message });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      await requireAdminEmail(req);
      const body = parseJsonBody(req.body);
      const payload = asArticlePayload(body);
      if (!payload) {
        res.status(400).json({ ok: false, message: "Invalid payload. Expected article + lang." });
        return;
      }
      const toInsert = mapArticleToInsert(payload);
      const { data, error } = await supabase
        .from("blogs")
        .upsert(toInsert, { onConflict: "lang,slug" })
        .select("*")
        .single();
      if (error || !data) {
        res.status(500).json({ ok: false, message: error?.message || "Unable to save blog." });
        return;
      }
      const row = data as BlogDbRow;
      res.status(200).json({
        ok: true,
        post: {
          id: row.id,
          lang: row.lang,
          status: row.status,
          smartmagSubtitle: row.smartmag_subtitle || "",
          externalLink: row.external_link || null,
          imagePlan: row.image_plan || [],
          article: mapRowToArticle(row),
        },
      });
    } catch (err: unknown) {
      console.error("[blogs:create] error:", err);
      const message = err instanceof Error ? err.message : "Unauthorized";
      const code = message === "Forbidden." || message === "Unauthorized." ? 403 : 400;
      res.status(code).json({ ok: false, message });
    }
    return;
  }

  res.status(405).json({ ok: false, message: "Method not allowed" });
}

