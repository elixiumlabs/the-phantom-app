import { z } from 'zod'
import { defineEngine, appendGenerationHistory } from '../_lib/engine'
import { adminClient } from '../_lib/supabase'
import { apiError } from '../_lib/auth'

const Input = z.object({
  project_id: z.string().min(1),
  platform: z.string().min(2).max(60),
  channel: z.enum(['dm', 'email', 'community_post']),
})
type In = z.infer<typeof Input>

interface Variation { variant: 'direct' | 'curious' | 'value_first'; message: string; word_count: number; why_this_works: string }
interface Out extends Record<string, unknown> {
  variations: [Variation, Variation, Variation]
  platform_notes: string
}

export default defineEngine<In, Out>({
  id: 'generateOutreach',
  input: Input,
  plans: ['phantom_pro'],
  dailyLimit: 30,
  maxTokens: 1800,
  temperature: 0.6,
  prompt: async ({ input, project }) => {
    if (!project) throw apiError(400, 'project_id required')
    const db = adminClient()
    const [{ data: gi }, { data: st }] = await Promise.all([
      db.from('ghost_identity').select('*').eq('project_id', project.id).single(),
      db.from('silent_test').select('*').eq('project_id', project.id).single(),
    ])
    const wordCap = input.channel === 'email' ? 200 : 100
    return `Write cold outreach messages for problem-focused validation. Goal: start a conversation, not sell.

Problem statement: """${gi?.problem_statement ?? ''}"""
Offer (for context, NOT to pitch directly): """${st?.offer_name ?? ''} — ${st?.offer_outcome ?? ''}"""
Includes: ${(st?.offer_includes ?? []).join(' / ') || '—'}
Platform: ${input.platform}
Channel: ${input.channel}
${gi?.voice_adjectives?.length ? `Voice: ${gi.voice_adjectives.join(', ')}` : ''}

Hard rules:
- Lead with the problem in audience-facing language, not the solution.
- No hype, no urgency tactics, no generic openers ("Hope you're well", "Quick question").
- Specific, demonstrably understanding the situation.
- Low-friction ask: a conversation, not a purchase.
- Each message must be UNDER ${wordCap} words.

Return JSON: { "variations": [{ "variant": "direct"|"curious"|"value_first", "message": string, "word_count": number, "why_this_works": string }, ... x3 ], "platform_notes": string }`
  },
  persist: async (ctx, output) => {
    if (!ctx.project) return { written_paths: [] }
    const written: string[] = []
    written.push(await appendGenerationHistory({ project_id: ctx.project.id, generator: 'generateOutreach', input: ctx.input, output }))
    const db = adminClient()
    const { data } = await db.from('outreach_templates').insert({
      project_id: ctx.project.id,
      user_id: ctx.uid,
      platform: ctx.input.platform,
      channel: ctx.input.channel,
      variations: output.variations,
      platform_notes: output.platform_notes,
    }).select('id').single()
    written.push(`outreach_templates/${data?.id}`)
    return { written_paths: written }
  },
})
