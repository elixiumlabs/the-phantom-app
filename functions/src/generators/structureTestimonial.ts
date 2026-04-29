import { onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { ANTHROPIC_API_KEY, generateJSON } from '../lib/anthropic'
import { gate, meterUsage, requirePlan, validate } from '../lib/guards'

const Input = z.object({
  raw_text: z.string().min(10).max(4000),
  source_note: z.string().max(200).optional(),
})

interface Output {
  buyer_problem_language: string
  buyer_outcome_language: string
  measurable_result: string | null
  permission_flag: 'granted' | 'unclear' | 'not_addressed'
  missing_pieces: string[]
  follow_up_questions: string[]
  pull_quote: string
}

export const structureTestimonial = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1' },
  async (req) => {
    const uid = await gate(req)
    await requirePlan(uid, ['free', 'phantom', 'phantom_pro'])
    await meterUsage(uid, 'structureTestimonial', 30)
    const input = validate(Input, req.data)

    return generateJSON<Output>({
      user: `Structure this raw testimonial into the proof-package format. Surface what's missing.

Raw testimonial:
"""${input.raw_text}"""
${input.source_note ? `Source note: ${input.source_note}` : ''}

Extract:
- buyer_problem_language: how the buyer described the problem in their own words (verbatim where possible).
- buyer_outcome_language: how the buyer described the outcome they received (verbatim where possible).
- measurable_result: a specific number/metric/timeline mentioned, or null if none.
- permission_flag: did the buyer grant permission to use this publicly? "granted" / "unclear" / "not_addressed".
- missing_pieces: what is NOT in the testimonial that a skeptical stranger would need.
- follow_up_questions: 2-4 specific questions to ask the buyer to fill the gaps.
- pull_quote: the strongest <25-word quote from the testimonial, verbatim.

Return JSON: { "buyer_problem_language": string, "buyer_outcome_language": string, "measurable_result": string|null, "permission_flag": "granted"|"unclear"|"not_addressed", "missing_pieces": string[], "follow_up_questions": string[], "pull_quote": string }`,
      maxTokens: 1200,
      temperature: 0.3,
    })
  },
)
