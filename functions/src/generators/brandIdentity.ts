import * as admin from 'firebase-admin'
import { z } from 'zod'
import { appendGenerationHistory, defineEngine } from '../lib/engine'

const Input = z.object({
  project_id: z.string().min(1),
  audience_override: z.string().max(500).optional(),
})
type In = z.infer<typeof Input>

interface Out extends Record<string, unknown> {
  visual_direction: 'minimal' | 'editorial' | 'bold' | 'warm' | 'technical' | 'other'
  visual_reasoning: string
  color_mood: { primary_feel: string; avoid: string[]; example_palette: string[] }
  typography_mood: { display_feel: string; body_feel: string; avoid: string[] }
  voice_pillars: string[]
  one_thing_to_avoid: string
}

export const recommendBrandIdentity = defineEngine<In, Out>({
  id: 'recommendBrandIdentity',
  input: Input,
  plans: ['free', 'phantom', 'phantom_pro'],
  dailyLimit: 8,
  maxTokens: 1400,
  temperature: 0.5,
  prompt: async ({ input, project }) => {
    if (!project) throw new Error('project required')
    const [liSnap, giSnap] = await Promise.all([
      project.ref.collection('lock_in').doc('main').get(),
      project.ref.collection('ghost_identity').doc('main').get(),
    ])
    const li = liSnap.data() ?? {}
    const gi = giSnap.data() ?? {}
    const positioning = li.generated_positioning || gi.positioning_statement || ''
    const audience = input.audience_override ?? li.buyer_problem_language ?? ''
    const voice = (li.final_voice_adjectives ?? gi.voice_adjectives ?? []) as string[]

    if (!positioning) throw new Error('Locked positioning required')

    return `Recommend brand identity direction for a brand whose positioning is now LOCKED from buyer data.

Locked positioning: """${positioning}"""
Audience (in buyer language): """${audience}"""
${voice.length ? `Voice adjectives: ${voice.join(', ')}` : ''}

The identity must REFLECT the validated positioning, not the founder's aspirational taste.

Return JSON: { "visual_direction": "minimal"|"editorial"|"bold"|"warm"|"technical"|"other", "visual_reasoning": string, "color_mood": { "primary_feel": string, "avoid": string[], "example_palette": string[] }, "typography_mood": { "display_feel": string, "body_feel": string, "avoid": string[] }, "voice_pillars": string[], "one_thing_to_avoid": string }

example_palette: 3-5 short hex codes. avoid arrays: list aesthetic moves the audience would interpret wrong.`
  },
  persist: async (ctx, output) => {
    if (!ctx.project) return { written_paths: [] }
    const written: string[] = []
    written.push(
      await appendGenerationHistory({
        project_ref: ctx.project.ref,
        generator: 'recommendBrandIdentity',
        input: ctx.input,
        output,
      }),
    )
    const ref = ctx.project.ref.collection('lock_in').doc('main')
    await ref.set(
      {
        ai_brand_identity: output,
        ai_brand_identity_generated_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
    written.push(ref.path)
    return { written_paths: written }
  },
})
