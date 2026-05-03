import { memo } from 'react'
import { AlertCircle, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects } from '@/contexts/ProjectContext'
import { Link } from 'react-router-dom'

const FREE_LIMITS = {
  active_projects: 1,
  offer_versions: 3,
  outreach_entries: 30,
  vault_items: 5,
} as const

const UsageLimitBanner = memo(() => {
  const { user } = useAuth()
  const { projects, outreachLog, proofVault, iterationVersions } = useProjects()

  if (!user || user.plan !== 'free') return null

  const activeProjects = projects.filter(p => p.status === 'active').length
  const totalOutreach = outreachLog.length
  const totalProof = proofVault.length
  const totalVersions = iterationVersions.length

  const limits = [
    { label: 'Active Projects', current: activeProjects, max: FREE_LIMITS.active_projects },
    { label: 'Outreach Entries', current: totalOutreach, max: FREE_LIMITS.outreach_entries },
    { label: 'Proof Items', current: totalProof, max: FREE_LIMITS.vault_items },
    { label: 'Offer Versions', current: totalVersions, max: FREE_LIMITS.offer_versions },
  ]

  const nearLimit = limits.some(l => l.current >= l.max * 0.8)
  const atLimit = limits.some(l => l.current >= l.max)

  if (!nearLimit) return null

  return (
    <div className={`card border-2 ${atLimit ? 'border-phantom-danger/50 bg-phantom-danger/5' : 'border-phantom-lime/30 bg-phantom-lime/5'} mb-6`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded ${atLimit ? 'bg-phantom-danger/20' : 'bg-phantom-lime/20'}`}>
          {atLimit ? <AlertCircle size={20} className="text-phantom-danger" /> : <Zap size={20} className="text-phantom-lime" />}
        </div>
        <div className="flex-1">
          <h3 className="font-display font-semibold text-[16px] text-phantom-text-primary mb-2">
            {atLimit ? 'Free Plan Limit Reached' : 'Approaching Free Plan Limits'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {limits.map(({ label, current, max }) => {
              const percentage = (current / max) * 100
              const isAtLimit = current >= max
              const isNearLimit = percentage >= 80
              
              return (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[11px] text-phantom-text-muted">{label}</span>
                    <span className={`font-code text-[11px] font-semibold ${isAtLimit ? 'text-phantom-danger' : isNearLimit ? 'text-phantom-lime' : 'text-phantom-text-secondary'}`}>
                      {current}/{max}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${isAtLimit ? 'bg-phantom-danger' : isNearLimit ? 'bg-phantom-lime' : 'bg-phantom-text-muted'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/pricing" className="btn-primary text-[13px] py-2 px-4">
              <Zap size={14} /> Upgrade to PRO
            </Link>
            <p className="font-body text-[12px] text-phantom-text-muted">
              Unlock unlimited projects, outreach, and proof storage
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

UsageLimitBanner.displayName = 'UsageLimitBanner'
export default UsageLimitBanner
