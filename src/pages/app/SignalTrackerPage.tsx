import { memo, useEffect, useState } from 'react'
import { Plus, Trash2, Filter, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects } from '@/contexts/ProjectContext'
import { db } from '@/lib/firebase'
import AppSidebar from '@/components/app/AppSidebar'

// Cross-project signal type. Maps to outreach_log entries:
// reply       = responded && !converted
// conversion  = converted
// objection   = objection.trim().length > 0
// no_response = !responded && !converted && !objection
type DerivedType = 'reply' | 'conversion' | 'objection' | 'no_response'

interface OutreachRow {
  id: string
  project_id: string
  date: string
  platform: string
  outreach_type: string
  identifier: string
  responded: boolean
  converted: boolean
  objection: string
  notes: string
  created_at: Date | null
}

const TYPE_LABELS: Record<DerivedType, string> = {
  reply: 'Reply',
  conversion: 'Conversion',
  objection: 'Objection',
  no_response: 'No Response',
}

const TYPE_BADGE: Record<DerivedType, string> = {
  reply: 'badge',
  conversion: 'badge badge-active',
  objection: 'badge badge-danger',
  no_response: 'badge',
}

function deriveType(row: OutreachRow): DerivedType {
  if (row.converted) return 'conversion'
  if (row.objection.trim().length > 0) return 'objection'
  if (row.responded) return 'reply'
  return 'no_response'
}

const SignalTrackerPage = memo(() => {
  const { user } = useAuth()
  const { projects } = useProjects()

  const [rows, setRows] = useState<OutreachRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [typeFilter, setTypeFilter] = useState<DerivedType | 'all'>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    project_id: '',
    type: 'reply' as DerivedType,
    platform: '',
    notes: '',
  })

  // Subscribe to ALL outreach_log entries the user owns via collectionGroup.
  // Rules require project ownership; we filter client-side by membership in
  // the user's projects list (rules deny anything else, so the listener will
  // simply not return foreign docs even if our where() drifted).
  useEffect(() => {
    if (!user) return

    let unsub: Unsubscribe | null = null
    if (projects.length === 0) {
      setRows([])
      setLoading(false)
      return
    }

    // Firestore `in` queries are capped at 30; for free-tier (1 active project)
    // and even paid plans this is fine. For >30 projects we'd need to fan out.
    const projectIds = projects.slice(0, 30).map((p) => p.id)

    const q = query(
      collectionGroup(db, 'outreach_log'),
      where('project_id', 'in', projectIds),
      orderBy('created_at', 'desc'),
    )

    unsub = onSnapshot(
      q,
      (snap) => {
        setRows(
          snap.docs.map((d) => {
            const data = d.data() as DocumentData
            return {
              id: d.id,
              project_id: data.project_id ?? d.ref.parent.parent?.id ?? '',
              date: data.date ?? '',
              platform: data.platform ?? '',
              outreach_type: data.outreach_type ?? 'other',
              identifier: data.identifier ?? '',
              responded: !!data.responded,
              converted: !!data.converted,
              objection: data.objection ?? '',
              notes: data.notes ?? '',
              created_at: data.created_at?.toDate?.() ?? null,
            }
          }),
        )
        setLoading(false)
        setError(null)
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error('[phantom] outreach collectionGroup error:', err)
        setError(err.message)
        setLoading(false)
      },
    )

    return () => {
      unsub?.()
    }
  }, [user, projects])

  useEffect(() => {
    if (!form.project_id && projects[0]) {
      setForm((f) => ({ ...f, project_id: projects[0].id }))
    }
  }, [projects, form.project_id])

  const filtered = rows
    .filter((r) => typeFilter === 'all' || deriveType(r) === typeFilter)
    .filter((r) => projectFilter === 'all' || r.project_id === projectFilter)

  const total = rows.length
  const conversions = rows.filter((r) => r.converted).length
  const replies = rows.filter((r) => r.responded && !r.converted).length
  const objections = rows.filter((r) => r.objection.trim().length > 0).length

  const convRate = total > 0 ? ((conversions / total) * 100).toFixed(1) : '0'
  const replyRate = total > 0 ? ((replies / total) * 100).toFixed(1) : '0'

  // Aggregate verbatim objections across all projects.
  const objectionMap = rows
    .filter((r) => r.objection.trim().length > 0)
    .reduce<Record<string, number>>((acc, r) => {
      const key = r.objection.trim()
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})
  const sortedObjections = Object.entries(objectionMap).sort(([, a], [, b]) => b - a)

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? '—'

  const submit = async () => {
    if (!form.project_id || !form.platform.trim()) return

    // Map derived type → outreach_log columns. Notes carry into objection
    // when type is objection, otherwise into notes.
    const payload = {
      project_id: form.project_id,
      date: new Date().toISOString().slice(0, 10),
      platform: form.platform.trim(),
      outreach_type: 'cold_dm',
      identifier: '',
      responded: form.type === 'reply' || form.type === 'conversion' || form.type === 'objection',
      converted: form.type === 'conversion',
      objection: form.type === 'objection' ? form.notes.trim() : '',
      notes: form.type === 'objection' ? '' : form.notes.trim(),
      created_at: serverTimestamp(),
    }
    await addDoc(collection(db, 'projects', form.project_id, 'outreach_log'), payload)

    setForm({
      project_id: form.project_id,
      type: 'reply',
      platform: '',
      notes: '',
    })
    setShowForm(false)
  }

  const remove = async (row: OutreachRow) => {
    await deleteDoc(doc(db, 'projects', row.project_id, 'outreach_log', row.id))
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
                Signal Tracker
              </h1>
              <p className="font-body text-[14px] text-phantom-text-secondary">
                Every reply, conversion, and objection across all projects. Pulled live from your outreach logs.
              </p>
            </div>
            <button className="btn-primary" onClick={() => setShowForm((v) => !v)} disabled={projects.length === 0}>
              <Plus size={16} /> Log signal
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total outreach', val: total, sub: 'entries logged' },
              { label: 'Conversions', val: conversions, sub: `${convRate}% rate` },
              { label: 'Replies', val: replies, sub: `${replyRate}% rate` },
              { label: 'Objections', val: objections, sub: `${sortedObjections.length} patterns` },
            ].map(({ label, val, sub }) => (
              <div key={label} className="card">
                <p className="font-code text-[38px] text-phantom-lime font-bold leading-none mb-1">{val}</p>
                <p className="font-body text-[12px] text-phantom-text-muted">{label}</p>
                <p className="font-body text-[11px] text-phantom-text-muted opacity-60">{sub}</p>
              </div>
            ))}
          </div>

          {/* Loading / error */}
          {loading && (
            <div className="card mb-6 flex items-center gap-3">
              <Loader className="animate-spin text-phantom-lime" size={16} />
              <p className="font-body text-[13px] text-phantom-text-secondary">Loading signals...</p>
            </div>
          )}
          {error && (
            <div className="card mb-6 bg-phantom-danger/10 border-phantom-danger/30">
              <p className="font-body text-[13px] text-phantom-danger">{error}</p>
              <p className="font-body text-[11px] text-phantom-text-muted mt-1">
                If this mentions a missing index, deploy <span className="font-code">firestore.indexes.json</span> or follow the link in the browser console.
              </p>
            </div>
          )}

          {/* Log Signal Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                className="card mb-6 border-phantom-lime/30"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="label text-phantom-lime mb-4">New signal</p>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="label text-phantom-text-secondary mb-2 block">Type</label>
                    <select
                      className="input"
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as DerivedType }))}
                    >
                      <option value="reply">Reply</option>
                      <option value="conversion">Conversion</option>
                      <option value="objection">Objection</option>
                      <option value="no_response">No Response</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-phantom-text-secondary mb-2 block">Project</label>
                    <select
                      className="input"
                      value={form.project_id}
                      onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}
                    >
                      {projects.length === 0 ? (
                        <option value="">No projects yet</option>
                      ) : (
                        projects.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="label text-phantom-text-secondary mb-2 block">Platform</label>
                    <input
                      className="input"
                      value={form.platform}
                      onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                      placeholder="e.g. r/Entrepreneur, LinkedIn DM"
                    />
                  </div>
                </div>
                <div>
                  <label className="label text-phantom-text-secondary mb-2 block">
                    {form.type === 'objection' ? 'Objection — what did they say?' : 'Notes'}
                  </label>
                  <textarea
                    className="input"
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder={
                      form.type === 'objection'
                        ? '"Too expensive for where I am right now"'
                        : 'What happened, what they said, any context'
                    }
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button className="btn-primary" onClick={submit} disabled={!form.project_id || !form.platform.trim()}>
                    Log signal
                  </button>
                  <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <Filter size={14} className="text-phantom-text-muted" />
            {(['all', 'conversion', 'reply', 'objection', 'no_response'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`font-ui text-[12px] px-3 py-1.5 rounded-full border transition-all duration-150 ${
                  typeFilter === t
                    ? 'border-phantom-lime text-phantom-lime bg-phantom-lime/10'
                    : 'border-phantom-border text-phantom-text-muted hover:border-[#333] hover:text-phantom-text-secondary'
                }`}
              >
                {t === 'all' ? 'All signals' : TYPE_LABELS[t]}
              </button>
            ))}
            {projects.length > 1 && (
              <select
                className="input text-[13px] py-1.5 w-auto min-w-[140px] ml-auto"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <option value="all">All projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Table */}
          {!loading && filtered.length === 0 ? (
            <div className="card text-center py-16 mb-6">
              <h3 className="font-display font-bold text-[18px] text-phantom-text-primary mb-2">
                No signals logged.
              </h3>
              <p className="font-body text-[14px] text-phantom-text-secondary mb-6">
                Every test starts with a first attempt. Log your outreach and track what converts.
              </p>
              <button
                className="btn-primary mx-auto"
                onClick={() => setShowForm(true)}
                disabled={projects.length === 0}
              >
                <Plus size={14} /> Log signal
              </button>
            </div>
          ) : (
            !loading && (
              <div className="card mb-8 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-phantom-border-subtle">
                      {['Date', 'Project', 'Platform', 'Type', 'Detail', ''].map((col) => (
                        <th
                          key={col}
                          className="text-left font-ui text-[11px] text-phantom-text-muted uppercase tracking-wider pb-3 pr-5 font-medium"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => {
                      const t = deriveType(r)
                      return (
                        <tr key={r.id} className="border-b border-phantom-border-subtle/40 hover:bg-[#0d0d0d] transition-colors">
                          <td className="py-3.5 pr-5 font-body text-[12px] text-phantom-text-muted whitespace-nowrap">
                            {r.created_at
                              ? r.created_at.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : r.date}
                          </td>
                          <td className="py-3.5 pr-5 font-body text-[13px] text-phantom-text-secondary max-w-[160px] truncate">
                            {projectName(r.project_id)}
                          </td>
                          <td className="py-3.5 pr-5 font-body text-[13px] text-phantom-text-secondary max-w-[160px] truncate">
                            {r.platform}
                          </td>
                          <td className="py-3.5 pr-5">
                            <span className={TYPE_BADGE[t]}>{TYPE_LABELS[t]}</span>
                          </td>
                          <td className="py-3.5 pr-5 font-body text-[13px] text-phantom-text-secondary max-w-[260px] truncate">
                            {r.objection || r.notes || <span className="text-phantom-text-muted">—</span>}
                          </td>
                          <td className="py-3.5">
                            <button
                              onClick={() => remove(r)}
                              className="text-phantom-text-muted hover:text-phantom-danger transition-colors"
                              aria-label="Delete entry"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Objection Patterns */}
          {sortedObjections.length > 0 && (
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <p className="label mb-2">Objection Patterns</p>
              <p className="font-body text-[13px] text-phantom-text-muted mb-5">
                Most frequent objections across all projects. These are telling you what to fix.
              </p>
              <div className="space-y-3">
                {sortedObjections.map(([note, count], i) => (
                  <div key={note} className="flex items-start gap-4">
                    <div className="flex items-center gap-2 w-16 shrink-0 pt-0.5">
                      <span className="font-code text-[14px] text-phantom-lime font-bold">{count}×</span>
                      {i === 0 && <span className="badge badge-danger text-[9px]">top</span>}
                    </div>
                    <p className="font-body text-[14px] text-phantom-text-secondary leading-snug">{note}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
})

SignalTrackerPage.displayName = 'SignalTrackerPage'
export default SignalTrackerPage
