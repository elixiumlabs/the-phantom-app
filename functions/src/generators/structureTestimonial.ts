import * as admin from 'firebase-admin'
import { z } from 'zod'
import { appendGenerationHistory, defineEngine } from '../lib/engine'

const Input = z.object({
  raw_text: z.string().min(10).max(4000),
  source_note: z.string().max(200).optional(),
  project_id: z.string().min(1),
  save_to_vault: z.boolean().optional(),
})
type In = z.infer<typeof Input>

interface Out extends Record<string, unknown> {
  buyer_problem_language: string
  buyer_outcome_language: string
  measurable_result: string | null
  permission_flag: 'granted' | 'unclear' | 'not_addressed'
  missing_pieces: string[]
  follow_up_questions: string[]
  pull_quote: string
}

export const structureTestimonial = defineEngine<In, Out>({
  id: 'structureTestimonial',
  input: Input,
  plans: ['free', 'phantom', 'phantom_pro'],
  dailyLimit: 30,
  maxTokens: 1200,
  temperature: 0.3,
  prompt: ({ input }) => `Structure this raw testimonial into the proof-package format. Surface what's missing.

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
  persist: async (ctx, output) => {
    if (!ctx.project) return { written_paths: [] }
    const written: string[] = []
    written.push(
      await appendGenerationHistory({
        project_ref: ctx.project.ref,
        generator: 'structureTestimonial',
        input: ctx.input,
        output,
      }),
    )
    if (ctx.input.save_to_vault !== false) {
      const vaultRef = admin.firestore().collection('proof_vault').doc()
      await vaultRef.set({
        user_id: ctx.uid,
        project_id: ctx.project.id,
        proof_type: 'testimonial',
        title: output.pull_quote.slice(0, 100),
        content: ctx.input.raw_text,
        source: ctx.input.source_note ?? null,
        amount: null,
        tags: ['ai_structured'],
        structured: output,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      })
      written.push(vaultRef.path)
    }
    // Append to lock_in buyer language fields when permission is granted.
    if (output.permission_flag === 'granted') {
      const liRef = ctx.project.ref.collection('lock_in').doc('main')
      const liSnap = await liRef.get()
      const li = liSnap.data() ?? {}
      const concat = (existing: string | undefined, addition: string) =>
        [existing?.trim(), addition.trim()].filter(Boolean).join('\n— ')
      await liRef.set(
        {
          buyer_problem_language: concat(li.buyer_problem_language, output.buyer_problem_language),
          buyer_outcome_language: concat(li.buyer_outcome_language, output.buyer_outcome_language),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
      written.push(liRef.path)
    }
    return { written_paths: written }
  },
})
