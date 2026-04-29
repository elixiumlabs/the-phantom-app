import { memo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Changelog', href: '#changelog' },
]

const NavigationDock = memo(() => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(10,10,10,0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid #1a1a1a' : 'none',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline z-10">
          <div className="w-4 h-4 bg-phantom-lime flex-shrink-0" />
          <span className="font-display font-bold text-[18px] text-phantom-text-primary">PHANTOM</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="font-body text-[14px] text-phantom-text-secondary hover:text-phantom-text-primary px-4 py-2 transition-colors duration-150 no-underline"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden sm:flex items-center gap-3 z-10">
          <Link to="/login" className="btn-ghost">Log in</Link>
          <Link to="/signup" className="btn-primary">Start free</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-phantom-text-secondary hover:text-phantom-text-primary transition-colors z-10"
          onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#0d0d0d] border-l border-phantom-border-subtle flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-phantom-border-subtle">
                <span className="font-display font-bold text-[16px] text-phantom-text-primary">PHANTOM</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-phantom-text-secondary hover:text-phantom-text-primary transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1">
                {NAV_LINKS.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="block font-body text-[15px] text-phantom-text-secondary hover:text-phantom-text-primary px-4 py-3 rounded transition-colors no-underline"
                  >
                    {label}
                  </a>
                ))}
              </nav>

              <div className="px-4 pb-8 space-y-3 border-t border-phantom-border-subtle pt-6">
                <Link
                  to="/login"
                  className="btn-secondary w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  Start free
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
})

NavigationDock.displayName = 'NavigationDock'
export default NavigationDock
