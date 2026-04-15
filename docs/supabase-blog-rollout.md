## Supabase Blog Rollout

### 1) Configure environment variables

Add these variables locally and in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional)

### 2) Apply DB schema

Run `supabase/sql/blogs_schema.sql` in Supabase SQL editor.

Then add your admin email:

```sql
insert into public.blog_admins (email) values ('your-admin@email.com')
on conflict (email) do nothing;
```

### 3) Phased rollout

- **Phase 1 (hybrid read):**
  - Blog reads use Supabase published posts first.
  - Static arrays remain fallback.
  - BlogStudio writes/edits/deletes run against Supabase.
- **Phase 2 (full Supabase):**
  - Migrate static posts and verify all slugs.
  - Remove static fallback from `getBlogPosts()` once production content is complete.

### 4) Optional one-time static migration

Use the admin-authenticated API endpoint:

- `POST /api/blogs-migrate-static`
- Optional query param: `?lang=en` or `?lang=ru`

This endpoint upserts static posts into Supabase with `published` status.

