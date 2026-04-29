import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import AppSidebar from '@/components/app/AppSidebar'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="font-display font-bold text-[18px] text-phantom-text-primary mb-5">{title}</h2>
    <div className="card">{children}</div>
  </div>
)

const SettingsPage = memo(() => {
  const { user, logout } = useAuth()

  const [name, setName] = useState(user?.name ?? '')
  const [email] = useState(user?.email ?? '')
  const [saved, setSaved] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)

  const [notifySignals, setNotifySignals] = useState(true)
  const [notifyPhase, setNotifyPhase] = useState(true)
  const [notifyProduct, setNotifyProduct] = useState(false)

  const saveName = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const savePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters.'); return }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return }
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
    setPwSaved(true)
    setTimeout(() => setPwSaved(false), 2500)
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
          <h1 className="font-display font-bold text-[28px] text-phantom-text-primary mb-1">Settings</h1>
          <p className="font-body text-[14px] text-phantom-text-secondary mb-10">
            Manage your account and preferences.
          </p>

          {/* Profile */}
          <Section title="Profile">
            <form onSubmit={saveName} className="flex flex-col gap-4">
              <div>
                <label className="label text-phantom-text-secondary mb-2 block">Full name</label>
                <input
                  className="input max-w-sm"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="label text-phantom-text-secondary mb-2 block">Email</label>
                <input
                  className="input max-w-sm opacity-50 cursor-not-allowed"
                  type="email"
                  value={email}
                  disabled
                  readOnly
                />
                <p className="font-body text-[12px] text-phantom-text-muted mt-1.5">
                  Email cannot be changed.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" className="btn-primary">Save changes</button>
                {saved && (
                  <span className="font-body text-[13px] text-phantom-lime">Saved.</span>
                )}
              </div>
            </form>
          </Section>

          {/* Password */}
          <Section title="Password">
            <form onSubmit={savePassword} className="flex flex-col gap-4 max-w-sm">
              <div>
                <label className="label text-phantom-text-secondary mb-2 block">Current password</label>
                <input
                  className="input"
                  type="password"
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="label text-phantom-text-secondary mb-2 block">New password</label>
                <input
                  className="input"
                  type="password"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="label text-phantom-text-secondary mb-2 block">Confirm new password</label>
                <input
                  className="input"
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {pwError && (
                <p className="font-body text-[13px] text-phantom-danger">{pwError}</p>
              )}
              <div className="flex items-center gap-3">
                <button type="submit" className="btn-primary">Update password</button>
                {pwSaved && (
                  <span className="font-body text-[13px] text-phantom-lime">Updated.</span>
                )}
              </div>
            </form>
          </Section>

          {/* Notifications */}
          <Section title="Notifications">
            <div className="flex flex-col gap-5">
              {[
                { label: 'Signal tracker milestones', sub: 'Get notified when you hit 10, 25, or 50 signals.', val: notifySignals, set: setNotifySignals },
                { label: 'Phase completion reminders', sub: 'Remind me when all phase conditions are met.', val: notifyPhase, set: setNotifyPhase },
                { label: 'Product updates', sub: 'New features and platform announcements.', val: notifyProduct, set: setNotifyProduct },
              ].map(({ label, sub, val, set }) => (
                <div key={label} className="flex items-start justify-between gap-6">
                  <div>
                    <p className="font-body text-[14px] text-phantom-text-primary mb-0.5">{label}</p>
                    <p className="font-body text-[12px] text-phantom-text-muted">{sub}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set(v => !v)}
                    className="shrink-0 mt-0.5 w-10 h-5.5 rounded-full transition-all duration-200 relative"
                    style={{
                      background: val ? '#89F336' : '#222',
                      width: 40,
                      height: 22,
                    }}
                    aria-pressed={val}
                  >
                    <span
                      className="absolute top-0.5 rounded-full transition-all duration-200"
                      style={{
                        width: 18,
                        height: 18,
                        background: val ? '#0a0a0a' : '#555',
                        left: val ? 20 : 2,
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Section>

          {/* Plan */}
          <Section title="Plan">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-[14px] text-phantom-text-primary mb-0.5">
                  Phantom Free
                </p>
                <p className="font-body text-[12px] text-phantom-text-muted">
                  1 brand · Phase 1 & 2 · Limited signals
                </p>
              </div>
              <a href="#pricing" className="btn-primary text-sm">
                Upgrade to Pro
              </a>
            </div>
          </Section>

          {/* Danger zone */}
          <Section title="Danger zone">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-[14px] text-phantom-text-primary mb-0.5">Sign out</p>
                  <p className="font-body text-[12px] text-phantom-text-muted">Sign out of your account on this device.</p>
                </div>
                <button type="button" className="btn-secondary" onClick={logout}>
                  Sign out
                </button>
              </div>
              <div className="divider" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-[14px] text-phantom-danger mb-0.5">Delete account</p>
                  <p className="font-body text-[12px] text-phantom-text-muted">Permanently delete your account and all brand data. This cannot be undone.</p>
                </div>
                <button type="button" className="btn-danger shrink-0">
                  Delete account
                </button>
              </div>
            </div>
          </Section>
        </motion.div>
      </main>
    </div>
  )
})

SettingsPage.displayName = 'SettingsPage'
export default SettingsPage
