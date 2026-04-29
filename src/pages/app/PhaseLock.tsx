import { memo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Trash2, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBrands, type ProofType } from '@/contexts/BrandContext'

/* ─── Proof item forms ─── */
interface ResultForm { metric: string; context: string; date: string }
interface TestimonialForm { quote: string; attribution: string; dateCollected: string }
interface CaseStudyForm { beforeState: string; whatWasDone: string; afterState: string; timeline: string }

const LOCK_ITEMS = [
  'The offer has converted consistently across a minimum of 5 unrelated buyers from different channels',
  'The positioning can be stated in one sentence and understood by someone who has never heard of you',
  'You have a minimum of 3 pieces of proof that a skeptical stranger would find credible',
  'Your objection list has been reduced to predictable objections with prepared responses',
  'The brand identity reflects the validated positioning, not the aspirational one',
  'You can describe who this is NOT for as specifically as who it IS for',
]

const PhaseLock = memo(() => {
  const { id } = useParams()
  const { getBrand, updateBrand, getBrandProof, addProofItem, deleteProofItem } = useBrands()
  const brand = getBrand(id!)
  const proof = getBrandProof(id!)

  const p4 = (brand?.phase4Data ?? {}) as Record<string, unknown>

  /* Positioning Lock */
  const [buyerProblem, setBuyerProblem] = useState((p4.buyerProblem as string) ?? '')
  const [buyerOutcome, setBuyerOutcome] = useState((p4.buyerOutcome as string) ?? '')
  const [buyerFailed, setBuyerFailed] = useState((p4.buyerFailed as string) ?? '')

  /* Brand Identity */
  const [finalName, setFinalName] = useState((p4.finalName as string) ?? '')
  const [finalPositioning, setFinalPositioning] = useState((p4.finalPositioning as string) ?? '')
  const [voiceTone, setVoiceTone] = useState((p4.voiceTone as string) ?? '')
  const [primaryAudience, setPrimaryAudience] = useState((p4.primaryAudience as string) ?? '')
  const [antiPositioning, setAntiPositioning] = useState((p4.antiPositioning as string) ?? '')

  /* Proof forms */
  const [showResultForm, setShowResultForm] = useState(false)
  const [resultForm, setResultForm] = useState<ResultForm>({ metric: '', context: '', date: '' })

  const [showTestimonialForm, setShowTestimonialForm] = useState(false)
  const [testimonialForm, setTestimonialForm] = useState<TestimonialForm>({
    quote: '', attribution: '', dateCollected: '',
  })

  const [showCaseStudyForm, setShowCaseStudyForm] = useState(false)
  const [caseStudyForm, setCaseStudyForm] = useState<CaseStudyForm>({
    beforeState: '', whatWasDone: '', afterState: '', timeline: '',
  })

  /* Lock-in checklist — manual */
  const stored = (p4.checklist as boolean[]) ?? Array(6).fill(false)
  const [checklist, setChecklist] = useState<boolean[]>(stored)

  const toggleCheck = (i: number) => {
    const next = [...checklist]
    next[i] = !next[i]
    setChecklist(next)
    updateBrand(id!, { phase4Data: { ...p4, checklist: next } })
  }

  const allChecked = checklist.every(Boolean)

  /* Save positioning + brand identity */
  const savePositioning = () => {
    updateBrand(id!, {
      phase4Data: { ...p4, buyerProblem, buyerOutcome, buyerFailed },
    })
  }

  const saveBrandIdentity = () => {
    updateBrand(id!, {
      phase4Data: { ...p4, finalName, finalPositioning, voiceTone, primaryAudience, antiPositioning },
    })
  }

  /* Add proof items */
  const addResult = () => {
    if (!resultForm.metric.trim()) return
    addProofItem({
      brandId: id!,
      type: 'result',
      content: { ...resultForm },
      phaseCollected: 'lock',
    })
    setResultForm({ metric: '', context: '', date: '' })
    setShowResultForm(false)
  }

  const addTestimonial = () => {
    if (!testimonialForm.quote.trim()) return
    addProofItem({
      brandId: id!,
      type: 'testimonial',
      content: { ...testimonialForm },
      phaseCollected: 'lock',
    })
    setTestimonialForm({ quote: '', attribution: '', dateCollected: '' })
    setShowTestimonialForm(false)
  }

  const addCaseStudy = () => {
    if (!caseStudyForm.beforeState.trim()) return
    addProofItem({
      brandId: id!,
      type: 'case_study',
      content: { ...caseStudyForm },
      phaseCollected: 'lock',
    })
    setCaseStudyForm({ beforeState: '', whatWasDone: '', afterState: '', timeline: '' })
    setShowCaseStudyForm(false)
  }

  const proofByType = (t: ProofType) => proof.filter(p => p.type === t)

  const exportBrandKit = () => {
    const data = {
      brand: brand?.name,
      positioning: {
        before: buyerProblem,
        after: buyerOutcome,
        differentiation: buyerFailed,
      },
      identity: {
        finalName,
        finalPositioning,
        voiceTone,
        primaryAudience,
        antiPositioning,
      },
      proof: {
        results: proofByType('result').map(p => p.content),
        testimonials: proofByType('testimonial').map(p => p.content),
        caseStudies: proofByType('case_study').map(p => p.content),
      },
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${brand?.name ?? 'brand'}-kit.json`
    a.click()
    URL.revokeObjectURL(url)
    updateBrand(id!, { currentPhase: 'complete' })
  }

  if (!brand) return null

  return (
    <motion.div
      className="max-w-3xl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="mb-8">
        <p className="label text-phantom-lime mb-2">Phase 04 — Lock In</p>
        <h1 className="font-display font-bold text-[32px] text-phantom-text-primary mb-3">
          Build the brand. For real this time.
        </h1>
        <p className="font-body text-[16px] text-phantom-text-secondary">
          The offer works. The messaging is validated. Now the brand identity earns the right to exist.
        </p>
      </div>

      {/* Section 1 — Positioning Lock */}
      <div className="card mb-6">
        <p className="label mb-2">Lock Your Positioning From Data</p>
        <p className="font-body text-[13px] text-phantom-text-muted mb-5">
          This comes from your buyers. Not from what you hoped they would say.
        </p>

        <div className="space-y-4 mb-5">
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">
              How did buyers describe the problem when they first came to you?
            </label>
            <p className="font-body text-[11px] text-phantom-text-muted mb-2">Use their exact words</p>
            <textarea
              className="input"
              rows={2}
              value={buyerProblem}
              onChange={e => setBuyerProblem(e.target.value)}
              placeholder='"I was spending 10 hours a week on X and still not seeing Y..."'
            />
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">
              How did buyers describe the outcome they received?
            </label>
            <p className="font-body text-[11px] text-phantom-text-muted mb-2">Use their exact words</p>
            <textarea
              className="input"
              rows={2}
              value={buyerOutcome}
              onChange={e => setBuyerOutcome(e.target.value)}
              placeholder='"Now I can X in Y time and my Z has doubled..."'
            />
          </div>
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">
              What had they tried before that didn't work?
            </label>
            <textarea
              className="input"
              rows={2}
              value={buyerFailed}
              onChange={e => setBuyerFailed(e.target.value)}
              placeholder="The alternatives that failed them before finding you"
            />
          </div>
        </div>

        {(buyerProblem || buyerOutcome || buyerFailed) && (
          <div className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-4 mb-5 space-y-3">
            {buyerProblem && (
              <div>
                <p className="label text-phantom-text-muted text-[10px] mb-1">BEFORE</p>
                <p className="font-body text-[13px] text-phantom-text-primary">{buyerProblem}</p>
              </div>
            )}
            {buyerOutcome && (
              <div>
                <p className="label text-phantom-lime text-[10px] mb-1">AFTER</p>
                <p className="font-body text-[13px] text-phantom-text-primary">{buyerOutcome}</p>
              </div>
            )}
            {buyerFailed && (
              <div>
                <p className="label text-phantom-text-muted text-[10px] mb-1">DIFFERENTIATION</p>
                <p className="font-body text-[13px] text-phantom-text-primary">{buyerFailed}</p>
              </div>
            )}
            <p className="font-body text-[11px] text-phantom-lime mt-2">This is your positioning. Use it verbatim.</p>
          </div>
        )}

        <button className="btn-secondary" onClick={savePositioning}>Save positioning</button>
      </div>

      {/* Section 2 — Brand Identity Builder */}
      <div className="card mb-6">
        <p className="label mb-2">Build the Real Brand</p>
        <p className="font-body text-[13px] text-phantom-text-muted mb-5">
          Now the name matters. Now the visual identity matters. Because now you know what you are building and for whom.
        </p>

        <div className="space-y-4 mb-5">
          {[
            { label: 'Final brand name', val: finalName, set: setFinalName, ph: 'The name this will go to market as' },
            { label: 'Final one-sentence positioning', val: finalPositioning, set: setFinalPositioning, ph: 'What it is, who it is for, what it produces' },
            { label: 'What this brand is NOT for (anti-positioning)', val: antiPositioning, set: setAntiPositioning, ph: 'Describe specifically who this is not for' },
            { label: 'Primary audience (from validated data)', val: primaryAudience, set: setPrimaryAudience, ph: 'Based on who actually bought, not who you imagined would' },
          ].map(({ label, val, set, ph }) => (
            <div key={label}>
              <label className="label text-phantom-text-secondary mb-2 block">{label}</label>
              <input className="input" value={val} onChange={e => set(e.target.value)} placeholder={ph} />
            </div>
          ))}
          <div>
            <label className="label text-phantom-text-secondary mb-2 block">Voice and tone</label>
            <textarea
              className="input"
              rows={2}
              value={voiceTone}
              onChange={e => setVoiceTone(e.target.value)}
              placeholder="How the brand communicates — the personality in the writing"
            />
          </div>
        </div>

        <button className="btn-secondary" onClick={saveBrandIdentity}>Save brand identity</button>
      </div>

      {/* Section 3 — Proof Package */}
      <div className="card mb-6">
        <p className="label mb-2">Proof Package</p>
        <p className="font-body text-[13px] text-phantom-text-muted mb-6">Assemble before going public.</p>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-body text-[14px] text-phantom-text-primary">Results</p>
            <button className="btn-ghost text-[12px] py-1 px-2 gap-1" onClick={() => setShowResultForm(v => !v)}>
              <Plus size={12} /> Add result
            </button>
          </div>

          <AnimatePresence>
            {showResultForm && (
              <motion.div
                className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-4 mb-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="space-y-3">
                  <input className="input text-[13px] py-2" value={resultForm.metric} onChange={e => setResultForm(f => ({ ...f, metric: e.target.value }))} placeholder="The metric (e.g. 3x revenue increase, 40% time saved)" />
                  <input className="input text-[13px] py-2" value={resultForm.context} onChange={e => setResultForm(f => ({ ...f, context: e.target.value }))} placeholder="Context (who, what situation)" />
                  <input className="input text-[13px] py-2" value={resultForm.date} onChange={e => setResultForm(f => ({ ...f, date: e.target.value }))} placeholder="Date" />
                  <div className="flex gap-2">
                    <button className="btn-primary text-[13px] py-2" onClick={addResult} disabled={!resultForm.metric.trim()}>Save result</button>
                    <button className="btn-ghost text-[13px]" onClick={() => setShowResultForm(false)}>Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            {proofByType('result').map(item => (
              <div key={item.id} className="flex items-start gap-3 bg-[#0d0d0d] border border-phantom-border-subtle rounded p-3">
                <div className="flex-1">
                  <p className="font-code font-bold text-[15px] text-phantom-lime">{item.content.metric}</p>
                  {item.content.context && <p className="font-body text-[12px] text-phantom-text-muted mt-0.5">{item.content.context}</p>}
                </div>
                <button onClick={() => deleteProofItem(item.id)} className="text-phantom-text-muted hover:text-phantom-danger transition-colors shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-body text-[14px] text-phantom-text-primary">Testimonials</p>
            <button className="btn-ghost text-[12px] py-1 px-2 gap-1" onClick={() => setShowTestimonialForm(v => !v)}>
              <Plus size={12} /> Add testimonial
            </button>
          </div>

          <AnimatePresence>
            {showTestimonialForm && (
              <motion.div
                className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-4 mb-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="space-y-3">
                  <textarea className="input text-[13px] py-2 min-h-[80px]" value={testimonialForm.quote} onChange={e => setTestimonialForm(f => ({ ...f, quote: e.target.value }))} placeholder="Quote in their exact words" />
                  <input className="input text-[13px] py-2" value={testimonialForm.attribution} onChange={e => setTestimonialForm(f => ({ ...f, attribution: e.target.value }))} placeholder="Attribution (name, title, company)" />
                  <input className="input text-[13px] py-2" value={testimonialForm.dateCollected} onChange={e => setTestimonialForm(f => ({ ...f, dateCollected: e.target.value }))} placeholder="Date collected" />
                  <div className="flex gap-2">
                    <button className="btn-primary text-[13px] py-2" onClick={addTestimonial} disabled={!testimonialForm.quote.trim()}>Save testimonial</button>
                    <button className="btn-ghost text-[13px]" onClick={() => setShowTestimonialForm(false)}>Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {proofByType('testimonial').map(item => (
              <div key={item.id} className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-4 relative">
                <p className="font-display text-[32px] text-phantom-lime opacity-30 leading-none mb-2">"</p>
                <p className="font-body text-[14px] text-phantom-text-primary leading-relaxed mb-3">{item.content.quote}</p>
                <p className="font-ui text-[11px] text-phantom-text-muted uppercase tracking-wider">{item.content.attribution}</p>
                <button
                  onClick={() => deleteProofItem(item.id)}
                  className="absolute top-3 right-3 text-phantom-text-muted hover:text-phantom-danger transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Case Studies */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-body text-[14px] text-phantom-text-primary">Case Studies</p>
            <button className="btn-ghost text-[12px] py-1 px-2 gap-1" onClick={() => setShowCaseStudyForm(v => !v)}>
              <Plus size={12} /> Add case study
            </button>
          </div>

          <AnimatePresence>
            {showCaseStudyForm && (
              <motion.div
                className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-4 mb-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="space-y-3">
                  <textarea className="input text-[13px] py-2 min-h-[60px]" value={caseStudyForm.beforeState} onChange={e => setCaseStudyForm(f => ({ ...f, beforeState: e.target.value }))} placeholder="Before state — what was their situation" />
                  <textarea className="input text-[13px] py-2 min-h-[60px]" value={caseStudyForm.whatWasDone} onChange={e => setCaseStudyForm(f => ({ ...f, whatWasDone: e.target.value }))} placeholder="What was done — what you worked on together" />
                  <textarea className="input text-[13px] py-2 min-h-[60px]" value={caseStudyForm.afterState} onChange={e => setCaseStudyForm(f => ({ ...f, afterState: e.target.value }))} placeholder="After state — specific measurable result" />
                  <input className="input text-[13px] py-2" value={caseStudyForm.timeline} onChange={e => setCaseStudyForm(f => ({ ...f, timeline: e.target.value }))} placeholder="Timeline (e.g. 6 weeks, 3 months)" />
                  <div className="flex gap-2">
                    <button className="btn-primary text-[13px] py-2" onClick={addCaseStudy} disabled={!caseStudyForm.beforeState.trim()}>Save case study</button>
                    <button className="btn-ghost text-[13px]" onClick={() => setShowCaseStudyForm(false)}>Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {proofByType('case_study').map(item => (
              <div key={item.id} className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-4 relative">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-body text-[10px] text-phantom-text-muted uppercase tracking-wider mb-1">Before</p>
                    <p className="font-body text-[13px] text-phantom-text-secondary">{item.content.beforeState}</p>
                  </div>
                  <div>
                    <p className="font-body text-[10px] text-phantom-lime uppercase tracking-wider mb-1">After</p>
                    <p className="font-body text-[13px] text-phantom-text-primary">{item.content.afterState}</p>
                  </div>
                </div>
                {item.content.timeline && (
                  <p className="font-body text-[11px] text-phantom-text-muted mt-2">Timeline: {item.content.timeline}</p>
                )}
                <button
                  onClick={() => deleteProofItem(item.id)}
                  className="absolute top-3 right-3 text-phantom-text-muted hover:text-phantom-danger transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4 — Lock-In Checklist */}
      <div className={`card transition-all duration-500 ${allChecked ? 'border-phantom-lime' : 'border-phantom-border'}`}>
        <p className="label text-phantom-lime mb-2">The Lock-In Checklist</p>
        <p className="font-body text-[13px] text-phantom-text-muted mb-6">
          Every item must be checked before this brand goes public. This is a hard gate.
        </p>

        <div className="space-y-3 mb-5">
          {LOCK_ITEMS.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 cursor-pointer group"
              onClick={() => toggleCheck(i)}
            >
              <div
                className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  checklist[i]
                    ? 'bg-phantom-lime border-phantom-lime'
                    : 'border-phantom-border group-hover:border-[#444]'
                }`}
              >
                {checklist[i] && (
                  <span className="text-phantom-black text-[11px] font-bold">✓</span>
                )}
              </div>
              <span
                className={`font-body text-[14px] leading-snug transition-colors duration-150 ${
                  checklist[i] ? 'text-phantom-text-primary' : 'text-phantom-text-muted'
                }`}
              >
                {item}
              </span>
            </div>
          ))}
        </div>

        <p className="font-body text-[13px] text-phantom-text-muted mb-5">
          {checklist.filter(Boolean).length} of {LOCK_ITEMS.length} complete
        </p>

        <AnimatePresence>
          {allChecked && (
            <motion.div
              className="bg-[#0a1900] border border-phantom-lime rounded p-5 mb-5 text-center"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <p className="label text-phantom-lime mb-1">Phantom Phase Complete</p>
              <p className="font-body text-[14px] text-phantom-text-secondary">
                You built it invisible. Now launch it inevitable.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          className="btn-primary w-full gap-2"
          disabled={!allChecked}
          onClick={exportBrandKit}
          title={!allChecked ? 'Complete all checklist items before going public' : ''}
        >
          <Download size={15} />
          Export brand kit + go public
        </button>

        {!allChecked && (
          <p className="font-body text-[12px] text-phantom-text-muted text-center mt-2">
            Complete all checklist items before going public.
          </p>
        )}
      </div>
    </motion.div>
  )
})

PhaseLock.displayName = 'PhaseLock'
export default PhaseLock
