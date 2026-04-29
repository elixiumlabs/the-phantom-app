import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from './firebase'

const fns = getFunctions(app, 'us-central1')

function call<TIn, TOut>(name: string) {
  const fn = httpsCallable<TIn, TOut>(fns, name)
  return async (data: TIn): Promise<TOut> => (await fn(data)).data
}

// ----- Phase 01 generators -----

export const refineProblemStatement = call<
  { draft: string },
  {
    refined: Array<{
      statement: string
      tightened: 'specificity' | 'audience' | 'outcome' | 'avoidance'
      note: string
    }>
  }
>('refineProblemStatement')

export const extractUnfairAdvantages = call<
  { background: string; problemStatement?: string },
  {
    advantages: Array<{
      advantage: string
      type: 'experience' | 'survived' | 'built' | 'access' | 'knowledge'
      credibilityScore: number
      reasoning: string
    }>
    rejected: Array<{ claim: string; reason: string }>
  }
>('extractUnfairAdvantages')

export const synthesizePositioning = call<
  { problemStatement: string; unfairAdvantages: string[] },
  {
    positioningOptions: Array<{
      sentence: string
      angle: 'problem-led' | 'outcome-led' | 'identity-led'
      reasoning: string
    }>
    workingNames: Array<{ name: string; rationale: string }>
    voiceTriples: Array<{ adjectives: [string, string, string]; whyItFits: string }>
  }
>('synthesizePositioning')

export const extractAudienceLanguage = call<
  { problemStatement: string; audienceDescription: string },
  {
    problemPhrases: string[]
    emotionalDescriptors: string[]
    failedAttemptPhrases: string[]
    outcomePhrases: string[]
    jargonToAvoid: string[]
    examples: Array<{ verbatim: string; whereSaid: string }>
  }
>('extractAudienceLanguage')

export const findWhereToTest = call<
  { problemStatement: string; audienceDescription: string },
  {
    locations: Array<{
      name: string
      channel:
        | 'reddit'
        | 'discord'
        | 'slack'
        | 'facebook_group'
        | 'forum'
        | 'twitter'
        | 'linkedin'
        | 'newsletter'
        | 'youtube'
        | 'other'
      url?: string
      whyAudienceIsHere: string
      outreachStyle: string
      accessDifficulty: 'easy' | 'medium' | 'hard'
      priorityScore: number
    }>
    searchQueries: string[]
  }
>('findWhereToTest')
