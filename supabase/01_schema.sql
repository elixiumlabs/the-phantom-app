-- =============================================================================
-- PHANTOM — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron";        -- scheduled jobs
create extension if not exists "pg_net";          -- HTTP calls from pg_cron

-- ---------------------------------------------------------------------------
-- Custom types
-- ---------------------------------------------------------------------------
create type plan_type as enum ('free', 'phantom', 'phantom_pro');
create type project_status as enum ('active', 'archived', 'surfaced');
create type llm_provider_type as enum ('gemini', 'groq', 'groq_fast', 'qwen', 'groq_compound');
create type subscription_status_type as enum ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete');

-- =============================================================================
-- USERS
-- Mirrors auth.users. Created by the bootstrapUser trigger (Phase 3).
-- Server-only fields: plan, stripe_*, subscription_status, onboarding_completed.
-- Users may update only llm_provider via the API.
-- =============================================================================
create table public.users (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null,
  full_name             text,
  avatar_url            text,

  -- plan & billing (server-only)
  plan                  plan_type not null default 'free',
  subscription_status   subscription_status_type,
  stripe_customer_id    text unique,
  stripe_subscription_id text unique,
  lifetime              boolean not null default false,

  -- preferences (user-editable)
  llm_provider          llm_provider_type not null default 'gemini',

  -- onboarding (server-only)
  onboarding_completed  boolean not null default false,
  is_admin              boolean not null default false,

  last_active_at        timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Daily AI usage counters: { generator_name: count }
-- One row per user per UTC day. Upserted by the API server.
create table public.ai_usage (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  day         date not null default current_date,
  generator   text not null,
  count       integer not null default 0,
  updated_at  timestamptz not null default now(),
  unique(user_id, day, generator)
);

-- Rate-limit windows (server-only, never exposed to client)
create table public.rate_limits (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  key         text not null,
  hits        integer not null default 0,
  window_end  timestamptz not null,
  unique(user_id, key)
);

-- =============================================================================
-- PROJECTS
-- =============================================================================
create table public.projects (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,
  name                text not null check(char_length(name) between 1 and 120),
  status              project_status not null default 'active',
  current_phase       smallint not null default 1 check(current_phase between 1 and 4),

  -- phase completion flags (server-only flips via callable)
  phase_1_completed   boolean not null default false,
  phase_2_completed   boolean not null default false,
  phase_3_completed   boolean not null default false,
  phase_4_completed   boolean not null default false,
  ready_to_surface    boolean not null default false,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- =============================================================================
-- PHASE 1 — Ghost Identity (one row per project)
-- =============================================================================
create table public.ghost_identity (
  id                      uuid primary key default uuid_generate_v4(),
  project_id              uuid not null unique references public.projects(id) on delete cascade,

  problem_statement       text not null default '',
  unfair_advantages       text[] not null default '{}',
  working_name            text not null default '',
  positioning_statement   text not null default '',
  voice_adjectives        text[] not null default '{}',

  -- AI-generated option sets (server-written, displayed for user selection)
  ai_problem_options      jsonb not null default '[]',
  ai_advantage_options    jsonb not null default '[]',
  ai_positioning_options  jsonb not null default '[]',
  ai_working_names        jsonb not null default '[]',
  ai_voice_triples        jsonb not null default '[]',

  -- checklist
  checklist_problem_written     boolean not null default false,
  checklist_advantages_mapped   boolean not null default false,
  checklist_positioning_written boolean not null default false,
  checklist_voice_defined       boolean not null default false,

  updated_at              timestamptz not null default now()
);

-- =============================================================================
-- PHASE 2 — Silent Test (one row per project)
-- =============================================================================
create table public.silent_test (
  id                        uuid primary key default uuid_generate_v4(),
  project_id                uuid not null unique references public.projects(id) on delete cascade,

  offer_name                text not null default '',
  offer_type                text,
  offer_includes            text[] not null default '{}',
  offer_outcome             text not null default '',
  offer_price               numeric(10,2),
  offer_currency            char(3) not null default 'USD',
  delivery_method           text not null default '',
  test_sample_size          integer,
  target_conversion_rate    numeric(5,2),
  failed_test_criteria      text not null default '',
  test_locations            text[] not null default '{}',
  sales_page                text,

  -- aggregated summary (server-computed)
  summary_total             integer not null default 0,
  summary_response_rate     numeric(5,2) not null default 0,
  summary_conversion_rate   numeric(5,2) not null default 0,
  summary_top_objection     text,

  -- AI-generated drafts
  ai_offer_drafts           jsonb not null default '[]',

  -- checklist
  checklist_offer_built             boolean not null default false,
  checklist_parameters_set          boolean not null default false,
  checklist_outreach_30             boolean not null default false,
  checklist_data_recorded           boolean not null default false,
  checklist_objections_documented   boolean not null default false,

  updated_at                timestamptz not null default now()
);

-- =============================================================================
-- PHASE 3 — Iteration Loop (one row per project)
-- =============================================================================
create table public.iteration_loop (
  id                          uuid primary key default uuid_generate_v4(),
  project_id                  uuid not null unique references public.projects(id) on delete cascade,

  diagnosis                   text not null default '',
  diagnosis_code              text,
  diagnosis_fix               text,
  diagnosis_variable          text,
  private_notes               text not null default '',

  -- checklist
  checklist_diagnosis_done        boolean not null default false,
  checklist_one_iteration         boolean not null default false,
  checklist_log_documented        boolean not null default false,
  checklist_converting_at_target  boolean not null default false,
  checklist_objections_reduced    boolean not null default false,

  updated_at                  timestamptz not null default now()
);

-- =============================================================================
-- PHASE 4 — Lock In (one row per project)
-- =============================================================================
create table public.lock_in (
  id                        uuid primary key default uuid_generate_v4(),
  project_id                uuid not null unique references public.projects(id) on delete cascade,

  buyer_problem_language    text not null default '',
  buyer_outcome_language    text not null default '',
  buyer_prior_attempts      text not null default '',
  generated_positioning     text not null default '',
  final_brand_name          text not null default '',
  visual_direction          text,
  final_voice_adjectives    text[] not null default '{}',
  not_for                   text not null default '',

  -- AI-generated options
  ai_brand_identity         jsonb,
  ai_not_for_exclusions     jsonb not null default '[]',

  -- checklist
  checklist_five_conversions          boolean not null default false,
  checklist_one_sentence_positioning  boolean not null default false,
  checklist_three_proof_pieces        boolean not null default false,
  checklist_objections_mapped         boolean not null default false,
  checklist_brand_from_data           boolean not null default false,
  checklist_not_for_defined           boolean not null default false,

  updated_at                timestamptz not null default now()
);

-- =============================================================================
-- OUTREACH LOG (many per project)
-- =============================================================================
create table public.outreach_log (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  date        date not null default current_date,
  platform    text,
  responded   boolean not null default false,
  converted   boolean not null default false,
  objection   text,
  notes       text,
  created_at  timestamptz not null default now()
);

-- =============================================================================
-- ITERATION VERSIONS (many per project)
-- =============================================================================
create table public.iteration_versions (
  id                    uuid primary key default uuid_generate_v4(),
  project_id            uuid not null references public.projects(id) on delete cascade,
  user_id               uuid not null references public.users(id) on delete cascade,
  version_number        integer not null default 1,
  date                  date not null default current_date,
  what_changed          text,
  single_variable       text,
  result                text,
  new_conversion_rate   numeric(5,2),
  flags                 text[] not null default '{}',
  created_at            timestamptz not null default now()
);

-- =============================================================================
-- GENERATIONS — AI run history (server-written, read-only for client)
-- =============================================================================
create table public.generations (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  generator   text not null,
  input       jsonb not null default '{}',
  output      jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- =============================================================================
-- SERVER-MANAGED AI OUTPUT TABLES
-- Written by the API, readable by project owner, never client-writable.
-- =============================================================================

create table public.insights (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  data        jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table public.audience_language (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  data        jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table public.objection_library (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  data        jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table public.competitive_gap (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  data        jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table public.iteration_suggestions (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  data        jsonb not null default '{}',
  -- user can mark suggestion as applied/dismissed
  applied     boolean not null default false,
  created_at  timestamptz not null default now()
);

create table public.outreach_templates (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  data        jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table public.proof_package (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  data        jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- =============================================================================
-- PROOF VAULT
-- =============================================================================
create table public.proof_vault (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  project_id      uuid references public.projects(id) on delete set null,
  proof_type      text,
  title           text,
  content         text,
  -- file fields written server-side after storage finalize
  file_url        text,
  storage_path    text,
  amount          numeric(10,2),
  source          text,
  date            date,
  tags            text[] not null default '{}',
  content_type    text,
  size            bigint,
  created_at      timestamptz not null default now()
);

-- =============================================================================
-- ACTIVITY LOG (server-written, user reads their own)
-- =============================================================================
create table public.activity_log (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  project_id  uuid references public.projects(id) on delete set null,
  action      text not null,
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- =============================================================================
-- INTEGRATIONS (OAuth tokens per project per provider)
-- =============================================================================
create table public.integrations (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  provider        text not null,   -- typeform | stripe | calendly | gumroad
  oauth_token     text,
  refresh_token   text,
  metadata        jsonb not null default '{}',
  connected_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(project_id, provider)
);

-- =============================================================================
-- INDEXES (mirrors firestore.indexes.json + extras)
-- =============================================================================

-- projects
create index idx_projects_user_status   on public.projects(user_id, status);
create index idx_projects_status_updated on public.projects(status, updated_at);

-- outreach_log
create index idx_outreach_project_date    on public.outreach_log(project_id, date desc);
create index idx_outreach_project_created on public.outreach_log(project_id, created_at desc);
create index idx_outreach_user_created    on public.outreach_log(user_id, created_at desc);

-- iteration_versions
create index idx_iter_versions_project on public.iteration_versions(project_id, version_number desc);

-- proof_vault
create index idx_proof_user_created    on public.proof_vault(user_id, created_at desc);
create index idx_proof_project_created on public.proof_vault(project_id, created_at desc);

-- activity_log
create index idx_activity_user_created on public.activity_log(user_id, created_at desc);

-- ai_usage
create index idx_ai_usage_user_day on public.ai_usage(user_id, day desc);

-- generations
create index idx_generations_project on public.generations(project_id, created_at desc);

-- server-managed tables
create index idx_insights_project           on public.insights(project_id, created_at desc);
create index idx_audience_lang_project      on public.audience_language(project_id, created_at desc);
create index idx_objection_lib_project      on public.objection_library(project_id, created_at desc);
create index idx_competitive_gap_project    on public.competitive_gap(project_id, created_at desc);
create index idx_iter_suggestions_project   on public.iteration_suggestions(project_id, created_at desc);
create index idx_outreach_templates_project on public.outreach_templates(project_id, created_at desc);
create index idx_proof_package_project      on public.proof_package(project_id, created_at desc);

-- =============================================================================
-- updated_at auto-trigger
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at           before update on public.users           for each row execute function public.set_updated_at();
create trigger trg_projects_updated_at        before update on public.projects        for each row execute function public.set_updated_at();
create trigger trg_ghost_identity_updated_at  before update on public.ghost_identity  for each row execute function public.set_updated_at();
create trigger trg_silent_test_updated_at     before update on public.silent_test     for each row execute function public.set_updated_at();
create trigger trg_iteration_loop_updated_at  before update on public.iteration_loop  for each row execute function public.set_updated_at();
create trigger trg_lock_in_updated_at         before update on public.lock_in         for each row execute function public.set_updated_at();
create trigger trg_integrations_updated_at    before update on public.integrations    for each row execute function public.set_updated_at();
create trigger trg_ai_usage_updated_at        before update on public.ai_usage        for each row execute function public.set_updated_at();
