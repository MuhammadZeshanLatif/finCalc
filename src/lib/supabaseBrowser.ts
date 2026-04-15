import { createClient } from "@supabase/supabase-js";

let supabaseBrowserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (supabaseBrowserClient) return supabaseBrowserClient;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anonKey) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
  }
  supabaseBrowserClient = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return supabaseBrowserClient;
}

