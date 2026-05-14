import { memo, useEffect, useMemo, useState } from 'react'
import { CalendarClock, Check, Copy, GitBranch, Megaphone, RefreshCw, Send, Sparkles, Workflow } from 'lucide-react'
import { motion } from 'framer-motion'
import AppSidebar from '@/components/app/AppSidebar'
import { useProjects } from '@/contexts/ProjectContext'

type Goal = 'authority' | 'launch' | 'proof' | 'education'
type SourceFormat = 'buyer_quote' | 'case_study' | 'offer_page' | 'objection'
type PlatformKey = 'linkedin' | 'x' | 'instagram' | 'email'

interface PlatformPost {
  platform: PlatformKey
  label: string
  hook: string
  body: string
  cta: string
  bestTime: string
}

const PLATFORMS: { key: PlatformKey; label: string; limit: string }[] = [
  { key: 'linkedin', label: 'LinkedIn', limit: 'Authority post' },
  { key: 'x', label: 'X', limit: 'Thread or short post' },
  { key: 'instagram', label: 'Instagram', limit: 'Carousel caption' },
  { key: 'email', label: 'Email', limit: 'Newsletter segment' },
]

const GOALS: { key: Goal; label: string }[] = [
  { key: 'launch', label: 'Launch Offer' },
  { key: 'proof', label: 'Show Proof' },
  { key: 'education', label: 'Educate Market' },
  { key: 'authority', label: 'Build Authority' },
]

const SOURCES: { key: SourceFormat; label: string }[] = [
  { key: 'buyer_quote', label: 'Buyer Quote' },
  { key: 'case_study', label: 'Case Study' },
  { key: 'offer_page', label: 'Offer Page' },
  { key: 'objection', label: 'Objection' },
]

function valueOr(value: string | null | undefined, fallback: string) {
  const next = value?.trim()
  return next && next.length > 0 ? next : fallback
}

function postForPlatform(platform: PlatformKey, context: { offer: string; problem: string; outcome: string; proof: string; cta: string; goal: Goal }): PlatformPost {
  const labels: Record<PlatformKey, string> = {
    linkedin: 'LinkedIn',
    x: 'X',
    instagram: 'Instagram',
    email: 'Email',
  }

  const goalHooks: Record<Goal, string> = {
    launch: `${context.offer} is open for a small group of buyers.`,
    proof: `The market gave us a clear signal: ${context.proof}.`,
    education: `Most buyers do not need more tactics. They need a sharper read on ${context.problem}.`,
    authority: `A pattern keeps showing up in validation calls: ${context.problem}.`,
  }

  const bodyByPlatform: Record<PlatformKey, string> = {
    linkedin: `${goalHooks[context.goal]}\n\nThe mistake is trying to scale before the offer has earned it. This campaign starts with the buyer's language, then turns it into a repeatable message.\n\nProblem: ${context.problem}\nOutcome: ${context.outcome}\nProof: ${context.proof}`,
    x: `${goalHooks[context.goal]}\n\n1. Name the pain in the buyer's words\n2. Show what changed after validation\n3. Invite one clear next step\n\nOffer: ${context.offer}\nOutcome: ${context.outcome}`,
    instagram: `${goalHooks[context.goal]}\n\nSlide 1: The problem buyers keep naming\nSlide 2: Why generic advice fails\nSlide 3: The validated mechanism\nSlide 4: Proof from the test\nSlide 5: ${context.cta}`,
    email: `Subject: A clearer path to ${context.outcome}\n\nThe strongest signal from validation was simple: ${context.problem}.\n\nThat shaped ${context.offer}. It is designed to create ${context.outcome}, using the proof we already captured: ${context.proof}.\n\n${context.cta}`,
  }

  const bestTime: Record<PlatformKey, string> = {
    linkedin: 'Tue 9:00 AM',
    x: 'Wed 11:30 AM',
    instagram: 'Thu 2:00 PM',
    email: 'Fri 8:15 AM',
  }

  return {
    platform,
    label: labels[platform],
    hook: goalHooks[context.goal],
    body: bodyByPlatform[platform],
    cta: context.cta,
    bestTime: bestTime[platform],
  }
}

const ContentStudioPage = memo(() => {
  const {
    projects,
    currentProject,
    ghostIdentity,
    silentTest,
    lockIn,
    proofVault,
    outreachLog,
    setCurrentProjectId,
  } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [goal, setGoal] = useState<Goal>('launch')
  const [sourceFormat, setSourceFormat] = useState<SourceFormat>('buyer_quote')
  const [platforms, setPlatforms] = useState<PlatformKey[]>(['linkedin', 'x', 'email'])
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (projects.length === 0) {
      setSelectedProjectId('')
      return
    }

    const readyProject = projects.find((project) => project.ready_to_surface)
    const fallbackProject = readyProject ?? projects[0]
    if (!selectedProjectId || !projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(fallbackProject.id)
    }
  }, [projects, selectedProjectId])

  useEffect(() => {
    setCurrentProjectId(selectedProjectId || null)
    return () => setCurrentProjectId(null)
  }, [selectedProjectId, setCurrentProjectId])

  const selectedProject = currentProject ?? projects.find((project) => project.id === selectedProjectId) ?? null
  const projectProof = useMemo(
    () => proofVault.filter((item) => item.project_id === selectedProjectId),
    [proofVault, selectedProjectId],
  )

  const studio = useMemo(() => {
    const offer = valueOr(silentTest?.offer_name, selectedProject?.name ? `${selectedProject.name} offer` : 'Validated offer')
    const problem = valueOr(lockIn?.buyer_problem_language ?? ghostIdentity?.problem_statement, 'the buyer knows the problem is expensive but cannot see the next move')
    const outcome = valueOr(lockIn?.buyer_outcome_language ?? silentTest?.offer_outcome, 'move from validation to a scalable offer')
    const proof = valueOr(projectProof[0]?.content ?? outreachLog.find((row) => row.converted)?.notes, 'early buyers responded to the offer during validation')
    const cta = goal === 'launch' ? 'Apply for the next opening.' : goal === 'proof' ? 'Reply if you want the breakdown.' : 'Save this and use it before you scale.'

    const selectedPosts = platforms.map((platform) => postForPlatform(platform, { offer, problem, outcome, proof, cta, goal }))
    const sourceBrief = {
      buyer_quote: `Turn this buyer language into content: "${problem}"`,
      case_study: `Show the before, intervention, and result behind: ${proof}`,
      offer_page: `Repurpose the offer page promise: ${outcome}`,
      objection: `Convert the strongest objection into education: ${valueOr(outreachLog.find((row) => row.objection)?.objection, 'I am not sure this will work for me')}`,
    }[sourceFormat]

    return {
      offer,
      problem,
      outcome,
      proof,
      cta,
      sourceBrief,
      selectedPosts,
      repurposeSteps: [
        'Extract one buyer-language insight from validation data.',
        'Write the long-form authority post first.',
        'Compress the core idea into short-form posts.',
        'Translate the same idea into visual carousel beats.',
        'Schedule cross-posts with platform-native CTAs.',
      ],
    }
  }, [ghostIdentity, goal, lockIn, outreachLog, platforms, projectProof, selectedProject, silentTest, sourceFormat])

  const togglePlatform = (platform: PlatformKey) => {
    setPlatforms((current) => {
      if (current.includes(platform)) {
        return current.length === 1 ? current : current.filter((item) => item !== platform)
      }
      return [...current, platform]
    })
  }

  const copyText = (id: string, text: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      window.setTimeout(() => setCopied(null), 1600)
    })
  }

  const allPosts = studio.selectedPosts.map((post) => [
    post.label,
    post.hook,
    post.body,
    `CTA: ${post.cta}`,
    `Best time: ${post.bestTime}`,
  ].join('\n')).join('\n\n---\n\n')

  return (
    <div className="flex min-h-screen bg-phantom-black">
      <AppSidebar />
      <main className="flex-1 ml-60 p-10 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
          <div className="flex items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="font-display font-bold text-[28px] text-phantom-text-primary mb-1">Content Studio</h1>
              <p className="font-body text-[14px] text-phantom-text-secondary max-w-2xl">
                Agentic content creation for cross-posting, campaign planning, and repurposing validated offer assets.
              </p>
            </div>
            <button className="btn-primary shrink-0" onClick={() => copyText('all', allPosts)} disabled={!selectedProject}>
              {copied === 'all' ? <Check size={14} /> : <Copy size={14} />}
              {copied === 'all' ? 'Copied' : 'Copy campaign'}
            </button>
          </div>

          <div className="grid xl:grid-cols-[340px_1fr] gap-6">
            <aside className="space-y-5">
              <div className="card">
                <label className="label block mb-2">Project</label>
                <select className="input" value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)}>
                  {projects.length === 0 ? (
                    <option value="">No projects yet</option>
                  ) : (
                    projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="card">
                <p className="label flex items-center gap-2 mb-3"><Megaphone size={14} /> Campaign Goal</p>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map((item) => (
                    <button
                      key={item.key}
                      className={`font-ui text-[12px] px-3 py-2 rounded-lg border transition-colors ${goal === item.key ? 'border-phantom-lime text-phantom-lime bg-phantom-lime/10' : 'border-phantom-border text-phantom-text-muted hover:text-phantom-text-secondary'}`}
                      onClick={() => setGoal(item.key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card">
                <p className="label flex items-center gap-2 mb-3"><GitBranch size={14} /> Source Asset</p>
                <select className="input" value={sourceFormat} onChange={(event) => setSourceFormat(event.target.value as SourceFormat)}>
                  {SOURCES.map((item) => (
                    <option key={item.key} value={item.key}>{item.label}</option>
                  ))}
                </select>
                <p className="font-body text-[12px] text-phantom-text-muted mt-3">{studio.sourceBrief}</p>
              </div>

              <div className="card">
                <p className="label flex items-center gap-2 mb-3"><Send size={14} /> Cross-Post Channels</p>
                <div className="space-y-2">
                  {PLATFORMS.map((item) => {
                    const active = platforms.includes(item.key)
                    return (
                      <button
                        key={item.key}
                        className={`radio-option w-full text-left ${active ? 'radio-option-selected' : ''}`}
                        onClick={() => togglePlatform(item.key)}
                      >
                        <span className="flex-1">
                          <span className="block font-ui text-[13px]">{item.label}</span>
                          <span className="block font-body text-[11px] text-phantom-text-muted">{item.limit}</span>
                        </span>
                        <span className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-phantom-lime' : 'bg-phantom-border'}`} />
                      </button>
                    )
                  })}
                </div>
              </div>
            </aside>

            <section className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-5">
                {[
                  { icon: Sparkles, label: 'Content Strategist', value: 'Chooses the strongest validated angle.' },
                  { icon: RefreshCw, label: 'Repurposer', value: 'Turns one source into platform-native assets.' },
                  { icon: CalendarClock, label: 'Scheduler', value: 'Queues cross-posts with varied hooks and CTAs.' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="card">
                    <Icon size={16} className="text-phantom-lime mb-3" />
                    <p className="font-display font-bold text-[15px] text-phantom-text-primary mb-2">{label}</p>
                    <p className="font-body text-[13px] text-phantom-text-secondary">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-[1fr_340px] gap-6">
                <div className="space-y-5">
                  {studio.selectedPosts.map((post) => (
                    <div key={post.platform} className="card">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className="badge badge-active mb-2">{post.label}</span>
                          <h2 className="font-display font-bold text-[19px] text-phantom-text-primary leading-tight">{post.hook}</h2>
                        </div>
                        <button className="btn-ghost h-8 w-8 p-0 shrink-0" onClick={() => copyText(post.platform, `${post.hook}\n\n${post.body}\n\n${post.cta}`)} aria-label={`Copy ${post.label}`}>
                          {copied === post.platform ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                      <p className="font-body text-[13px] text-phantom-text-secondary leading-relaxed whitespace-pre-wrap mb-4">{post.body}</p>
                      <div className="flex items-center justify-between gap-4 border-t border-phantom-border-subtle pt-3">
                        <p className="font-body text-[12px] text-phantom-text-muted">CTA: {post.cta}</p>
                        <p className="font-code text-[11px] text-phantom-lime">{post.bestTime}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-5">
                  <div className="card">
                    <p className="label flex items-center gap-2 mb-4"><Workflow size={14} /> Agent Workflow</p>
                    <div className="space-y-3">
                      {studio.repurposeSteps.map((step, index) => (
                        <div key={step} className="flex gap-3">
                          <span className="h-7 w-7 rounded-lg bg-phantom-lime/10 border border-phantom-lime/30 text-phantom-lime font-code text-[11px] flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <p className="font-body text-[13px] text-phantom-text-secondary leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card">
                    <p className="label flex items-center gap-2 mb-4"><CalendarClock size={14} /> Schedule Queue</p>
                    <div className="space-y-3">
                      {studio.selectedPosts.map((post) => (
                        <div key={post.platform} className="flex items-center justify-between gap-3 border-b border-phantom-border-subtle pb-3 last:border-0 last:pb-0">
                          <div>
                            <p className="font-body text-[13px] text-phantom-text-primary">{post.label}</p>
                            <p className="font-body text-[11px] text-phantom-text-muted">Ready to cross-post</p>
                          </div>
                          <span className="font-code text-[11px] text-phantom-lime">{post.bestTime}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  )
})

ContentStudioPage.displayName = 'ContentStudioPage'
export default ContentStudioPage
