-- ============================================================
-- FinanceCalculator — Blog CMS schema
-- Run this ENTIRE file once in: Supabase Dashboard → SQL Editor → New query
--
-- Same Supabase project as the contact form (ehnpcdnkagkmgmtopwkx).
-- Creates one dedicated table + one image bucket for this site only.
-- Does NOT touch the older `blogs` table. Safe to re-run.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ADMIN CHECK (same as schema.sql; repeated so this file runs on its own)
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
-- BLOG POSTS
-- status = 'draft'      → editors only
-- status = 'published'  → public once published_at <= now()
--   (a published row with a future published_at is a scheduled post;
--    RLS, the site, the PHP renderer and the sitemap all hide it until then,
--    so no cron job is needed)
-- ------------------------------------------------------------
create table if not exists public.fincalc_blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  category text not null default 'Personal Finance',
  author text not null default 'FinanceCalculator Editorial Team',
  image text not null default '',
  image_alt text not null default '',
  og_image text,
  seo_title text,
  seo_description text,
  social_description text,
  primary_keyword text,
  secondary_keywords text[] not null default '{}',
  tags text[] not null default '{}',
  calc_link text,
  canonical_url text,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fincalc_blog_published_has_date check (status = 'draft' or published_at is not null)
);

create index if not exists fincalc_blog_posts_public_idx
  on public.fincalc_blog_posts (status, published_at desc);

create or replace function public.fincalc_blog_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists fincalc_blog_posts_touch on public.fincalc_blog_posts;
create trigger fincalc_blog_posts_touch
  before update on public.fincalc_blog_posts
  for each row execute function public.fincalc_blog_touch_updated_at();

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Public (anon): read only posts that are published AND due.
-- Admin (signed-in user listed in blog_admins): full access.
-- ------------------------------------------------------------
alter table public.fincalc_blog_posts enable row level security;

drop policy if exists "public_read_live_fincalc_blog_posts" on public.fincalc_blog_posts;
create policy "public_read_live_fincalc_blog_posts"
  on public.fincalc_blog_posts for select
  to anon
  using (status = 'published' and published_at <= now());

drop policy if exists "admin_all_fincalc_blog_posts" on public.fincalc_blog_posts;
create policy "admin_all_fincalc_blog_posts"
  on public.fincalc_blog_posts for all
  to authenticated
  using (public.fincalc_is_admin())
  with check (public.fincalc_is_admin());

-- ------------------------------------------------------------
-- IMAGE BUCKET (public read, admin upload)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('fincalc-blog-images', 'fincalc-blog-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public_read_fincalc_blog_images" on storage.objects;
create policy "public_read_fincalc_blog_images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'fincalc-blog-images');

drop policy if exists "admin_write_fincalc_blog_images" on storage.objects;
create policy "admin_write_fincalc_blog_images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'fincalc-blog-images' and public.fincalc_is_admin());

drop policy if exists "admin_update_fincalc_blog_images" on storage.objects;
create policy "admin_update_fincalc_blog_images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'fincalc-blog-images' and public.fincalc_is_admin());

drop policy if exists "admin_delete_fincalc_blog_images" on storage.objects;
create policy "admin_delete_fincalc_blog_images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'fincalc-blog-images' and public.fincalc_is_admin());
