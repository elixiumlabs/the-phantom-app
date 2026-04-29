import { onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { ANTHROPIC_API_KEY, generateJSON } from '../lib/anthropic'
import { gate, meterUsage, requirePlan, validate } from '../lib/guards'

const Input = z.object({
  positioning: z.string().min(5).max(800),
  audience: z.string().min(3).max(500),
})

interface Output {
  not_for_paragraph: string
  exclusions: Array<{ exclusion: string; why: string }>
  failure_modes_if_we_serve_them: string[]
}

export const buildNotFor = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1' },
  async (req) => {
    const uid = await gate(req)
    await requirePlan(uid, ['free', 'phantom', 'phantom_pro'])
    await meterUsage(uid, 'buildNotFor', 10)
    const input = validate(Input, req.data)

    return generateJSON<Output>({
      user: `Define who this brand is NOT for, as specifically as the audience definition itself.

Positioning: """${input.positioning}"""
Audience: """${input.audience}"""

Return JSON: { "not_for_paragraph": string, "exclusions": [{ "exclusion": string, "why": string }], "failure_modes_if_we_serve_them": string[] }

- not_for_paragraph: a tight paragraph (under 80 words).
- exclusions: 4-6 specific types of person/situation. Concrete, not vague.
- failure_modes_if_we_serve_them: 3-4 specific bad outcomes (refunds, complaints, dilution, mismatched expectations).`,
      maxTokens: 1000,
      temperature: 0.4,
    })
  },
)
