/**
 * One-time admin user setup for the /admin dashboard.
 *
 * Creates (or, if it already exists, updates the password of) a Supabase Auth user and
 * adds the email to public.blog_admins, so it can log into the admin dashboard.
 *
 * Uses the Supabase SECRET / service_role key — run LOCALLY only, never ship it.
 * Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local when not set in the shell.
 *
 * Usage (PowerShell):
 *   $env:ADMIN_EMAIL="you@example.com"
 *   $env:ADMIN_PASSWORD="<choose a strong password>"
 *   node scripts/create-admin-user.mjs
 */
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const local = Object.fromEntries(
  (fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8") : "")
    .split(/\r?\n/)
    .map(line => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/))
    .filter(Boolean)
    .map(m => [m[1], m[2].replace(/^(['"])(.*)\1$/, "$2")]),
);
const url = process.env.SUPABASE_URL || local.SUPABASE_URL || local.VITE_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || local.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!url || !secret || !email || !password) {
  console.error("Missing: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (.env.local), ADMIN_EMAIL, ADMIN_PASSWORD");
  process.exit(1);
}

const supabase = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });

async function findUserByEmail(targetEmail) {
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find(u => (u.email || "").toLowerCase() === targetEmail.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) return null;
  }
}

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (!error) {
    console.log(`✓ Created admin user: ${email} (id: ${data.user.id})`);
  } else {
    console.log(`User exists (${error.message}). Updating password…`);
    const existing = await findUserByEmail(email);
    if (!existing) throw new Error("Could not locate the existing user to update.");
    const upd = await supabase.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
    if (upd.error) throw new Error("Update failed: " + upd.error.message);
    console.log(`✓ Updated password for existing admin user: ${email}`);
  }
  const { error: listError } = await supabase.from("blog_admins").upsert({ email: email.toLowerCase() });
  if (listError) throw new Error("Could not add the email to blog_admins: " + listError.message);
  console.log("✓ Email is in public.blog_admins — it can sign in at /admin.");
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
