import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from './firebase'

const fns = getFunctions(app, 'us-central1')

function call<TIn, TOut>(name: string) {
  const fn = httpsCallable<TIn, TOut>(fns, name)
  return async (data: TIn): Promise<TOut> => (await fn(data)).data
}

// ========================================
// AUTOMATIONS
// ========================================

export const createProject = call<
  { name: string; initial_problem?: string },
  { project_id: string }
>('createProject')

export const completeOnboarding = call<
  {
    what_building: string
    user_type: 'solo_founder' | 'creator' | 'coach_consultant' | 'agency' | 'other'
    built_in_public: 'yes' | 'no' | 'currently'
    history_note?: string
  },
  { project_id: string }
>('completeOnboarding')

export const skipOnboarding = call<
  Record<string, never>,
  { ok: true }
>('skipOnboarding')

export const adminGrantPro = call<
  { uid?: string; plan?: 'phantom' | 'phantom_pro' },
  { ok: true; uid: string; plan: string }
>('adminGrantPro')

export const deleteProject = call<
  { project_id: string },
  { ok: boolean }
>('deleteProject')

export const completePhase = call<
  { project_id: string; phase: 1 | 2 | 3 | 4 },
  { ok: boolean; phase: number }
>('completePhase')

// ========================================
// PHASE 01 GENERATORS
// ========================================

export const refineProblemStatement = call<
  { draft: string; project_id?: string },
  {
    refined: Array<{
      statement: string
      tightened: 'specificity' | 'audience' | 'outcome' | 'avoidance'
      note: string
    }>
  }
>('refineProblemStatement')

export const extractUnfairAdvantages = call<
  { background: string; problemStatement?: string; project_id?: string },
  {
    advantages: Array<{
      advantage: string
      type: 'experience' | 'survived' | 'built' | 'access' | 'knowledge'
      credibilityScore: number
      reasoning: string
    }>
    rejected: Array<{ claim: string; reason: string }>
  }
>('extractUnfairAdvantages')

export const synthesizePositioning = call<
  { problemStatement: string; unfairAdvantages: string[]; project_id?: string },
  {
    positioningOptions: Array<{
      sentence: string
      angle: 'problem-led' | 'outcome-led' | 'identity-led'
      reasoning: string
    }>
    workingNames: Array<{ name: string; rationale: string }>
    voiceTriples: Array<{ adjectives: [string, string, string]; whyItFits: string }>
  }
>('synthesizePositioning')

export const extractAudienceLanguage = call<
  { problemStatement: string; audienceDescription: string; project_id?: string },
  {
    problemPhrases: string[]
    emotionalDescriptors: string[]
    failedAttemptPhrases: string[]
    outcomePhrases: string[]
    jargonToAvoid: string[]
    examples: Array<{ verbatim: string; whereSaid: string }>
  }
>('extractAudienceLanguage')

export const findWhereToTest = call<
  { problemStatement: string; audienceDescription: string; project_id?: string },
  {
    locations: Array<{
      name: string
      channel:
        | 'reddit'
        | 'discord'
        | 'slack'
        | 'facebook_group'
        | 'forum'
        | 'twitter'
        | 'linkedin'
        | 'newsletter'
        | 'youtube'
        | 'other'
      url?: string
      whyAudienceIsHere: string
      outreachStyle: string
      accessDifficulty: 'easy' | 'medium' | 'hard'
      priorityScore: number
    }>
    searchQueries: string[]
  }
>('findWhereToTest')

// ========================================
// PHASE 02 GENERATORS
// ========================================

export const buildMinimumOffer = call<
  { project_id: string; outcome_override?: string },
  {
    drafts: Array<{
      name: string
      type: 'service' | 'digital_product' | 'course' | 'consultation' | 'other'
      includes: string[]
      outcome_sentence: string
      price_band: { low: number; high: number; currency: 'USD' }
      delivery_method: string
      why_this_validates_fast: string
    }>
  }
>('buildMinimumOffer')

export const generateOutreach = call<
  {
    project_id: string
    platform: string
    channel: 'dm' | 'email' | 'community_post'
  },
  {
    variations: Array<{
      variant: 'direct' | 'curious' | 'value_first'
      message: string
      word_count: number
      why_this_works: string
    }>
    platform_notes: string
  }
>('generateOutreach')

export const buildObjectionLibrary = call<
  { project_id: string },
  {
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
  }
>('buildObjectionLibrary')

// ========================================
// PHASE 03 GENERATORS
// ========================================

export const diagnoseOffer = call<
  { project_id: string },
  {
    diagnosis_code:
      | 'no_replies'
      | 'replies_no_conversations'
      | 'conversations_no_close'
      | 'converting_below_target'
      | 'no_conversion_after_30'
    diagnosis: string
    fix: string
    variable_to_change: 'problem_statement' | 'offer_structure' | 'positioning' | 'audience' | 'price' | 'proof'
    reasoning: string
  }
>('diagnoseOffer')

export const suggestIteration = call<
  { project_id: string },
  {
    variable_to_change: string
    hypothesis: string
    exact_change: string
    measure: string
    expected_signal: string
    do_not_change: string[]
  }
>('suggestIteration')

export const competitiveGapAnalysis = call<
  {
    problem_statement: string
    audience: string
    project_id?: string
  },
  {
    existing_solutions: Array<{
      name: string
      category: 'incumbent_software' | 'service_provider' | 'community' | 'content_creator' | 'diy_method' | 'other'
      does_well: string[]
      consistently_misses: string[]
    }>
    gaps: Array<{ gap: string; why_unfilled: string; user_wedge: string }>
    primary_wedge: string
  }
>('competitiveGapAnalysis')

// ========================================
// PHASE 04 GENERATORS
// ========================================

export const positioningFromData = call<
  { project_id: string },
  {
    positioning: string
    reasoning: string
    buyer_phrases_used: string[]
    what_was_left_out: string[]
  }
>('positioningFromData')

export const recommendBrandIdentity = call<
  { project_id: string; audience_override?: string },
  {
    visual_direction: 'minimal' | 'editorial' | 'bold' | 'warm' | 'technical' | 'other'
    visual_reasoning: string
    color_mood: { primary_feel: string; avoid: string[]; example_palette: string[] }
    typography_mood: { display_feel: string; body_feel: string; avoid: string[] }
    voice_pillars: string[]
    one_thing_to_avoid: string
  }
>('recommendBrandIdentity')

export const buildNotFor = call<
  { project_id: string },
  {
    not_for_paragraph: string
    exclusions: Array<{ exclusion: string; why: string }>
    failure_modes_if_we_serve_them: string[]
  }
>('buildNotFor')

export const structureTestimonial = call<
  {
    raw_text: string
    source_note?: string
    project_id: string
    save_to_vault?: boolean
  },
  {
    buyer_problem_language: string
    buyer_outcome_language: string
    measurable_result: string | null
    permission_flag: 'granted' | 'unclear' | 'not_addressed'
    missing_pieces: string[]
    follow_up_questions: string[]
    pull_quote: string
  }
>('structureTestimonial')

export const curateProofPackage = call<
  { project_id: string },
  {
    selected: Array<{
      proof_id: string
      proof_type: string
      why_it_belongs: string
      skeptic_score: number
    }>
    missing_categories: string[]
    recommendation: string
  }
>('curateProofPackage')

// ========================================
// EXPORT
// ========================================

export const exportLockInPdf = call<
  { project_id: string },
  { url: string; storage_path: string } | { html: string; fallback: true }
>('exportLockInPdf')

// ========================================
// STORAGE
// ========================================

export const requestProofUploadUrl = call<
  {
    project_id: string
    proof_type: 'screenshot' | 'testimonial' | 'case_study' | 'revenue' | 'conversion_data'
    filename: string
    content_type: string
    title?: string
    amount?: number
    source?: string
  },
  { upload_url: string; storage_path: string; item_id: string }
>('requestProofUploadUrl')

// ========================================
// STRIPE
// ========================================

export const createCheckoutSession = call<
  { price_id: string },
  { url: string }
>('createCheckoutSession')

export const createBillingPortalSession = call<
  Record<string, never>,
  { url: string }
>('createBillingPortalSession')
