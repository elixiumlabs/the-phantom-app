# Supabase Setup — Phase 1

Run these SQL files in order in the Supabase SQL Editor.
Dashboard → SQL Editor → New query → paste → Run.

## Order

| File | What it does |
|---|---|
| `01_schema.sql` | Creates all tables, types, indexes, and updated_at triggers |
| `02_rls.sql` | Enables RLS and creates all security policies |
| `03_cron.sql` | Schedules inactivity nudge + integration sync jobs |

## Before running 03_cron.sql

Replace the two placeholders in that file:
- `YOUR_VERCEL_URL` → your Vercel deployment URL (e.g. `https://the-phantom-app.vercel.app`)
- `YOUR_CRON_SECRET` → a random secret string you generate (e.g. `openssl rand -hex 32`)

Store that same secret as `CRON_SECRET` in your Vercel environment variables.
Your Vercel API routes at `/api/cron/*` must check for this header before executing.

## Supabase project settings to note

After creating your project, grab these from Settings → API:
- `SUPABASE_URL` — the project URL
- `SUPABASE_ANON_KEY` — for the frontend client
- `SUPABASE_SERVICE_ROLE_KEY` — for the backend API routes (never expose to client)

## Storage bucket

Create one bucket manually in Storage → New bucket:
- Name: `proof-vault`
- Public: No (private)

RLS on the bucket is configured via the Storage policies UI or SQL.
Add this policy after creating the bucket:

```sql
-- Allow authenticated users to upload to their own folder
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

## Auth providers

In Authentication → Providers:
- Enable **Email** (enabled by default)
- Enable **Google** — add your OAuth client ID + secret from Google Cloud Console

## What's next (Phase 2–5)

- Phase 2: Swap Firebase Auth → Supabase Auth in `src/contexts/AuthContext.tsx`
- Phase 3: Port `functions/` to Vercel API routes in `api/`
- Phase 4: Swap Firestore `onSnapshot` → Supabase Realtime in `src/contexts/ProjectContext.tsx`
- Phase 5: Deploy frontend to Vercel, configure env vars, test end-to-end
