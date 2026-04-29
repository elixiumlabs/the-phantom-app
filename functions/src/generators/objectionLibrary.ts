import { onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { ANTHROPIC_API_KEY, generateJSON } from '../lib/anthropic'
import { gate, meterUsage, requirePlan, validate } from '../lib/guards'
import { loadOwnedProject } from '../lib/projectAccess'

const Input = z.object({ project_id: z.string().min(1) })

type Bucket = 'price' | 'trust' | 'proof' | 'fit' | 'timing' | 'other'

interface Output {
  buckets: Array<{
    bucket: Bucket
    objections: Array<{ raw: string; pattern: string; response: string; offer_change_hint: string | null }>
  }>
  most_common_bucket: Bucket
}

export const buildObjectionLibrary = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1' },
  async (req) => {
    const uid = await gate(req)
    await requirePlan(uid, ['free', 'phantom', 'phantom_pro'])
    await meterUsage(uid, 'buildObjectionLibrary', 10)
    const { project_id } = validate(Input, req.data)
    const { ref } = await loadOwnedProject(uid, project_id)

    const outreach = await ref.collection('outreach_log').get()
    const objections = outreach.docs
      .map((d) => (d.data().objection as string | undefined)?.trim())
      .filter((o): o is string => !!o)
    if (objections.length === 0) {
      return { buckets: [], most_common_bucket: 'other' as Bucket }
    }

    return generateJSON<Output>({
      user: `Group these raw outreach objections into buckets and prepare a response for each pattern.

Objections (one per line):
${objections.map((o, i) => `${i + 1}. ${o}`).join('\n')}

Buckets: price, trust, proof, fit, timing, other.

For each bucket present in the data:
- Group similar objections under shared "patterns" (the underlying objection, not the surface words).
- Write a concise response (under 60 words) that does NOT defend, but reframes or addresses the underlying concern.
- If the objection is signaling that the OFFER STRUCTURE is broken (not just the message), include a short offer_change_hint; otherwise null.

Return JSON: { "buckets": [{ "bucket": "price"|"trust"|"proof"|"fit"|"timing"|"other", "objections": [{ "raw": string, "pattern": string, "response": string, "offer_change_hint": string|null }] }], "most_common_bucket": "price"|"trust"|"proof"|"fit"|"timing"|"other" }`,
      maxTokens: 2200,
    })
  },
)

