import { supabase } from './supabase'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

async function call<TIn, TOut>(path: string, data: TIn): Promise<TOut> {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token

  const res = await fetch(`${API_BASE}/api/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(body?.message ?? `Request failed: ${res.status}`)
  }

  return res.json() as Promise<TOut>
}

// ========================================
// AUTOMATIONS
// ========================================

export const createProject = (data: { name: string; initial_problem?: string }) =>
  call<typeof data, { project_id: string }>('automations/create-project', data)

export const completeOnboarding = (data: {
  what_building: string
  user_type: 'solo_founder' | 'creator' | 'coach_consultant' | 'agency' | 'other'
  built_in_public: 'yes' | 'no' | 'currently'
  history_note?: string
}) => call<typeof data, { project_id: string }>('automations/complete-onboarding', data)

export const skipOnboarding = () =>
  call<Record<string, never>, { ok: true }>('automations/skip-onboarding', {})

export const adminGrantPro = (data: { uid?: string; plan?: 'phantom' | 'phantom_pro' }) =>
  call<typeof data, { ok: true; uid: string; plan: string }>('automations/admin-grant-pro', data)

export const deleteProject = (data: { project_id: string }) =>
  call<typeof data, { ok: boolean }>('automations/delete-project', data)

export const completePhase = (data: { project_id: string; phase: 1 | 2 | 3 | 4 }) =>
  call<typeof data, { ok: boolean; phase: number }>('automations/complete-phase', data)

// ========================================
// PHASE 01 GENERATORS
// ========================================

export const refineProblemStatement = (data: { draft: string; project_id?: string }) =>
  call<typeof data, {
    refined: Array<{
      statement: string
      tightened: 'specificity' | 'audience' | 'outcome' | 'avoidance'
      note: string
    }>
  }>('generators/refine-problem-statement', data)

export const extractUnfairAdvantages = (data: { background: string; problemStatement?: string; project_id?: string }) =>
  call<typeof data, {
    advantages: Array<{
      advantage: string
      type: 'experience' | 'survived' | 'built' | 'access' | 'knowledge'
      credibilityScore: number
      reasoning: string
    }>
    rejected: Array<{ claim: string; reason: string }>
  }>('generators/extract-unfair-advantages', data)

export const synthesizePositioning = (data: { problemStatement: string; unfairAdvantages: string[]; project_id?: string }) =>
  call<typeof data, {
    positioningOptions: Array<{
      sentence: string
      angle: 'problem-led' | 'outcome-led' | 'identity-led'
      reasoning: string
    }>
    workingNames: Array<{ name: string; rationale: string }>
    voiceTriples: Array<{ adjectives: [string, string, string]; whyItFits: string }>
  }>('generators/synthesize-positioning', data)

export const extractAudienceLanguage = (data: { problemStatement: string; audienceDescription: string; project_id?: string }) =>
  call<typeof data, {
    problemPhrases: string[]
    emotionalDescriptors: string[]
    failedAttemptPhrases: string[]
    outcomePhrases: string[]
    jargonToAvoid: string[]
    examples: Array<{ verbatim: string; whereSaid: string }>
  }>('generators/extract-audience-language', data)

export const findWhereToTest = (data: { problemStatement: string; audienceDescription: string; project_id?: string }) =>
  call<typeof data, {
    locations: Array<{
      name: string
      channel: 'reddit' | 'discord' | 'slack' | 'facebook_group' | 'forum' | 'twitter' | 'linkedin' | 'newsletter' | 'youtube' | 'other'
      url?: string
      whyAudienceIsHere: string
      outreachStyle: string
      accessDifficulty: 'easy' | 'medium' | 'hard'
      priorityScore: number
    }>
    searchQueries: string[]
  }>('generators/find-where-to-test', data)

// ========================================
// PHASE 02 GENERATORS
// ========================================

export const buildMinimumOffer = (data: { project_id: string; outcome_override?: string }) =>
  call<typeof data, {
    drafts: Array<{
      name: string
      type: 'service' | 'digital_product' | 'course' | 'consultation' | 'other'
      includes: string[]
      outcome_sentence: string
      price_band: { low: number; high: number; currency: 'USD' }
      delivery_method: string
      why_this_validates_fast: string
    }>
  }>('generators/build-minimum-offer', data)

export const generateOutreach = (data: { project_id: string; platform: string; channel: 'dm' | 'email' | 'community_post' }) =>
  call<typeof data, {
    variations: Array<{
      variant: 'direct' | 'curious' | 'value_first'
      message: string
      word_count: number
      why_this_works: string
    }>
    platform_notes: string
  }>('generators/generate-outreach', data)

export const buildObjectionLibrary = (data: { project_id: string }) =>
  call<typeof data, {
    buckets: Array<{
      bucket: 'price' | 'trust' | 'proof' | 'fit' | 'timing' | 'other'
      objections: Array<{
        raw: string
        pattern: string
        response: string
        offer_change_hint: string | null
      }>
    }>
    most_common_bucket: 'price' | 'trust' | 'proof' | 'fit' | 'timing' | 'other'
    empty?: boolean
  }>('generators/build-objection-library', data)

// ========================================
// PHASE 03 GENERATORS
// ========================================

export const diagnoseOffer = (data: { project_id: string }) =>
  call<typeof data, {
    diagnosis_code: 'no_replies' | 'replies_no_conversations' | 'conversations_no_close' | 'converting_below_target' | 'no_conversion_after_30'
    diagnosis: string
    fix: string
    variable_to_change: 'problem_statement' | 'offer_structure' | 'positioning' | 'audience' | 'price' | 'proof'
    reasoning: string
  }>('generators/diagnose-offer', data)

export const suggestIteration = (data: { project_id: string }) =>
  call<typeof data, {
    variable_to_change: string
    hypothesis: string
    exact_change: string
    measure: string
    expected_signal: string
    do_not_change: string[]
  }>('generators/suggest-iteration', data)

export const competitiveGapAnalysis = (data: { problem_statement: string; audience: string; project_id?: string }) =>
  call<typeof data, {
    existing_solutions: Array<{
      name: string
      category: 'incumbent_software' | 'service_provider' | 'community' | 'content_creator' | 'diy_method' | 'other'
      does_well: string[]
      consistently_misses: string[]
    }>
    gaps: Array<{ gap: string; why_unfilled: string; user_wedge: string }>
    primary_wedge: string
  }>('generators/competitive-gap-analysis', data)

// ========================================
// PHASE 04 GENERATORS
// ========================================

export const positioningFromData = (data: { project_id: string }) =>
  call<typeof data, {
    positioning: string
    reasoning: string
    buyer_phrases_used: string[]
    what_was_left_out: string[]
  }>('generators/positioning-from-data', data)

export const recommendBrandIdentity = (data: { project_id: string; audience_override?: string }) =>
  call<typeof data, {
    visual_direction: 'minimal' | 'editorial' | 'bold' | 'warm' | 'technical' | 'other'
    visual_reasoning: string
    color_mood: { primary_feel: string; avoid: string[]; example_palette: string[] }
    typography_mood: { display_feel: string; body_feel: string; avoid: string[] }
    voice_pillars: string[]
    one_thing_to_avoid: string
  }>('generators/recommend-brand-identity', data)

export const buildNotFor = (data: { project_id: string }) =>
  call<typeof data, {
    not_for_paragraph: string
    exclusions: Array<{ exclusion: string; why: string }>
    failure_modes_if_we_serve_them: string[]
  }>('generators/build-not-for', data)

export const structureTestimonial = (data: {
  raw_text: string
  source_note?: string
  project_id: string
  save_to_vault?: boolean
}) =>
  call<typeof data, {
    buyer_problem_language: string
    buyer_outcome_language: string
    measurable_result: string | null
    permission_flag: 'granted' | 'unclear' | 'not_addressed'
    missing_pieces: string[]
    follow_up_questions: string[]
    pull_quote: string
  }>('generators/structure-testimonial', data)

export const curateProofPackage = (data: { project_id: string }) =>
  call<typeof data, {
    selected: Array<{
      proof_id: string
      proof_type: string
      why_it_belongs: string
      skeptic_score: number
    }>
    missing_categories: string[]
    recommendation: string
  }>('generators/curate-proof-package', data)

// ========================================
// EXPORT
// ========================================

export const exportLockInPdf = (data: { project_id: string }) =>
  call<typeof data, { url: string; storage_path: string } | { html: string; fallback: true }>('export/lock-in-pdf', data)

// ========================================
// STORAGE
// ========================================

export const requestProofUploadUrl = (data: {
  project_id: string
  proof_type: 'screenshot' | 'testimonial' | 'case_study' | 'revenue' | 'conversion_data'
  filename: string
  content_type: string
  title?: string
  amount?: number
  source?: string
}) =>
  call<typeof data, { upload_url: string; storage_path: string; item_id: string }>('storage/proof-upload-url', data)

// ========================================
// STRIPE
// ========================================

export const createCheckoutSession = (data: { price_id: string }) =>
  call<typeof data, { url: string }>('billing/create-checkout', data)

export const createBillingPortalSession = () =>
  call<Record<string, never>, { url: string }>('billing/create-portal', {})

// ========================================
// INTEGRATIONS
// ========================================

export const getIntegrationAuthUrl = (data: { platform: 'typeform' | 'stripe' | 'calendly' | 'gumroad'; project_id: string }) =>
  call<typeof data, { auth_url: string }>('integrations/auth-url', data)

export const disconnectIntegration = (data: { platform: 'typeform' | 'stripe' | 'calendly' | 'gumroad'; project_id: string }) =>
  call<typeof data, { success: boolean }>('integrations/disconnect', data)

export const getIntegrations = (data: { project_id: string }) =>
  call<typeof data, { integrations: Array<{ platform: string; connected_at: string; status: string }> }>('integrations/list', data)
