import { memo } from 'react'
import { TrendingUp, Repeat, Database, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProjects } from '@/contexts/ProjectContext'
import AppSidebar from '@/components/app/AppSidebar'

const ValidationDashboardPage = memo(() => {
  const { projects, outreachLog, proofVault } = useProjects()

  const activeProjects = projects.filter((p) => p.status === 'active')
  const totalOutreach = outreachLog.length
  const totalConversions = outreachLog.filter((o) => o.converted).length
  const totalReplies = outreachLog.filter((o) => o.responded).length
  const totalProof = proofVault.length

  const conversionRate = totalOutreach > 0 ? ((totalConversions / totalOutreach) * 100).toFixed(1) : '0.0'
  const replyRate = totalOutreach > 0 ? ((totalReplies / totalOutreach) * 100).toFixed(1) : '0.0'
  const repeatRate = totalConversions > 0 ? ((totalProof / totalConversions) * 100).toFixed(1) : '0.0'

  return (
    <div className="flex min-h-screen bg-phantom-black">
      <AppSidebar />
      <main className="flex-1 ml-60 p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="mb-10">
            <h1 className="font-display font-bold text-[28px] text-phantom-text-primary mb-1">
              Validation Dashboard
            </h1>
            <p className="font-body text-[14px] text-phantom-text-secondary">
              Real-time metrics on conversion, response behavior, and proof collection across your projects.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active projects', value: activeProjects.length, sub: 'in phantom phase', icon: Activity },
              { label: 'Cold conversion rate', value: `${conversionRate}%`, sub: `${totalConversions}/${totalOutreach} converted`, icon: TrendingUp },
              { label: 'Reply rate', value: `${replyRate}%`, sub: `${totalReplies}/${totalOutreach} replied`, icon: Repeat },
              { label: 'Proof captured', value: totalProof, sub: `${repeatRate}% proof/conversion`, icon: Database },
            ].map(({ label, value, sub, icon: Icon }) => (
              <div key={label} className="card">
                <Icon size={15} className="text-phantom-text-muted mb-2" />
                <p className="font-code text-[34px] text-phantom-lime font-bold leading-none mb-1">{value}</p>
                <p className="font-body text-[12px] text-phantom-text-muted">{label}</p>
                <p className="font-body text-[11px] text-phantom-text-muted opacity-70">{sub}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <p className="label mb-2">How to read this</p>
            <ul className="space-y-2 font-body text-[13px] text-phantom-text-secondary">
              <li>• <span className="text-phantom-text-primary">Cold conversion rate</span> is your strongest signal of offer-market fit.</li>
              <li>• <span className="text-phantom-text-primary">Reply rate</span> helps diagnose messaging and audience quality.</li>
              <li>• <span className="text-phantom-text-primary">Proof captured</span> indicates how ready you are for lock-in and launch.</li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  )
})

ValidationDashboardPage.displayName = 'ValidationDashboardPage'
export default ValidationDashboardPage
