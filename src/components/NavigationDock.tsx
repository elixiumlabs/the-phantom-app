import { memo, useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

const NAV_LINKS = [
  { label: 'Features', href: '/features' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
]

const NavigationDock = memo(() => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()
  const dashHref = user
    ? (user.onboardingCompleted ? '/dashboard' : '/onboarding')
    : null

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isActive = (href: string) => {
    if (href.startsWith('/')) return location.pathname === href
    return false
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 lg:px-24 xl:px-40 py-4 flex items-center justify-between transition-all duration-300"
      style={{
        background: scrolled || menuOpen ? 'rgba(10,10,10,0.85)' : 'transparent',
        backdropFilter: scrolled || menuOpen ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid #1a1a1a' : '1px solid transparent',
      }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 no-underline z-10">
        <div className="w-4 h-4 bg-phantom-lime flex-shrink-0" />
        <span className="font-display font-bold text-[18px] tracking-tight text-phantom-text-primary">
          PHANTOM
        </span>
      </Link>

      {/* Desktop pill nav */}
      <div className="hidden md:flex items-center bg-phantom-surface/60 border border-phantom-border-subtle rounded-full px-1 py-1 gap-1 backdrop-blur-md">
        {NAV_LINKS.map(({ label, href }) => {
          const active = isActive(href)
          const className = `font-body px-4 py-1.5 rounded-full text-sm transition-all no-underline ${
            active
              ? 'bg-phantom-surface border border-phantom-border text-phantom-text-primary font-medium'
              : 'text-phantom-text-secondary hover:text-phantom-text-primary'
          }`
          return href.startsWith('/') ? (
            <Link key={label} to={href} className={className}>{label}</Link>
          ) : (
            <a key={label} href={href} className={className}>{label}</a>
          )
        })}
      </div>

      {/* Desktop CTA */}
      <div className="hidden md:flex items-center gap-3 z-10">
        {user && dashHref ? (
          <Link
            to={dashHref}
            className="flex items-center gap-2 bg-gradient-to-r from-phantom-lime to-[#5fc91f] text-phantom-black hover:opacity-90 text-sm font-semibold pl-4 pr-2 py-1.5 rounded-full transition-opacity no-underline"
            aria-label={user.onboardingCompleted ? 'Open dashboard' : 'Finish setup'}
            title={user.email}
          >
            {user.onboardingCompleted ? 'Dashboard' : 'Finish setup'}
            <span className="size-7 rounded-full bg-phantom-black flex items-center justify-center text-phantom-lime font-display font-bold text-[12px] uppercase">
              {(user.name || user.email || '?').trim().charAt(0)}
            </span>
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              className="font-body text-sm text-phantom-text-secondary hover:text-phantom-text-primary transition-colors no-underline px-3"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-2.5 bg-gradient-to-r from-phantom-lime to-[#5fc91f] text-phantom-black hover:opacity-90 text-sm font-semibold pl-5 pr-2 py-2 rounded-full transition-opacity no-underline"
            >
              Start free
              <span className="size-7 rounded-full bg-phantom-black flex items-center justify-center">
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.6 4.602h10m-4-4 4 4-4 4" stroke="#89F336" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(v => !v)}
        className="md:hidden flex flex-col gap-1.5 cursor-pointer bg-transparent border-0 p-1 z-10"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      >
        <span className={`block w-6 h-0.5 bg-phantom-text-primary transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-6 h-0.5 bg-phantom-text-primary transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-0.5 bg-phantom-text-primary transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 w-full bg-phantom-black/95 backdrop-blur-xl border-t border-phantom-border-subtle flex flex-col p-5 gap-1 md:hidden z-50"
          >
            {NAV_LINKS.map(({ label, href }) => {
              const active = isActive(href)
              const className = `font-body px-4 py-3 rounded-lg text-[15px] no-underline transition-colors ${
                active
                  ? 'bg-phantom-surface font-medium text-phantom-text-primary'
                  : 'text-phantom-text-secondary hover:bg-phantom-surface hover:text-phantom-text-primary'
              }`
              return href.startsWith('/') ? (
                <Link key={label} to={href} className={className} onClick={() => setMenuOpen(false)}>{label}</Link>
              ) : (
                <a key={label} href={href} className={className} onClick={() => setMenuOpen(false)}>{label}</a>
              )
            })}
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-phantom-border-subtle">
              {user && dashHref ? (
                <>
                  <span className="font-body text-[12px] text-phantom-text-muted px-4 py-1">
                    Signed in as {user.email}
                  </span>
                  <Link
                    to={dashHref}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-phantom-lime to-[#5fc91f] text-phantom-black text-sm font-semibold px-5 py-2.5 rounded-full no-underline w-fit"
                  >
                    {user.onboardingCompleted ? 'Open dashboard' : 'Finish setup'}
                    <span className="size-7 rounded-full bg-phantom-black flex items-center justify-center">
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M.6 4.602h10m-4-4 4 4-4 4" stroke="#89F336" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="font-body text-sm text-phantom-text-secondary hover:text-phantom-text-primary transition-colors no-underline px-4 py-2"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-phantom-lime to-[#5fc91f] text-phantom-black text-sm font-semibold px-5 py-2.5 rounded-full no-underline w-fit"
                  >
                    Start free
                    <span className="size-7 rounded-full bg-phantom-black flex items-center justify-center">
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M.6 4.602h10m-4-4 4 4-4 4" stroke="#89F336" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
})

NavigationDock.displayName = 'NavigationDock'
export default NavigationDock
