# Supabase Setup

Run these SQL files in order in the Supabase SQL Editor.

| File | What it does |
|---|---|
| `01_schema.sql` | Creates tables, types, indexes, and `updated_at` triggers |
| `02_rls.sql` | Enables row level security and owner policies |
| `03_cron.sql` | Schedules Vercel cron-backed jobs |
| `04_post_gcp_migration_fixes.sql` | Adds post-migration columns, webhook keys, summaries, and compatibility triggers |

## Environment

Vercel needs:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_WEBHOOK_SECRET`
- `CRON_SECRET`
- AI provider keys such as `GEMINI_API_KEY` and `GROQ_API_KEY`
- Stripe keys and webhook secret

The Vite frontend needs:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Stripe price IDs

## Storage

Create these buckets:

- `proof-vault`: private, used for customer proof uploads
- `phantom-app`: public, used for marketing/static image assets

For `proof-vault`, allow authenticated users to manage files inside their own folder:

```sql
create policy "proof-vault: owner upload"
  on storage.objects for insert
  with check (
    bucket_id = 'proof-vault'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "proof-vault: owner read"
  on storage.objects for select
  using (
    bucket_id = 'proof-vault'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "proof-vault: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'proof-vault'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Auth

Enable Email auth. Enable Google OAuth in Supabase if Google sign-in should remain available.

