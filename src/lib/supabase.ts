import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || "";
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || "";

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase URL or anon key. Check .env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
  }
  if (!cachedClient) {
    cachedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: typeof window !== "undefined",
        autoRefreshToken: typeof window !== "undefined",
        storageKey: "fincalc-admin-auth",
      },
    });
  }
  return cachedClient;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

const TABLE = "fincalc_contacts";

export type ContactStatus = "new" | "in_progress" | "resolved" | "archived";

export type ContactRecord = {
  id: string;
  name: string;
  email: string | null;
  subject: string | null;
  message: string | null;
  status: ContactStatus;
  source: "website" | "admin_manual";
  created_at: string;
};

export type ContactFields = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  status?: string;
};

function normalizeStatus(value: string | undefined): ContactStatus {
  const s = String(value || "").toLowerCase().replace(/\s+/g, "_");
  return (["new", "in_progress", "resolved", "archived"].includes(s) ? s : "new") as ContactStatus;
}

// ------------------------------------------------------------
// PUBLIC — website contact form
// ------------------------------------------------------------
export async function submitContact(payload: ContactFields): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "The contact form is not configured." };
  }
  if (!payload.name?.trim()) {
    return { ok: false, error: "Name is required." };
  }

  try {
    const { error } = await getSupabase().from(TABLE).insert({
      name: payload.name.trim().slice(0, 200),
      email: payload.email?.trim().slice(0, 320) || null,
      subject: payload.subject?.trim().slice(0, 300) || null,
      message: payload.message?.trim().slice(0, 5000) || null,
      status: "new",
      source: "website",
    });

    if (error) {
      console.error("fincalc_contacts insert:", error.message);
      return { ok: false, error: "Could not send your message. Please email us instead." };
    }
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: false, error: "Network error. Please try again." };
  }
}

// ------------------------------------------------------------
// ADMIN — auth
// ------------------------------------------------------------
export async function adminSignIn(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) {
    console.error("admin sign-in:", error.status, error.message);
    return { ok: false, error: error.message || "Incorrect email or password." };
  }
  return { ok: true };
}

export async function adminSignOut() {
  await getSupabase().auth.signOut();
}

export async function getAdminSession() {
  const { data } = await getSupabase().auth.getSession();
  return data.session;
}

// ------------------------------------------------------------
// ADMIN — data + CRUD
// ------------------------------------------------------------
export async function fetchContacts(): Promise<ContactRecord[]> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    const missing = error.code === "PGRST205" || error.code === "42P01";
    throw new Error(missing ? "Contacts table not found. Run supabase/schema.sql in the Supabase SQL Editor once." : "Could not load submissions.");
  }
  return (data || []) as ContactRecord[];
}

const contactRow = (fields: ContactFields) => ({
  name: fields.name || "",
  email: fields.email || null,
  subject: fields.subject || null,
  message: fields.message || null,
  status: normalizeStatus(fields.status),
});

export async function adminAddContact(fields: ContactFields) {
  const { error } = await getSupabase().from(TABLE).insert({ ...contactRow(fields), source: "admin_manual" });
  if (error) throw new Error("Could not add submission.");
}

export async function adminUpdateContact(id: string, fields: ContactFields) {
  const { error } = await getSupabase().from(TABLE).update(contactRow(fields)).eq("id", id);
  if (error) throw new Error("Could not update submission.");
}

export async function adminUpdateStatus(id: string, status: string) {
  const { error } = await getSupabase().from(TABLE).update({ status: normalizeStatus(status) }).eq("id", id);
  if (error) throw new Error("Could not update status.");
}

export async function adminDeleteContact(id: string) {
  const { error } = await getSupabase().from(TABLE).delete().eq("id", id);
  if (error) throw new Error("Could not delete submission.");
}
