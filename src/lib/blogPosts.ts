import { getSupabase, isSupabaseConfigured } from "./supabase";

export const BLOG_TABLE = "fincalc_blog_posts";
export const BLOG_IMAGE_BUCKET = "fincalc-blog-images";
export const BLOG_CATEGORIES = [
  "Mortgages & Home Buying",
  "Loans & Debt",
  "Savings & Interest",
  "Investing",
  "Retirement",
  "Taxes",
  "Budgeting",
  "Credit",
  "Calculators & Math",
  "Health & Lifestyle Math",
  "Personal Finance",
];
export const DEFAULT_AUTHOR = "FinanceCalculator Editorial Team";
/** Calculator pages a post can link its "Try the calculator" button to. */
export const CALC_LINK_OPTIONS = [
  "", "basic", "interest", "deposit", "loan", "mortgage", "days", "vat", "emi", "bmi", "tax", "currency", "salestax", "ti84", "desmos",
];

export type PostState = "draft" | "scheduled" | "published";

export type DbPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image: string;
  imageAlt: string;
  ogImage: string;
  seoTitle: string;
  seoDescription: string;
  socialDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  tags: string[];
  calcLink: string;
  canonicalUrl: string;
  featured: boolean;
  status: "draft" | "published";
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

type Row = Record<string, any>;

// A published row with a future published_at is a scheduled post.
export const postState = (post: Pick<DbPost, "status" | "publishedAt">): PostState =>
  post.status !== "published" ? "draft" : Date.parse(post.publishedAt) > Date.now() ? "scheduled" : "published";

export const emptyPost = (): DbPost => ({
  id: "",
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  category: BLOG_CATEGORIES[0],
  author: DEFAULT_AUTHOR,
  image: "",
  imageAlt: "",
  ogImage: "",
  seoTitle: "",
  seoDescription: "",
  socialDescription: "",
  primaryKeyword: "",
  secondaryKeywords: [],
  tags: [],
  calcLink: "",
  canonicalUrl: "",
  featured: false,
  status: "draft",
  publishedAt: "",
  createdAt: "",
  updatedAt: "",
});

export function fromBlogRow(row: Row): DbPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || "",
    content: row.content || "",
    category: row.category || BLOG_CATEGORIES[0],
    author: row.author || DEFAULT_AUTHOR,
    image: row.image || "",
    imageAlt: row.image_alt || "",
    ogImage: row.og_image || "",
    seoTitle: row.seo_title || "",
    seoDescription: row.seo_description || "",
    socialDescription: row.social_description || "",
    primaryKeyword: row.primary_keyword || "",
    secondaryKeywords: row.secondary_keywords || [],
    tags: row.tags || [],
    calcLink: row.calc_link || "",
    canonicalUrl: row.canonical_url || "",
    featured: Boolean(row.featured),
    status: row.status,
    publishedAt: row.published_at || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

export function toBlogRow(post: DbPost): Row {
  const clean = (list: string[]) => (list || []).map(item => item.trim()).filter(Boolean);
  return {
    ...(post.id ? { id: post.id } : {}),
    slug: post.slug,
    title: post.title.trim(),
    excerpt: post.excerpt.trim(),
    content: post.content,
    category: post.category,
    author: post.author.trim() || DEFAULT_AUTHOR,
    image: post.image || "",
    image_alt: post.imageAlt || "",
    og_image: post.ogImage || null,
    seo_title: post.seoTitle?.trim() || null,
    seo_description: post.seoDescription?.trim() || null,
    social_description: post.socialDescription?.trim() || null,
    primary_keyword: post.primaryKeyword?.trim() || null,
    secondary_keywords: clean(post.secondaryKeywords),
    tags: clean(post.tags),
    calc_link: post.calcLink || null,
    canonical_url: post.canonicalUrl?.trim() || null,
    featured: post.featured,
    status: post.status,
    published_at: post.publishedAt || null,
  };
}

// ------------------------------------------------------------
// PUBLIC — live posts only (published and due)
// ------------------------------------------------------------
export async function fetchLivePosts(): Promise<DbPost[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await getSupabase()
      .from(BLOG_TABLE)
      .select("*")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(500);
    if (error) return [];
    return (data || []).map(fromBlogRow);
  } catch {
    return [];
  }
}

export async function fetchLivePostBySlug(slug: string): Promise<DbPost | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await getSupabase()
      .from(BLOG_TABLE)
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    if (error || !data) return null;
    return fromBlogRow(data);
  } catch {
    return null;
  }
}

// ------------------------------------------------------------
// ADMIN — all posts (RLS allows signed-in admins only)
// ------------------------------------------------------------
export async function adminFetchPosts(): Promise<DbPost[]> {
  const { data, error } = await getSupabase().from(BLOG_TABLE).select("*").order("updated_at", { ascending: false }).limit(1000);
  if (error) {
    const missing = error.code === "PGRST205" || error.code === "42P01";
    throw new Error(missing ? "Blog table not found. Run supabase/blog-schema.sql in the Supabase SQL Editor once." : "Could not load blog posts.");
  }
  return (data || []).map(fromBlogRow);
}

export async function adminSavePost(post: DbPost): Promise<DbPost> {
  const { data, error } = await getSupabase().from(BLOG_TABLE).upsert(toBlogRow(post)).select().single();
  if (error) {
    if (error.code === "23505") throw new Error("Another post already uses this URL slug. Choose a different slug.");
    throw new Error(error.message || "Could not save the post.");
  }
  return fromBlogRow(data);
}

export async function adminSetVisibility(id: string, status: "draft" | "published", publishedAt: string | null) {
  const { error } = await getSupabase().from(BLOG_TABLE).update({ status, published_at: publishedAt }).eq("id", id);
  if (error) throw new Error(error.message || "Could not change the post status.");
}

export async function adminDeletePost(id: string) {
  const { error } = await getSupabase().from(BLOG_TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message || "Could not delete the post.");
}

// Resize to max 1600px wide, convert to WebP, upload to the public bucket and return its URL.
export async function uploadBlogImage(file: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Use a JPG, PNG or WebP image.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", 0.82));
  if (!blob) throw new Error("This browser could not convert the image to WebP.");
  const base = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "blog-image";
  const path = `${new Date().toISOString().slice(0, 7)}/${base}-${Date.now().toString(36)}.webp`;
  const supabase = getSupabase();
  const { error } = await supabase.storage.from(BLOG_IMAGE_BUCKET).upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw new Error(error.message?.includes("Bucket not found") ? "Image bucket not found. Run supabase/blog-schema.sql once." : "Image upload failed.");
  return supabase.storage.from(BLOG_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
