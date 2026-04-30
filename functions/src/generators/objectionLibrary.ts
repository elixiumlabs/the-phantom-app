import * as admin from 'firebase-admin'
import { z } from 'zod'
import { appendGenerationHistory, defineEngine } from '../lib/engine'

const Input = z.object({ project_id: z.string().min(1) })
type In = z.infer<typeof Input>

type Bucket = 'price' | 'trust' | 'proof' | 'fit' | 'timing' | 'other'

interface Out extends Record<string, unknown> {
  buckets: Array<{
    bucket: Bucket
    objections: Array<{ raw: string; pattern: string; response: string; offer_change_hint: string | null }>
  }>
  most_common_bucket: Bucket
  empty?: true
}

export const buildObjectionLibrary = defineEngine<In, Out>({
  id: 'buildObjectionLibrary',
  input: Input,
  plans: ['free', 'phantom', 'phantom_pro'],
  dailyLimit: 10,
  maxTokens: 2400,
  prompt: async ({ project }) => {
    if (!project) throw new Error('project required')
    const outreach = await project.ref.collection('outreach_log').get()
    const objections = outreach.docs
      .map((d) => (d.data().objection as string | undefined)?.trim())
      .filter((o): o is string => !!o)
    if (objections.length === 0) {
      // Force the model to return an empty shape; engine will still persist.
      return `No objections logged yet. Return JSON: { "buckets": [], "most_common_bucket": "other", "empty": true }`
    }
    return `Group these raw outreach objections into buckets and prepare a response for each pattern.

Objections (one per line):
${objections.map((o, i) => `${i + 1}. ${o}`).join('\n')}

Buckets: price, trust, proof, fit, timing, other.

For each bucket present in the data:
- Group similar objections under shared "patterns" (the underlying objection, not the surface words).
- Write a concise response (under 60 words) that does NOT defend, but reframes or addresses the underlying concern.
- If the objection is signaling that the OFFER STRUCTURE is broken (not just the message), include a short offer_change_hint; otherwise null.

Return JSON: { "buckets": [{ "bucket": "price"|"trust"|"proof"|"fit"|"timing"|"other", "objections": [{ "raw": string, "pattern": string, "response": string, "offer_change_hint": string|null }] }], "most_common_bucket": "price"|"trust"|"proof"|"fit"|"timing"|"other" }`
  },
  persist: async (ctx, output) => {
    if (!ctx.project) return { written_paths: [] }
    const written: string[] = []
    written.push(
      await appendGenerationHistory({
        project_ref: ctx.project.ref,
        generator: 'buildObjectionLibrary',
        input: ctx.input,
        output,
      }),
    )
    const ref = ctx.project.ref.collection('objection_library').doc('main')
    await ref.set(
      {
        buckets: output.buckets,
        most_common_bucket: output.most_common_bucket,
        is_empty: output.empty === true,
        generated_at: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
    written.push(ref.path)
    // Mirror onto silent_test.checklist.objections_documented when we have at least one bucket.
    const hasObjections = !output.empty && (output.buckets?.length ?? 0) > 0
    if (hasObjections) {
      await ctx.project.ref.collection('silent_test').doc('main').set(
        { checklist: { objections_documented: true }, updated_at: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true },
      )
    }
    return { written_paths: written }
  },
})
