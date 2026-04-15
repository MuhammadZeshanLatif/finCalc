import { BLOG_POSTS_EN } from "../src/data/blog/postsEn";
import { BLOG_POSTS_RU } from "../src/data/blog/postsRu";
import { mapArticleToInsert } from "../src/data/blog/dbMapper";
import type { AppLang } from "../src/utils/routes";
import { getSupabaseAdminClient, requireAdminEmail } from "./_lib/supabase";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }

  try {
    await requireAdminEmail(req);
    const langRaw = String(req.query?.lang || "all").trim().toLowerCase();
    const selected: AppLang[] =
      langRaw === "en" ? ["en"] : langRaw === "ru" ? ["ru"] : ["en", "ru"];

    const supabase = getSupabaseAdminClient();
    let migrated = 0;
    for (const lang of selected) {
      const source = lang === "ru" ? BLOG_POSTS_RU : BLOG_POSTS_EN;
      for (const article of source) {
        const payload = mapArticleToInsert({
          article,
          lang,
          status: "published",
        });
        const { error } = await supabase
          .from("blogs")
          .upsert(payload, { onConflict: "lang,slug" });
        if (!error) migrated += 1;
      }
    }

    res.status(200).json({
      ok: true,
      message: "Static blog migration completed.",
      migrated,
      langs: selected,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    const status = message === "Forbidden." || message === "Unauthorized." ? 403 : 500;
    res.status(status).json({ ok: false, message });
  }
}

