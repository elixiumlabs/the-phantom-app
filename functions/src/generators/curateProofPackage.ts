import * as admin from 'firebase-admin'
import { z } from 'zod'
import { appendGenerationHistory, defineEngine } from '../lib/engine'

const Input = z.object({ project_id: z.string().min(1) })
type In = z.infer<typeof Input>

interface Out extends Record<string, unknown> {
  selected: Array<{
    proof_id: string
    proof_type: string
    why_it_belongs: string
    skeptic_score: number
  }>
  missing_categories: string[]
  recommendation: string
}

export const curateProofPackage = defineEngine<In, Out>({
  id: 'curateProofPackage',
  input: Input,
  plans: ['free', 'phantom', 'phantom_pro'],
  dailyLimit: 10,
  maxTokens: 1800,
  temperature: 0.3,
  prompt: async ({ project }) => {
    if (!project) throw new Error('project required')
    const vault = await admin
      .firestore()
      .collection('proof_vault')
      .where('project_id', '==', project.id)
      .get()

    const items = vault.docs.map((d) => ({
      id: d.id,
      type: d.data().proof_type,
      title: d.data().title,
      content: (d.data().content as string | undefined)?.slice(0, 600) ?? '',
      amount: d.data().amount ?? null,
      source: d.data().source ?? null,
      date: d.data().date ?? null,
    }))

    if (items.length === 0) {
      return `No proof in the vault yet. Return JSON: { "selected": [], "missing_categories": ["screenshot","testimonial","case_study","revenue","conversion_data"], "recommendation": "Phase 04 lock-in requires at least 3 credible pieces. Add proof to the vault before curating." }`
    }

    return `Curate the strongest proof package from this vault. A skeptical stranger must find it credible.

Vault items:
${JSON.stringify(items, null, 2)}

Return JSON: { "selected": [{ "proof_id": string, "proof_type": string, "why_it_belongs": string, "skeptic_score": number }], "missing_categories": string[], "recommendation": string }

- Pick at least 3, no more than 7.
- skeptic_score 0-100: how much weight a stranger would give this piece.
- missing_categories: which proof types are absent that the package would benefit from.
- recommendation: ONE sentence on how to strengthen the package next.`
  },
  persist: async (ctx, output) => {
    if (!ctx.project) return { written_paths: [] }
    const written: string[] = []
    written.push(
      await appendGenerationHistory({
        project_ref: ctx.project.ref,
        generator: 'curateProofPackage',
        input: ctx.input,
        output,
      }),
    )
    const ref = ctx.project.ref.collection('proof_package').doc('main')
    await ref.set(
      {
        ...output,
        generated_at: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
    written.push(ref.path)
    // Reflect the 3-proof checklist if the curator approved 3+ credible pieces.
    if (output.selected.length >= 3) {
      const liRef = ctx.project.ref.collection('lock_in').doc('main')
      await liRef.set(
        {
          checklist: { three_proof_pieces: true },
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
      written.push(liRef.path)
    }
    return { written_paths: written }
  },
  activityMeta: (out) => ({ selected: out.selected.length, missing: out.missing_categories.length }),
})
