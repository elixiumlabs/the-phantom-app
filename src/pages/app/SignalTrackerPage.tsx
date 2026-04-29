import { memo, useState } from 'react'
import { Plus, Trash2, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useBrands, type SignalType, type Signal } from '@/contexts/BrandContext'
import AppSidebar from '@/components/app/AppSidebar'

const SIGNAL_LABELS: Record<SignalType, string> = {
  reply:       'Reply',
  conversion:  'Conversion',
  objection:   'Objection',
  no_response: 'No Response',
}

const SIGNAL_BADGE: Record<SignalType, string> = {
  reply:       'badge',
  conversion:  'badge badge-active',
  objection:   'badge badge-danger',
  no_response: 'badge',
}

const PHASE_LABELS: Record<string, string> = {
  identify: 'Phase 01',
  test:     'Phase 02',
  iterate:  'Phase 03',
  lock:     'Phase 04',
  complete: 'Complete',
}

const DEFAULT_FORM = { type: 'reply' as SignalType, source: '', notes: '', brandId: '', phase: 'test' as const }

const SignalTrackerPage = memo(() => {
  const { user } = useAuth()
  const { brands, signals, addSignal, deleteSignal } = useBrands()

  const userBrands   = brands.filter(b => b.userId === user?.id)
  const allSignals   = signals.filter(s => userBrands.some(b => b.id === s.brandId))

  const [typeFilter,  setTypeFilter]  = useState<SignalType | 'all'>('all')
  const [brandFilter, setBrandFilter] = useState<string>('all')
  const [showForm,    setShowForm]    = useState(false)
  const [form,        setForm]        = useState({ ...DEFAULT_FORM, brandId: userBrands[0]?.id ?? '' })

  const filtered = allSignals
    .filter(s => typeFilter  === 'all' || s.type    === typeFilter)
    .filter(s => brandFilter === 'all' || s.brandId === brandFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const total      = allSignals.length
  const conversions = allSignals.filter(s => s.type === 'conversion').length
  const replies     = allSignals.filter(s => s.type === 'reply').length
  const objections  = allSignals.filter(s => s.type === 'objection').length

  const convRate  = total > 0 ? ((conversions / total) * 100).toFixed(1) : '0'
  const replyRate = total > 0 ? ((replies     / total) * 100).toFixed(1) : '0'

  // Aggregate objections across all brands for pattern detection
  const objectionMap = allSignals
    .filter(s => s.type === 'objection' && s.notes.trim())
    .reduce<Record<string, number>>((acc, s) => {
      acc[s.notes] = (acc[s.notes] ?? 0) + 1
      return acc
    }, {})

  const sortedObjections = Object.entries(objectionMap).sort(([, a], [, b]) => b - a)

  const getBrandName = (id: string) => userBrands.find(b => b.id === id)?.name ?? '—'

  const submit = () => {
    if (!form.source.trim() || !form.brandId) return
    addSignal({
      brandId:  form.brandId,
      type:     form.type,
      source:   form.source.trim(),
      notes:    form.notes.trim(),
      phase:    form.phase,
    })
    setForm({ ...DEFAULT_FORM, brandId: userBrands[0]?.id ?? '' })
    setShowForm(false)
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
                Every reply, conversion, and objection across all brands. Track what matters. Ignore the rest.
              </p>
            </div>
            <button className="btn-primary" onClick={() => setShowForm(v => !v)}>
              <Plus size={16} /> Log signal
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total outreach',   val: total,      sub: 'signals logged' },
              { label: 'Conversions',      val: conversions, sub: `${convRate}% rate` },
              { label: 'Replies',          val: replies,     sub: `${replyRate}% rate` },
              { label: 'Objections',       val: objections,  sub: `${sortedObjections.length} patterns` },
            ].map(({ label, val, sub }) => (
              <div key={label} className="card">
                <p className="font-code text-[38px] text-phantom-lime font-bold leading-none mb-1">{val}</p>
                <p className="font-body text-[12px] text-phantom-text-muted">{label}</p>
                <p className="font-body text-[11px] text-phantom-text-muted opacity-60">{sub}</p>
              </div>
            ))}
          </div>

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
                    <label className="label text-phantom-text-secondary mb-2 block">Signal type</label>
                    <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as SignalType }))}>
                      <option value="reply">Reply</option>
                      <option value="conversion">Conversion</option>
                      <option value="objection">Objection</option>
                      <option value="no_response">No Response</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-phantom-text-secondary mb-2 block">Brand</label>
                    <select className="input" value={form.brandId} onChange={e => setForm(f => ({ ...f, brandId: e.target.value }))}>
                      {userBrands.length === 0
                        ? <option value="">No brands yet</option>
                        : userBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)
                      }
                    </select>
                  </div>
                  <div>
                    <label className="label text-phantom-text-secondary mb-2 block">Phase</label>
                    <select className="input" value={form.phase} onChange={e => setForm(f => ({ ...f, phase: e.target.value as Signal['phase'] }))}>
                      <option value="identify">Phase 01 — Ghost Identity</option>
                      <option value="test">Phase 02 — Silent Test</option>
                      <option value="iterate">Phase 03 — Iteration Loop</option>
                      <option value="lock">Phase 04 — Lock In</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="label text-phantom-text-secondary mb-2 block">Source — where did you reach this person</label>
                    <input className="input" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="e.g. Reddit r/entrepreneur, Twitter DM, cold email" />
                  </div>
                  <div>
                    <label className="label text-phantom-text-secondary mb-2 block">
                      {form.type === 'objection' ? 'Objection — what exactly did they say' : 'Notes'}
                    </label>
                    <textarea
                      className="input"
                      rows={2}
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder={
                        form.type === 'objection'
                          ? '"Too expensive for where I am right now" / "I need to see results first"'
                          : 'What happened, what they said, any relevant context'
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="btn-primary" onClick={submit} disabled={!form.source.trim() || !form.brandId}>
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
            {(['all', 'conversion', 'reply', 'objection', 'no_response'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`font-ui text-[12px] px-3 py-1.5 rounded-full border transition-all duration-150 ${
                  typeFilter === t
                    ? 'border-phantom-lime text-phantom-lime bg-phantom-lime/10'
                    : 'border-phantom-border text-phantom-text-muted hover:border-[#333] hover:text-phantom-text-secondary'
                }`}
              >
                {t === 'all' ? 'All signals' : SIGNAL_LABELS[t]}
              </button>
            ))}
            {userBrands.length > 1 && (
              <select className="input text-[13px] py-1.5 w-auto min-w-[140px] ml-auto" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
                <option value="all">All brands</option>
                {userBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
          </div>

          {/* Signal Table */}
          {filtered.length === 0 ? (
            <div className="card text-center py-16 mb-6">
              <h3 className="font-display font-bold text-[18px] text-phantom-text-primary mb-2">
                No signals logged.
              </h3>
              <p className="font-body text-[14px] text-phantom-text-secondary mb-6">
                Every test starts with a first attempt. Log your outreach and track what converts.
              </p>
              <button className="btn-primary mx-auto" onClick={() => setShowForm(true)}>
                <Plus size={14} /> Log signal
              </button>
            </div>
          ) : (
            <div className="card mb-8 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-phantom-border-subtle">
                    {['Date', 'Brand', 'Phase', 'Type', 'Source', 'Notes', ''].map(col => (
                      <th key={col} className="text-left font-ui text-[11px] text-phantom-text-muted uppercase tracking-wider pb-3 pr-5 font-medium">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id} className="border-b border-phantom-border-subtle/40 hover:bg-[#0d0d0d] transition-colors">
                      <td className="py-3.5 pr-5 font-body text-[12px] text-phantom-text-muted whitespace-nowrap">
                        {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3.5 pr-5 font-body text-[13px] text-phantom-text-secondary max-w-[120px] truncate">
                        {getBrandName(s.brandId)}
                      </td>
                      <td className="py-3.5 pr-5 font-body text-[12px] text-phantom-text-muted whitespace-nowrap">
                        {PHASE_LABELS[s.phase] ?? s.phase}
                      </td>
                      <td className="py-3.5 pr-5">
                        <span className={SIGNAL_BADGE[s.type]}>{SIGNAL_LABELS[s.type]}</span>
                      </td>
                      <td className="py-3.5 pr-5 font-body text-[13px] text-phantom-text-secondary max-w-[160px] truncate">
                        {s.source}
                      </td>
                      <td className="py-3.5 pr-5 font-body text-[13px] text-phantom-text-secondary max-w-[220px] truncate">
                        {s.notes || <span className="text-phantom-text-muted">—</span>}
                      </td>
                      <td className="py-3.5">
                        <button
                          onClick={() => deleteSignal(s.id)}
                          className="text-phantom-text-muted hover:text-phantom-danger transition-colors"
                          aria-label="Delete signal"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Objection Pattern Analysis */}
          {sortedObjections.length > 0 && (
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <p className="label mb-2">Objection Patterns</p>
              <p className="font-body text-[13px] text-phantom-text-muted mb-5">
                Most frequent objections across all brands. These are telling you what to fix.
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
