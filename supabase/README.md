# Supabase Setup

Run these SQL files in order in the Supabase SQL Editor.

| File | What it does |
|---|---|
| `01_schema.sql` | Creates tables, types, indexes, and `updated_at` triggers |
| `02_rls.sql` | Enables row level security and owner policies |
| `03_cron.sql` | Schedules Vercel cron-backed jobs |
| `04_post_gcp_migration_fixes.sql` | Adds post-migration columns, webhook keys, summaries, and compatibility triggers |
| `05_openrouter_llm_provider.sql` | Adds OpenRouter to the LLM provider enum |
| `06_onboarding_responses.sql` | Stores structured onboarding/customer intake for admin review |

## Environment

Vercel needs:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_WEBHOOK_SECRET`
- `CRON_SECRET`
- AI provider keys such as `GEMINI_API_KEY`, `GROQ_API_KEY`, and `OPENROUTER_API_KEY`
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

Enable Email auth. Enable GitHub and Discord OAuth in Supabase to support the social login buttons on the login and signup screens.

### GitHub social login

1. In GitHub, go to Settings > Developer settings > OAuth Apps > New OAuth App.
2. Use the Phantom production origin as the Homepage URL:

```text
https://the-phantom-app-empress-projects-0c495ae7.vercel.app
```

3. Use the Supabase Auth callback URL as the Authorization callback URL:

```text
https://uqkeuojzrnxdyefmyuwz.supabase.co/auth/v1/callback
```

4. In Supabase, go to Authentication > Sign In / Providers > GitHub.
5. Enable GitHub, then paste the GitHub OAuth App Client ID and Client Secret.
6. In Supabase Authentication > URL Configuration, add the app callback URLs:

```text
https://the-phantom-app-empress-projects-0c495ae7.vercel.app/auth/callback
http://localhost:5173/auth/callback
http://localhost:5174/auth/callback
```

GitHub social login is separate from the Supabase OAuth 2.1 Server settings below.

### Discord social login

1. In Discord, go to the Developer Portal and create an application.
2. Add this redirect URL to the Discord OAuth2 settings:

```text
https://uqkeuojzrnxdyefmyuwz.supabase.co/auth/v1/callback
```

3. In Supabase, go to Authentication > Sign In / Providers > Discord.
4. Enable Discord, then paste the Discord Client ID and Client Secret.
5. Keep the same Supabase redirect URLs listed above for the app callback.

For Supabase OAuth 2.1 Server:

1. In Supabase, go to Authentication > URL Configuration.
2. Set Site URL to the app origin without a trailing slash, for example:

```text
https://the-phantom-app-empress-projects-0c495ae7.vercel.app
```

3. Add regular app sign-in redirect URLs:

```text
https://the-phantom-app-empress-projects-0c495ae7.vercel.app/auth/callback
http://localhost:5173/auth/callback
```

4. Go to Authentication > OAuth Server, enable OAuth 2.1 Server, and set Authorization Path to:

```text
/oauth/consent
```

This produces the authorization UI at:

```text
https://the-phantom-app-empress-projects-0c495ae7.vercel.app/oauth/consent
```

OAuth clients should use these Supabase endpoints:

```text
Authorization endpoint:
https://uqkeuojzrnxdyefmyuwz.supabase.co/auth/v1/oauth/authorize

Token endpoint:
https://uqkeuojzrnxdyefmyuwz.supabase.co/auth/v1/oauth/token

JWKS endpoint:
https://uqkeuojzrnxdyefmyuwz.supabase.co/auth/v1/.well-known/jwks.json

OIDC discovery:
https://uqkeuojzrnxdyefmyuwz.supabase.co/auth/v1/.well-known/openid-configuration
```

Avoid configuring the Site URL with a trailing slash, otherwise Supabase may build a double-slash URL like `//oauth/consent`.
