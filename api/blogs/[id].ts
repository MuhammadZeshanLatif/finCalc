import type { BlogDbRow } from "../../src/data/blog/dbMapper";
import { mapRowToArticle } from "../../src/data/blog/dbMapper";
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

export default async function handler(req: any, res: any) {
  const id = String(req.query?.id || "").trim();
  if (!id) {
    res.status(400).json({ ok: false, message: "Blog id is required." });
    return;
  }

  const supabase = getSupabaseAdminClient();

  if (req.method === "PATCH") {
    try {
      await requireAdminEmail(req);
      const body = parseJsonBody(req.body);
      const patch: Record<string, unknown> = {};
      if (typeof body.title === "string") patch.title = body.title.trim();
      if (typeof body.metaTitle === "string") patch.meta_title = body.metaTitle.trim();
      if (typeof body.metaDescription === "string") patch.meta_description = body.metaDescription.trim();
      if (typeof body.excerpt === "string") patch.excerpt = body.excerpt.trim();
      if (typeof body.keywords === "string") patch.keywords = body.keywords.trim();
      if (typeof body.status === "string") {
        const st = body.status.trim().toLowerCase();
        if (st === "draft" || st === "published") patch.status = st;
      }
      if (typeof body.smartmagSubtitle === "string") patch.smartmag_subtitle = body.smartmagSubtitle.trim();
      if (body.externalLink === null) patch.external_link = null;
      if (body.externalLink && typeof body.externalLink === "object") patch.external_link = body.externalLink;
      if (Array.isArray(body.imagePlan)) patch.image_plan = body.imagePlan;

      if (!Object.keys(patch).length) {
        res.status(400).json({ ok: false, message: "No valid fields provided for update." });
        return;
      }

      const { data, error } = await supabase
        .from("blogs")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();
      if (error || !data) {
        res.status(500).json({ ok: false, message: error?.message || "Unable to update blog." });
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
      console.error("[blogs:update] error:", err);
      res.status(403).json({ ok: false, message: err instanceof Error ? err.message : "Forbidden" });
    }
    return;
  }

  if (req.method === "DELETE") {
    try {
      await requireAdminEmail(req);
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) {
        res.status(500).json({ ok: false, message: error.message });
        return;
      }
      res.status(200).json({ ok: true });
    } catch (err: unknown) {
      console.error("[blogs:delete] error:", err);
      res.status(403).json({ ok: false, message: err instanceof Error ? err.message : "Forbidden" });
    }
    return;
  }

  res.status(405).json({ ok: false, message: "Method not allowed" });
}

