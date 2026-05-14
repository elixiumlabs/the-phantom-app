import { memo, useEffect, useMemo, useState } from 'react'
import { Check, Copy, Layers, MessageSquareText, Palette, ShieldCheck, Sparkles, Target, Type } from 'lucide-react'
import { motion } from 'framer-motion'
import AppSidebar from '@/components/app/AppSidebar'
import { useProjects } from '@/contexts/ProjectContext'

const PALETTE = [
  { name: 'Phantom Lime', value: '#89F336', use: 'Primary actions and proof signals' },
  { name: 'Deep Black', value: '#0A0A0A', use: 'Background and high-contrast canvas' },
  { name: 'Signal Blue', value: '#4F8CFF', use: 'Links, data, and secondary emphasis' },
  { name: 'Proof Gold', value: '#F5C518', use: 'Wins, badges, and launch moments' },
  { name: 'Soft White', value: '#F0F0F0', use: 'Primary text and clean surfaces' },
]

function joinList(items: string[] | undefined, fallback: string) {
  const cleaned = (items ?? []).map((item) => item.trim()).filter(Boolean)
  return cleaned.length > 0 ? cleaned.join(', ') : fallback
}

function sentence(value: string | null | undefined, fallback: string) {
  const cleaned = value?.trim()
  return cleaned && cleaned.length > 0 ? cleaned : fallback
}

const BrandStudioPage = memo(() => {
  const {
    projects,
    currentProject,
    ghostIdentity,
    silentTest,
    lockIn,
    proofVault,
    setCurrentProjectId,
  } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (projects.length === 0) {
      setSelectedProjectId('')
      return
    }

    const surfacedProject = projects.find((project) => project.ready_to_surface)
    const fallbackProject = surfacedProject ?? projects[0]
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
    () => proofVault.filter((item) => item.project_id === selectedProjectId).slice(0, 3),
    [proofVault, selectedProjectId],
  )

  const kit = useMemo(() => {
    const brandName = sentence(lockIn?.final_brand_name ?? ghostIdentity?.working_name ?? selectedProject?.name, 'Validated Brand')
    const problem = sentence(lockIn?.buyer_problem_language ?? ghostIdentity?.problem_statement, 'The buyer problem still needs sharper language.')
    const outcome = sentence(lockIn?.buyer_outcome_language ?? silentTest?.offer_outcome, 'A concrete outcome the buyer can feel and measure.')
    const positioning = sentence(
      lockIn?.generated_positioning ?? ghostIdentity?.positioning_statement,
      `${brandName} helps a specific buyer move from the painful current state to a proven outcome.`,
    )
    const offer = sentence(silentTest?.offer_name, `${brandName} launch offer`)
    const voice = joinList(lockIn?.final_voice_adjectives ?? ghostIdentity?.voice_adjectives, 'Specific, calm, useful')
    const visual = sentence(lockIn?.visual_direction, 'High-contrast, proof-led, minimal visual system with one strong accent.')
    const notFor = sentence(lockIn?.not_for ?? ghostIdentity?.anti_customers?.join(', '), 'Not for buyers who want theory without execution.')

    return {
      brandName,
      problem,
      outcome,
      positioning,
      offer,
      voice,
      visual,
      notFor,
      headline: `${outcome} without guessing what the market wants`,
      promise: `Turn validated buyer language into a brand system built around ${problem.toLowerCase()}`,
      tagline: `${offer} for buyers ready to move.`,
    }
  }, [ghostIdentity, lockIn, selectedProject, silentTest])

  const copyText = (id: string, text: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      window.setTimeout(() => setCopied(null), 1600)
    })
  }

  const fullKit = [
    `Brand: ${kit.brandName}`,
    `Positioning: ${kit.positioning}`,
    `Headline: ${kit.headline}`,
    `Tagline: ${kit.tagline}`,
    `Problem: ${kit.problem}`,
    `Outcome: ${kit.outcome}`,
    `Voice: ${kit.voice}`,
    `Visual Direction: ${kit.visual}`,
    `Not For: ${kit.notFor}`,
  ].join('\n')

  return (
    <div className="flex min-h-screen bg-phantom-black">
      <AppSidebar />
      <main className="flex-1 ml-60 p-10 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
          <div className="flex items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="font-display font-bold text-[28px] text-phantom-text-primary mb-1">Brand Studio</h1>
              <p className="font-body text-[14px] text-phantom-text-secondary max-w-2xl">
                Turn validated offer data into a usable brand kit: messaging, voice, visual direction, and proof cues.
              </p>
            </div>
            <button className="btn-primary shrink-0" onClick={() => copyText('kit', fullKit)} disabled={!selectedProject}>
              {copied === 'kit' ? <Check size={14} /> : <Copy size={14} />}
              {copied === 'kit' ? 'Copied' : 'Copy kit'}
            </button>
          </div>

          <div className="grid lg:grid-cols-[320px_1fr] gap-6">
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
                <p className="font-body text-[12px] text-phantom-text-muted mt-3">
                  Best results come from projects that reached Lock In with buyer language and proof.
                </p>
              </div>

              <div className="card">
                <p className="label mb-4">Brand Readiness</p>
                {[
                  { label: 'Validated offer', active: Boolean(silentTest?.offer_name) },
                  { label: 'Buyer language', active: Boolean(lockIn?.buyer_problem_language || ghostIdentity?.problem_statement) },
                  { label: 'Proof assets', active: projectProof.length > 0 },
                  { label: 'Final voice', active: Boolean(lockIn?.final_voice_adjectives?.length || ghostIdentity?.voice_adjectives?.length) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-phantom-border-subtle last:border-0">
                    <span className="font-body text-[13px] text-phantom-text-secondary">{item.label}</span>
                    <span className={`badge text-[9px] ${item.active ? 'badge-active' : ''}`}>{item.active ? 'Ready' : 'Draft'}</span>
                  </div>
                ))}
              </div>
            </aside>

            <section className="space-y-6">
              <div className="card bg-[#0d0d0d]">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="label text-phantom-lime mb-3">Identity System</p>
                    <h2 className="font-display font-bold text-[34px] leading-tight text-phantom-text-primary mb-3">{kit.brandName}</h2>
                    <p className="font-body text-[15px] text-phantom-text-secondary max-w-3xl leading-relaxed">{kit.positioning}</p>
                  </div>
                  <Sparkles size={22} className="text-phantom-lime shrink-0" />
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                {[
                  { icon: Target, label: 'Core Problem', value: kit.problem },
                  { icon: ShieldCheck, label: 'Promised Outcome', value: kit.outcome },
                  { icon: MessageSquareText, label: 'Voice', value: kit.voice },
                  { icon: Layers, label: 'Not For', value: kit.notFor },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="card">
                    <div className="flex items-center justify-between mb-3">
                      <p className="label flex items-center gap-2"><Icon size={14} /> {label}</p>
                      <button className="btn-ghost h-8 w-8 p-0" onClick={() => copyText(label, value)} aria-label={`Copy ${label}`}>
                        {copied === label ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-[1fr_340px] gap-5">
                <div className="card">
                  <p className="label flex items-center gap-2 mb-4"><Type size={14} /> Copy Blocks</p>
                  <div className="space-y-4">
                    {[
                      { label: 'Hero headline', value: kit.headline },
                      { label: 'Subheadline', value: kit.promise },
                      { label: 'Tagline', value: kit.tagline },
                    ].map((item) => (
                      <div key={item.label} className="border-b border-phantom-border-subtle pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <p className="font-ui text-[11px] uppercase tracking-wider text-phantom-text-muted">{item.label}</p>
                          <button className="text-phantom-text-muted hover:text-phantom-lime" onClick={() => copyText(item.label, item.value)} aria-label={`Copy ${item.label}`}>
                            {copied === item.label ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                        <p className="font-body text-[14px] text-phantom-text-secondary">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <p className="label flex items-center gap-2 mb-4"><Palette size={14} /> Visual Direction</p>
                  <p className="font-body text-[13px] text-phantom-text-secondary mb-4 leading-relaxed">{kit.visual}</p>
                  <div className="space-y-3">
                    {PALETTE.map((color) => (
                      <div key={color.name} className="flex items-center gap-3">
                        <span className="h-9 w-9 rounded-lg border border-phantom-border-subtle shrink-0" style={{ background: color.value }} />
                        <div className="min-w-0">
                          <p className="font-body text-[13px] text-phantom-text-primary">{color.name}</p>
                          <p className="font-body text-[11px] text-phantom-text-muted truncate">{color.use}</p>
                        </div>
                      </div>
                    ))}
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

BrandStudioPage.displayName = 'BrandStudioPage'
export default BrandStudioPage
