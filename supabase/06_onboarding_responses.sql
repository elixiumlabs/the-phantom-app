-- =============================================================================
-- PHANTOM - Onboarding Responses
-- Stores structured customer intake from first-run onboarding.
-- Run AFTER 04_post_gcp_migration_fixes.sql.
-- =============================================================================

create table public.onboarding_responses (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null unique references public.users(id) on delete cascade,
  project_id        uuid references public.projects(id) on delete set null,
  what_building     text not null default '',
  user_type         text not null check (user_type in ('solo_founder', 'creator', 'coach_consultant', 'agency', 'other')),
  built_in_public   text not null check (built_in_public in ('yes', 'no', 'currently')),
  history_note      text,
  refined_problem   text,
  suggested_name    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_onboarding_responses_created on public.onboarding_responses(created_at desc);
create index idx_onboarding_responses_project on public.onboarding_responses(project_id);

alter table public.onboarding_responses enable row level security;

create policy "onboarding_responses: owner read"
  on public.onboarding_responses for select
  using (auth.uid() = user_id);

-- No client insert/update/delete policies. The API server writes with service role.

create trigger trg_onboarding_responses_updated_at
  before update on public.onboarding_responses
  for each row execute function public.set_updated_at();
