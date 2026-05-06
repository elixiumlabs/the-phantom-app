-- =============================================================================
-- PHANTOM — pg_cron Scheduled Jobs
-- Replaces Firebase Cloud Scheduler (inactivityNudge, syncIntegrations).
-- generateDailyBriefs is handled lazily on dashboard load (no cron needed).
--
-- Run AFTER 01_schema.sql and 02_rls.sql.
-- Requires pg_cron + pg_net extensions (enabled in 01_schema.sql).
--
-- YOUR_VERCEL_URL and CRON_SECRET must be set before running.
-- Replace the placeholders below with your actual values.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Inactivity Nudge — runs daily at 09:00 UTC
-- Finds users inactive for 7+ days and calls the Vercel API route which
-- sends the email via Resend. The API route handles the actual email logic.
-- ---------------------------------------------------------------------------
select cron.schedule(
  'inactivity-nudge',           -- job name (unique)
  '0 9 * * *',                  -- every day at 09:00 UTC
  $$
    select net.http_post(
      url     := 'https://YOUR_VERCEL_URL/api/cron/inactivity-nudge',
      headers := jsonb_build_object(
        'Content-Type',   'application/json',
        'x-cron-secret',  'YOUR_CRON_SECRET'
      ),
      body    := '{}'::jsonb
    );
  $$
);

-- ---------------------------------------------------------------------------
-- Sync Integrations — runs every 6 hours
-- Refreshes OAuth tokens for connected third-party integrations
-- (Typeform, Calendly, Gumroad, Stripe).
-- ---------------------------------------------------------------------------
select cron.schedule(
  'sync-integrations',
  '0 */6 * * *',                -- every 6 hours
  $$
    select net.http_post(
      url     := 'https://YOUR_VERCEL_URL/api/cron/sync-integrations',
      headers := jsonb_build_object(
        'Content-Type',   'application/json',
        'x-cron-secret',  'YOUR_CRON_SECRET'
      ),
      body    := '{}'::jsonb
    );
  $$
);

-- ---------------------------------------------------------------------------
-- Cleanup old rate limit windows — runs daily at 03:00 UTC
-- Removes expired rows so the table stays small.
-- This one runs pure SQL (no HTTP call needed).
-- ---------------------------------------------------------------------------
select cron.schedule(
  'cleanup-rate-limits',
  '0 3 * * *',
  $$
    delete from public.rate_limits where window_end < now();
  $$
);

-- ---------------------------------------------------------------------------
-- Cleanup old AI usage rows older than 90 days — runs weekly on Sunday 04:00 UTC
-- ---------------------------------------------------------------------------
select cron.schedule(
  'cleanup-ai-usage',
  '0 4 * * 0',
  $$
    delete from public.ai_usage where day < current_date - interval '90 days';
  $$
);

-- =============================================================================
-- To view scheduled jobs:
--   select * from cron.job;
--
-- To unschedule a job:
--   select cron.unschedule('inactivity-nudge');
-- =============================================================================
