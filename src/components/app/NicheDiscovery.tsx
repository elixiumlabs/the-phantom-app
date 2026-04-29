import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Loader2, ArrowRight, Target, Users, TrendingUp, Zap } from 'lucide-react'
import { discoverNiches, type NicheOpportunity } from '@/lib/phantomAI'
import { isAIConfigured } from '@/lib/aiClient'
import { useAuth } from '@/contexts/AuthContext'
import { useBrands } from '@/contexts/BrandContext'

interface Props {
  open: boolean
  onClose: () => void
}

const NicheDiscovery = memo(({ open, onClose }: Props) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createBrand } = useBrands()
  const [seed, setSeed] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<NicheOpportunity[]>([])

  const aiOk = isAIConfigured()

  const run = async () => {
    if (!seed.trim()) return
    setError('')
    setLoading(true)
    setResults([])
    try {
      const opps = await discoverNiches(seed.trim(), 6)
      setResults(opps)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Discovery failed')
    } finally {
      setLoading(false)
    }
  }

  const spawnBrand = (opp: NicheOpportunity) => {
    if (!user) return
    const b = createBrand(user.id, opp.niche, opp.problem, opp.audience)
    onClose()
    navigate(`/brand/${b.id}/identify`)
  }

  if (!open) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-3xl mt-12 mb-12"
        initial={{ scale: 0.96, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 16, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-phantom-text-muted hover:text-phantom-text-primary transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-phantom-lime/10 border border-phantom-lime/30 flex items-center justify-center">
              <Sparkles size={18} className="text-phantom-lime" />
            </div>
            <div>
              <h2 className="font-display font-bold text-[22px] text-phantom-text-primary leading-tight">
                Niche Discovery
              </h2>
              <p className="font-body text-[13px] text-phantom-text-secondary">
                Phantom scans for faceless brand opportunities you can validate in 30 days.
              </p>
            </div>
          </div>

          {!aiOk && (
            <div className="mt-4 p-3 rounded-xl border border-phantom-warning/30 bg-phantom-warning/5">
              <p className="font-body text-[13px] text-phantom-warning">
                AI is not configured. Add VITE_OPENAI_API_KEY to .env.local to enable Phantom intelligence.
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <input
              className="input flex-1"
              placeholder="What domain, skill, or interest are you exploring? (e.g. 'sleep optimization for shift workers')"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && run()}
              autoFocus
            />
            <button
              className="btn-primary whitespace-nowrap"
              onClick={run}
              disabled={loading || !seed.trim() || !aiOk}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Scanning…
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Discover
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="mt-3 font-body text-[13px] text-phantom-danger">{error}</p>
          )}

          <AnimatePresence mode="popLayout">
            {loading && (
              <motion.div
                key="skeleton"
                className="mt-6 grid gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-24 rounded-2xl border border-phantom-border-subtle relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(90deg, transparent, rgba(137,243,54,0.06), transparent)',
                      }}
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
                    />
                  </div>
                ))}
              </motion.div>
            )}

            {!loading && results.length > 0 && (
              <motion.div
                key="results"
                className="mt-6 space-y-3"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.06 } } }}
              >
                {results.map((opp, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="card-interactive p-5 rounded-2xl border border-phantom-border bg-phantom-surface"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-[16px] text-phantom-text-primary leading-snug mb-1">
                          {opp.niche}
                        </h3>
                        <p className="font-body text-[13px] text-phantom-text-secondary leading-relaxed">
                          {opp.problem}
                        </p>
                      </div>
                      <ScoreRing score={opp.score} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      <Pill icon={Users} label="Audience" value={opp.audience} />
                      <Pill icon={Zap} label="Angle" value={opp.unfairAngle} />
                      <Pill icon={Target} label="Market" value={opp.marketSize} />
                      <Pill icon={TrendingUp} label="Compete" value={opp.competitionLevel} />
                    </div>

                    <p className="font-body text-[12px] text-phantom-text-muted leading-relaxed mb-3">
                      <span className="text-phantom-lime">→</span> {opp.monetizationPath}
                    </p>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-phantom-border-subtle">
                      <p className="font-body text-[11px] text-phantom-text-muted italic flex-1 line-clamp-2">
                        {opp.reasoning}
                      </p>
                      <button
                        className="btn-primary whitespace-nowrap text-[12px] py-2 px-3"
                        onClick={() => spawnBrand(opp)}
                      >
                        Spawn brand <ArrowRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
})
NicheDiscovery.displayName = 'NicheDiscovery'

const ScoreRing = memo(({ score }: { score: number }) => {
  const size = 56
  const stroke = 4
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const color = score >= 80 ? '#89F336' : score >= 60 ? '#a3e635' : score >= 40 ? '#f5c518' : '#ff4444'
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1a1a1a" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (score / 100) * c }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-code text-[14px] font-bold" style={{ color }}>
          {score}
        </span>
      </div>
    </div>
  )
})
ScoreRing.displayName = 'ScoreRing'

const Pill = memo(
  ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
    <div className="px-2.5 py-1.5 rounded-lg bg-phantom-surface-dark border border-phantom-border-subtle">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon size={10} className="text-phantom-text-muted" />
        <span className="font-ui text-[9px] uppercase tracking-wider text-phantom-text-muted">
          {label}
        </span>
      </div>
      <p className="font-body text-[11px] text-phantom-text-primary truncate">{value}</p>
    </div>
  )
)
Pill.displayName = 'Pill'

export default NicheDiscovery
