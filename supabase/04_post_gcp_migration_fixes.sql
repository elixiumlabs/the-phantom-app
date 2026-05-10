-- =============================================================================
-- Post-GCP migration compatibility fixes
-- Run after 01_schema.sql, 02_rls.sql, and 03_cron.sql.
-- =============================================================================

do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'subscription_status_type'
      and e.enumlabel = 'lifetime'
  ) then
    alter type subscription_status_type add value 'lifetime';
  end if;
end $$;

alter table public.users
  add column if not exists onboarding_meta jsonb not null default '{}',
  add column if not exists webhook_key text unique,
  add column if not exists webhook_key_generated_at timestamptz;

alter table public.ghost_identity
  add column if not exists anti_customers text[] not null default '{}',
  add column if not exists checklist_anti_customers_defined boolean not null default false,
  add column if not exists ai_rejected_claims jsonb not null default '[]';

alter table public.silent_test
  alter column sales_page type jsonb using coalesce(nullif(sales_page, '')::jsonb, '{}'::jsonb),
  alter column sales_page set default '{}'::jsonb,
  add column if not exists summary_responded integer not null default 0,
  add column if not exists summary_converted integer not null default 0,
  add column if not exists checklist_sales_page_built boolean not null default false;

alter table public.outreach_log
  add column if not exists outreach_type text,
  add column if not exists identifier text;

alter table public.iteration_versions
  alter column single_variable type boolean using coalesce(single_variable::boolean, true);

create index if not exists idx_users_webhook_key on public.users(webhook_key) where webhook_key is not null;

create or replace function public.recompute_silent_test_summary()
returns trigger language plpgsql as $$
declare
  target_project uuid;
begin
  target_project := coalesce(new.project_id, old.project_id);

  update public.silent_test st
  set
    summary_total = stats.total,
    summary_responded = stats.responded,
    summary_converted = stats.converted,
    summary_response_rate = case when stats.total = 0 then 0 else round((stats.responded::numeric / stats.total::numeric) * 100, 2) end,
    summary_conversion_rate = case when stats.total = 0 then 0 else round((stats.converted::numeric / stats.total::numeric) * 100, 2) end,
    summary_top_objection = stats.top_objection,
    checklist_data_recorded = stats.total > 0,
    checklist_outreach_30 = stats.total >= 30,
    updated_at = now()
  from (
    select
      count(*)::integer as total,
      count(*) filter (where responded)::integer as responded,
      count(*) filter (where converted)::integer as converted,
      (
        select objection
        from public.outreach_log
        where project_id = target_project and nullif(trim(objection), '') is not null
        group by objection
        order by count(*) desc
        limit 1
      ) as top_objection
    from public.outreach_log
    where project_id = target_project
  ) stats
  where st.project_id = target_project;

  return null;
end;
$$;

drop trigger if exists trg_outreach_summary_insert on public.outreach_log;
drop trigger if exists trg_outreach_summary_update on public.outreach_log;
drop trigger if exists trg_outreach_summary_delete on public.outreach_log;

create trigger trg_outreach_summary_insert after insert on public.outreach_log
  for each row execute function public.recompute_silent_test_summary();
create trigger trg_outreach_summary_update after update on public.outreach_log
  for each row execute function public.recompute_silent_test_summary();
create trigger trg_outreach_summary_delete after delete on public.outreach_log
  for each row execute function public.recompute_silent_test_summary();

