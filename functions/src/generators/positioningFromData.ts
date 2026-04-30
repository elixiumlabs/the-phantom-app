import * as admin from 'firebase-admin'
import { z } from 'zod'
import { appendGenerationHistory, defineEngine } from '../lib/engine'

const Input = z.object({ project_id: z.string().min(1) })
type In = z.infer<typeof Input>

interface Out extends Record<string, unknown> {
  positioning: string
  reasoning: string
  buyer_phrases_used: string[]
  what_was_left_out: string[]
}

export const positioningFromData = defineEngine<In, Out>({
  id: 'positioningFromData',
  input: Input,
  plans: ['free', 'phantom', 'phantom_pro'],
  dailyLimit: 10,
  maxTokens: 800,
  temperature: 0.4,
  prompt: async ({ project }) => {
    if (!project) throw new Error('project required')
    const liSnap = await project.ref.collection('lock_in').doc('main').get()
    const li = liSnap.data() ?? {}
    if (!li.buyer_problem_language || !li.buyer_outcome_language || !li.buyer_prior_attempts) {
      throw new Error('Phase 04 buyer language fields must be filled before generating positioning')
    }
    return `Generate the LOCKED positioning sentence for Phase 04. Build it from BUYER LANGUAGE only — not aspirational language.

Buyers described their problem as: """${li.buyer_problem_language}"""
Buyers described the outcome they got as: """${li.buyer_outcome_language}"""
What buyers had tried before that didn't work: """${li.buyer_prior_attempts}"""

Rules:
- One sentence. Under 30 words.
- Use phrases lifted directly from the buyer language above whenever possible.
- Specific enough that someone with the problem recognizes themselves immediately.
- A skeptical stranger should be able to understand it without context.

Return JSON: { "positioning": string, "reasoning": string, "buyer_phrases_used": string[], "what_was_left_out": string[] }

what_was_left_out: things the founder probably wants in the positioning that the buyer language did NOT actually support. List them so the founder sees the discipline.`
  },
  persist: async (ctx, output) => {
    if (!ctx.project) return { written_paths: [] }
    const written: string[] = []
    written.push(
      await appendGenerationHistory({
        project_ref: ctx.project.ref,
        generator: 'positioningFromData',
        input: ctx.input,
        output,
      }),
    )
    const liRef = ctx.project.ref.collection('lock_in').doc('main')
    await liRef.set(
      {
        generated_positioning: output.positioning,
        ai_positioning_reasoning: output.reasoning,
        ai_buyer_phrases_used: output.buyer_phrases_used,
        ai_what_was_left_out: output.what_was_left_out,
        ai_positioning_generated_at: admin.firestore.FieldValue.serverTimestamp(),
        checklist: { one_sentence_positioning: true },
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
    written.push(liRef.path)
    return { written_paths: written }
  },
})
