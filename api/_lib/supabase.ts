import "./loadEnv";
import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function extractBearerToken(req: any): string {
  const header = String(req.headers?.authorization || req.headers?.Authorization || "").trim();
  if (!header.toLowerCase().startsWith("bearer ")) return "";
  return header.slice(7).trim();
}

export async function requireAdminEmail(req: any): Promise<string> {
  const token = extractBearerToken(req);
  if (!token) {
    throw new Error("Missing bearer token.");
  }
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.email) {
    throw new Error("Unauthorized.");
  }
  const email = data.user.email.toLowerCase();
  const envAdminEmail = String(process.env.SUPABASE_ADMIN_EMAIL || "").trim().toLowerCase();
  if (envAdminEmail && email === envAdminEmail) {
    return email;
  }
  const { data: adminRow, error: adminErr } = await supabase
    .from("blog_admins")
    .select("email")
    .ilike("email", email)
    .maybeSingle();
  if (adminErr || !adminRow) {
    throw new Error("Forbidden.");
  }
  return email;
}

