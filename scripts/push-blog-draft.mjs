// Push finished articles into the admin blog (/admin/blog) as DRAFTS.
// It never publishes or schedules: that stays a manual step in the admin dashboard.
//
//   npm run blog:draft -- content/blog-drafts/some-article.md [--dry-run]
//   npm run blog:draft -- content/blog-drafts            (every .md file in the folder)
//
// Put ONE of these in .env.local (git-ignored, never commit it):
//   SUPABASE_SERVICE_ROLE_KEY=...      (Supabase → Project Settings → API keys; no login needed)
// or the admin login, so the same database rules apply as in the dashboard:
//   BLOG_EDITOR_EMAIL=you@example.com
//   BLOG_EDITOR_PASSWORD=...
//
// article.md starts with a front-matter block, then the Markdown body:
//   ---
//   title: How Mortgage Points Work (and When Buying Them Pays Off)
//   slug: how-mortgage-points-work
//   category: Mortgages & Home Buying
//   excerpt: One or two sentences shown on the blog card.
//   seoTitle: Optional, defaults to the title (aim for 60 characters or less)
//   seoDescription: Optional, defaults to the excerpt (aim for 120-160 characters)
//   socialDescription: Optional, for social shares
//   primaryKeyword: mortgage points
//   secondaryKeywords: discount points, buy down rate
//   tags: Mortgages, Interest Rates
//   calcLink: mortgage
//   author: FinanceCalculator Editorial Team
//   heroImage: images/how-mortgage-points-work/hero.webp
//   heroAlt: Describe what the hero image shows
//   ---
// Local images (heroImage and ![alt](images/...webp) in the body) are uploaded to the
// fincalc-blog-images bucket and replaced with their public URL. Site paths (/blog/...)
// and https:// URLs are kept as they are.
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const TABLE = "fincalc_blog_posts";
const BUCKET = "fincalc-blog-images";
const CATEGORIES = [
  "Mortgages & Home Buying", "Loans & Debt", "Savings & Interest", "Investing", "Retirement", "Taxes",
  "Budgeting", "Credit", "Calculators & Math", "Health & Lifestyle Math", "Personal Finance",
];
const CALC_LINKS = ["", "basic", "interest", "deposit", "loan", "mortgage", "days", "vat", "emi", "bmi", "tax", "currency", "salestax", "ti84", "desmos"];
const DEFAULT_AUTHOR = "FinanceCalculator Editorial Team";
const MIME = { ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const target = args.find(a => !a.startsWith("--"));
if (!target) throw new Error("Usage: npm run blog:draft -- path/to/article.md|folder [--dry-run]");

async function loadEnv() {
  const env = {};
  for (const name of [".env", ".env.production", ".env.local"]) {
    const text = await fs.readFile(name, "utf8").catch(() => "");
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  }
  return { ...env, ...process.env };
}

function parseArticle(text) {
  const m = text.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error("The file must start with a --- front-matter block.");
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z]+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  // A leading "# Title" line duplicates the page H1, so drop it.
  return { meta, body: m[2].replace(/^\s*#\s+.+\n/, "").trim() };
}

const list = value => (value || "").split(",").map(item => item.trim()).filter(Boolean);
const isLocal = ref => !/^(https?:\/\/|\/)/.test(ref);

// Slugs of articles built into the site code cannot be reused.
async function staticSlugs() {
  const slugs = new Set();
  for (const name of await fs.readdir("src/data/blog")) {
    if (!name.endsWith(".ts")) continue;
    const source = await fs.readFile(path.join("src/data/blog", name), "utf8");
    for (const m of source.matchAll(/^\s*slug:\s*"([^"]+)"/gm)) slugs.add(m[1]);
  }
  return slugs;
}

async function check(file, builtIn) {
  const baseDir = path.dirname(path.resolve(file));
  const { meta, body } = parseArticle(await fs.readFile(file, "utf8"));
  const problems = [];
  if (!meta.title) problems.push("title is missing");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(meta.slug || "")) problems.push("slug must be lowercase words separated by hyphens");
  if (builtIn.has(meta.slug)) problems.push(`slug "${meta.slug}" belongs to an article built into the site code (src/data/blog)`);
  if (!CATEGORIES.includes(meta.category)) problems.push(`category must be one of: ${CATEGORIES.join(", ")}`);
  if (meta.calcLink !== undefined && !CALC_LINKS.includes(meta.calcLink)) problems.push(`calcLink must be one of: ${CALC_LINKS.filter(Boolean).join(", ")}`);
  if (!meta.excerpt) problems.push("excerpt is missing");
  if (body.length < 100) problems.push("article body is shorter than 100 characters");
  if (meta.heroImage && !meta.heroAlt) problems.push("heroAlt is required when heroImage is set");
  if (!meta.primaryKeyword) problems.push("primaryKeyword is missing");
  for (const key of ["secondaryKeywords", "tags"]) {
    if (/\d,\d{3}/.test(meta[key] || "")) problems.push(`${key} has a number with a thousands comma (e.g. $100,000); lists are split on commas, so write $100k or $100000`);
  }
  const seoTitle = meta.seoTitle || meta.title || "";
  if (seoTitle.length > 60) problems.push(`SEO title is ${seoTitle.length} characters; keep it at 60 or less (add a shorter seoTitle)`);
  const seoDescription = meta.seoDescription || meta.excerpt || "";
  if (seoDescription.length < 120 || seoDescription.length > 160) problems.push(`SEO description is ${seoDescription.length} characters; keep it between 120 and 160`);
  if (meta.socialDescription && meta.socialDescription.length > 200) problems.push(`socialDescription is ${meta.socialDescription.length} characters; keep it under 200`);

  const bodyImages = [...body.matchAll(/!\[([^\]]*)\]\(([^)\s]+)\)/g)];
  for (const [, alt, ref] of bodyImages) if (!alt.trim()) problems.push(`image has no alt text: ${ref}`);
  for (const ref of [...bodyImages.map(x => x[2]), meta.heroImage].filter(Boolean)) {
    const onDisk = isLocal(ref) ? path.resolve(baseDir, ref) : ref.startsWith("/") ? path.resolve("public", `.${ref}`) : null;
    if (onDisk) await fs.access(onDisk).catch(() => problems.push(`image not found: ${ref}`));
    if (isLocal(ref) && path.extname(ref).toLowerCase() !== ".webp") problems.push(`local images must be .webp: ${ref}`);
  }
  return { file, baseDir, meta, body, localImages: [...new Set(bodyImages.map(x => x[2]).filter(isLocal))], problems };
}

const stat = await fs.stat(target);
const files = stat.isDirectory()
  ? (await fs.readdir(target)).filter(n => n.endsWith(".md") && !n.startsWith("_")).sort().map(n => path.join(target, n))
  : [target];

const builtIn = await staticSlugs();
const articles = [];
const seen = new Map();
let failed = 0;
for (const file of files) {
  const a = await check(file, builtIn);
  if (seen.has(a.meta.slug)) a.problems.push(`slug "${a.meta.slug}" is also used by ${seen.get(a.meta.slug)}`);
  seen.set(a.meta.slug, file);
  const words = a.body.split(/\s+/).length;
  if (a.problems.length) {
    failed++;
    console.log(`✗ ${file}\n  - ${a.problems.join("\n  - ")}`);
  } else {
    console.log(`✓ "${a.meta.title}" → /blog/${a.meta.slug} (${a.meta.category}), ${words} words, ${a.localImages.length} body image(s)${a.meta.heroImage ? " + hero" : ""}`);
    articles.push(a);
  }
}
if (failed) throw new Error(`${failed} article(s) failed checks; nothing was pushed.`);
if (dryRun) { console.log(`Dry run: ${articles.length} article(s) passed checks, nothing uploaded.`); process.exit(0); }

const env = await loadEnv();
if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env.production or .env.local");
// Either a server key (SUPABASE_SERVICE_ROLE_KEY, no login needed) or the admin login.
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceKey && (!env.BLOG_EDITOR_EMAIL || !env.BLOG_EDITOR_PASSWORD)) {
  throw new Error("Add SUPABASE_SERVICE_ROLE_KEY, or BLOG_EDITOR_EMAIL and BLOG_EDITOR_PASSWORD (your /admin login), to .env.local");
}
const supabase = createClient(env.VITE_SUPABASE_URL, serviceKey || env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
if (!serviceKey) {
  const { error: authError } = await supabase.auth.signInWithPassword({ email: env.BLOG_EDITOR_EMAIL, password: env.BLOG_EDITOR_PASSWORD });
  if (authError) throw new Error("Sign-in failed: " + authError.message + ". Check the login, or add SUPABASE_SERVICE_ROLE_KEY to .env.local instead.");
}

async function push({ meta, body, baseDir, localImages }) {
  const { data: existing, error: readError } = await supabase.from(TABLE).select("id,status,published_at,image,image_alt").eq("slug", meta.slug).maybeSingle();
  if (readError) {
    const missing = readError.code === "PGRST205" || readError.code === "42P01";
    throw new Error(missing ? "Blog table not found. Run supabase/blog-schema.sql in the Supabase SQL Editor once." : "Could not read the blog table: " + readError.message);
  }
  if (existing && existing.status === "published") {
    const when = Date.parse(existing.published_at) > Date.now() ? "scheduled" : "published";
    return `skipped: /blog/${meta.slug} is already ${when} (edit it in /admin/blog instead)`;
  }

  async function uploadImage(ref) {
    const ext = path.extname(ref).toLowerCase();
    const data = await fs.readFile(path.resolve(baseDir, ref));
    const name = path.basename(ref, ext).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    // Stable key per article + file: re-pushing a draft overwrites its own images instead of piling up copies.
    const key = `articles/${meta.slug}/${name}${ext === ".jpeg" ? ".jpg" : ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(key, data, { contentType: MIME[ext], cacheControl: "31536000", upsert: true });
    if (error) throw new Error(`Upload failed for ${ref}: ${error.message}${error.message?.includes("Bucket not found") ? " (run supabase/blog-schema.sql once)" : ""}`);
    return supabase.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
  }

  let content = body;
  for (const ref of localImages) {
    const url = await uploadImage(ref);
    content = content.split(`](${ref})`).join(`](${url})`);
  }
  // Without a heroImage in the file, keep the hero an existing draft already has in the admin.
  const hero = meta.heroImage
    ? { image: isLocal(meta.heroImage) ? await uploadImage(meta.heroImage) : meta.heroImage, image_alt: meta.heroAlt }
    : existing ? {} : { image: "", image_alt: "" };

  const payload = {
    ...(existing ? { id: existing.id } : {}),
    slug: meta.slug,
    title: meta.title,
    excerpt: meta.excerpt,
    content,
    category: meta.category,
    author: meta.author || DEFAULT_AUTHOR,
    ...hero,
    seo_title: meta.seoTitle || null,
    seo_description: meta.seoDescription || null,
    social_description: meta.socialDescription || null,
    primary_keyword: meta.primaryKeyword || null,
    secondary_keywords: list(meta.secondaryKeywords),
    tags: list(meta.tags),
    calc_link: meta.calcLink || null,
    status: "draft",
    published_at: null,
  };
  const { error: saveError } = await supabase.from(TABLE).upsert(payload).select("id").single();
  if (saveError) throw new Error("Draft could not be saved: " + saveError.message);
  return `${existing ? "updated" : "created"} draft`;
}

try {
  let i = 0;
  for (const a of articles) {
    i++;
    console.log(`[${i}/${articles.length}] /blog/${a.meta.slug}: ${await push(a)}`);
  }
  console.log("Done. Open /admin/blog → Draft to review, publish or schedule.");
} finally {
  if (!serviceKey) await supabase.auth.signOut();
}
