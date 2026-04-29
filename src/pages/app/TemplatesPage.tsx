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
