-- =============================================================================
-- PHANTOM — Row Level Security Policies
-- Mirrors firestore.rules exactly.
-- Run AFTER 01_schema.sql
-- =============================================================================

-- Enable RLS on every table
alter table public.users               enable row level security;
alter table public.ai_usage            enable row level security;
alter table public.rate_limits         enable row level security;
alter table public.projects            enable row level security;
alter table public.ghost_identity      enable row level security;
alter table public.silent_test         enable row level security;
alter table public.iteration_loop      enable row level security;
alter table public.lock_in             enable row level security;
alter table public.outreach_log        enable row level security;
alter table public.iteration_versions  enable row level security;
alter table public.generations         enable row level security;
alter table public.insights            enable row level security;
alter table public.audience_language   enable row level security;
alter table public.objection_library   enable row level security;
alter table public.competitive_gap     enable row level security;
alter table public.iteration_suggestions enable row level security;
alter table public.outreach_templates  enable row level security;
alter table public.proof_package       enable row level security;
alter table public.proof_vault         enable row level security;
alter table public.activity_log        enable row level security;
alter table public.integrations        enable row level security;

-- ---------------------------------------------------------------------------
-- Helper: service-role bypass
-- The API server uses the service role key and bypasses RLS entirely.
-- All policies below apply only to anon / authenticated (client) roles.
-- ---------------------------------------------------------------------------

-- =============================================================================
-- USERS
-- Owner reads their own row.
-- Owner may update only llm_provider.
-- No client inserts or deletes (bootstrapUser API route handles creation).
-- =============================================================================
create policy "users: owner read"
  on public.users for select
  using (auth.uid() = id);

create policy "users: owner update llm_provider only"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
-- Note: column-level enforcement (only llm_provider) is done in the API route,
-- not here, to keep policies simple. The service role handles all other updates.

-- =============================================================================
-- AI_USAGE — owner read, server writes only
-- =============================================================================
create policy "ai_usage: owner read"
  on public.ai_usage for select
  using (auth.uid() = user_id);

-- No insert/update/delete policies → only service role can write

-- =============================================================================
-- RATE_LIMITS — server-only, no client access
-- =============================================================================
-- No policies → blocked for all client roles

-- =============================================================================
-- PROJECTS
-- =============================================================================
create policy "projects: owner read"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "projects: owner delete"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Clients cannot set phase flags, ready_to_surface, or change user_id.
-- Those are enforced server-side (service role). Client update is allowed
-- for non-protected columns (name, status active→archived, current_phase).
create policy "projects: owner update safe fields"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    -- prevent client from promoting to surfaced (server-only)
    and (status = 'active' or status = 'archived')
  );

-- No client insert — createProject API route uses service role

-- =============================================================================
-- Helper function: does the current user own the project?
-- Used by phase table policies.
-- =============================================================================
create or replace function public.owns_project(p_project_id uuid)
returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from public.projects
    where id = p_project_id and user_id = auth.uid()
  );
$$;

-- =============================================================================
-- PHASE TABLES — owner read/write via owns_project()
-- ghost_identity, silent_test, iteration_loop, lock_in
-- =============================================================================

-- ghost_identity
create policy "ghost_identity: owner read"
  on public.ghost_identity for select
  using (public.owns_project(project_id));

create policy "ghost_identity: owner write"
  on public.ghost_identity for insert
  with check (public.owns_project(project_id));

create policy "ghost_identity: owner update"
  on public.ghost_identity for update
  using (public.owns_project(project_id));

create policy "ghost_identity: owner delete"
  on public.ghost_identity for delete
  using (public.owns_project(project_id));

-- silent_test
create policy "silent_test: owner read"
  on public.silent_test for select
  using (public.owns_project(project_id));

create policy "silent_test: owner write"
  on public.silent_test for insert
  with check (public.owns_project(project_id));

create policy "silent_test: owner update"
  on public.silent_test for update
  using (public.owns_project(project_id));

create policy "silent_test: owner delete"
  on public.silent_test for delete
  using (public.owns_project(project_id));

-- iteration_loop
create policy "iteration_loop: owner read"
  on public.iteration_loop for select
  using (public.owns_project(project_id));

create policy "iteration_loop: owner write"
  on public.iteration_loop for insert
  with check (public.owns_project(project_id));

create policy "iteration_loop: owner update"
  on public.iteration_loop for update
  using (public.owns_project(project_id));

create policy "iteration_loop: owner delete"
  on public.iteration_loop for delete
  using (public.owns_project(project_id));

-- lock_in
create policy "lock_in: owner read"
  on public.lock_in for select
  using (public.owns_project(project_id));

create policy "lock_in: owner write"
  on public.lock_in for insert
  with check (public.owns_project(project_id));

create policy "lock_in: owner update"
  on public.lock_in for update
  using (public.owns_project(project_id));

create policy "lock_in: owner delete"
  on public.lock_in for delete
  using (public.owns_project(project_id));

-- =============================================================================
-- OUTREACH LOG — owner read/write
-- =============================================================================
create policy "outreach_log: owner read"
  on public.outreach_log for select
  using (auth.uid() = user_id);

create policy "outreach_log: owner insert"
  on public.outreach_log for insert
  with check (auth.uid() = user_id and public.owns_project(project_id));

create policy "outreach_log: owner update"
  on public.outreach_log for update
  using (auth.uid() = user_id);

create policy "outreach_log: owner delete"
  on public.outreach_log for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- ITERATION VERSIONS — owner read/write
-- version_number is server-stamped (enforced in API route)
-- =============================================================================
create policy "iteration_versions: owner read"
  on public.iteration_versions for select
  using (auth.uid() = user_id);

create policy "iteration_versions: owner insert"
  on public.iteration_versions for insert
  with check (auth.uid() = user_id and public.owns_project(project_id));

create policy "iteration_versions: owner update"
  on public.iteration_versions for update
  using (auth.uid() = user_id);

create policy "iteration_versions: owner delete"
  on public.iteration_versions for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- SERVER-MANAGED AI OUTPUT TABLES
-- Owner reads, no client writes.
-- =============================================================================

create policy "generations: owner read"
  on public.generations for select
  using (auth.uid() = user_id);

create policy "insights: owner read"
  on public.insights for select
  using (public.owns_project(project_id));

create policy "audience_language: owner read"
  on public.audience_language for select
  using (public.owns_project(project_id));

create policy "objection_library: owner read"
  on public.objection_library for select
  using (public.owns_project(project_id));

create policy "competitive_gap: owner read"
  on public.competitive_gap for select
  using (public.owns_project(project_id));

-- iteration_suggestions: owner can read and update (mark applied)
create policy "iteration_suggestions: owner read"
  on public.iteration_suggestions for select
  using (public.owns_project(project_id));

create policy "iteration_suggestions: owner update"
  on public.iteration_suggestions for update
  using (public.owns_project(project_id));

-- outreach_templates: owner can read and delete
create policy "outreach_templates: owner read"
  on public.outreach_templates for select
  using (public.owns_project(project_id));

create policy "outreach_templates: owner delete"
  on public.outreach_templates for delete
  using (public.owns_project(project_id));

create policy "proof_package: owner read"
  on public.proof_package for select
  using (public.owns_project(project_id));

-- =============================================================================
-- PROOF VAULT
-- =============================================================================
create policy "proof_vault: owner read"
  on public.proof_vault for select
  using (auth.uid() = user_id);

create policy "proof_vault: owner insert"
  on public.proof_vault for insert
  with check (auth.uid() = user_id);

-- user may update non-server fields; file_url + storage_path are server-only
create policy "proof_vault: owner update safe fields"
  on public.proof_vault for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
-- file_url + storage_path column protection enforced in API route

create policy "proof_vault: owner delete"
  on public.proof_vault for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- ACTIVITY LOG — server-written, owner reads their own
-- =============================================================================
create policy "activity_log: owner read"
  on public.activity_log for select
  using (auth.uid() = user_id);

-- =============================================================================
-- INTEGRATIONS — owner reads and deletes; server inserts/updates
-- =============================================================================
create policy "integrations: owner read"
  on public.integrations for select
  using (auth.uid() = user_id);

create policy "integrations: owner delete"
  on public.integrations for delete
  using (auth.uid() = user_id);
