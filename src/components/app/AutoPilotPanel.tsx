import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Loader2, Users, Mail, BarChart3, Sparkles, Copy, Check, ArrowRight,
} from 'lucide-react'
import {
  researchAudience, draftOutreach, analyzeSignals,
  type AudienceProfile, type OutreachVariant, type SignalAnalysis,
} from '@/lib/phantomAI'
import { isAIConfigured } from '@/lib/aiClient'
import { useBrands, type Brand } from '@/contexts/BrandContext'

type Tab = 'audience' | 'outreach' | 'analysis'

interface Props {
  brand: Brand
  onClose: () => void
}

const AutoPilotPanel = memo(({ brand, onClose }: Props) => {
  const { getBrandSignals, updateBrand } = useBrands()
  const [tab, setTab] = useState<Tab>('audience')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [audience, setAudience] = useState<AudienceProfile | null>(null)
  const [outreach, setOutreach] = useState<OutreachVariant[]>([])
  const [analysis, setAnalysis] = useState<SignalAnalysis | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const aiOk = isAIConfigured()

  const run = async (which: Tab) => {
    if (!aiOk) {
      setError('AI not configured. Add VITE_OPENAI_API_KEY to .env.local')
      return
    }
    setError('')
    setLoading(true)
    try {
      if (which === 'audience') {
        const data = await researchAudience(brand)
        setAudience(data)
        updateBrand(brand.id, {
          phase1Data: { ...brand.phase1Data, audienceProfile: data },
        })
      } else if (which === 'outreach') {
        const data = await draftOutreach(brand, 3)
        setOutreach(data)
        updateBrand(brand.id, {
          phase2Data: { ...brand.phase2Data, outreachVariants: data },
        })
      } else if (which === 'analysis') {
        const signals = getBrandSignals(brand.id)
        const data = await analyzeSignals(brand, signals)
        setAnalysis(data)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI request failed')
    } finally {
      setLoading(false)
    }
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-[560px] h-full bg-phantom-surface-dark border-l border-phantom-border overflow-y-auto"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-phantom-surface-dark border-b border-phantom-border-subtle px-6 py-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-phantom-lime" />
              <span className="font-ui text-[10px] uppercase tracking-widest text-phantom-lime">
                AutoPilot
              </span>
            </div>
            <h3 className="font-display font-bold text-[18px] text-phantom-text-primary leading-tight">
              {brand.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-phantom-text-muted hover:text-phantom-text-primary"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-phantom-border-subtle flex gap-1">
          {(
            [
              { id: 'audience', icon: Users, label: 'Audience' },
              { id: 'outreach', icon: Mail, label: 'Outreach' },
              { id: 'analysis', icon: BarChart3, label: 'Analysis' },
            ] as { id: Tab; icon: React.ElementType; label: string }[]
          ).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-ui text-[12px] transition-colors ${
                tab === id
                  ? 'bg-phantom-lime/10 text-phantom-lime border border-phantom-lime/30'
                  : 'text-phantom-text-muted hover:text-phantom-text-primary border border-transparent'
              }`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl border border-phantom-danger/30 bg-phantom-danger/5">
              <p className="font-body text-[12px] text-phantom-danger">{error}</p>
            </div>
          )}

          {tab === 'audience' && (
            <AudienceTab
              audience={audience}
              loading={loading}
              onRun={() => run('audience')}
            />
          )}
          {tab === 'outreach' && (
            <OutreachTab
              variants={outreach}
              loading={loading}
              onRun={() => run('outreach')}
              onCopy={copy}
              copied={copied}
            />
          )}
          {tab === 'analysis' && (
            <AnalysisTab
              analysis={analysis}
              loading={loading}
              onRun={() => run('analysis')}
              signalCount={getBrandSignals(brand.id).length}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  )
})
AutoPilotPanel.displayName = 'AutoPilotPanel'

const RunButton = memo(
  ({ loading, onRun, label }: { loading: boolean; onRun: () => void; label: string }) => (
    <button className="btn-primary w-full" onClick={onRun} disabled={loading}>
      {loading ? (
        <>
          <Loader2 size={14} className="animate-spin" /> Phantom is working…
        </>
      ) : (
        <>
          <Sparkles size={14} /> {label}
        </>
      )}
    </button>
  )
)
RunButton.displayName = 'RunButton'

const AudienceTab = memo(
  ({
    audience,
    loading,
    onRun,
  }: {
    audience: AudienceProfile | null
    loading: boolean
    onRun: () => void
  }) => (
    <div>
      <RunButton
        loading={loading}
        onRun={onRun}
        label={audience ? 'Re-run audience research' : 'Research audience'}
      />
      <AnimatePresence mode="wait">
        {audience && (
          <motion.div
            key="audience"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-5 space-y-4"
          >
            <Block title="Demographics" content={audience.demographics} />
            <Block title="Psychographics" content={audience.psychographics} />
            <ListBlock title="Pain points" items={audience.painPoints} />
            <ListBlock title="Desires" items={audience.desires} />
            <ListBlock title="Objections" items={audience.objections} />
            <ListBlock title="Where they hang out" items={audience.whereTheyHangOut} />
            <ListBlock title="Language they use" items={audience.languageTheyUse} />
            <ListBlock title="What they already buy" items={audience.whatTheyAlreadyBuy} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
)
AudienceTab.displayName = 'AudienceTab'

const OutreachTab = memo(
  ({
    variants,
    loading,
    onRun,
    onCopy,
    copied,
  }: {
    variants: OutreachVariant[]
    loading: boolean
    onRun: () => void
    onCopy: (t: string, k: string) => void
    copied: string | null
  }) => (
    <div>
      <RunButton
        loading={loading}
        onRun={onRun}
        label={variants.length ? 'Re-draft outreach' : 'Draft outreach variants'}
      />
      <AnimatePresence>
        {variants.length > 0 && (
          <motion.div
            key="variants"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 space-y-3"
          >
            {variants.map((v, i) => {
              const fullText = `${v.subjectOrHook}\n\n${v.body}\n\n${v.callToAction}`
              const k = `outreach-${i}`
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="p-4 rounded-2xl border border-phantom-border bg-phantom-surface"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge badge-active text-[9px]">{v.channel}</span>
                    <button
                      onClick={() => onCopy(fullText, k)}
                      className="text-phantom-text-muted hover:text-phantom-lime transition-colors"
                      aria-label="Copy"
                    >
                      {copied === k ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="font-display font-bold text-[14px] text-phantom-text-primary mb-2">
                    {v.subjectOrHook}
                  </p>
                  <p className="font-body text-[13px] text-phantom-text-secondary leading-relaxed mb-3 whitespace-pre-line">
                    {v.body}
                  </p>
                  <p className="font-body text-[12px] text-phantom-lime mb-3">→ {v.callToAction}</p>
                  <p className="font-body text-[11px] text-phantom-text-muted italic border-t border-phantom-border-subtle pt-2">
                    Why this works: {v.rationale}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
)
OutreachTab.displayName = 'OutreachTab'

const AnalysisTab = memo(
  ({
    analysis,
    loading,
    onRun,
    signalCount,
  }: {
    analysis: SignalAnalysis | null
    loading: boolean
    onRun: () => void
    signalCount: number
  }) => (
    <div>
      <p className="font-body text-[12px] text-phantom-text-muted mb-3">
        Analyzing {signalCount} signal{signalCount === 1 ? '' : 's'} for this brand.
      </p>
      <RunButton
        loading={loading}
        onRun={onRun}
        label={analysis ? 'Re-analyze signals' : 'Analyze signals'}
      />
      <AnimatePresence>
        {analysis && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 space-y-4"
          >
            <ListBlock title="Patterns detected" items={analysis.patternsDetected} />
            <Block title="Conversion insight" content={analysis.conversionInsight} />
            {analysis.objectionThemes.length > 0 && (
              <ListBlock title="Objection themes" items={analysis.objectionThemes} />
            )}
            <div className="p-4 rounded-2xl bg-phantom-lime/5 border border-phantom-lime/30">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight size={14} className="text-phantom-lime" />
                <span className="font-ui text-[10px] uppercase tracking-widest text-phantom-lime">
                  Recommended next iteration
                </span>
              </div>
              <p className="font-body text-[14px] text-phantom-text-primary leading-relaxed">
                {analysis.recommendedIteration}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1 bg-phantom-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-phantom-lime"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.confidence * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <span className="font-code text-[11px] text-phantom-text-muted">
                  {Math.round(analysis.confidence * 100)}% confidence
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
)
AnalysisTab.displayName = 'AnalysisTab'

const Block = memo(({ title, content }: { title: string; content: string }) => (
  <div>
    <p className="font-ui text-[10px] uppercase tracking-widest text-phantom-text-muted mb-1.5">
      {title}
    </p>
    <p className="font-body text-[13px] text-phantom-text-primary leading-relaxed">{content}</p>
  </div>
))
Block.displayName = 'Block'

const ListBlock = memo(({ title, items }: { title: string; items: string[] }) => (
  <div>
    <p className="font-ui text-[10px] uppercase tracking-widest text-phantom-text-muted mb-1.5">
      {title}
    </p>
    <ul className="space-y-1">
      {items.map((it, i) => (
        <li
          key={i}
          className="font-body text-[13px] text-phantom-text-primary leading-relaxed flex gap-2"
        >
          <span className="text-phantom-lime shrink-0">·</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  </div>
))
ListBlock.displayName = 'ListBlock'

export default AutoPilotPanel
