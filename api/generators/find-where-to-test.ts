import { z } from 'zod'
import { defineEngine, appendGenerationHistory } from '../_lib/engine'
import { adminClient } from '../_lib/supabase'

const Input = z.object({
  problemStatement: z.string().min(10).max(1000),
  audienceDescription: z.string().min(5).max(1000),
  project_id: z.string().min(1).optional(),
})
type In = z.infer<typeof Input>

interface Out extends Record<string, unknown> {
  locations: Array<{
    name: string
    channel: string
    url?: string
    whyAudienceIsHere: string
    outreachStyle: string
    accessDifficulty: 'easy' | 'medium' | 'hard'
    priorityScore: number
  }>
  searchQueries: string[]
}

export default defineEngine<In, Out>({
  id: 'findWhereToTest',
  input: Input,
  plans: ['free', 'phantom', 'phantom_pro'],
  dailyLimit: 15,
  maxTokens: 2500,
  prompt: ({ input }) => `Identify the specific places this audience already gathers, so the user can run their Phase 02 silent test there.

Problem statement:
"""${input.problemStatement}"""

Audience:
"""${input.audienceDescription}"""

RULES:
- Be specific. "Reddit" is not an answer. "r/Entrepreneur", "r/digitalnomad" — that level of specificity.
- Include subreddits, named Discord servers, named Slack communities, named FB groups, named forums, niche newsletters, niche YouTube creators' comment sections, niche LinkedIn hashtags.
- Only include locations where this audience is ALREADY discussing this exact problem.
- For each, describe the appropriate outreach style (cold DM / community post / value-first comment / etc.) — different communities have different rules.
- Score priority 0-100 by audience density × access ease × outreach receptivity.
- Provide 5-10 search queries the user can paste into Google/Reddit/Twitter to find more places themselves.

Return JSON: { "locations": [{ "name": string, "channel": "reddit"|"discord"|"slack"|"facebook_group"|"forum"|"twitter"|"linkedin"|"newsletter"|"youtube"|"other", "url": string, "whyAudienceIsHere": string, "outreachStyle": string, "accessDifficulty": "easy"|"medium"|"hard", "priorityScore": number }], "searchQueries": string[] }

Return at least 8 locations. Sort by priorityScore descending.`,
  persist: async (ctx, output) => {
    const written: string[] = []
    if (ctx.project) {
      written.push(await appendGenerationHistory({ project_id: ctx.project.id, generator: 'findWhereToTest', input: ctx.input, output }))
      const db = adminClient()
      await db.from('silent_test').update({
        ai_test_locations: output.locations,
        ai_search_queries: output.searchQueries,
        ai_locations_generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('project_id', ctx.project.id)
      written.push(`silent_test/${ctx.project.id}`)
    }
    return { written_paths: written }
  },
  activityMeta: (out) => ({ location_count: out.locations.length }),
})
