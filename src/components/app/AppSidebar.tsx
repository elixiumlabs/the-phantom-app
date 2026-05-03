import { memo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Shield, Activity, FileText, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects } from '@/contexts/ProjectContext'

const NAV_MAIN = [
  { label: 'Dashboard',  href: '/dashboard', icon: LayoutDashboard },
]

const NAV_TOOLS = [
  { label: 'Proof Vault',     href: '/vault',      icon: Shield   },
  { label: 'Signal Tracker',  href: '/signals',    icon: Activity },
  { label: 'Templates',       href: '/templates',  icon: FileText },
]

const NAV_ACCOUNT = [
  { label: 'Settings', href: '/settings', icon: Settings },
]

const FREE_LIMITS = {
  active_projects: 1,
  outreach_entries: 30,
  vault_items: 5,
} as const

const AppSidebar = memo(() => {
  const { user, logout } = useAuth()
  const { projects, outreachLog, proofVault } = useProjects()
  const { pathname } = useLocation()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname.startsWith('/project/')
    return pathname === href
  }

  const NavLink = ({ label, href, icon: Icon }: { label: string; href: string; icon: React.ElementType }) => (
    <Link
      to={href}
      className={`nav-item ${isActive(href) ? 'nav-item-active' : ''}`}
    >
      <Icon size={15} />
      <span>{label}</span>
    </Link>
  )

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-[#0d0d0d] border-r border-phantom-border-subtle flex flex-col z-40">

      {/* Logo */}
      <div className="p-6 border-b border-phantom-border-subtle">
        <Link to="/" className="flex items-center gap-2 no-underline mb-5">
          <div className="w-4 h-4 bg-phantom-lime flex-shrink-0" />
          <span className="font-display font-bold text-[16px] text-phantom-text-primary tracking-widest">
            PHANTOM
          </span>
        </Link>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center flex-shrink-0">
            <span className="font-ui text-[13px] text-phantom-lime font-bold">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-[13px] text-phantom-text-primary truncate">{user?.name}</p>
            <span className={`badge text-[9px] mt-0.5 ${user?.plan === 'phantom_pro' ? 'badge-active' : ''}`}>
              {user?.plan === 'phantom_pro' ? 'PRO' : user?.plan === 'phantom' ? 'PHANTOM' : 'FREE'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-4">

        {/* Main */}
        <div className="space-y-0.5">
          {NAV_MAIN.map(item => <NavLink key={item.label} {...item} />)}
        </div>

        {/* Tools */}
        <div>
          <p className="font-ui text-[10px] text-phantom-text-muted uppercase tracking-wider px-4 mb-1.5">
            Quick links
          </p>
          <div className="space-y-0.5">
            {NAV_TOOLS.map(item => <NavLink key={item.label} {...item} />)}
          </div>
        </div>

        {/* Account */}
        <div className="space-y-0.5">
          {NAV_ACCOUNT.map(item => <NavLink key={item.label} {...item} />)}
        </div>

      </nav>

      {/* Upgrade CTA */}
      {user?.plan === 'free' && (
        <div className="p-3 border-t border-phantom-border-subtle">
          <div className="rounded-xl p-3" style={{ background: '#0a1900', border: '1px solid rgba(137,243,54,0.2)' }}>
            <p className="font-body text-[11px] text-phantom-text-muted mb-2 uppercase tracking-wide">
              Free Plan Usage
            </p>
            <div className="space-y-2 mb-3">
              {[
                { label: 'Projects', current: projects.filter(p => p.status === 'active').length, max: FREE_LIMITS.active_projects },
                { label: 'Outreach', current: outreachLog.length, max: FREE_LIMITS.outreach_entries },
                { label: 'Proof', current: proofVault.length, max: FREE_LIMITS.vault_items },
              ].map(({ label, current, max }) => {
                const percentage = (current / max) * 100
                const isAtLimit = current >= max
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-body text-[10px] text-phantom-text-muted">{label}</span>
                      <span className={`font-code text-[10px] font-semibold ${isAtLimit ? 'text-phantom-danger' : 'text-phantom-lime'}`}>
                        {current}/{max}
                      </span>
                    </div>
                    <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${isAtLimit ? 'bg-phantom-danger' : 'bg-phantom-lime'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <Link to="/settings" className="btn-primary w-full text-[12px] py-2 text-center no-underline block">
              Upgrade to PRO
            </Link>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="p-3 border-t border-phantom-border-subtle">
        <button
          onClick={logout}
          className="nav-item w-full justify-start text-phantom-text-muted hover:text-phantom-danger"
        >
          <LogOut size={15} />
          <span>Log out</span>
        </button>
      </div>

    </aside>
  )
})

AppSidebar.displayName = 'AppSidebar'
export default AppSidebar
