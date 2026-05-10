# The Phantom App

Pre-launch brand validation operating system.

## Stack

- Frontend: React + TypeScript + Vite + Tailwind
- Hosting: Vercel
- API: Vercel Serverless Functions in `api/`
- Auth, database, realtime, and storage: Supabase
- Billing: Stripe
- AI: Gemini/Groq provider routes through the Vercel API

## Local Development

1. Copy `.env.example` to `.env.local`.
2. Fill in the Supabase, Stripe, and AI provider values.
3. Run:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## Supabase

Apply SQL files in order:

```text
supabase/01_schema.sql
supabase/02_rls.sql
supabase/03_cron.sql
supabase/04_post_gcp_migration_fixes.sql
```

The Vercel API requires `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_WEBHOOK_SECRET`.

## Production

Deploy through Vercel. The active runtime is Supabase + Vercel; Firebase/GCP is no longer part of the app runtime.

```bash
npm run build
```

