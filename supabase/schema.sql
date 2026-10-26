-- ============================================================
-- FinanceCalculator (financcalculators.com) — Supabase schema
-- Run this ENTIRE file once in: Supabase Dashboard → SQL Editor → New query
--
-- Project: ehnpcdnkagkmgmtopwkx
-- Creates ONE dedicated table for the contact form plus the admin check.
-- It does NOT touch the older `blogs` table. Safe to re-run.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ADMIN CHECK
-- Only emails listed in public.blog_admins count as admins, so a stray
-- Supabase Auth sign-up can never read or edit site data.
-- ------------------------------------------------------------
create table if not exists public.blog_admins (
  email text primary key,
  created_at timestamptz not null default now()
);
alter table public.blog_admins enable row level security;
insert into public.blog_admins (email) values ('zeeshanlatif.tech@gmail.com') on conflict do nothing;

create or replace function public.fincalc_is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.blog_admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.fincalc_is_admin() to authenticated;

-- ------------------------------------------------------------
-- CONTACT SUBMISSIONS
-- (Website contact form + admin manual entry)
-- ------------------------------------------------------------
create table if not exists public.fincalc_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  email text check (email is null or char_length(email) <= 320),
  subject text check (subject is null or char_length(subject) <= 300),
  message text check (message is null or char_length(message) <= 5000),
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'resolved', 'archived')),
  source text not null default 'website'
    check (source in ('website', 'admin_manual')),
  created_at timestamptz not null default now()
);

create index if not exists fincalc_contacts_created_at_idx
  on public.fincalc_contacts (created_at desc);
create index if not exists fincalc_contacts_status_idx
  on public.fincalc_contacts (status);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- Public website: INSERT only (anon), always as a new website submission
-- Admin dashboard: signed-in users listed in blog_admins get full access
-- ------------------------------------------------------------
alter table public.fincalc_contacts enable row level security;

drop policy if exists "anon_insert_fincalc_contacts" on public.fincalc_contacts;
create policy "anon_insert_fincalc_contacts"
  on public.fincalc_contacts for insert
  to anon
  with check (status = 'new' and source = 'website');

drop policy if exists "admin_all_fincalc_contacts" on public.fincalc_contacts;
create policy "admin_all_fincalc_contacts"
  on public.fincalc_contacts for all
  to authenticated
  using (public.fincalc_is_admin())
  with check (public.fincalc_is_admin());

-- ------------------------------------------------------------
-- OPTIONAL: dashboard stats (total + last 7 days)
-- ------------------------------------------------------------
create or replace view public.fincalc_stats
with (security_invoker = true) as
select
  (select count(*) from public.fincalc_contacts) as contacts_total,
  (select count(*) from public.fincalc_contacts where status = 'new') as contacts_new,
  (select count(*) from public.fincalc_contacts
     where created_at >= now() - interval '7 days') as contacts_last_7_days;

grant select on public.fincalc_stats to authenticated;
