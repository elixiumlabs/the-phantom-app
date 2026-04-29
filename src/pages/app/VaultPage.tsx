import { memo, useState } from 'react'
import { Plus, Trash2, TrendingUp, MessageSquare, FileText, Camera, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useBrands, type ProofType } from '@/contexts/BrandContext'
import AppSidebar from '@/components/app/AppSidebar'

const TYPE_LABELS: Record<ProofType, string> = {
  result:      'Result',
  testimonial: 'Testimonial',
  case_study:  'Case Study',
  screenshot:  'Screenshot',
}

const TYPE_BADGE: Record<ProofType, string> = {
  result:      'badge badge-active',
  testimonial: 'badge',
  case_study:  'badge',
  screenshot:  'badge',
}

type AddForm =
  | { type: 'result';      brandId: string; metric: string; context: string; date: string }
  | { type: 'testimonial'; brandId: string; quote: string; attribution: string; dateCollected: string }
  | { type: 'case_study';  brandId: string; beforeState: string; whatWasDone: string; afterState: string; timeline: string }
  | { type: 'screenshot';  brandId: string; title: string; notes: string }

const VaultPage = memo(() => {
  const { user } = useAuth()
  const { brands, proofItems, addProofItem, deleteProofItem } = useBrands()

  const userBrands = brands.filter(b => b.userId === user?.id)
  const allProof   = proofItems.filter(p => userBrands.some(b => b.id === p.brandId))

  const [typeFilter,  setTypeFilter]  = useState<ProofType | 'all'>('all')
  const [brandFilter, setBrandFilter] = useState<string>('all')
  const [sortBy,      setSortBy]      = useState<'newest' | 'oldest'>('newest')
  const [showForm,    setShowForm]    = useState(false)
  const [formType,    setFormType]    = useState<ProofType>('testimonial')
  const [brandId,     setBrandId]     = useState(userBrands[0]?.id ?? '')

  // Per-type form state
  const [resultForm,      setResultForm]      = useState({ metric: '', context: '', date: '' })
  const [testimonialForm, setTestimonialForm] = useState({ quote: '', attribution: '', dateCollected: '' })
  const [caseForm,        setCaseForm]        = useState({ beforeState: '', whatWasDone: '', afterState: '', timeline: '' })
  const [screenshotForm,  setScreenshotForm]  = useState({ title: '', notes: '' })

  const filtered = allProof
    .filter(p => typeFilter === 'all' || p.type === typeFilter)
    .filter(p => brandFilter === 'all' || p.brandId === brandFilter)
    .sort((a, b) =>
      sortBy === 'newest'
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

  const getBrandName = (id: string) => userBrands.find(b => b.id === id)?.name ?? 'Unknown brand'

  const resetForms = () => {
    setResultForm({ metric: '', context: '', date: '' })
    setTestimonialForm({ quote: '', attribution: '', dateCollected: '' })
    setCaseForm({ beforeState: '', whatWasDone: '', afterState: '', timeline: '' })
    setScreenshotForm({ title: '', notes: '' })
  }

  const canSubmit = () => {
    if (!brandId) return false
    if (formType === 'result')      return resultForm.metric.trim().length > 0
    if (formType === 'testimonial') return testimonialForm.quote.trim().length > 0
    if (formType === 'case_study')  return caseForm.beforeState.trim().length > 0
    if (formType === 'screenshot')  return screenshotForm.title.trim().length > 0
    return false
  }

  const submit = () => {
    if (!canSubmit()) return
    let content: Record<string, string> = {}
    if (formType === 'result')      content = { ...resultForm }
    if (formType === 'testimonial') content = { ...testimonialForm }
    if (formType === 'case_study')  content = { ...caseForm }
    if (formType === 'screenshot')  content = { ...screenshotForm }

    addProofItem({ brandId, type: formType, content, phaseCollected: 'lock' })
    resetForms()
    setShowForm(false)
  }

  const counts = {
    result:      allProof.filter(p => p.type === 'result').length,
    testimonial: allProof.filter(p => p.type === 'testimonial').length,
    case_study:  allProof.filter(p => p.type === 'case_study').length,
    screenshot:  allProof.filter(p => p.type === 'screenshot').length,
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
            <button className="btn-primary" onClick={() => { setShowForm(v => !v); resetForms() }}>
              <Plus size={16} /> Add proof
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total proof items', val: allProof.length,        icon: TrendingUp    },
              { label: 'Results',           val: counts.result,           icon: TrendingUp    },
              { label: 'Testimonials',      val: counts.testimonial,      icon: MessageSquare },
              { label: 'Case studies',      val: counts.case_study,       icon: FileText      },
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

                {/* Type + Brand row */}
                <div className="grid md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="label text-phantom-text-secondary mb-2 block">Proof type</label>
                    <select className="input" value={formType} onChange={e => { setFormType(e.target.value as ProofType); resetForms() }}>
                      <option value="testimonial">Testimonial</option>
                      <option value="result">Result</option>
                      <option value="case_study">Case Study</option>
                      <option value="screenshot">Screenshot</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-phantom-text-secondary mb-2 block">Brand</label>
                    <select className="input" value={brandId} onChange={e => setBrandId(e.target.value)}>
                      {userBrands.length === 0
                        ? <option value="">Create a brand first</option>
                        : userBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)
                      }
                    </select>
                  </div>
                </div>

                {/* Result fields */}
                {formType === 'result' && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">The metric (specific and measurable)</label>
                      <input className="input" value={resultForm.metric} onChange={e => setResultForm(f => ({ ...f, metric: e.target.value }))} placeholder="e.g. 3x revenue increase in 30 days, 40% time saved per week" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Context</label>
                      <input className="input" value={resultForm.context} onChange={e => setResultForm(f => ({ ...f, context: e.target.value }))} placeholder="Who achieved this result and in what situation" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Date</label>
                      <input className="input" type="date" value={resultForm.date} onChange={e => setResultForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                  </div>
                )}

                {/* Testimonial fields */}
                {formType === 'testimonial' && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Quote — their exact words</label>
                      <textarea className="input" rows={3} value={testimonialForm.quote} onChange={e => setTestimonialForm(f => ({ ...f, quote: e.target.value }))} placeholder='"I went from X to Y in Z timeframe. The specific thing that made the difference was..."' />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Attribution</label>
                      <input className="input" value={testimonialForm.attribution} onChange={e => setTestimonialForm(f => ({ ...f, attribution: e.target.value }))} placeholder="Name, title, or role — no last names required" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Date collected</label>
                      <input className="input" type="date" value={testimonialForm.dateCollected} onChange={e => setTestimonialForm(f => ({ ...f, dateCollected: e.target.value }))} />
                    </div>
                  </div>
                )}

                {/* Case Study fields */}
                {formType === 'case_study' && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Before — what was their situation</label>
                      <textarea className="input" rows={2} value={caseForm.beforeState} onChange={e => setCaseForm(f => ({ ...f, beforeState: e.target.value }))} placeholder="The specific problem, pain, or situation they were in" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">What was done</label>
                      <textarea className="input" rows={2} value={caseForm.whatWasDone} onChange={e => setCaseForm(f => ({ ...f, whatWasDone: e.target.value }))} placeholder="What you worked on or delivered together" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">After — specific measurable result</label>
                      <textarea className="input" rows={2} value={caseForm.afterState} onChange={e => setCaseForm(f => ({ ...f, afterState: e.target.value }))} placeholder="The outcome. Use numbers wherever possible." />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Timeline</label>
                      <input className="input" value={caseForm.timeline} onChange={e => setCaseForm(f => ({ ...f, timeline: e.target.value }))} placeholder="e.g. 6 weeks, 3 months" />
                    </div>
                  </div>
                )}

                {/* Screenshot fields */}
                {formType === 'screenshot' && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">What this screenshot shows</label>
                      <input className="input" value={screenshotForm.title} onChange={e => setScreenshotForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Stripe dashboard showing $4,200 in week 1" />
                    </div>
                    <div>
                      <label className="label text-phantom-text-secondary mb-2 block">Notes</label>
                      <textarea className="input" rows={2} value={screenshotForm.notes} onChange={e => setScreenshotForm(f => ({ ...f, notes: e.target.value }))} placeholder="Context, date, what it proves" />
                    </div>
                    <div className="bg-[#0d0d0d] border border-phantom-border-subtle rounded-xl p-4">
                      <p className="font-body text-[13px] text-phantom-text-muted">
                        File upload coming in the next version. Document the screenshot here and store the file externally for now.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button className="btn-primary" onClick={submit} disabled={!canSubmit()}>
                    Save to vault
                  </button>
                  <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters + Sort */}
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={14} className="text-phantom-text-muted shrink-0" />
              {(['all', 'result', 'testimonial', 'case_study', 'screenshot'] as const).map(t => (
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
                    <span className="ml-1.5 opacity-50">{counts[t]}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {userBrands.length > 1 && (
                <select className="input text-[13px] py-1.5 w-auto min-w-[140px]" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
                  <option value="all">All brands</option>
                  {userBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              )}
              <select className="input text-[13px] py-1.5 w-auto" value={sortBy} onChange={e => setSortBy(e.target.value as 'newest' | 'oldest')}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          {/* Empty state */}
          {filtered.length === 0 ? (
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
              <button className="btn-primary mx-auto" onClick={() => setShowForm(true)}>
                <Plus size={14} /> Add proof
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(item => (
                <motion.div
                  key={item.id}
                  className="card card-interactive group relative"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Delete */}
                  <button
                    onClick={() => deleteProofItem(item.id)}
                    className="absolute top-4 right-4 text-phantom-text-muted hover:text-phantom-danger transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Delete"
                  >
                    <Trash2 size={13} />
                  </button>

                  {/* Type badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={TYPE_BADGE[item.type]}>{TYPE_LABELS[item.type]}</span>
                    <span className="font-body text-[11px] text-phantom-text-muted">{getBrandName(item.brandId)}</span>
                  </div>

                  {/* Result */}
                  {item.type === 'result' && (
                    <>
                      <p className="font-code font-bold text-[18px] text-phantom-lime leading-tight mb-2">{item.content.metric}</p>
                      {item.content.context && <p className="font-body text-[13px] text-phantom-text-secondary">{item.content.context}</p>}
                    </>
                  )}

                  {/* Testimonial */}
                  {item.type === 'testimonial' && (
                    <>
                      <p className="font-display text-[28px] text-phantom-lime opacity-30 leading-none mb-1">"</p>
                      <p className="font-body text-[14px] text-phantom-text-primary leading-relaxed mb-3 line-clamp-4">{item.content.quote}</p>
                      {item.content.attribution && (
                        <p className="font-ui text-[11px] text-phantom-text-muted uppercase tracking-wider">— {item.content.attribution}</p>
                      )}
                    </>
                  )}

                  {/* Case Study */}
                  {item.type === 'case_study' && (
                    <div className="space-y-3">
                      {item.content.beforeState && (
                        <div>
                          <p className="font-body text-[10px] text-phantom-text-muted uppercase tracking-wider mb-1">Before</p>
                          <p className="font-body text-[13px] text-phantom-text-secondary line-clamp-2">{item.content.beforeState}</p>
                        </div>
                      )}
                      {item.content.afterState && (
                        <div>
                          <p className="font-body text-[10px] text-phantom-lime uppercase tracking-wider mb-1">After</p>
                          <p className="font-body text-[13px] text-phantom-text-primary line-clamp-2">{item.content.afterState}</p>
                        </div>
                      )}
                      {item.content.timeline && (
                        <p className="font-body text-[11px] text-phantom-text-muted">Timeline: {item.content.timeline}</p>
                      )}
                    </div>
                  )}

                  {/* Screenshot */}
                  {item.type === 'screenshot' && (
                    <>
                      <div className="flex items-center justify-center w-full h-24 bg-[#0d0d0d] border border-phantom-border-subtle rounded-xl mb-3">
                        <Camera size={20} className="text-phantom-text-muted" />
                      </div>
                      <p className="font-body text-[14px] text-phantom-text-primary mb-1">{item.content.title}</p>
                      {item.content.notes && <p className="font-body text-[12px] text-phantom-text-muted line-clamp-2">{item.content.notes}</p>}
                    </>
                  )}

                  {/* Date */}
                  <p className="font-body text-[11px] text-phantom-text-muted mt-4 pt-3 border-t border-phantom-border-subtle">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
