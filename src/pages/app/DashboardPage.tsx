import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowRight, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects, type Project } from '@/contexts/ProjectContext'
import AppSidebar from '@/components/app/AppSidebar'
import { completeOnboarding, deleteProject, createProject } from '@/lib/functions'
import { useProtection } from '@/hooks'

const PHASE_LABELS: Record<number, string> = {
  1: 'Phase 01 — Ghost Identity',
  2: 'Phase 02 — Silent Test',
  3: 'Phase 03 — Iteration Loop',
  4: 'Phase 04 — Lock In',
}

const ProjectCard = memo(({ project }: { project: Project }) => {
  const navigate = useNavigate()
  const { outreachLog, proofVault } = useProjects()
  const projectOutreach = outreachLog.filter(o => o.project_id === project.id)
  const projectProof = proofVault.filter(p => p.project_id === project.id)
  const conversions = projectOutreach.filter(o => o.converted).length
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await deleteProject({ project_id: project.id })
    } catch (err) {
      alert('Failed to delete project: ' + (err as Error).message)
      setDeleting(false)
    }
  }

  return (
    <div
      className="card card-interactive cursor-pointer relative group"
      onClick={() => navigate(`/project/${project.id}/identify`)}
    >
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-phantom-danger/10 rounded text-phantom-text-muted hover:text-phantom-danger"
        aria-label="Delete project"
      >
        <Trash2 size={13} />
      </button>

      <div className="flex items-start justify-between mb-4 gap-3 pr-8">
        <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary leading-tight">
          {project.name}
        </h3>
        <span className="badge badge-active text-[9px] shrink-0 mt-0.5">
          {PHASE_LABELS[project.current_phase]}
        </span>
      </div>

      {/* Phase progress segments */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4].map((phase) => {
          const filled = project[`phase_${phase}_completed` as keyof Project] === true
          const active = phase === project.current_phase
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
          { label: 'Outreach', val: projectOutreach.length },
          { label: 'Conversions', val: conversions },
          { label: 'Proof', val: projectProof.length },
        ].map(({ label, val }) => (
          <div key={label}>
            <p className="font-code text-[22px] text-phantom-lime font-bold leading-none">{val}</p>
            <p className="font-body text-[11px] text-phantom-text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="font-body text-[11px] text-phantom-text-muted">
          Updated {new Date(project.updated_at).toLocaleDateString()}
        </span>
        <button className="btn-ghost text-[13px] py-1 px-2">
          Continue <ArrowRight size={12} />
        </button>
      </div>
    </div>
  )
})
ProjectCard.displayName = 'ProjectCard'

// Onboarding Modal
const OnboardingModal = memo(({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const [form, setForm] = useState({
    what_building: '',
    project_name: '',
  })

  const handleSubmit = async () => {
    if (!form.what_building.trim()) {
      setError('Please describe what you are building')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await createProject({
        name: form.project_name.trim() || form.what_building.slice(0, 60),
        initial_problem: form.what_building.trim(),
      })
      navigate(`/project/${result.project_id}/identify`)
      onClose()
    } catch (err) {
      const msg = (err as Error).message
      // Handle free plan limit gracefully
      if (/limit/i.test(msg) || /upgrade/i.test(msg)) {
        setError('Free plan allows 1 active project. Archive or delete your existing project to create a new one, or upgrade to PRO.')
      } else {
        setError(msg)
      }
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="card max-w-lg w-full"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <p className="label text-phantom-lime mb-2">New Project</p>
          <h2 className="font-display font-bold text-[24px] text-phantom-text-primary">
            {step === 1 ? 'What are you building?' : 'Name your project'}
          </h2>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="font-body text-[14px] text-phantom-text-secondary">
              Describe what you are building in 1-2 sentences. This will be refined in Phase 01.
            </p>
            <textarea
              className="input min-h-[120px]"
              value={form.what_building}
              onChange={(e) => setForm({ ...form, what_building: e.target.value })}
              placeholder="e.g. A short course that helps neurodivergent freelancers price their work without negotiating against themselves."
              autoFocus
            />
            <button
              className="btn-primary w-full"
              onClick={() => setStep(2)}
              disabled={!form.what_building.trim()}
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="font-body text-[14px] text-phantom-text-secondary">
              Give your project a working name. You can change this later.
            </p>
            <input
              className="input"
              value={form.project_name}
              onChange={(e) => setForm({ ...form, project_name: e.target.value })}
              placeholder="Leave blank to auto-generate from description"
            />
            {error && (
              <div className="bg-phantom-danger/10 border border-phantom-danger/30 rounded p-3">
                <p className="font-body text-[13px] text-phantom-danger">{error}</p>
              </div>
            )}
            <div className="flex gap-2">
              <button className="btn-ghost flex-1" onClick={() => setStep(1)} disabled={loading}>
                Back
              </button>
              <button className="btn-primary flex-1" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating project...' : 'Create project'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
})
OnboardingModal.displayName = 'OnboardingModal'

const DashboardPage = memo(() => {
  const { user } = useAuth()
  const { projects, outreachLog, loading } = useProjects()
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Enable protection for authenticated dashboard
  useProtection({ disableRightClick: true, monitorCopy: true })

  const userProjects = projects.filter(p => p.user_id === user?.id)
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
              Here is where your projects stand.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowOnboarding(true)}>
            <Plus size={16} /> New project
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
            { label: 'Total projects', val: userProjects.length, sub: 'projects' },
            {
              label: 'In phantom phase',
              val: userProjects.filter(p => p.status === 'active').length,
              sub: 'active',
            },
            {
              label: 'Ready to surface',
              val: userProjects.filter(p => p.ready_to_surface).length,
              sub: 'passed lock-in',
            },
            {
              label: 'Outreach tracked',
              val: outreachLog.filter(o => userProjects.some(p => p.id === o.project_id)).length,
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

        {/* Projects */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-[20px] text-phantom-text-primary">
              Active Projects
            </h2>
            {userProjects.length > 3 && (
              <span className="font-body text-[13px] text-phantom-text-muted">
                {userProjects.length} projects
              </span>
            )}
          </div>

          {loading ? (
            <div className="card text-center py-16">
              <span className="label text-phantom-lime">Loading projects...</span>
            </div>
          ) : userProjects.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-12 h-12 rounded mx-auto mb-4 flex items-center justify-center bg-[#0a1900] border border-phantom-lime/30">
                <Plus size={20} className="text-phantom-lime" />
              </div>
              <h3 className="font-display font-bold text-[18px] text-phantom-text-primary mb-2">
                Nothing here yet.
              </h3>
              <p className="font-body text-[14px] text-phantom-text-secondary mb-6">
                Your first phantom project is one decision away.
              </p>
              <button className="btn-primary mx-auto" onClick={() => setShowOnboarding(true)}>
                <Plus size={14} /> Create project
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {userProjects.map(p => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <AnimatePresence>
        {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      </AnimatePresence>
    </div>
  )
})

DashboardPage.displayName = 'DashboardPage'
export default DashboardPage
