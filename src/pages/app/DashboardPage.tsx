import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useBrands, type Brand } from '@/contexts/BrandContext'
import AppSidebar from '@/components/app/AppSidebar'
import BrandWizard from '@/components/BrandWizard'
import { AnimatePresence } from 'framer-motion'

const PHASE_LABELS: Record<string, string> = {
  identify: 'Phase 01 — Ghost Identity',
  test: 'Phase 02 — Silent Test',
  iterate: 'Phase 03 — Iteration Loop',
  lock: 'Phase 04 — Lock In',
  complete: 'Complete',
}


const BrandCard = memo(({ brand }: { brand: Brand }) => {
  const navigate = useNavigate()
  const { getBrandSignals, getBrandProof } = useBrands()
  const signals = getBrandSignals(brand.id)
  const proof = getBrandProof(brand.id)
  const conversions = signals.filter(s => s.type === 'conversion').length

  return (
    <div
      className="card card-interactive cursor-pointer"
      onClick={() => navigate(`/brand/${brand.id}/identify`)}
    >
      <div className="flex items-start justify-between mb-4 gap-3">
        <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary leading-tight">
          {brand.name}
        </h3>
        <span className="badge badge-active text-[9px] shrink-0 mt-0.5">
          {PHASE_LABELS[brand.currentPhase]}
        </span>
      </div>

      {/* Phase progress segments */}
      <div className="flex gap-1 mb-4">
        {['identify', 'test', 'iterate', 'lock'].map((phase, i) => {
          const phases = ['identify', 'test', 'iterate', 'lock', 'complete']
          const currentIdx = phases.indexOf(brand.currentPhase)
          const filled = i < currentIdx || brand.currentPhase === 'complete'
          const active = i === currentIdx
          return (
            <div key={phase} className="flex-1 h-1 rounded-sm overflow-hidden bg-[#1a1a1a]">
              <div
                className="h-full bg-phantom-lime rounded-sm transition-all duration-500"
                style={{ width: filled ? '100%' : active ? '50%' : '0%' }}
              />
            </div>
          )
        })}
      </div>

      <div className="flex gap-6 mb-4">
        {[
          { label: 'Signals', val: signals.length },
          { label: 'Conversions', val: conversions },
          { label: 'Proof', val: proof.length },
        ].map(({ label, val }) => (
          <div key={label}>
            <p className="font-code text-[22px] text-phantom-lime font-bold leading-none">{val}</p>
            <p className="font-body text-[11px] text-phantom-text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="font-body text-[11px] text-phantom-text-muted">
          Updated {new Date(brand.updatedAt).toLocaleDateString()}
        </span>
        <button className="btn-ghost text-[13px] py-1 px-2">
          Continue <ArrowRight size={12} />
        </button>
      </div>
    </div>
  )
})
BrandCard.displayName = 'BrandCard'

const DashboardPage = memo(() => {
  const { user } = useAuth()
  const { brands, signals } = useBrands()
  const [showWizard, setShowWizard] = useState(false)

  const userBrands = brands.filter(b => b.userId === user?.id)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex min-h-screen bg-phantom-black">
      <AppSidebar />

      <main className="flex-1 ml-60 p-10 overflow-y-auto">
        {/* Header */}
        <motion.div
          className="flex items-start justify-between mb-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div>
            <h1 className="font-display font-bold text-[28px] text-phantom-text-primary mb-1">
              {greeting}, {user?.name?.split(' ')[0]}.
            </h1>
            <p className="font-body text-[14px] text-phantom-text-secondary">
              Here is where your brands stand.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowWizard(true)}>
            <Plus size={16} /> New brand
          </button>
        </motion.div>

        {/* Metrics */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
        >
          {[
            { label: 'Total brands', val: userBrands.length, sub: 'brands' },
            {
              label: 'In phantom phase',
              val: userBrands.filter(b => b.currentPhase !== 'complete').length,
              sub: 'active',
            },
            {
              label: 'Ready to launch',
              val: userBrands.filter(b => b.currentPhase === 'complete').length,
              sub: 'passed lock-in',
            },
            {
              label: 'Signals tracked',
              val: signals.filter(s => userBrands.some(b => b.id === s.brandId)).length,
              sub: 'data points',
            },
          ].map(({ label, val, sub }) => (
            <div key={label} className="card">
              <p className="font-body text-[12px] text-phantom-text-muted mb-2">{label}</p>
              <p className="font-code text-[38px] text-phantom-lime font-bold leading-none mb-1">{val}</p>
              <p className="font-body text-[11px] text-phantom-text-muted">{sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Brands */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-[20px] text-phantom-text-primary">
              Active Brands
            </h2>
            {userBrands.length > 3 && (
              <span className="font-body text-[13px] text-phantom-text-muted">
                {userBrands.length} brands
              </span>
            )}
          </div>

          {userBrands.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-12 h-12 rounded mx-auto mb-4 flex items-center justify-center bg-[#0a1900] border border-phantom-lime/30">
                <Plus size={20} className="text-phantom-lime" />
              </div>
              <h3 className="font-display font-bold text-[18px] text-phantom-text-primary mb-2">
                Nothing here yet.
              </h3>
              <p className="font-body text-[14px] text-phantom-text-secondary mb-6">
                Your first phantom brand is one decision away.
              </p>
              <button className="btn-primary mx-auto" onClick={() => setShowWizard(true)}>
                <Plus size={14} /> Create brand
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {userBrands.map(b => (
                <BrandCard key={b.id} brand={b} />
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <AnimatePresence>
        {showWizard && <BrandWizard onClose={() => setShowWizard(false)} />}
      </AnimatePresence>
    </div>
  )
})

DashboardPage.displayName = 'DashboardPage'
export default DashboardPage
