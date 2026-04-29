import { onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { ANTHROPIC_API_KEY, generateJSON } from '../lib/anthropic'
import { gate, meterUsage, requirePlan, validate } from '../lib/guards'

const Input = z.object({
  problem_statement: z.string().min(10).max(1000),
  outcome: z.string().min(3).max(400),
  audience_note: z.string().max(500).optional(),
})

interface OfferDraft {
  name: string
  type: 'service' | 'digital_product' | 'course' | 'consultation' | 'other'
  includes: string[]
  outcome_sentence: string
  price_band: { low: number; high: number; currency: 'USD' }
  delivery_method: string
  why_this_validates_fast: string
}

interface Output {
  drafts: [OfferDraft, OfferDraft, OfferDraft]
}

export const buildMinimumOffer = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1' },
  async (req) => {
    const uid = await gate(req)
    await requirePlan(uid, ['free', 'phantom', 'phantom_pro'])
    await meterUsage(uid, 'buildMinimumOffer', 15)
    const input = validate(Input, req.data)

    return generateJSON<Output>({
      user: `Generate 3 minimum-offer drafts for Phase 02 (Silent Test).

Problem statement: """${input.problem_statement}"""
Outcome the offer must produce: """${input.outcome}"""
${input.audience_note ? `Audience note: ${input.audience_note}` : ''}

A minimum offer is the SMALLEST version that produces the outcome. Not comprehensive. Not beautiful. It must work.

Return JSON: { "drafts": [{ "name": string, "type": "service"|"digital_product"|"course"|"consultation"|"other", "includes": string[], "outcome_sentence": string, "price_band": { "low": number, "high": number, "currency": "USD" }, "delivery_method": string, "why_this_validates_fast": string }, ... x3 ] }

Make each draft a different shape — for example: a 1:1 service variant, a productized variant, and a tiny digital deliverable. Each "includes" list should be 3-5 specific items. Price bands should be realistic for the audience and the outcome.`,
      maxTokens: 2000,
    })
  },
)
