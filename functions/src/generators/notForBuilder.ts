import * as admin from 'firebase-admin'
import { z } from 'zod'
import { appendGenerationHistory, defineEngine } from '../lib/engine'

const Input = z.object({ project_id: z.string().min(1) })
type In = z.infer<typeof Input>

interface Out extends Record<string, unknown> {
  not_for_paragraph: string
  exclusions: Array<{ exclusion: string; why: string }>
  failure_modes_if_we_serve_them: string[]
}

export const buildNotFor = defineEngine<In, Out>({
  id: 'buildNotFor',
  input: Input,
  plans: ['free', 'phantom', 'phantom_pro'],
  dailyLimit: 10,
  maxTokens: 1100,
  temperature: 0.4,
  prompt: async ({ project }) => {
    if (!project) throw new Error('project required')
    const [liSnap, giSnap] = await Promise.all([
      project.ref.collection('lock_in').doc('main').get(),
      project.ref.collection('ghost_identity').doc('main').get(),
    ])
    const li = liSnap.data() ?? {}
    const gi = giSnap.data() ?? {}
    const positioning = li.generated_positioning || gi.positioning_statement || ''
    const audience = li.buyer_problem_language || gi.problem_statement || ''
    if (!positioning) throw new Error('Locked positioning required')

    return `Define who this brand is NOT for, as specifically as the audience definition itself.

Positioning: """${positioning}"""
Audience: """${audience}"""

Return JSON: { "not_for_paragraph": string, "exclusions": [{ "exclusion": string, "why": string }], "failure_modes_if_we_serve_them": string[] }

- not_for_paragraph: a tight paragraph (under 80 words).
- exclusions: 4-6 specific types of person/situation. Concrete, not vague.
- failure_modes_if_we_serve_them: 3-4 specific bad outcomes (refunds, complaints, dilution, mismatched expectations).`
  },
  persist: async (ctx, output) => {
    if (!ctx.project) return { written_paths: [] }
    const written: string[] = []
    written.push(
      await appendGenerationHistory({
        project_ref: ctx.project.ref,
        generator: 'buildNotFor',
        input: ctx.input,
        output,
      }),
    )
    const ref = ctx.project.ref.collection('lock_in').doc('main')
    await ref.set(
      {
        not_for: output.not_for_paragraph,
        ai_not_for_exclusions: output.exclusions,
        ai_not_for_failure_modes: output.failure_modes_if_we_serve_them,
        ai_not_for_generated_at: admin.firestore.FieldValue.serverTimestamp(),
        checklist: { not_for_defined: true },
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
    written.push(ref.path)
    return { written_paths: written }
  },
})
