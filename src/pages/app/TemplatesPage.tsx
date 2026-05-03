import { memo, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import AppSidebar from '@/components/app/AppSidebar'

interface Template {
  id: string
  category: string
  name: string
  platform: string
  when: string
  body: string
  tips: string[]
}

const TEMPLATES: Template[] = [
  {
    id: 'cold-dm',
    category: 'Cold Outreach',
    name: 'Cold DM — Problem Research',
    platform: 'Twitter / Instagram / LinkedIn DM',
    when: 'First contact with someone who matches your target audience. You have not spoken before.',
    body: `Hey [Name], I'm researching [specific problem area] and I've been connecting with [their type of person]. Quick question — how are you currently handling [specific pain point]? Not pitching anything. Genuinely trying to understand how people in your position deal with this before I build anything.`,
    tips: [
      'Lead with the problem, not yourself.',
      'Acknowledge you are not selling. This removes the guard.',
      'Ask one question only. Multiple questions kill reply rates.',
      'Replace every bracket with something specific — generic openers get ignored.',
    ],
  },
  {
    id: 'cold-dm-followup',
    category: 'Cold Outreach',
    name: 'Cold DM — Follow-Up',
    platform: 'Any DM platform',
    when: 'They did not reply to your first message. Send once, 3–5 days later. Do not send again after this.',
    body: `Hey [Name], following up in case this got buried. Still just doing research — no pitch. The one question I had: how are you currently handling [specific problem]? Even a one-line answer helps.`,
    tips: [
      'One follow-up only. Two is the limit. Three is harassment.',
      'Reference the original question — do not start from scratch.',
      'Keep it shorter than the first message.',
    ],
  },
  {
    id: 'community-post',
    category: 'Community & Forums',
    name: 'Community Post — Problem Discovery',
    platform: 'Reddit, Facebook Groups, Slack communities, Discord',
    when: 'Posting in a community where your target audience gathers. You are researching, not announcing.',
    body: `Question for [community name]: For those dealing with [specific problem], what has been your biggest frustration with the current solutions? I am researching this space before building anything and want to understand it from people who actually live it.`,
    tips: [
      'Ask about frustrations, not about your idea. Frustration questions get more honest answers.',
      'Never mention that you are building something in the post — it shifts the dynamic.',
      'Engage with every reply. The follow-up conversations are where the real data lives.',
      'Post at the times the community is most active.',
    ],
  },
  {
    id: 'forum-reply',
    category: 'Community & Forums',
    name: 'Forum Reply — Research Hook',
    platform: 'Reddit, Quora, niche forums',
    when: 'Someone has posted about the exact problem you are solving. You reply to their post.',
    body: `I have been researching this exact issue. Before building a solution, I am curious — what would solving [specific aspect] actually look like for you? What would need to be true for you to say the problem is finally fixed?`,
    tips: [
      'Reply to threads that are already getting engagement — not dead posts.',
      'Answer their question first if they asked one. Then ask yours.',
      'The question "what would need to be true" surfaces the real criteria buyers use.',
    ],
  },
  {
    id: 'cold-email',
    category: 'Email',
    name: 'Cold Email — Research Request',
    platform: 'Email',
    when: 'You have their email address and they match your target audience. First contact only.',
    body: `Subject: Quick question about [problem area]

Hi [Name],

I came across your [post/comment/profile/work] about [specific context]. I am researching [problem area] and I have one question: what is the most expensive part of this problem for you right now — in time, money, or frustration?

No pitch. Just research. Would value a two-minute reply if you have it.

[Your name]`,
    tips: [
      'Subject line: make it about them, not you.',
      'Reference something specific. Generic cold emails fail because they are clearly mass-sent.',
      'One question. The "time, money, or frustration" framing makes it easy to answer quickly.',
      'Signature only — no links, no logo, no footer. Keep it human.',
    ],
  },
  {
    id: 'email-followup',
    category: 'Email',
    name: 'Cold Email — Follow-Up',
    platform: 'Email',
    when: 'No reply after 4–5 business days. Send once.',
    body: `Subject: Re: Quick question about [problem area]

Hi [Name],

Following up in case the last email got buried. The research question was: what is the most expensive part of [problem area] for you right now?

Still just research — not selling anything. Even a one-line reply is useful.

[Your name]`,
    tips: [
      'Reply to your original thread so they see the context.',
      'Restate the question — do not make them scroll.',
      'After this, move on. No third email.',
    ],
  },
  {
    id: 'offer-dm',
    category: 'Making the Offer',
    name: 'Soft Offer — After Research Conversation',
    platform: 'Any DM or email',
    when: 'You have had a research conversation. They confirmed the problem is real for them. Now you present the offer.',
    body: `Based on what you described — [restate their specific problem in their words] — I am actually building something designed exactly for that.

It is [offer name]: [one sentence description]. The outcome is [specific result].

I am working with [small number] people right now at a reduced rate in exchange for feedback. Would you be open to a quick call to see if it is a fit?`,
    tips: [
      'Mirror their language from the research conversation — not your original positioning.',
      'Name the specific problem they described. This shows you listened.',
      'The "reduced rate for feedback" framing lowers the barrier and frames them as a collaborator.',
      'Ask for a call, not a purchase. Conversion happens in conversation.',
    ],
  },
  {
    id: 'offer-email',
    category: 'Making the Offer',
    name: 'Offer Email — Problem-to-Outcome Pitch',
    platform: 'Email',
    when: 'You already received meaningful research responses and want to make the first direct offer by email.',
    body: `Subject: Based on what you shared about [problem]

Hi [Name],

You mentioned [their exact pain in their words]. I am building [offer name] specifically to solve that.

In short: [one sentence on what it is].
Outcome: [specific measurable result].
Best fit for: [who it is for].

If useful, I can walk you through it in 15 minutes and we can quickly decide if it's a fit.

[Your name]`,
    tips: [
      'Start with their words before your product name.',
      'Keep the core offer to 3 short lines: what it is, outcome, fit.',
      'Invite a short fit-check call rather than forcing a hard close by email.',
    ],
  },
  {
    id: 'offer-dm-low-friction',
    category: 'Making the Offer',
    name: 'DM Offer — Low-Friction Pilot Invite',
    platform: 'Twitter / LinkedIn / Instagram DM',
    when: 'They engaged in research and seem interested, but may be hesitant to commit to full scope.',
    body: `Given what you shared about [problem], I think you are exactly who this pilot is for.

I am running a small test with [number] people:
- Focus: [specific problem to solve]
- Timeline: [time frame]
- Outcome target: [specific result]

If it works, great. If not, you still leave with [clear value artifact]. Want details?`,
    tips: [
      'Position as a pilot with clear boundaries and outcome target.',
      'Include "if not" downside protection to reduce perceived risk.',
      'End with a lightweight CTA ("Want details?") to keep momentum.',
    ],
  },
  {
    id: 'offer-objection-price',
    category: 'Making the Offer',
    name: 'Offer Response — Price Objection Reframe',
    platform: 'Email / DM',
    when: 'They say the offer sounds useful but expensive.',
    body: `Totally fair question.

The way to evaluate this is against the current cost of [problem] in [time/money/lost opportunities], not against the sticker price alone.

If we hit [specific outcome], this should return more than it costs. If we do not, I do not want you locked into something that is not working.

If helpful, I can break down expected ROI using your numbers before you decide.`,
    tips: [
      'Acknowledge first — never argue with the objection.',
      'Reframe around cost-of-problem and expected return.',
      'Offer to run the math with their numbers to make it concrete.',
    ],
  },
  {
    id: 'offer-final-followup',
    category: 'Making the Offer',
    name: 'Offer Follow-Up — Decision Prompt',
    platform: 'Email / DM',
    when: 'They showed interest, received details, but have gone quiet for several days.',
    body: `Quick follow-up on [offer name].

No pressure either way — just want to close the loop. Should we:
1) move forward,
2) revisit later, or
3) park this for now?

Any of the three is totally fine.`,
    tips: [
      'Use explicit options to make replying easy.',
      'Neutral tone gets more responses than pressure tactics.',
      'If they choose later, set a concrete follow-up date immediately.',
    ],
  },
  {
    id: 'linkedin',
    category: 'LinkedIn',
    name: 'LinkedIn Connection Request Note',
    platform: 'LinkedIn',
    when: 'Sending a connection request to someone who fits your audience profile.',
    body: `Hi [Name], I came across your work on [specific topic]. I am researching [problem area] and connecting with people who deal with it directly. No pitch — just building a clearer picture before I build anything. Would be glad to connect.`,
    tips: [
      'LinkedIn limits connection notes to 300 characters. Keep it tight.',
      'Reference something specific from their profile or posts.',
      'Do not ask a question in the connection note — save that for after they accept.',
    ],
  },
  {
    id: 'linkedin-followup',
    category: 'LinkedIn',
    name: 'LinkedIn DM — Post-Connection Research',
    platform: 'LinkedIn DM',
    when: 'They accepted your connection request. Use this as the first message after acceptance.',
    body: `Thanks for connecting, [Name]. Quick research question — when it comes to [specific problem], what part tends to break first for your team?

I am mapping patterns before building anything, so I am not pitching. Even a short answer is useful.`,
    tips: [
      'Send this within 24 hours of acceptance while context is fresh.',
      'Ask one concrete question tied to execution, not theory.',
      'Keep the no-pitch line to reduce resistance and improve reply rate.',
    ],
  },
  {
    id: 'warm-intro-ask',
    category: 'Warm Intros',
    name: 'Warm Intro Request — Mutual Contact',
    platform: 'Email / DM',
    when: 'You know someone who can introduce you to a target buyer. Use this before direct outreach.',
    body: `Hey [Mutual Contact], could I ask for a quick intro to [Target Name]?

I am researching [specific problem] with [audience type] and want to ask one short question about how they currently handle it. No pitch, no sales call — just validation research.

If you are open to it, happy to send a 2-line blurb you can forward.`,
    tips: [
      'Make the ask low-friction and specific.',
      'State exactly what you will not do (no sales call).',
      'Offer a forwardable blurb so they do less work.',
    ],
  },
  {
    id: 'customer-referral-ask',
    category: 'Warm Intros',
    name: 'Customer Referral Ask — Similar Operators',
    platform: 'Email / DM',
    when: 'You already have one user/customer and want referrals to similar people for more signal.',
    body: `You mentioned [specific pain point] was a major issue before [result they got].

Do you know 1–2 people in a similar role who are still dealing with this? I am doing more problem research and would love to ask them one short question. I can draft a message you can forward if that helps.`,
    tips: [
      'Anchor the ask to a result they already experienced.',
      'Request 1–2 intros, not a broad favor.',
      'Referral outreach usually converts higher because trust is transferred.',
    ],
  },
  {
    id: 'breakup-followup',
    category: 'Email',
    name: 'Cold Email — Breakup Follow-Up',
    platform: 'Email',
    when: 'After your first email and one follow-up got no response. Final touch, then close the loop.',
    body: `Subject: Should I close this out?

Hi [Name],

I have reached out twice about [problem area] research and did not hear back, so I will assume timing is not right.

If this is still relevant, reply with "later" and I will check back in a month. Otherwise I will close this out.

[Your name]`,
    tips: [
      'Use only after two unanswered touches.',
      'Give an easy one-word reply option to reduce effort.',
      'If they do not respond, actually close the thread and move on.',
    ],
  },
]

const CATEGORIES = Array.from(new Set(TEMPLATES.map(t => t.category)))

function TemplatePart({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/g).map((part, i) =>
        /^\[.+\]$/.test(part)
          ? <span key={i} className="text-phantom-lime bg-phantom-lime/10 px-0.5 rounded">{part}</span>
          : <span key={i}>{part}</span>
      )}
    </>
  )
}

const TemplateCard = memo(({ template }: { template: Template }) => {
  const [copied, setCopied] = useState(false)
  const [open,   setOpen]   = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(template.body).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <span className="badge mb-2">{template.category}</span>
          <h3 className="font-display font-bold text-[16px] text-phantom-text-primary">{template.name}</h3>
          <p className="font-body text-[12px] text-phantom-text-muted mt-0.5">{template.platform}</p>
        </div>
        <button
          onClick={copy}
          className="btn-secondary text-[12px] py-1.5 px-3 shrink-0 gap-1.5"
        >
          {copied ? <Check size={12} className="text-phantom-lime" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* When to use */}
      <div className="bg-[#0d0d0d] border border-phantom-border-subtle rounded-xl p-3 mb-4">
        <p className="font-ui text-[10px] text-phantom-text-muted uppercase tracking-wider mb-1">When to use</p>
        <p className="font-body text-[13px] text-phantom-text-secondary">{template.when}</p>
      </div>

      {/* Template body */}
      <div className="bg-[#0a0a0a] border border-phantom-border-subtle rounded-xl p-4 mb-4">
        <p className="font-body text-[13px] text-phantom-text-secondary leading-relaxed whitespace-pre-wrap">
          <TemplatePart text={template.body} />
        </p>
      </div>

      {/* Tips toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="font-body text-[13px] text-phantom-text-muted hover:text-phantom-text-secondary transition-colors mb-2"
      >
        {open ? '▾ Hide tips' : '▸ Usage tips'}
      </button>

      {open && (
        <motion.ul
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {template.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="font-code text-[11px] text-phantom-lime mt-0.5 shrink-0">—</span>
              <p className="font-body text-[13px] text-phantom-text-secondary">{tip}</p>
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  )
})
TemplateCard.displayName = 'TemplateCard'

const TemplatesPage = memo(() => {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const filtered = activeCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeCategory)

  return (
    <div className="flex min-h-screen bg-phantom-black">
      <AppSidebar />
      <main className="flex-1 ml-60 p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-display font-bold text-[28px] text-phantom-text-primary mb-1">
              Outreach Templates
            </h1>
            <p className="font-body text-[14px] text-phantom-text-secondary max-w-xl">
              Proven outreach frameworks for silent market validation. Customize every bracket. Generic messages get ignored.
            </p>
          </div>

          {/* Rule callout */}
          <div className="bg-[#0a1900] border border-phantom-lime/30 rounded-2xl p-5 mb-8">
            <p className="font-body text-[13px] text-phantom-text-primary leading-relaxed">
              <span className="text-phantom-lime font-medium">The rule:</span> You are tracking one metric — conversions. Not replies. Not likes. Not DMs that say "this is interesting." Money. The offer either produces it or it doesn't. These templates exist to start conversations, not to close deals. The close happens in the conversation.
            </p>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-8">
            {['all', ...CATEGORIES].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-ui text-[12px] px-4 py-2 rounded-full border transition-all duration-150 ${
                  activeCategory === cat
                    ? 'border-phantom-lime text-phantom-lime bg-phantom-lime/10'
                    : 'border-phantom-border text-phantom-text-muted hover:border-[#333] hover:text-phantom-text-secondary'
                }`}
              >
                {cat === 'all' ? `All templates (${TEMPLATES.length})` : cat}
              </button>
            ))}
          </div>

          {/* Template grid */}
          <div className="grid md:grid-cols-2 gap-5">
            {filtered.map(t => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>

          {/* Bottom note */}
          <div className="mt-10 pt-8 border-t border-phantom-border-subtle">
            <p className="font-body text-[13px] text-phantom-text-muted max-w-xl">
              These templates are starting points. The version that converts for your specific offer and audience will be different from what you start with. Log every variation in the Signal Tracker and iterate based on what the data tells you.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
})

TemplatesPage.displayName = 'TemplatesPage'
export default TemplatesPage
