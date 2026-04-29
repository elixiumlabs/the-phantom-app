import { onCall } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { ANTHROPIC_API_KEY, generateJSON } from '../lib/anthropic'
import { meterUsage, requireAuth, requirePlan, validate } from '../lib/guards'

const Input = z.object({
  problemStatement: z.string().min(10).max(1000),
  audienceDescription: z.string().min(5).max(1000),
})

type Channel = 'reddit' | 'discord' | 'slack' | 'facebook_group' | 'forum' | 'twitter' | 'linkedin' | 'newsletter' | 'youtube' | 'other'

interface Output {
  locations: Array<{
    name: string
    channel: Channel
    url?: string
    whyAudienceIsHere: string
    outreachStyle: string
    accessDifficulty: 'easy' | 'medium' | 'hard'
    priorityScore: number
  }>
  searchQueries: string[]
}

export const findWhereToTest = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: 'us-central1' },
  async (req) => {
    const uid = requireAuth(req)
    await requirePlan(uid, ['free', 'phantom', 'phantom_pro'])
    await meterUsage(uid, 'findWhereToTest', 15)

    const { problemStatement, audienceDescription } = validate(Input, req.data)

    return generateJSON<Output>({
      user: `Identify the specific places this audience already gathers, so the user can run their Phase 02 silent test there.

Problem statement:
"""${problemStatement}"""

Audience:
"""${audienceDescription}"""

RULES:
- Be specific. "Reddit" is not an answer. "r/Entrepreneur", "r/digitalnomad" — that level of specificity.
- Include subreddits, named Discord servers, named Slack communities, named FB groups, named forums, niche newsletters, niche YouTube creators' comment sections, niche LinkedIn hashtags.
- Only include locations where this audience is ALREADY discussing this exact problem.
- For each, describe the appropriate outreach style (cold DM / community post / value-first comment / etc.) — different communities have different rules.
- Score priority 0-100 by audience density × access ease × outreach receptivity.
- Provide 5-10 search queries the user can paste into Google/Reddit/Twitter to find more places themselves.

Return JSON: { "locations": [{ "name": string, "channel": "reddit"|"discord"|"slack"|"facebook_group"|"forum"|"twitter"|"linkedin"|"newsletter"|"youtube"|"other", "url": string, "whyAudienceIsHere": string, "outreachStyle": string, "accessDifficulty": "easy"|"medium"|"hard", "priorityScore": number }], "searchQueries": string[] }

Return at least 8 locations. Sort by priorityScore descending.`,
      maxTokens: 2500,
    })
  },
)
