import { onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { ANTHROPIC_API_KEY, generateJSON } from '../lib/anthropic'
import { gate, meterUsage, requirePlan, validate } from '../lib/guards'

const Input = z.object({
  buyer_problem_language: z.string().min(5).max(2000),
  buyer_outcome_language: z.string().min(5).max(2000),
  buyer_prior_attempts: z.string().min(3).max(2000),
})

interface Output {
  positioning: string
  reasoning: string
  buyer_phrases_used: string[]
  what_was_left_out: string[]
}

export const positioningFromData = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1' },
  async (req) => {
    const uid = await gate(req)
    await requirePlan(uid, ['free', 'phantom', 'phantom_pro'])
    await meterUsage(uid, 'positioningFromData', 10)
    const input = validate(Input, req.data)

    return generateJSON<Output>({
      user: `Generate the LOCKED positioning sentence for Phase 04. Build it from BUYER LANGUAGE only — not aspirational language.

Buyers described their problem as: """${input.buyer_problem_language}"""
Buyers described the outcome they got as: """${input.buyer_outcome_language}"""
What buyers had tried before that didn't work: """${input.buyer_prior_attempts}"""

Rules:
- One sentence. Under 30 words.
- Use phrases lifted directly from the buyer language above whenever possible.
- Specific enough that someone with the problem recognizes themselves immediately.
- A skeptical stranger should be able to understand it without context.

Return JSON: { "positioning": string, "reasoning": string, "buyer_phrases_used": string[], "what_was_left_out": string[] }

what_was_left_out: things the founder probably wants in the positioning that the buyer language did NOT actually support. List them so the founder sees the discipline.`,
      maxTokens: 700,
      temperature: 0.4,
    })
  },
)
