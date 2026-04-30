import { memo, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader, Sparkles, AlertTriangle, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface GeneratorPanelProps<TOut> {
  /** Display label (shown in the header). */
  title: string
  /** One-line description above the run button. */
  description: string
  /** Lucide icon — defaults to Sparkles. */
  icon?: ReactNode
  /** Required plan; if user is below it, the panel renders an upsell instead of the button. */
  requiredPlan?: 'free' | 'phantom' | 'phantom_pro'
  /** Disable the button (e.g. required input missing). */
  disabled?: boolean
  /** Helper text shown when disabled. */
  disabledReason?: string
  /** The actual callable. Must be one of the typed wrappers in src/lib/functions.ts. */
  run: () => Promise<TOut>
  /** Render the result. Receives the output of run(). */
  renderResult: (out: TOut) => ReactNode
  /** Optional CTA label override. */
  cta?: string
}

const PLAN_RANK: Record<'free' | 'phantom' | 'phantom_pro', number> = {
  free: 0,
  phantom: 1,
  phantom_pro: 2,
}

function GeneratorPanelInner<TOut>({
  title,
  description,
  icon,
  requiredPlan = 'free',
  disabled = false,
  disabledReason,
  run,
  renderResult,
  cta = 'Generate',
}: GeneratorPanelProps<TOut>) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TOut | null>(null)

  const userPlan = user?.plan ?? 'free'
  const planLocked = PLAN_RANK[userPlan] < PLAN_RANK[requiredPlan]

  const onRun = async () => {
    setError(null)
    setLoading(true)
    try {
      const out = await run()
      setResult(out)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setError(msg)
      // eslint-disable-next-line no-console
      console.error('[phantom] generator failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card border-phantom-border-subtle hover:border-phantom-lime/30 transition-colors">
      <div className="flex items-start gap-3 mb-4">
        <div className="shrink-0 w-9 h-9 rounded-lg bg-phantom-lime/10 border border-phantom-lime/30 flex items-center justify-center text-phantom-lime">
          {icon ?? <Sparkles size={16} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="label text-phantom-lime">{title}</p>
            {requiredPlan === 'phantom_pro' && (
              <span className="badge text-[9px] bg-phantom-lime/10 text-phantom-lime border border-phantom-lime/30 px-1.5 py-0.5 rounded">PRO</span>
            )}
          </div>
          <p className="font-body text-[13px] text-phantom-text-secondary leading-relaxed">{description}</p>
        </div>
      </div>

      {planLocked ? (
        <div className="flex items-center justify-between gap-3 bg-phantom-black/40 border border-phantom-border-subtle rounded-lg p-3">
          <div className="flex items-center gap-2 text-phantom-text-muted text-[13px]">
            <Lock size={14} />
            <span>Requires {requiredPlan === 'phantom_pro' ? 'PHANTOM PRO' : 'PHANTOM'}.</span>
          </div>
          <a href="/settings" className="btn-secondary text-[12px] py-1.5 px-3">Upgrade</a>
        </div>
      ) : (
        <button
          className="btn-primary w-full justify-center flex items-center gap-2"
          disabled={loading || disabled}
          onClick={onRun}
        >
          {loading ? (
            <>
              <Loader size={14} className="animate-spin" /> Generating...
            </>
          ) : (
            cta
          )}
        </button>
      )}

      {!planLocked && disabled && disabledReason && (
        <p className="font-body text-[12px] text-phantom-text-muted mt-2">{disabledReason}</p>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            className="mt-4 flex items-start gap-2 bg-phantom-danger/10 border border-phantom-danger/30 rounded-lg p-3"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <AlertTriangle size={14} className="text-phantom-danger mt-0.5 shrink-0" />
            <p className="font-body text-[13px] text-phantom-danger">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result !== null && (
          <motion.div
            className="mt-5 pt-5 border-t border-phantom-border-subtle"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderResult(result)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const GeneratorPanel = memo(GeneratorPanelInner) as <TOut>(p: GeneratorPanelProps<TOut>) => JSX.Element

export default GeneratorPanel
