import { memo, useMemo, useRef, useState } from 'react'
import { Plus, Trash2, TrendingUp, MessageSquare, FileText, Camera, Filter, Upload, Loader, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects, type ProofVaultItem } from '@/contexts/ProjectContext'
import { useVault } from '@/hooks'
import { db } from '@/lib/firebase'
import { requestProofUploadUrl } from '@/lib/functions'
import AppSidebar from '@/components/app/AppSidebar'

type BackendProofType = ProofVaultItem['proof_type']

const TYPE_LABELS: Record<BackendProofType, string> = {
  revenue:         'Result',
  testimonial:     'Testimonial',
  case_study:      'Case Study',
  screenshot:      'Screenshot',
  conversion_data: 'Conversion Data',
}

const TYPE_BADGE: Record<BackendProofType, string> = {
  revenue:         'badge badge-active',
  testimonial:     'badge',
  case_study:      'badge',
  screenshot:      'badge',
  conversion_data: 'badge',
}

const ALLOWED_FILE = /^(image\/.+|application\/pdf|text\/csv)$/

const VaultPage = memo(() => {
  const { user } = useAuth()
  const { projects } = useProjects()
  const { items, loading } = useVault()

  const userProjects = useMemo(
    () => projects.filter((p) => p.user_id === user?.id),
    [projects, user?.id],
  )

  const [typeFilter, setTypeFilter] = useState<BackendProofType | 'all'>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<BackendProofType>('testimonial')
  const [projectId, setProjectId] = useState(userProjects[0]?.id ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Per-type form state (text fields only — file is read from input ref)
  const [resultForm, setResultForm] = useState({ metric: '', context: '', date: '' })
  const [testimonialForm, setTestimonialForm] = useState({ quote: '', attribution: '', dateCollected: '' })
  const [caseForm, setCaseForm] = useState({ beforeState: '', whatWasDone: '', afterState: '', timeline: '' })
  const [screenshotForm, setScreenshotForm] = useState({ title: '', notes: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const filtered = useMemo(() => {
    return items
      .filter((p) => typeFilter === 'all' || p.proof_type === typeFilter)
      .filter((p) => projectFilter === 'all' || p.project_id === projectFilter)
      .sort((a, b) => {
        const aTs = parseTs(a.created_at)
        const bTs = parseTs(b.created_at)
        return sortBy === 'newest' ? bTs - aTs : aTs - bTs
      })
  }, [items, typeFilter, projectFilter, sortBy])

  const counts = useMemo(
    () => ({
      revenue: items.filter((p) => p.proof_type === 'revenue').length,
      testimonial: items.filter((p) => p.proof_type === 'testimonial').length,
      case_study: items.filter((p) => p.proof_type === 'case_study').length,
      screenshot: items.filter((p) => p.proof_type === 'screenshot').length,
      conversion_data: items.filter((p) => p.proof_type === 'conversion_data').length,
    }),
    [items],
  )

  const getProjectName = (id: string) =>
    userProjects.find((p) => p.id === id)?.name ?? 'Unknown project'

  const resetForms = () => {
    setResultForm({ metric: '', context: '', date: '' })
    setTestimonialForm({ quote: '', attribution: '', dateCollected: '' })
    setCaseForm({ beforeState: '', whatWasDone: '', afterState: '', timeline: '' })
    setScreenshotForm({ title: '', notes: '' })
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setError(null)
  }

  const canSubmit = () => {
    if (!projectId) return false
    if (submitting) return false
    if (formType === 'revenue') return resultForm.metric.trim().length > 0
    if (formType === 'testimonial') return testimonialForm.quote.trim().length > 0
    if (formType === 'case_study') return caseForm.beforeState.trim().length > 0
    if (formType === 'screenshot') return screenshotForm.title.trim().length > 0 && selectedFile !== null
    return false
  }

  const submit = async () => {
    if (!canSubmit() || !user) return
    setSubmitting(true)
    setError(null)

    try {
      if (formType === 'screenshot' && selectedFile) {
        if (!ALLOWED_FILE.test(selectedFile.type)) {
          throw new Error(`Unsupported file type: ${selectedFile.type || 'unknown'}`)
        }
        const { upload_url } = await requestProofUploadUrl({
          project_id: projectId,
          proof_type: 'screenshot',
          filename: selectedFile.name,
          content_type: selectedFile.type,
          title: screenshotForm.title.trim() || undefined,
        })
        const res = await fetch(upload_url, {
          method: 'PUT',
          headers: {
            'Content-Type': selectedFile.type,
            'x-goog-meta-uid': user.id,
            'x-goog-meta-project-id': projectId,
            'x-goog-meta-proof-type': 'screenshot',
            'x-goog-meta-title': screenshotForm.title.trim() || '',
            'x-goog-meta-source': '',
            'x-goog-meta-amount': '',
          },
          body: selectedFile,
        })
        if (!res.ok) throw new Error(`Upload failed (${res.status})`)
        // The onFinalize trigger will create the proof_vault doc.
      } else {
        const content = formatContent(formType, { resultForm, testimonialForm, caseForm })
        const amount =
          formType === 'revenue' && resultForm.metric ? extractAmount(resultForm.metric) : null
        const date =
          formType === 'revenue' ? resultForm.date :
          formType === 'testimonial' ? testimonialForm.dateCollected :
          ''
        await addDoc(collection(db, 'proof_vault'), {
          user_id: user.id,
          project_id: projectId,
          proof_type: formType,
          title: deriveTitle(formType, { resultForm, testimonialForm, caseForm }),
          content,
          amount,
          source: formType === 'testimonial' ? testimonialForm.attribution || null : null,
          date: date || null,
          tags: [],
          content_type: null,
          size: null,
          created_at: serverTimestamp(),
        })
      }

      resetForms()
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save proof item.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (item: ProofVaultItem) => {
    if (!confirm('Delete this proof item?')) return
    try {
      await deleteDoc(doc(db, 'proof_vault', item.id))
    } catch (err) {
      console.error('[phantom] delete proof failed:', err)
    }
  }

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
          <div className="flex items-start justify-between mb-10">
            <div>
              <h1 className="font-display font-bold text-[28px] text-phantom-text-primary mb-1">
                Proof Vault
              </h1>
              <p className="font-body text-[14px] text-phantom-text-secondary">
                Every result, testimonial, and case study collected in private. The asset library for when phantom phase ends.
              </p>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                if (userProjects.length === 0) return
                setShowForm((v) => !v)
                resetForms()
                if (!projectId && userProjects[0]) setProjectId(userProjects[0].id)
              }}
              disabled={userProjects.length === 0}
            >
              <Plus size={16} /> Add proof
            </button>
          </div>

          {userProjects.length === 0 && (
            <div className="card mb-6 border-phantom-border-subtle">
              <p className="font-body text-[14px] text-phantom-text-secondary">
                Create a project first — the vault stores proof against a specific phantom test.
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total proof items', val: items.length, icon: TrendingUp },
              { label: 'Results',           val: counts.revenue, icon: TrendingUp },
              { label: 'Testimonials',      val: counts.testimonial, icon: MessageSquare },
              { label: 'Case studies',      val: counts.case_study, icon: FileText },
            ].map(({ label, val, icon: Icon }) => (
              <div key={label} className="card">
                <Icon size={14} className="text-phantom-text-muted mb-3" />
                <p className="font-code text-[38px] text-phantom-lime font-bold leading-none mb-1">{val}</p>
                <p className="font-body text-[12px] text-phantom-text-muted">{label}</p>
              </div>
            ))}
          </div>

          {/* Add Proof Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                className="card mb-6 border-phantom-lime/30"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="label text-phantom-lime mb-4">New proof item</p>

                <div className="grid md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="label text-phantom-text-secondary mb-2 block">Proof type</label>
                    <select
                      className="input"
                      value={formType}
                      onChange={(e) => {
                        setFormType(e.target.value as BackendProofType)
                        resetForms()
                      }}
                    >
                      <option value="testimonial">Testimonial</option>
                      <option value="revenue">Result</option>
                      <option value="case_study">Case Study</option>
                      <option value="screenshot">Screenshot</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-phantom-text-secondary mb-2 block">Project</label>
                    <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                      {userProjects.length === 0 ? (
                        <option value="">Create a project first</option>
                      ) : (
                        userProjects.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {formType === 'revenue' && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">The metric (specific and measurable)</label>
                      <input className="input" value={resultForm.metric} onChange={(e) => setResultForm((f) => ({ ...f, metric: e.target.value }))} placeholder="e.g. 3x revenue increase in 30 days, 40% time saved per week" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Context</label>
                      <input className="input" value={resultForm.context} onChange={(e) => setResultForm((f) => ({ ...f, context: e.target.value }))} placeholder="Who achieved this result and in what situation" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Date</label>
                      <input className="input" type="date" value={resultForm.date} onChange={(e) => setResultForm((f) => ({ ...f, date: e.target.value }))} />
                    </div>
                  </div>
                )}

                {formType === 'testimonial' && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Quote — their exact words</label>
                      <textarea className="input" rows={3} value={testimonialForm.quote} onChange={(e) => setTestimonialForm((f) => ({ ...f, quote: e.target.value }))} placeholder='"I went from X to Y in Z timeframe. The specific thing that made the difference was..."' />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Attribution</label>
                      <input className="input" value={testimonialForm.attribution} onChange={(e) => setTestimonialForm((f) => ({ ...f, attribution: e.target.value }))} placeholder="Name, title, or role — no last names required" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Date collected</label>
                      <input className="input" type="date" value={testimonialForm.dateCollected} onChange={(e) => setTestimonialForm((f) => ({ ...f, dateCollected: e.target.value }))} />
                    </div>
                  </div>
                )}

                {formType === 'case_study' && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Before — what was their situation</label>
                      <textarea className="input" rows={2} value={caseForm.beforeState} onChange={(e) => setCaseForm((f) => ({ ...f, beforeState: e.target.value }))} placeholder="The specific problem, pain, or situation they were in" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">What was done</label>
                      <textarea className="input" rows={2} value={caseForm.whatWasDone} onChange={(e) => setCaseForm((f) => ({ ...f, whatWasDone: e.target.value }))} placeholder="What you worked on or delivered together" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">After — specific measurable result</label>
                      <textarea className="input" rows={2} value={caseForm.afterState} onChange={(e) => setCaseForm((f) => ({ ...f, afterState: e.target.value }))} placeholder="The outcome. Use numbers wherever possible." />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Timeline</label>
                      <input className="input" value={caseForm.timeline} onChange={(e) => setCaseForm((f) => ({ ...f, timeline: e.target.value }))} placeholder="e.g. 6 weeks, 3 months" />
                    </div>
                  </div>
                )}

                {formType === 'screenshot' && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">What this screenshot shows</label>
                      <input className="input" value={screenshotForm.title} onChange={(e) => setScreenshotForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Stripe dashboard showing $4,200 in week 1" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Notes</label>
                      <textarea className="input" rows={2} value={screenshotForm.notes} onChange={(e) => setScreenshotForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Context, date, what it proves" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">File (image, PDF, or CSV)</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,application/pdf,text/csv"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                        className="block w-full text-[13px] text-phantom-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-phantom-border-subtle file:bg-phantom-black file:text-phantom-lime file:font-ui file:text-[12px] hover:file:border-phantom-lime/40 cursor-pointer"
                      />
                      {selectedFile && (
                        <p className="font-body text-[12px] text-phantom-text-muted mt-2">
                          {selectedFile.name} — {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-phantom-danger/10 border border-phantom-danger/30 rounded-lg p-3 mb-4">
                    <p className="font-body text-[13px] text-phantom-danger">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button className="btn-primary" onClick={() => void submit()} disabled={!canSubmit()}>
                    {submitting ? (
                      <><Loader size={14} className="animate-spin" /> Saving...</>
                    ) : formType === 'screenshot' ? (
                      <><Upload size={14} /> Upload to vault</>
                    ) : (
                      'Save to vault'
                    )}
                  </button>
                  <button className="btn-ghost" onClick={() => setShowForm(false)} disabled={submitting}>Cancel</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters + Sort */}
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={14} className="text-phantom-text-muted shrink-0" />
              {(['all', 'revenue', 'testimonial', 'case_study', 'screenshot'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`font-ui text-[12px] px-3 py-1.5 rounded-full border transition-all duration-150 ${
                    typeFilter === t
                      ? 'border-phantom-lime text-phantom-lime bg-phantom-lime/10'
                      : 'border-phantom-border text-phantom-text-muted hover:border-[#333] hover:text-phantom-text-secondary'
                  }`}
                >
                  {t === 'all' ? 'All' : TYPE_LABELS[t]}
                  {t !== 'all' && (
                    <span className="ml-1.5 opacity-50">{counts[t as keyof typeof counts]}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {userProjects.length > 1 && (
                <select className="input text-[13px] py-1.5 w-auto min-w-[140px]" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                  <option value="all">All projects</option>
                  {userProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
              <select className="input text-[13px] py-1.5 w-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          {/* Empty / list */}
          {loading ? (
            <div className="card text-center py-16">
              <Loader size={20} className="animate-spin text-phantom-text-muted mx-auto mb-3" />
              <p className="font-body text-[14px] text-phantom-text-secondary">Loading vault...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-[#0a1900] border border-phantom-lime/30">
                <TrendingUp size={20} className="text-phantom-lime" />
              </div>
              <h3 className="font-display font-bold text-[18px] text-phantom-text-primary mb-2">
                Vault is empty.
              </h3>
              <p className="font-body text-[14px] text-phantom-text-secondary mb-6 max-w-sm mx-auto">
                Start uploading proof. Every result, every conversion, every testimonial belongs here.
              </p>
              <button
                className="btn-primary mx-auto"
                onClick={() => setShowForm(true)}
                disabled={userProjects.length === 0}
              >
                <Plus size={14} /> Add proof
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  className="card card-interactive group relative"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={() => void handleDelete(item)}
                    className="absolute top-4 right-4 text-phantom-text-muted hover:text-phantom-danger transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Delete"
                  >
                    <Trash2 size={13} />
                  </button>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={TYPE_BADGE[item.proof_type]}>{TYPE_LABELS[item.proof_type]}</span>
                    <span className="font-body text-[11px] text-phantom-text-muted">{getProjectName(item.project_id)}</span>
                  </div>

                  <ProofCard item={item} />

                  <p className="font-body text-[11px] text-phantom-text-muted mt-4 pt-3 border-t border-phantom-border-subtle">
                    {formatDate(item.created_at)}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
})

VaultPage.displayName = 'VaultPage'
export default VaultPage

function ProofCard({ item }: { item: ProofVaultItem }) {
  if (item.proof_type === 'revenue') {
    return (
      <>
        <p className="font-code font-bold text-[18px] text-phantom-lime leading-tight mb-2">{item.title || item.content}</p>
        {item.content && item.title && item.content !== item.title && (
          <p className="font-body text-[13px] text-phantom-text-secondary">{item.content}</p>
        )}
      </>
    )
  }
  if (item.proof_type === 'testimonial') {
    return (
      <>
        <p className="font-display text-[28px] text-phantom-lime opacity-30 leading-none mb-1">"</p>
        <p className="font-body text-[14px] text-phantom-text-primary leading-relaxed mb-3 line-clamp-4">{item.content || item.title}</p>
        {item.source && (
          <p className="font-ui text-[11px] text-phantom-text-muted uppercase tracking-wider">— {item.source}</p>
        )}
      </>
    )
  }
  if (item.proof_type === 'case_study') {
    const parts = parseCaseStudy(item.content)
    return (
      <div className="space-y-3">
        {parts.before && (
          <div>
            <p className="font-body text-[10px] text-phantom-text-muted uppercase tracking-wider mb-1">Before</p>
            <p className="font-body text-[13px] text-phantom-text-secondary line-clamp-2">{parts.before}</p>
          </div>
        )}
        {parts.after && (
          <div>
            <p className="font-body text-[10px] text-phantom-lime uppercase tracking-wider mb-1">After</p>
            <p className="font-body text-[13px] text-phantom-text-primary line-clamp-2">{parts.after}</p>
          </div>
        )}
        {parts.timeline && (
          <p className="font-body text-[11px] text-phantom-text-muted">Timeline: {parts.timeline}</p>
        )}
      </div>
    )
  }
  if (item.proof_type === 'screenshot') {
    return (
      <>
        <div className="flex items-center justify-center w-full h-24 bg-[#0d0d0d] border border-phantom-border-subtle rounded-xl mb-3">
          <Camera size={20} className="text-phantom-text-muted" />
        </div>
        <p className="font-body text-[14px] text-phantom-text-primary mb-1">{item.title || 'Screenshot'}</p>
        {item.content && <p className="font-body text-[12px] text-phantom-text-muted line-clamp-2">{item.content}</p>}
        {item.file_url && (
          <p className="font-body text-[11px] text-phantom-text-muted mt-2 inline-flex items-center gap-1">
            <ExternalLink size={11} /> File stored
          </p>
        )}
      </>
    )
  }
  return <p className="font-body text-[13px] text-phantom-text-secondary">{item.title || item.content}</p>
}

function formatContent(
  type: BackendProofType,
  forms: {
    resultForm: { metric: string; context: string; date: string }
    testimonialForm: { quote: string; attribution: string; dateCollected: string }
    caseForm: { beforeState: string; whatWasDone: string; afterState: string; timeline: string }
  },
): string {
  if (type === 'revenue') {
    return forms.resultForm.context.trim() || forms.resultForm.metric.trim()
  }
  if (type === 'testimonial') {
    return forms.testimonialForm.quote.trim()
  }
  if (type === 'case_study') {
    return JSON.stringify({
      before: forms.caseForm.beforeState.trim(),
      what: forms.caseForm.whatWasDone.trim(),
      after: forms.caseForm.afterState.trim(),
      timeline: forms.caseForm.timeline.trim(),
    })
  }
  return ''
}

function deriveTitle(
  type: BackendProofType,
  forms: {
    resultForm: { metric: string; context: string; date: string }
    testimonialForm: { quote: string; attribution: string; dateCollected: string }
    caseForm: { beforeState: string; whatWasDone: string; afterState: string; timeline: string }
  },
): string {
  if (type === 'revenue') return forms.resultForm.metric.trim()
  if (type === 'testimonial') return forms.testimonialForm.attribution.trim() || 'Testimonial'
  if (type === 'case_study') return forms.caseForm.beforeState.trim().slice(0, 80)
  return ''
}

function parseCaseStudy(content: string): { before?: string; what?: string; after?: string; timeline?: string } {
  if (!content) return {}
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {
    // fall through — treat as plain text
  }
  return { before: content }
}

function extractAmount(metric: string): number | null {
  const match = metric.match(/\$?\s*([\d,]+(?:\.\d+)?)/)
  if (!match) return null
  const num = parseFloat(match[1].replace(/,/g, ''))
  return Number.isFinite(num) ? num : null
}

function parseTs(value: unknown): number {
  if (!value) return 0
  if (typeof value === 'string') {
    const t = Date.parse(value)
    return Number.isNaN(t) ? 0 : t
  }
  if (typeof value === 'object' && value !== null) {
    const v = value as { toDate?: () => Date; seconds?: number }
    if (typeof v.toDate === 'function') return v.toDate().getTime()
    if (typeof v.seconds === 'number') return v.seconds * 1000
  }
  return 0
}

function formatDate(value: unknown): string {
  const ts = parseTs(value)
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
