import { z } from 'zod'
import { defineEngine, appendGenerationHistory } from '../_lib/engine'
import { adminClient } from '../_lib/supabase'
import { apiError } from '../_lib/auth'

const Input = z.object({
  project_id: z.string().min(1),
  outcome_override: z.string().max(400).optional(),
})
type In = z.infer<typeof Input>

interface OfferDraft {
  name: string
  type: string
  includes: string[]
  outcome_sentence: string
  price_band: { low: number; high: number; currency: 'USD' }
  delivery_method: string
  why_this_validates_fast: string
}
interface Out extends Record<string, unknown> {
  drafts: [OfferDraft, OfferDraft, OfferDraft]
}

export default defineEngine<In, Out>({
  id: 'buildMinimumOffer',
  input: Input,
  plans: ['free', 'phantom', 'phantom_pro'],
  dailyLimit: 15,
  maxTokens: 2200,
  prompt: async ({ project }) => {
    if (!project) throw apiError(400, 'project_id required')
    const db = adminClient()
    const { data: gi } = await db.from('ghost_identity').select('*').eq('project_id', project.id).single()
    return `Generate 3 minimum-offer drafts for Phase 02 (Silent Test).

Problem statement: """${gi?.problem_statement ?? ''}"""
Working name: ${gi?.working_name ?? '—'}
Positioning: ${gi?.positioning_statement ?? '—'}
Voice: ${(gi?.voice_adjectives ?? []).join(', ') || '—'}

A minimum offer is the SMALLEST version that produces the outcome. Not comprehensive. Not beautiful. It must work.

Return JSON: { "drafts": [{ "name": string, "type": "service"|"digital_product"|"course"|"consultation"|"other", "includes": string[], "outcome_sentence": string, "price_band": { "low": number, "high": number, "currency": "USD" }, "delivery_method": string, "why_this_validates_fast": string }, ... x3 ] }

Make each draft a different shape — for example: a 1:1 service variant, a productized variant, and a tiny digital deliverable. Each "includes" list should be 3-5 specific items. Price bands should be realistic for the audience and the outcome.`
  },
  persist: async (ctx, output) => {
    if (!ctx.project) return { written_paths: [] }
    const written: string[] = []
    written.push(await appendGenerationHistory({ project_id: ctx.project.id, generator: 'buildMinimumOffer', input: ctx.input, output }))
    const db = adminClient()
    await db.from('silent_test').update({
      ai_offer_drafts: output.drafts,
      ai_offer_generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('project_id', ctx.project.id)
    written.push(`silent_test/${ctx.project.id}`)
    return { written_paths: written }
  },
})
