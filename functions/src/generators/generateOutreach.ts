import { onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { ANTHROPIC_API_KEY, generateJSON } from '../lib/anthropic'
import { gate, meterUsage, requirePlan, validate } from '../lib/guards'

const Input = z.object({
  problem_statement: z.string().min(10).max(1000),
  offer_summary: z.string().min(5).max(800),
  platform: z.string().min(2).max(60),
  channel: z.enum(['dm', 'email', 'community_post']),
  voice_adjectives: z.array(z.string().min(2)).max(3).optional(),
})

interface Variation {
  variant: 'direct' | 'curious' | 'value_first'
  message: string
  word_count: number
  why_this_works: string
}

interface Output {
  variations: [Variation, Variation, Variation]
  platform_notes: string
}

export const generateOutreach = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1' },
  async (req) => {
    const uid = await gate(req)
    await requirePlan(uid, ['phantom_pro']) // PRO ONLY per PRD §16
    await meterUsage(uid, 'generateOutreach', 30)
    const input = validate(Input, req.data)

    const wordCap = input.channel === 'email' ? 200 : 100

    return generateJSON<Output>({
      user: `Write cold outreach messages for problem-focused validation. Goal: start a conversation, not sell.

Problem statement: """${input.problem_statement}"""
Offer (for context, NOT to pitch directly): """${input.offer_summary}"""
Platform: ${input.platform}
Channel: ${input.channel}
${input.voice_adjectives?.length ? `Voice: ${input.voice_adjectives.join(', ')}` : ''}

Hard rules:
- Lead with the problem in audience-facing language, not the solution.
- No hype, no urgency tactics, no generic openers ("Hope you're well", "Quick question").
- Specific, demonstrably understanding the situation.
- Low-friction ask: a conversation, not a purchase.
- Each message must be UNDER ${wordCap} words.

Return JSON: { "variations": [{ "variant": "direct"|"curious"|"value_first", "message": string, "word_count": number, "why_this_works": string }, ... x3 ], "platform_notes": string }`,
      maxTokens: 1800,
      temperature: 0.6,
    })
  },
)
