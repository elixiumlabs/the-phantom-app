import * as admin from 'firebase-admin'
import { z } from 'zod'
import { appendGenerationHistory, defineEngine } from '../lib/engine'

const Input = z.object({
  project_id: z.string().min(1),
  platform: z.string().min(2).max(60),
  channel: z.enum(['dm', 'email', 'community_post']),
})
type In = z.infer<typeof Input>

interface Variation {
  variant: 'direct' | 'curious' | 'value_first'
  message: string
  word_count: number
  why_this_works: string
}

interface Out extends Record<string, unknown> {
  variations: [Variation, Variation, Variation]
  platform_notes: string
}

export const generateOutreach = defineEngine<In, Out>({
  id: 'generateOutreach',
  input: Input,
  plans: ['phantom_pro'],
  dailyLimit: 30,
  maxTokens: 1800,
  temperature: 0.6,
  prompt: async ({ input, project }) => {
    if (!project) throw new Error('project required')
    const [giSnap, stSnap] = await Promise.all([
      project.ref.collection('ghost_identity').doc('main').get(),
      project.ref.collection('silent_test').doc('main').get(),
    ])
    const gi = giSnap.data() ?? {}
    const st = stSnap.data() ?? {}
    const wordCap = input.channel === 'email' ? 200 : 100

    return `Write cold outreach messages for problem-focused validation. Goal: start a conversation, not sell.

Problem statement: """${gi.problem_statement ?? ''}"""
Offer (for context, NOT to pitch directly): """${st.offer_name ?? ''} — ${st.offer_outcome ?? ''}"""
Includes: ${(st.offer_includes ?? []).join(' / ') || '—'}
Platform: ${input.platform}
Channel: ${input.channel}
${gi.voice_adjectives?.length ? `Voice: ${gi.voice_adjectives.join(', ')}` : ''}

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
    written.push(
      await appendGenerationHistory({
        project_ref: ctx.project.ref,
        generator: 'generateOutreach',
        input: ctx.input,
        output,
      }),
    )
    const tplRef = ctx.project.ref.collection('outreach_templates').doc()
    await tplRef.set({
      platform: ctx.input.platform,
      channel: ctx.input.channel,
      variations: output.variations,
      platform_notes: output.platform_notes,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    })
    written.push(tplRef.path)
    return { written_paths: written }
  },
})
