import "./_lib/loadEnv";
import { mapArticleToInsert, mapRowToArticle, type BlogDbRow } from "../src/data/blog/dbMapper";
import { getSupabaseAdminClient, requireAdminEmail } from "./_lib/supabase";

type JsonRecord = Record<string, unknown>;

type BlogBlock =
  | { t: "h2"; id: string; text: string }
  | { t: "h3"; id: string; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "callout"; variant: "note" | "disclaimer"; title?: string; text: string };

type GeneratedArticle = {
  topicKey: string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  excerpt: string;
  keyPhrases: string[];
  blocks: BlogBlock[];
  sources: { title: string; url: string }[];
  calcLink: string;
  articleSection?: string;
  smartmagSubtitle?: string;
  externalLink?: { anchor: string; url: string };
  imagePlan?: {
    filenameWebp: string;
    alt: string;
    caption: string;
    placement: string;
  }[];
};

type KeywordReport = {
  primaryKeyword: string;
  primaryCount: number;
  maxSecondaryKeyword: string;
  maxSecondaryCount: number;
};

function safeSlug(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || `auto-generated-blog-${Date.now()}`;
}

function trimTo(input: string, max: number): string {
  return input.length > max ? `${input.slice(0, max - 1).trim()}…` : input;
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countPhrase(haystack: string, phrase: string): number {
  const p = phrase.trim();
  if (!p) return 0;
  const rx = new RegExp(escapeRegExp(p), "gi");
  const m = haystack.match(rx);
  return m ? m.length : 0;
}

/** Secondary terms that are substrings of the primary skew counts (e.g. "loan" vs "car loan calculator"). */
function isRedundantSecondaryVsPrimary(primaryLc: string, secondaryLc: string): boolean {
  const k = secondaryLc.trim();
  const p = primaryLc.trim();
  if (!k || !p || k === p) return true;
  if (p.includes(k) && k.length < p.length) return true;
  return false;
}

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

function safeId(input: string, fallback: string): string {
  const id = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return id || fallback;
}

function normalizeBlocks(blocksRaw: unknown, title: string, topic: string, language: "en" | "ru"): BlogBlock[] {
  if (!Array.isArray(blocksRaw)) {
    return [
      { t: "h2", id: "overview", text: language === "ru" ? "Краткий обзор" : "Overview" },
      {
        t: "p",
        text:
          language === "ru"
            ? `Эта статья сгенерирована автоматически по теме: ${topic}.`
            : `This article is automatically generated for the topic: ${topic}.`,
      },
      { t: "h2", id: "conclusion", text: language === "ru" ? "Вывод" : "Conclusion" },
      {
        t: "p",
        text:
          language === "ru"
            ? "Перед финансовыми решениями сверяйте данные с официальными источниками."
            : "Before making financial decisions, verify assumptions with official sources.",
      },
    ];
  }

  const out: BlogBlock[] = [];
  for (const item of blocksRaw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const t = String(rec.t || "").trim();
    if (t === "h2") {
      const text = String(rec.text || "").trim();
      if (!text) continue;
      out.push({ t: "h2", id: safeId(String(rec.id || text), safeId(text, "section")), text: trimTo(text, 140) });
      continue;
    }
    if (t === "h3") {
      const text = String(rec.text || "").trim();
      if (!text) continue;
      out.push({ t: "h3", id: safeId(String(rec.id || text), safeId(text, "subsection")), text: trimTo(text, 140) });
      continue;
    }
    if (t === "p") {
      const text = String(rec.text || "").trim();
      if (!text) continue;
      out.push({ t: "p", text: trimTo(text, 800) });
      continue;
    }
    if (t === "ul") {
      const items = Array.isArray(rec.items)
        ? rec.items.map(x => String(x || "").trim()).filter(Boolean).slice(0, 8)
        : [];
      if (!items.length) continue;
      out.push({ t: "ul", items: items.map(x => trimTo(x, 220)) });
      continue;
    }
    if (t === "callout") {
      const text = String(rec.text || "").trim();
      if (!text) continue;
      const variant = String(rec.variant || "note") === "disclaimer" ? "disclaimer" : "note";
      const titleSafe = String(rec.title || "").trim();
      out.push({
        t: "callout",
        variant,
        ...(titleSafe ? { title: trimTo(titleSafe, 120) } : {}),
        text: trimTo(text, 400),
      });
    }
  }
  if (!out.length) {
    out.push(
      { t: "h2", id: "overview", text: title },
      {
        t: "p",
        text:
          language === "ru"
            ? `Эта статья сгенерирована автоматически по теме: ${topic}.`
            : `This article is automatically generated for the topic: ${topic}.`,
      },
    );
  }
  return out;
}

function normalizeSources(sourcesRaw: unknown): { title: string; url: string }[] {
  if (!Array.isArray(sourcesRaw)) return [];
  return sourcesRaw
    .map(x => {
      if (!x || typeof x !== "object") return null;
      const rec = x as Record<string, unknown>;
      const title = String(rec.title || "").trim();
      const url = String(rec.url || "").trim();
      if (!title || !/^https?:\/\//i.test(url)) return null;
      return { title: trimTo(title, 160), url };
    })
    .filter(Boolean)
    .slice(0, 8) as { title: string; url: string }[];
}

function wordsFromBlocks(blocks: BlogBlock[]): number {
  let text = "";
  for (const b of blocks) {
    if (b.t === "h2" || b.t === "h3" || b.t === "p" || b.t === "callout") {
      text += ` ${"text" in b ? b.text : ""}`;
    }
    if (b.t === "ul") text += ` ${b.items.join(" ")}`;
  }
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function coerceGenerated(
  obj: unknown,
  topic: string,
  language: "en" | "ru",
  primaryKeyword: string,
): GeneratedArticle {
  const rec = typeof obj === "object" && obj ? (obj as Record<string, unknown>) : {};
  const titleRaw = String(rec.title || topic).trim();
  const title = titleRaw || topic;
  const slugRaw = String(rec.slug || safeSlug(title)).trim();
  const slug = safeSlug(slugRaw || title);
  const topicKeyRaw = String(rec.topicKey || `ai-${slug}`).trim();
  const topicKey = safeId(topicKeyRaw, `ai-${Date.now()}`);
  const metaTitle = trimTo(String(rec.metaTitle || `${title} | FinanceCalculator`).trim(), 65);
  const metaDescription = trimTo(
    String(rec.metaDescription || `Practical guide: ${title}.`).trim(),
    165,
  );
  const keywords = trimTo(
    String(rec.keywords || `${title.toLowerCase()}, finance blog, calculator guide`).trim(),
    220,
  );
  const excerpt = trimTo(
    String(rec.excerpt || `Learn ${title.toLowerCase()} with practical examples and clear steps.`).trim(),
    220,
  );
  const keyPhrasesRaw = Array.isArray(rec.keyPhrases)
    ? rec.keyPhrases.map(x => String(x || "").trim()).filter(Boolean)
    : [];
  const keyPhrases = keyPhrasesRaw.slice(0, 7).map(x => trimTo(x, 80));
  const blocks = normalizeBlocks(rec.blocks, title, topic, language);
  const sources = normalizeSources(rec.sources);
  const calcLinkRaw = String(rec.calcLink || "loan").trim().toLowerCase();
  const calcLink = [
    "basic", "interest", "deposit", "loan", "loanearly", "mortgage", "days",
    "vat", "emi", "bmi", "tax", "currency", "autoloan", "salestax", "desmos", "ti84",
  ].includes(calcLinkRaw)
    ? calcLinkRaw
    : "loan";
  const articleSection = String(rec.articleSection || "Personal finance").trim();
  const smartmagSubtitleRaw = String(rec.smartmagSubtitle || "").trim();
  const extRaw = rec.externalLink && typeof rec.externalLink === "object"
    ? (rec.externalLink as Record<string, unknown>)
    : null;
  const externalLink =
    extRaw && String(extRaw.anchor || "").trim() && /^https?:\/\//i.test(String(extRaw.url || "").trim())
      ? {
          anchor: trimTo(String(extRaw.anchor || "").trim(), 100),
          url: String(extRaw.url || "").trim(),
        }
      : undefined;
  const imagePlanRaw = Array.isArray(rec.imagePlan) ? rec.imagePlan : [];
  const imagePlan = imagePlanRaw
    .map(x => {
      if (!x || typeof x !== "object") return null;
      const r = x as Record<string, unknown>;
      const filenameBase = String(r.filenameWebp || "").trim().toLowerCase();
      const filenameWebp = filenameBase.endsWith(".webp") ? filenameBase : `${filenameBase}.webp`;
      const alt = String(r.alt || "").trim();
      const caption = String(r.caption || "").trim();
      const placement = String(r.placement || "").trim();
      if (!filenameBase || !alt || !caption || !placement) return null;
      return {
        filenameWebp: trimTo(filenameWebp.replace(/[^a-z0-9._-]/g, "-"), 80),
        alt: trimTo(alt, 160),
        caption: trimTo(caption, 180),
        placement: trimTo(placement, 120),
      };
    })
    .filter(Boolean)
    .slice(0, 4) as {
      filenameWebp: string;
      alt: string;
      caption: string;
      placement: string;
    }[];
  const kwPrimary = primaryKeyword.trim();
  const mergedKeywords = [
    ...(kwPrimary ? [kwPrimary] : []),
    ...keywords.split(",").map(x => x.trim()).filter(Boolean),
  ];
  const dedupKeywords = Array.from(new Set(mergedKeywords.map(x => x.toLowerCase())))
    .map(k => mergedKeywords.find(x => x.toLowerCase() === k) || k)
    .slice(0, 10);

  return {
    topicKey,
    title,
    slug,
    metaTitle,
    metaDescription,
    keywords: dedupKeywords.join(", "),
    excerpt,
    keyPhrases: keyPhrases.length ? keyPhrases : [trimTo(kwPrimary || topic, 80)],
    blocks,
    sources,
    calcLink,
    articleSection: trimTo(articleSection, 80),
    ...(smartmagSubtitleRaw ? { smartmagSubtitle: trimTo(smartmagSubtitleRaw, 110) } : {}),
    ...(externalLink ? { externalLink } : {}),
    ...(imagePlan.length ? { imagePlan } : {}),
  };
}

async function generateWithOpenAI(
  topic: string,
  language: "en" | "ru",
  country: string,
  primaryKeyword: string,
  correction: string,
): Promise<GeneratedArticle> {
  const languageName = language === "ru" ? "Russian" : "English";
  const prompt = `
You are an SEO editor. Generate a blog article JSON compatible with strict blog schema.
Topic: ${topic}
Language: ${languageName}
Primary keyword: ${primaryKeyword}
Country for SERP analysis: ${country}

Return strict JSON with keys:
topicKey, title, slug, metaTitle, metaDescription, smartmagSubtitle, keywords, excerpt, keyPhrases, calcLink, articleSection, blocks, sources, externalLink, imagePlan

Rules:
- Follow this exact workflow internally:
  1) Analyze SERP for keyword gaps in ${country}.
  2) Extract heading patterns from top results and build logical outline.
  3) Write semantically optimized content, AI-friendly, grade-8 readability, short sentences, Yoast/RankMath style.
  4) Run proofread and factual consistency check.
  5) Insert only missing sections from gap analysis, avoid unnecessary rewrites.
  6) Perform ICP and NLP-based topical analysis.
  7) Incorporate ICP/NLP findings into the article.
  8) Write intro and conclusion with pain points + personal-experience tone and strong EEAT.
  9) Intro must be exactly 2 paragraphs and conclusion exactly 2 paragraphs.
  10) Target ~800 words, main keyword density around 0.8%, include at least 35 transition devices, avoid repeating the same starter word over 2 consecutive sentences.
  11) Add exactly one essential external link and provide anchor + URL.
  12) Output ready-to-paste final article body.
  13) Provide meta pack and 4 image suggestions (.webp names, alt text, captions, placements).
- Keep output in ${languageName}.
- slug must be latin-url-safe.
- topicKey should be stable and latin-url-safe.
- metaTitle length 50-59 chars.
- metaDescription length 150-159 chars.
- smartmagSubtitle concise (60-100 chars).
- keywords comma-separated, relevant, non-stuffed.
- primary keyword must be naturally prominent and appear more than any secondary keyword.
- HARD (machine-checked): include the exact primary keyword phrase "${primaryKeyword}" verbatim at least 4 times across title + metaTitle + metaDescription + excerpt + all block text combined.
- Do not repeat any single secondary keyword/keyPhrase (anything in keywords/keyPhrases except the primary phrase itself) more than twice in the full article body; use synonyms instead.
- excerpt 1-2 sentences.
- keyPhrases: 4-7 items.
- calcLink: one of loan, loanearly, interest, deposit, mortgage, tax, vat, emi, autoloan, currency, bmi.
- blocks: 10-22 items using only:
  - {"t":"h2","id":"section-id","text":"..."}
  - {"t":"h3","id":"sub-id","text":"..."}
  - {"t":"p","text":"..."}
  - {"t":"ul","items":["...","..."]}
  - {"t":"callout","variant":"note","title":"optional","text":"..."}
- include at least: intro, practical steps, common mistakes, conclusion.
- sources: 2-5 trustworthy URLs if possible, else empty array.
- externalLink: {"anchor":"...","url":"https://..."} exactly one.
- imagePlan: exactly 4 items with:
  {"filenameWebp":"name.webp","alt":"...","caption":"...","placement":"where to place in article"}
${correction ? `- Correction from previous attempt: ${correction}` : ""}
  `.trim();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing.");
  }
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      messages: [
        { role: "system", content: "You produce valid JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI generation failed: ${response.status} ${text.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content || "{}";
  let parsed: unknown = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }
  return coerceGenerated(parsed, topic, language, primaryKeyword);
}

async function generateWithGemini(
  topic: string,
  language: "en" | "ru",
  country: string,
  primaryKeyword: string,
  correction: string,
): Promise<GeneratedArticle> {
  const languageName = language === "ru" ? "Russian" : "English";
  const prompt = `
You are an SEO editor. Generate a blog article JSON compatible with strict blog schema.
Topic: ${topic}
Language: ${languageName}
Primary keyword: ${primaryKeyword}
Country for SERP analysis: ${country}

Return strict JSON with keys:
topicKey, title, slug, metaTitle, metaDescription, smartmagSubtitle, keywords, excerpt, keyPhrases, calcLink, articleSection, blocks, sources, externalLink, imagePlan

Rules:
- Follow this exact workflow internally:
  1) Analyze SERP for keyword gaps in ${country}.
  2) Extract heading patterns from top results and build logical outline.
  3) Write semantically optimized content, AI-friendly, grade-8 readability, short sentences, Yoast/RankMath style.
  4) Run proofread and factual consistency check.
  5) Insert only missing sections from gap analysis, avoid unnecessary rewrites.
  6) Perform ICP and NLP-based topical analysis.
  7) Incorporate ICP/NLP findings into the article.
  8) Write intro and conclusion with pain points + personal-experience tone and strong EEAT.
  9) Intro must be exactly 2 paragraphs and conclusion exactly 2 paragraphs.
  10) Target ~800 words, main keyword density around 0.8%, include at least 35 transition devices, avoid repeating the same starter word over 2 consecutive sentences.
  11) Add exactly one essential external link and provide anchor + URL.
  12) Output ready-to-paste final article body.
  13) Provide meta pack and 4 image suggestions (.webp names, alt text, captions, placements).
- Keep output in ${languageName}.
- slug must be latin-url-safe.
- topicKey should be stable and latin-url-safe.
- metaTitle length 50-59 chars.
- metaDescription length 150-159 chars.
- smartmagSubtitle concise (60-100 chars).
- keywords comma-separated, relevant, non-stuffed.
- primary keyword must be naturally prominent and appear more than any secondary keyword.
- HARD (machine-checked): include the exact primary keyword phrase "${primaryKeyword}" verbatim at least 4 times across title + metaTitle + metaDescription + excerpt + all block text combined.
- Do not repeat any single secondary keyword/keyPhrase (anything in keywords/keyPhrases except the primary phrase itself) more than twice in the full article body; use synonyms instead.
- excerpt 1-2 sentences.
- keyPhrases: 4-7 items.
- calcLink: one of loan, loanearly, interest, deposit, mortgage, tax, vat, emi, autoloan, currency, bmi.
- blocks: 10-22 items using only:
  - {"t":"h2","id":"section-id","text":"..."}
  - {"t":"h3","id":"sub-id","text":"..."}
  - {"t":"p","text":"..."}
  - {"t":"ul","items":["...","..."]}
  - {"t":"callout","variant":"note","title":"optional","text":"..."}
- include at least: intro, practical steps, common mistakes, conclusion.
- sources: 2-5 trustworthy URLs if possible, else empty array.
- externalLink: {"anchor":"...","url":"https://..."} exactly one.
- imagePlan: exactly 4 items with:
  {"filenameWebp":"name.webp","alt":"...","caption":"...","placement":"where to place in article"}
${correction ? `- Correction from previous attempt: ${correction}` : ""}
  `.trim();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }
  // `gemini-flash-latest` tracks the current Flash model (Google AI Studio / REST).
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.5,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini generation failed: ${response.status} ${text.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  let parsed: unknown = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }
  return coerceGenerated(parsed, topic, language, primaryKeyword);
}

async function generateArticle(
  topic: string,
  language: "en" | "ru",
  country: string,
  primaryKeyword: string,
  correction: string,
): Promise<GeneratedArticle> {
  if (process.env.GEMINI_API_KEY) {
    return generateWithGemini(topic, language, country, primaryKeyword, correction);
  }
  return generateWithOpenAI(topic, language, country, primaryKeyword, correction);
}

function analyzeKeywordRule(
  generated: GeneratedArticle,
  primaryKeyword: string,
): KeywordReport {
  const parts: string[] = [
    generated.title,
    generated.metaTitle,
    generated.metaDescription,
    generated.excerpt,
  ];
  for (const b of generated.blocks) {
    if (b.t === "h2" || b.t === "h3" || b.t === "p" || b.t === "callout") parts.push(b.text);
    if (b.t === "ul") parts.push(...b.items);
  }
  const fullText = parts.join(" ").toLowerCase();
  const primary = primaryKeyword.trim().toLowerCase();
  const primaryCount = countPhrase(fullText, primary);

  const secondary = Array.from(
    new Set(
      [
        ...generated.keywords.split(",").map(x => x.trim().toLowerCase()),
        ...generated.keyPhrases.map(x => x.trim().toLowerCase()),
      ].filter(Boolean),
    ),
  ).filter(k => k !== primary);

  let maxSecondaryKeyword = "";
  let maxSecondaryCount = 0;
  for (const kw of secondary) {
    if (isRedundantSecondaryVsPrimary(primary, kw)) continue;
    const c = countPhrase(fullText, kw);
    if (c > maxSecondaryCount) {
      maxSecondaryCount = c;
      maxSecondaryKeyword = kw;
    }
  }
  return {
    primaryKeyword,
    primaryCount,
    maxSecondaryKeyword,
    maxSecondaryCount,
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }
  try {
    await requireAdminEmail(req);
    const body = parseJsonBody(req.body);
    const topicRaw = String(body.topic || "").trim();
    const languageRaw = String(body.language || "en").trim().toLowerCase();
    const countryRaw = String(body.country || "").trim();
    const primaryKeyword = String(body.primaryKeyword || "").trim();
    const statusRaw = String(body.status || "draft").trim().toLowerCase();

    if (!primaryKeyword) {
      res.status(400).json({ ok: false, message: "Primary keyword is required." });
      return;
    }
    if (!countryRaw) {
      res.status(400).json({ ok: false, message: "Country is required." });
      return;
    }
    const language = (languageRaw === "ru" ? "ru" : "en") as "en" | "ru";
    const status = (statusRaw === "published" ? "published" : "draft") as "draft" | "published";
    const country = countryRaw;
    const topic = topicRaw || primaryKeyword;
    let generated: GeneratedArticle | null = null;
    let keywordReport: KeywordReport | null = null;
    let correction = "";

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const draft = await generateArticle(topic, language, country, primaryKeyword, correction);
      const report = analyzeKeywordRule(draft, primaryKeyword);
      generated = draft;
      keywordReport = report;
      if (report.primaryCount >= 2 && report.primaryCount > report.maxSecondaryCount) {
        break;
      }
      correction = `Primary keyword "${primaryKeyword}" must appear verbatim MORE times than any single secondary keyword in keywords/keyPhrases (substring overlaps are ignored). Current: primary=${report.primaryCount}, top-secondary="${report.maxSecondaryKeyword}":${report.maxSecondaryCount}. Repeat the full primary phrase in at least two H2 or body paragraphs, and reduce repetition of "${report.maxSecondaryKeyword}".`;
    }

    if (!generated || !keywordReport) {
      res.status(500).json({ ok: false, message: "Failed to generate article." });
      return;
    }
    if (!(keywordReport.primaryCount >= 2 && keywordReport.primaryCount > keywordReport.maxSecondaryCount)) {
      res.status(422).json({
        ok: false,
        message:
          "Could not satisfy keyword dominance rule after several attempts. Try a shorter primary keyword, or a topic closer to that phrase, or run again.",
        keywordReport,
      });
      return;
    }

    const now = new Date().toISOString().slice(0, 10);
    const words = wordsFromBlocks(generated.blocks);
    const readingTimeMinutes = Math.max(3, Math.round(words / 190));
    const article = {
      topicKey: generated.topicKey,
      slug: generated.slug,
      title: generated.title,
      metaTitle: generated.metaTitle,
      metaDescription: generated.metaDescription,
      keywords: generated.keywords,
      excerpt: generated.excerpt,
      datePublished: now,
      dateModified: now,
      author: "FinanceCalculator AI Editorial",
      readingTimeMinutes,
      hero: {
        src: "/preview-image.webp",
        alt: generated.title,
        caption: language === "ru" ? "AI-сгенерированное изображение-превью" : "AI-generated preview image",
        credit: "FinanceCalculator AI",
      },
      keyPhrases: generated.keyPhrases,
      blocks: generated.blocks,
      sources: generated.sources,
      calcLink: generated.calcLink,
      articleSection: generated.articleSection ?? "Personal finance",
    };

    const supabase = getSupabaseAdminClient();
    const toInsert = mapArticleToInsert({
      article,
      lang: language,
      status,
      smartmagSubtitle: generated.smartmagSubtitle || "",
      externalLink: generated.externalLink || null,
      imagePlan: generated.imagePlan || [],
    });

    const { data: saved, error: saveErr } = await supabase
      .from("blogs")
      .upsert(toInsert, { onConflict: "lang,slug" })
      .select("*")
      .single();
    if (saveErr || !saved) {
      res.status(500).json({ ok: false, message: saveErr?.message || "Failed to save generated blog." });
      return;
    }
    const savedRow = saved as BlogDbRow;
    const savedArticle = mapRowToArticle(savedRow);

    res.status(200).json({
      ok: true,
      message: `Blog generated and saved as ${status}.`,
      article: savedArticle,
      keywordReport,
      seoPack: {
        smartmagSubtitle: savedRow.smartmag_subtitle || "",
        externalLink: savedRow.external_link || null,
        imagePlan: savedRow.image_plan || [],
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    console.error("[blog-automation] error:", err);
    const status = msg === "Forbidden." || msg === "Unauthorized." || msg === "Missing bearer token." ? 403 : 500;
    res.status(status).json({ ok: false, message: msg });
  }
}
