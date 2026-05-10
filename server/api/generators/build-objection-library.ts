import { z } from 'zod'
import { defineEngine, appendGenerationHistory } from '../_lib/engine'
import { adminClient } from '../_lib/supabase'
import { apiError } from '../_lib/auth'

const Input = z.object({ project_id: z.string().min(1) })
type In = z.infer<typeof Input>

interface Out extends Record<string, unknown> {
  buckets: Array<{
    bucket: string
    objections: Array<{ raw: string; pattern: string; response: string; offer_change_hint: string | null }>
  }>
  most_common_bucket: string
  empty?: true
}

export default defineEngine<In, Out>({
  id: 'buildObjectionLibrary',
  input: Input,
  plans: ['free', 'phantom', 'phantom_pro'],
  dailyLimit: 10,
  maxTokens: 2400,
  prompt: async ({ project }) => {
    if (!project) throw apiError(400, 'project_id required')
    const db = adminClient()
    const { data: outreach } = await db.from('outreach_log').select('objection').eq('project_id', project.id)
    const objections = (outreach ?? []).map(r => r.objection?.trim()).filter(Boolean) as string[]
    if (objections.length === 0) {
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
    written.push(await appendGenerationHistory({ project_id: ctx.project.id, generator: 'buildObjectionLibrary', input: ctx.input, output }))
    const db = adminClient()
    await db.from('objection_library').upsert({
      project_id: ctx.project.id,
      buckets: output.buckets,
      most_common_bucket: output.most_common_bucket,
      is_empty: output.empty === true,
      generated_at: new Date().toISOString(),
    }, { onConflict: 'project_id' })
    written.push(`objection_library/${ctx.project.id}`)
    if (!output.empty && (output.buckets?.length ?? 0) > 0) {
      await db.from('silent_test').update({ checklist_objections_documented: true, updated_at: new Date().toISOString() }).eq('project_id', ctx.project.id)
    }
    return { written_paths: written }
  },
})
