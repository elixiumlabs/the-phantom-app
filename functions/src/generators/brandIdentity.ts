import { onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { ANTHROPIC_API_KEY, generateJSON } from '../lib/anthropic'
import { gate, meterUsage, requirePlan, validate } from '../lib/guards'

const Input = z.object({
  positioning: z.string().min(5).max(800),
  audience: z.string().min(3).max(500),
  voice_adjectives: z.array(z.string().min(2)).max(3).optional(),
})

interface Output {
  visual_direction: 'minimal' | 'editorial' | 'bold' | 'warm' | 'technical' | 'other'
  visual_reasoning: string
  color_mood: { primary_feel: string; avoid: string[]; example_palette: string[] }
  typography_mood: { display_feel: string; body_feel: string; avoid: string[] }
  voice_pillars: string[]
  one_thing_to_avoid: string
}

export const recommendBrandIdentity = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1' },
  async (req) => {
    const uid = await gate(req)
    await requirePlan(uid, ['free', 'phantom', 'phantom_pro'])
    await meterUsage(uid, 'recommendBrandIdentity', 8)
    const input = validate(Input, req.data)

    return generateJSON<Output>({
      user: `Recommend brand identity direction for a brand whose positioning is now LOCKED from buyer data.

Locked positioning: """${input.positioning}"""
Audience: """${input.audience}"""
${input.voice_adjectives?.length ? `Voice adjectives: ${input.voice_adjectives.join(', ')}` : ''}

The identity must REFLECT the validated positioning, not the founder's aspirational taste.

Return JSON: { "visual_direction": "minimal"|"editorial"|"bold"|"warm"|"technical"|"other", "visual_reasoning": string, "color_mood": { "primary_feel": string, "avoid": string[], "example_palette": string[] }, "typography_mood": { "display_feel": string, "body_feel": string, "avoid": string[] }, "voice_pillars": string[], "one_thing_to_avoid": string }

example_palette: 3-5 short hex codes. avoid arrays: list aesthetic moves the audience would interpret wrong.`,
      maxTokens: 1400,
      temperature: 0.5,
    })
  },
)
