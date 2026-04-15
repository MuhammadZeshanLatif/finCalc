-- Supabase blog backend schema for FinanceCalculator
-- Run this in Supabase SQL editor (or migrations) before enabling the app APIs.

create extension if not exists "pgcrypto";

create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  topic_key text not null,
  slug text not null,
  lang text not null check (lang in ('en', 'ru')),
  title text not null,
  meta_title text not null,
  meta_description text not null,
  keywords text not null default '',
  excerpt text not null default '',
  date_published date not null default current_date,
  date_modified date not null default current_date,
  author text not null default 'FinanceCalculator Editorial',
  reading_time_minutes integer not null default 5 check (reading_time_minutes > 0),
  hero jsonb not null default '{}'::jsonb,
  key_phrases text[] not null default '{}'::text[],
  blocks jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  calc_link text not null default 'loan',
  article_section text,
  smartmag_subtitle text,
  external_link jsonb,
  image_plan jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

create unique index if not exists blogs_lang_slug_uq on public.blogs (lang, slug);
create unique index if not exists blogs_lang_topic_key_uq on public.blogs (lang, topic_key);
create index if not exists blogs_status_lang_date_idx on public.blogs (status, lang, date_published desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  new.date_modified = current_date;
  return new;
end;
$$;

drop trigger if exists trg_blogs_set_updated_at on public.blogs;
create trigger trg_blogs_set_updated_at
before update on public.blogs
for each row
execute function public.set_updated_at();

alter table public.blogs enable row level security;
alter table public.blog_admins enable row level security;

drop policy if exists "public-read-published-blogs" on public.blogs;
create policy "public-read-published-blogs"
on public.blogs
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "admin-read-all-blogs" on public.blogs;
create policy "admin-read-all-blogs"
on public.blogs
for select
to authenticated
using (
  exists (
    select 1
    from public.blog_admins ba
    where lower(ba.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "admin-insert-blogs" on public.blogs;
create policy "admin-insert-blogs"
on public.blogs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.blog_admins ba
    where lower(ba.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "admin-update-blogs" on public.blogs;
create policy "admin-update-blogs"
on public.blogs
for update
to authenticated
using (
  exists (
    select 1
    from public.blog_admins ba
    where lower(ba.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
)
with check (
  exists (
    select 1
    from public.blog_admins ba
    where lower(ba.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "admin-delete-blogs" on public.blogs;
create policy "admin-delete-blogs"
on public.blogs
for delete
to authenticated
using (
  exists (
    select 1
    from public.blog_admins ba
    where lower(ba.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop policy if exists "admin-read-admin-list" on public.blog_admins;
create policy "admin-read-admin-list"
on public.blog_admins
for select
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

