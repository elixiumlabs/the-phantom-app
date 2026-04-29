import { memo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const AppSidebar = memo(() => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (href: string) => {
    if (href === '/dashboard') return location.pathname === '/dashboard' || location.pathname.startsWith('/brand/')
    return location.pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-[#0d0d0d] border-r border-phantom-border-subtle flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-phantom-border-subtle">
        <Link to="/dashboard" className="flex items-center gap-2 no-underline mb-5">
          <div className="w-4 h-4 bg-phantom-lime flex-shrink-0" />
          <span className="font-display font-bold text-[16px] text-phantom-text-primary">PHANTOM</span>
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
            <span className={`badge text-[9px] ${user?.plan === 'pro' ? 'badge-active' : ''}`}>
              {user?.plan ?? 'free'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={label}
              to={href}
              className={`nav-item ${active ? 'nav-item-active' : ''}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          )
        })}

      </nav>

      {/* Upgrade CTA */}
      {user?.plan === 'free' && (
        <div className="p-3 border-t border-phantom-border-subtle">
          <div className="rounded p-3" style={{ background: '#0a1900', border: '1px solid rgba(137,243,54,0.2)' }}>
            <p className="font-body text-[12px] text-phantom-text-primary mb-2">
              Unlock all 4 phases
            </p>
            <button className="btn-primary w-full text-[12px] py-2">
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="p-3 border-t border-phantom-border-subtle">
        <button
          onClick={logout}
          className="nav-item w-full justify-start text-phantom-text-muted hover:text-phantom-danger gap-3"
        >
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
})

AppSidebar.displayName = 'AppSidebar'
export default AppSidebar
