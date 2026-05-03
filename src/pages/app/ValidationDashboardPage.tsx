import { memo, useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, BarChart3, Database, Loader, MessageSquareWarning, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { collectionGroup, onSnapshot, orderBy, query, where, type Unsubscribe } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects, type OutreachLog, type ProofVaultItem } from '@/contexts/ProjectContext'
import { db } from '@/lib/firebase'
import AppSidebar from '@/components/app/AppSidebar'

const MAX_IDS_PER_QUERY = 30

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

function toDate(v: string | undefined) {
  if (!v) return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

const ValidationDashboardPage = memo(() => {
  const { user } = useAuth()
  const { projects, proofVault } = useProjects()
  const [rows, setRows] = useState<OutreachLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setRows([])
      setLoading(false)
      return
    }

    const projectIds = projects.map((p) => p.id)
    if (projectIds.length === 0) {
      setRows([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const chunks = chunk(projectIds, MAX_IDS_PER_QUERY)
    const byChunk: Record<number, OutreachLog[]> = {}
    const unsubs: Unsubscribe[] = []

    chunks.forEach((ids, idx) => {
      const q = query(collectionGroup(db, 'outreach_log'), where('project_id', 'in', ids), orderBy('created_at', 'desc'))
      const unsub = onSnapshot(
        q,
        (snap) => {
          byChunk[idx] = snap.docs.map((d) => {
            const data = d.data() as Record<string, unknown>
            const createdAt = data.created_at as { toDate?: () => Date } | undefined
            return {
              id: d.id,
              project_id: String(data.project_id ?? d.ref.parent.parent?.id ?? ''),
              date: String(data.date ?? ''),
              platform: String(data.platform ?? ''),
              responded: Boolean(data.responded),
              converted: Boolean(data.converted),
              objection: String(data.objection ?? ''),
              notes: String(data.notes ?? ''),
              created_at: createdAt?.toDate?.()?.toISOString() ?? '',
            }
          })

          setRows(
            Object.values(byChunk)
              .flat()
              .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')),
          )
          setLoading(false)
          setError(null)
        },
        (err) => {
          // eslint-disable-next-line no-console
          console.error('[validation-dashboard] error:', err)
          setLoading(false)
          setError(err.message || 'Could not load validation metrics.')
        },
      )

      unsubs.push(unsub)
    })

    return () => unsubs.forEach((u) => u())
  }, [user, projects])

  const activeProjects = useMemo(() => projects.filter((p) => p.status === 'active'), [projects])
  const projectMap = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p])), [projects])

  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000
  const d7 = new Date(now.getTime() - 7 * dayMs)
  const d30 = new Date(now.getTime() - 30 * dayMs)

  const rows7 = rows.filter((r) => {
    const dt = toDate(r.created_at)
    return dt ? dt >= d7 : false
  })
  const rows30 = rows.filter((r) => {
    const dt = toDate(r.created_at)
    return dt ? dt >= d30 : false
  })

  const totalOutreach = rows.length
  const totalConversions = rows.filter((r) => r.converted).length
  const totalReplies = rows.filter((r) => r.responded && !r.converted).length
  const totalObjections = rows.filter((r) => r.objection.trim().length > 0).length
  const totalProof = proofVault.length

  const conversionRate = totalOutreach > 0 ? (totalConversions / totalOutreach) * 100 : 0
  const replyRate = totalOutreach > 0 ? (totalReplies / totalOutreach) * 100 : 0
  const objectionRate = totalOutreach > 0 ? (totalObjections / totalOutreach) * 100 : 0
  const proofPerConversion = totalConversions > 0 ? totalProof / totalConversions : 0

  const conv7 = rows7.length > 0 ? (rows7.filter((r) => r.converted).length / rows7.length) * 100 : 0
  const conv30 = rows30.length > 0 ? (rows30.filter((r) => r.converted).length / rows30.length) * 100 : 0

  const projectStats = useMemo(() => {
    const grouped: Record<string, { outreach: number; conversions: number; replies: number; objections: number }> = {}
    rows.forEach((r) => {
      grouped[r.project_id] ??= { outreach: 0, conversions: 0, replies: 0, objections: 0 }
      grouped[r.project_id].outreach += 1
      if (r.converted) grouped[r.project_id].conversions += 1
      if (r.responded && !r.converted) grouped[r.project_id].replies += 1
      if (r.objection.trim().length > 0) grouped[r.project_id].objections += 1
    })

    return Object.entries(grouped)
      .map(([projectId, s]) => ({
        projectId,
        name: projectMap[projectId]?.name ?? 'Unknown project',
        ...s,
        convRate: s.outreach > 0 ? (s.conversions / s.outreach) * 100 : 0,
      }))
      .sort((a, b) => b.convRate - a.convRate)
  }, [rows, projectMap])

  const objectionPatterns = useMemo(() => {
    const map: Record<string, number> = {}
    rows.forEach((r) => {
      const key = r.objection.trim()
      if (!key) return
      map[key] = (map[key] ?? 0) + 1
    })
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 5)
  }, [rows])

  const proofTypeBreakdown = useMemo(() => {
    const map: Record<ProofVaultItem['proof_type'], number> = {
      screenshot: 0,
      testimonial: 0,
      case_study: 0,
      revenue: 0,
      conversion_data: 0,
      landing_page_test: 0,
      ad_performance: 0,
      survey_data: 0,
      preorder_campaign: 0,
      competitor_analysis: 0,
      market_research: 0,
    }
    proofVault.forEach((p) => {
      map[p.proof_type] += 1
    })
    return Object.entries(map).filter(([, c]) => c > 0).sort(([, a], [, b]) => b - a)
  }, [proofVault])

  return (
    <div className="flex min-h-screen bg-phantom-black">
      <AppSidebar />
      <main className="flex-1 ml-60 p-10 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
          <div className="mb-10">
            <h1 className="font-display font-bold text-[28px] text-phantom-text-primary mb-1">Validation Dashboard</h1>
            <p className="font-body text-[14px] text-phantom-text-secondary">Production metrics from live outreach and proof data.</p>
          </div>

          {loading && (
            <div className="card mb-6 flex items-center gap-3">
              <Loader className="animate-spin text-phantom-lime" size={16} />
              <p className="font-body text-[13px] text-phantom-text-secondary">Loading validation metrics...</p>
            </div>
          )}
          {error && (
            <div className="card mb-6 bg-phantom-danger/10 border-phantom-danger/30">
              <p className="font-body text-[13px] text-phantom-danger">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Active projects', val: activeProjects.length, sub: 'currently testing', icon: Activity },
              { label: 'Cold conversion', val: `${conversionRate.toFixed(1)}%`, sub: `${totalConversions}/${totalOutreach}`, icon: TrendingUp },
              { label: 'Reply rate', val: `${replyRate.toFixed(1)}%`, sub: `${totalReplies}/${totalOutreach}`, icon: BarChart3 },
              { label: 'Objection rate', val: `${objectionRate.toFixed(1)}%`, sub: `${totalObjections}/${totalOutreach}`, icon: AlertTriangle },
              { label: 'Proof captured', val: totalProof, sub: `${proofPerConversion.toFixed(2)} per conversion`, icon: Database },
            ].map(({ label, val, sub, icon: Icon }) => (
              <div key={label} className="card">
                <Icon size={15} className="text-phantom-text-muted mb-2" />
                <p className="font-code text-[30px] text-phantom-lime font-bold leading-none mb-1">{val}</p>
                <p className="font-body text-[12px] text-phantom-text-muted">{label}</p>
                <p className="font-body text-[11px] text-phantom-text-muted opacity-70">{sub}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <p className="label mb-3">Trend snapshot</p>
              <div className="space-y-2 text-[13px] font-body text-phantom-text-secondary">
                <p>Last 7 days conversion: <span className="text-phantom-lime">{conv7.toFixed(1)}%</span></p>
                <p>Last 30 days conversion: <span className="text-phantom-lime">{conv30.toFixed(1)}%</span></p>
                <p>Delta (7d vs 30d): <span className={conv7 >= conv30 ? 'text-phantom-lime' : 'text-phantom-warning'}>{(conv7 - conv30).toFixed(1)}%</span></p>
              </div>
            </div>

            <div className="card">
              <p className="label mb-3 flex items-center gap-2"><MessageSquareWarning size={13} /> Top objections</p>
              {objectionPatterns.length === 0 ? (
                <p className="font-body text-[13px] text-phantom-text-muted">No objection patterns yet.</p>
              ) : (
                <div className="space-y-2">
                  {objectionPatterns.map(([objection, count]) => (
                    <div key={objection} className="flex items-start justify-between gap-4">
                      <p className="font-body text-[13px] text-phantom-text-secondary">{objection}</p>
                      <span className="badge">{count}×</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <p className="label mb-3">Project performance</p>
              {projectStats.length === 0 ? (
                <p className="font-body text-[13px] text-phantom-text-muted">No outreach data yet.</p>
              ) : (
                <div className="space-y-2">
                  {projectStats.slice(0, 8).map((p) => (
                    <div key={p.projectId} className="flex items-center justify-between text-[13px]">
                      <p className="font-body text-phantom-text-secondary truncate pr-3">{p.name}</p>
                      <p className="font-code text-phantom-lime">{p.convRate.toFixed(1)}% ({p.conversions}/{p.outreach})</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <p className="label mb-3">Proof health</p>
              {proofTypeBreakdown.length === 0 ? (
                <p className="font-body text-[13px] text-phantom-text-muted">No proof items yet.</p>
              ) : (
                <div className="space-y-2">
                  {proofTypeBreakdown.slice(0, 8).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-[13px]">
                      <p className="font-body text-phantom-text-secondary">{type.split('_').join(' ')}</p>
                      <span className="font-code text-phantom-lime">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
})

ValidationDashboardPage.displayName = 'ValidationDashboardPage'
export default ValidationDashboardPage
