import { memo, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Activity, AlertTriangle, BarChart3, ChevronDown, ChevronLeft, ChevronRight, Database, Loader, MessageSquareWarning, TrendingUp } from 'lucide-react'
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

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

function weekStartKey(d: Date) {
  const dt = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const day = dt.getUTCDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  dt.setUTCDate(dt.getUTCDate() + diffToMonday)
  return dt.toISOString().slice(0, 10)
}

function monthKey(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

const ValidationDashboardPage = memo(() => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { projects, proofVault } = useProjects()
  const [rows, setRows] = useState<OutreachLog[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [objectionsPage, setObjectionsPage] = useState(1)
  const [conversionsPage, setConversionsPage] = useState(1)
  const [isTrendCollapsed, setIsTrendCollapsed] = useState(false)
  const [trendGranularity, setTrendGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const ITEMS_PER_PAGE = 5

  useEffect(() => {
    if (!projects.length) {
      setSelectedProjectId('')
      return
    }
    if (id && projects.some((p) => p.id === id)) {
      setSelectedProjectId(id)
      return
    }
    if (!selectedProjectId || !projects.some((p) => p.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId, id])

  useEffect(() => {
    if (!selectedProjectId) return
    if (id !== selectedProjectId) {
      navigate(`/validation/${selectedProjectId}`, { replace: true })
    }
  }, [id, selectedProjectId, navigate])

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
  const selectedProject = useMemo(() => projects.find((p) => p.id === selectedProjectId) ?? null, [projects, selectedProjectId])
  const scopedRows = useMemo(() => rows.filter((r) => r.project_id === selectedProjectId), [rows, selectedProjectId])

  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000

  const totalOutreach = scopedRows.length
  const totalConversions = scopedRows.filter((r) => r.converted).length
  const totalReplies = scopedRows.filter((r) => r.responded && !r.converted).length
  const totalObjections = scopedRows.filter((r) => r.objection.trim().length > 0).length
  const totalProof = proofVault.length

  const conversionRate = totalOutreach > 0 ? (totalConversions / totalOutreach) * 100 : 0
  const replyRate = totalOutreach > 0 ? (totalReplies / totalOutreach) * 100 : 0
  const objectionRate = totalOutreach > 0 ? (totalObjections / totalOutreach) * 100 : 0
  const proofPerConversion = totalConversions > 0 ? totalProof / totalConversions : 0

  const projectStats = useMemo(() => {
    const grouped: Record<string, { outreach: number; conversions: number; replies: number; objections: number }> = {}
    scopedRows.forEach((r) => {
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
  }, [scopedRows, projectMap])

  const objectionPatterns = useMemo(() => {
    const map: Record<string, number> = {}
    scopedRows.forEach((r) => {
      const key = r.objection.trim()
      if (!key) return
      map[key] = (map[key] ?? 0) + 1
    })
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 5)
  }, [scopedRows])

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

  const trendGrid = useMemo(() => {
    const map: Record<string, { outreach: number; replies: number; conversions: number }> = {}
    const keys: string[] = []

    if (trendGranularity === 'daily') {
      const days = 14
      const start = new Date(now.getTime() - (days - 1) * dayMs)
      for (let i = 0; i < days; i += 1) {
        const dt = new Date(start.getTime() + i * dayMs)
        const key = dayKey(dt)
        keys.push(key)
        map[key] = { outreach: 0, replies: 0, conversions: 0 }
      }
    } else if (trendGranularity === 'weekly') {
      for (let i = 11; i >= 0; i -= 1) {
        const dt = new Date(now)
        dt.setDate(now.getDate() - i * 7)
        const key = weekStartKey(dt)
        keys.push(key)
        map[key] = { outreach: 0, replies: 0, conversions: 0 }
      }
    } else {
      for (let i = 11; i >= 0; i -= 1) {
        const dt = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = monthKey(dt)
        keys.push(key)
        map[key] = { outreach: 0, replies: 0, conversions: 0 }
      }
    }

    scopedRows.forEach((r) => {
      const dt = toDate(r.created_at)
      if (!dt) return
      const key = trendGranularity === 'daily' ? dayKey(dt) : trendGranularity === 'weekly' ? weekStartKey(dt) : monthKey(dt)
      if (!map[key]) return
      map[key].outreach += 1
      if (r.responded && !r.converted) map[key].replies += 1
      if (r.converted) map[key].conversions += 1
    })

    const series = keys.map((date) => {
      const v = map[date]
      return {
        date,
        outreach: v.outreach,
        replies: v.replies,
        conversions: v.conversions,
        convRate: v.outreach > 0 ? (v.conversions / v.outreach) * 100 : 0,
      }
    })

    return series
  }, [scopedRows, now, dayMs, trendGranularity])

  const topConvertingDetails = useMemo(() => {
    const converted = scopedRows.filter((r) => r.converted)
    const map: Record<string, number> = {}

    converted.forEach((r) => {
      const detail = r.notes.trim() || 'Converted lead (no detail logged)'
      map[detail] = (map[detail] ?? 0) + 1
    })

    return Object.entries(map)
      .map(([detail, count]) => ({
        detail,
        count,
        share: converted.length > 0 ? (count / converted.length) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
  }, [scopedRows])

  const objectionsTotalPages = Math.max(1, Math.ceil(objectionPatterns.length / ITEMS_PER_PAGE))
  const conversionsTotalPages = Math.max(1, Math.ceil(topConvertingDetails.length / ITEMS_PER_PAGE))

  const pagedObjections = useMemo(() => {
    const start = (objectionsPage - 1) * ITEMS_PER_PAGE
    return objectionPatterns.slice(start, start + ITEMS_PER_PAGE)
  }, [objectionPatterns, objectionsPage])

  const pagedConversions = useMemo(() => {
    const start = (conversionsPage - 1) * ITEMS_PER_PAGE
    return topConvertingDetails.slice(start, start + ITEMS_PER_PAGE)
  }, [topConvertingDetails, conversionsPage])

  useEffect(() => {
    if (objectionsPage > objectionsTotalPages) setObjectionsPage(objectionsTotalPages)
  }, [objectionsPage, objectionsTotalPages])

  useEffect(() => {
    if (conversionsPage > conversionsTotalPages) setConversionsPage(conversionsTotalPages)
  }, [conversionsPage, conversionsTotalPages])

  return (
    <div className="flex min-h-screen bg-phantom-black">
      <AppSidebar />
      <main className="flex-1 ml-60 p-10 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
          <div className="mb-10">
            <h1 className="font-display font-bold text-[28px] text-phantom-text-primary mb-1">Validation Dashboard</h1>
            <p className="font-body text-[14px] text-phantom-text-secondary">Production metrics from live outreach and proof data.</p>
            <div className="mt-4 max-w-sm">
              <label className="label text-phantom-text-secondary mb-2 block">Project</label>
              <select className="input" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
                {projects.length === 0 ? (
                  <option value="">No projects</option>
                ) : (
                  projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))
                )}
              </select>
              {selectedProject && (
                <p className="font-body text-[12px] text-phantom-text-muted mt-2">Viewing: {selectedProject.name}</p>
              )}
            </div>
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

<div className="card mb-8 flex flex-col">
            <button
              type="button"
              className="label mb-3 flex items-center justify-between text-left"
              onClick={() => setIsTrendCollapsed((v) => !v)}
              aria-expanded={!isTrendCollapsed}
              aria-controls="conversion-trend-table"
            >
              <span>Conversion trends</span>
              <ChevronDown
                size={14}
                className={`transition-transform ${isTrendCollapsed ? '' : 'rotate-180'}`}
                aria-hidden="true"
              />
            </button>
            {!isTrendCollapsed && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  {([
                    { key: 'daily', label: 'Daily' },
                    { key: 'weekly', label: 'Weekly' },
                    { key: 'monthly', label: 'Monthly' },
                  ] as const).map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      className={`px-3 py-1 rounded-md text-[12px] border ${trendGranularity === option.key ? 'border-phantom-lime text-phantom-lime bg-phantom-lime/10' : 'border-phantom-border-subtle text-phantom-text-secondary'}`}
                      onClick={() => setTrendGranularity(option.key)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div id="conversion-trend-table" className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-phantom-border-subtle">
                        {['Date', 'Outreach', 'Replies', 'Conversions', 'Conversion %'].map((h) => (
                          <th key={h} className="text-left py-2 pr-4 font-ui text-[11px] uppercase tracking-wider text-phantom-text-muted">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trendGrid.map((d) => (
                        <tr key={d.date} className="border-b border-phantom-border-subtle/40">
                          <td className="py-2 pr-4 font-code text-[12px] text-phantom-text-secondary">{d.date}</td>
                          <td className="py-2 pr-4 font-code text-[12px] text-phantom-text-secondary">{d.outreach}</td>
                          <td className="py-2 pr-4 font-code text-[12px] text-phantom-text-secondary">{d.replies}</td>
                          <td className="py-2 pr-4 font-code text-[12px] text-phantom-text-secondary">{d.conversions}</td>
                          <td className="py-2 pr-4 font-code text-[12px] text-phantom-lime">{d.convRate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
<div className="card flex flex-col">
              <p className="label mb-3 flex items-center gap-2"><MessageSquareWarning size={13} /> Top objections</p>
              {objectionPatterns.length === 0 ? (
                <p className="font-body text-[13px] text-phantom-text-muted">No objection patterns yet.</p>
              ) : (
                <>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {pagedObjections.map(([objection]) => (
                    <div key={objection} className="flex items-start gap-4">
                      <p className="font-body text-[13px] text-phantom-text-secondary">{objection}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <button
                    className="btn-secondary h-7 w-7 p-0 inline-flex items-center justify-center"
                    aria-label="Previous objections page"
                    disabled={objectionsPage <= 1}
                    onClick={() => setObjectionsPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <p className="font-body text-[11px] text-phantom-text-muted">Page {objectionsPage} / {objectionsTotalPages}</p>
                  <button
                    className="btn-secondary h-7 w-7 p-0 inline-flex items-center justify-center"
                    aria-label="Next objections page"
                    disabled={objectionsPage >= objectionsTotalPages}
                    onClick={() => setObjectionsPage((p) => Math.min(objectionsTotalPages, p + 1))}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
                </>
              )}
            </div>

            <div className="card flex flex-col">
              <p className="label mb-3 flex items-center gap-2"><TrendingUp size={13} /> Top conversions</p>
              {topConvertingDetails.length === 0 ? (
                <p className="font-body text-[13px] text-phantom-text-muted">No conversions logged yet.</p>
              ) : (
                <>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {pagedConversions.map((s) => (
                    <div key={s.detail} className="flex items-start gap-4">
                      <p className="font-body text-[13px] text-phantom-text-secondary">{s.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <button
                    className="btn-secondary h-7 w-7 p-0 inline-flex items-center justify-center"
                    aria-label="Previous conversions page"
                    disabled={conversionsPage <= 1}
                    onClick={() => setConversionsPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <p className="font-body text-[11px] text-phantom-text-muted">Page {conversionsPage} / {conversionsTotalPages}</p>
                  <button
                    className="btn-secondary h-7 w-7 p-0 inline-flex items-center justify-center"
                    aria-label="Next conversions page"
                    disabled={conversionsPage >= conversionsTotalPages}
                    onClick={() => setConversionsPage((p) => Math.min(conversionsTotalPages, p + 1))}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
                </>
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
                      <p className="font-body text-phantom-text-secondary">{type.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
                      <span className="font-code text-phantom-lime">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card mt-6 overflow-x-auto">
            <p className="label mb-3">Project metrics grid</p>
            {projectStats.length === 0 ? (
              <p className="font-body text-[13px] text-phantom-text-muted">No rows yet. Start logging outreach to populate this grid.</p>
            ) : (
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-phantom-border-subtle">
                    {['Project', 'Outreach', 'Replies', 'Conversions', 'Conv %', 'Objections'].map((h) => (
                      <th key={h} className="text-left py-2 pr-4 font-ui text-[11px] uppercase tracking-wider text-phantom-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projectStats.map((p) => (
                    <tr key={p.projectId} className="border-b border-phantom-border-subtle/40">
                      <td className="py-2 pr-4 font-body text-[13px] text-phantom-text-secondary">{p.name}</td>
                      <td className="py-2 pr-4 font-code text-[12px] text-phantom-text-secondary">{p.outreach}</td>
                      <td className="py-2 pr-4 font-code text-[12px] text-phantom-text-secondary">{p.replies}</td>
                      <td className="py-2 pr-4 font-code text-[12px] text-phantom-text-secondary">{p.conversions}</td>
                      <td className="py-2 pr-4 font-code text-[12px] text-phantom-lime">{p.convRate.toFixed(1)}%</td>
                      <td className="py-2 pr-4 font-code text-[12px] text-phantom-text-secondary">{p.objections}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
})

ValidationDashboardPage.displayName = 'ValidationDashboardPage'
export default ValidationDashboardPage
