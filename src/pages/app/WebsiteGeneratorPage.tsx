import { memo, useEffect, useMemo, useState } from 'react'
import { Check, Copy, FileText, Globe2, LayoutTemplate, MousePointerClick, WandSparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import AppSidebar from '@/components/app/AppSidebar'
import { useProjects } from '@/contexts/ProjectContext'

type PageType = 'waitlist' | 'sales' | 'pilot'
type Tone = 'direct' | 'premium' | 'friendly'

interface PageSection {
  title: string
  eyebrow: string
  body: string
}

function clean(value: string | null | undefined, fallback: string) {
  const next = value?.trim()
  return next && next.length > 0 ? next : fallback
}

const PAGE_TYPES: { key: PageType; label: string; description: string }[] = [
  { key: 'sales', label: 'Sales Page', description: 'Built for validated offers ready to convert.' },
  { key: 'pilot', label: 'Pilot Page', description: 'Best for limited beta, founding customer, or cohort offers.' },
  { key: 'waitlist', label: 'Waitlist', description: 'Capture demand before a full public launch.' },
]

const TONES: { key: Tone; label: string }[] = [
  { key: 'direct', label: 'Direct' },
  { key: 'premium', label: 'Premium' },
  { key: 'friendly', label: 'Friendly' },
]

const WebsiteGeneratorPage = memo(() => {
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
  const [pageType, setPageType] = useState<PageType>('sales')
  const [tone, setTone] = useState<Tone>('direct')
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
  const proofItems = useMemo(
    () => proofVault.filter((item) => item.project_id === selectedProjectId).slice(0, 3),
    [proofVault, selectedProjectId],
  )

  const copy = useMemo(() => {
    const brand = clean(lockIn?.final_brand_name ?? ghostIdentity?.working_name ?? selectedProject?.name, 'Your validated offer')
    const offer = clean(silentTest?.offer_name, `${brand} Pilot`)
    const problem = clean(lockIn?.buyer_problem_language ?? ghostIdentity?.problem_statement, 'buyers are stuck with a painful, expensive problem')
    const outcome = clean(lockIn?.buyer_outcome_language ?? silentTest?.offer_outcome, 'get the outcome they already proved they want')
    const positioning = clean(lockIn?.generated_positioning ?? ghostIdentity?.positioning_statement, `${brand} turns validated demand into a focused offer.`)
    const price = silentTest?.offer_price ? `${silentTest.offer_currency || 'USD'} ${silentTest.offer_price}` : 'Founding customer pricing'
    const cta = pageType === 'waitlist' ? 'Join the waitlist' : pageType === 'pilot' ? 'Apply for the pilot' : 'Get the offer'
    const tonePrefix = tone === 'premium' ? 'A refined way to' : tone === 'friendly' ? 'A clearer way to' : 'The fastest way to'

    const sections: PageSection[] = [
      {
        eyebrow: pageType === 'waitlist' ? 'Demand Capture' : pageType === 'pilot' ? 'Limited Pilot' : 'Validated Offer',
        title: `${tonePrefix} ${outcome.toLowerCase()}`,
        body: `${offer} is for people dealing with ${problem}. ${positioning}`,
      },
      {
        eyebrow: 'Why This Exists',
        title: 'Built from buyer language, not internal guesses',
        body: `The offer is based on the exact problem pattern: ${problem}. The page should repeat the buyer's words before explaining the mechanism.`,
      },
      {
        eyebrow: 'What They Get',
        title: offer,
        body: silentTest?.offer_includes?.length
          ? silentTest.offer_includes.map((item) => `- ${item}`).join('\n')
          : `- Diagnosis of the current bottleneck\n- Execution plan tied to ${outcome}\n- Clear next step after delivery`,
      },
      {
        eyebrow: 'Proof',
        title: proofItems.length > 0 ? 'Evidence the market is responding' : 'Proof to capture next',
        body: proofItems.length > 0
          ? proofItems.map((item) => `- ${item.title}: ${item.content}`).join('\n')
          : 'Add testimonials, screenshots, conversion data, or buyer quotes from the Proof Vault as soon as they exist.',
      },
      {
        eyebrow: 'Offer',
        title: `${price} - clear scope, clear outcome`,
        body: `Use this section to show delivery method, timeline, included assets, and why the next step is low-risk. Primary CTA: ${cta}.`,
      },
    ]

    return {
      brand,
      offer,
      problem,
      outcome,
      cta,
      sections,
      metaTitle: `${brand} | ${offer}`,
      metaDescription: `${offer} helps validated buyers ${outcome.toLowerCase()} without relying on untested messaging.`,
    }
  }, [ghostIdentity, lockIn, pageType, proofItems, selectedProject, silentTest, tone])

  const fullPageCopy = [
    `Meta title: ${copy.metaTitle}`,
    `Meta description: ${copy.metaDescription}`,
    '',
    ...copy.sections.flatMap((section) => [
      section.eyebrow,
      section.title,
      section.body,
      '',
    ]),
    `CTA: ${copy.cta}`,
  ].join('\n')

  const writeClipboard = (id: string, text: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      window.setTimeout(() => setCopied(null), 1600)
    })
  }

  return (
    <div className="flex min-h-screen bg-phantom-black">
      <AppSidebar />
      <main className="flex-1 ml-60 p-10 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
          <div className="flex items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="font-display font-bold text-[28px] text-phantom-text-primary mb-1">Website Generator</h1>
              <p className="font-body text-[14px] text-phantom-text-secondary max-w-2xl">
                Generate a launch-ready website outline with a built-in copywriter trained on validated offer data.
              </p>
            </div>
            <button className="btn-primary shrink-0" onClick={() => writeClipboard('page', fullPageCopy)} disabled={!selectedProject}>
              {copied === 'page' ? <Check size={14} /> : <Copy size={14} />}
              {copied === 'page' ? 'Copied' : 'Copy page'}
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
                <p className="label flex items-center gap-2 mb-3"><LayoutTemplate size={14} /> Page Type</p>
                <div className="space-y-2">
                  {PAGE_TYPES.map((item) => (
                    <button
                      key={item.key}
                      className={`radio-option w-full text-left ${pageType === item.key ? 'radio-option-selected' : ''}`}
                      onClick={() => setPageType(item.key)}
                    >
                      <span className="flex-1">
                        <span className="block font-ui text-[13px]">{item.label}</span>
                        <span className="block font-body text-[11px] text-phantom-text-muted">{item.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card">
                <p className="label flex items-center gap-2 mb-3"><WandSparkles size={14} /> Copywriter Tone</p>
                <div className="grid grid-cols-3 gap-2">
                  {TONES.map((item) => (
                    <button
                      key={item.key}
                      className={`font-ui text-[12px] px-3 py-2 rounded-lg border transition-colors ${tone === item.key ? 'border-phantom-lime text-phantom-lime bg-phantom-lime/10' : 'border-phantom-border text-phantom-text-muted hover:text-phantom-text-secondary'}`}
                      onClick={() => setTone(item.key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card">
                <p className="label flex items-center gap-2 mb-3"><FileText size={14} /> SEO Draft</p>
                <p className="font-ui text-[11px] uppercase tracking-wider text-phantom-text-muted mb-1">Title</p>
                <p className="font-body text-[13px] text-phantom-text-secondary mb-3">{copy.metaTitle}</p>
                <p className="font-ui text-[11px] uppercase tracking-wider text-phantom-text-muted mb-1">Description</p>
                <p className="font-body text-[13px] text-phantom-text-secondary">{copy.metaDescription}</p>
              </div>
            </aside>

            <section className="grid lg:grid-cols-[1fr_360px] gap-6">
              <div className="space-y-5">
                {copy.sections.map((section) => (
                  <div key={section.eyebrow} className="card">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="label text-phantom-lime mb-2">{section.eyebrow}</p>
                        <h2 className="font-display font-bold text-[21px] text-phantom-text-primary leading-tight">{section.title}</h2>
                      </div>
                      <button className="btn-ghost h-8 w-8 p-0 shrink-0" onClick={() => writeClipboard(section.eyebrow, `${section.title}\n${section.body}`)} aria-label={`Copy ${section.eyebrow}`}>
                        {copied === section.eyebrow ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed whitespace-pre-wrap">{section.body}</p>
                  </div>
                ))}
              </div>

              <div className="card h-fit sticky top-6">
                <p className="label flex items-center gap-2 mb-4"><Globe2 size={14} /> Live Page Preview</p>
                <div className="rounded-xl overflow-hidden border border-phantom-border-subtle bg-[#090909]">
                  <div className="h-9 bg-[#111] border-b border-phantom-border-subtle flex items-center gap-1.5 px-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-phantom-danger/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-phantom-warning/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-phantom-lime/70" />
                  </div>
                  <div className="p-5">
                    <p className="font-ui text-[10px] uppercase tracking-wider text-phantom-lime mb-3">{copy.sections[0]?.eyebrow}</p>
                    <h3 className="font-display font-bold text-[25px] leading-tight text-phantom-text-primary mb-3">{copy.sections[0]?.title}</h3>
                    <p className="font-body text-[12px] leading-relaxed text-phantom-text-secondary mb-5">{copy.sections[0]?.body}</p>
                    <button className="btn-primary w-full text-[12px] py-2">
                      <MousePointerClick size={13} /> {copy.cta}
                    </button>
                    <div className="mt-5 space-y-2">
                      {copy.sections.slice(1, 4).map((section) => (
                        <div key={section.eyebrow} className="rounded-lg border border-phantom-border-subtle p-3 bg-[#0d0d0d]">
                          <p className="font-ui text-[9px] uppercase tracking-wider text-phantom-text-muted mb-1">{section.eyebrow}</p>
                          <p className="font-body text-[12px] text-phantom-text-secondary">{section.title}</p>
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

WebsiteGeneratorPage.displayName = 'WebsiteGeneratorPage'
export default WebsiteGeneratorPage
