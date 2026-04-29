import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut', delay },
})

const HeroSection = memo(() => (
  <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 noise-grain overflow-hidden">

    {/* Label */}
    <motion.div
      className="liquid-glass-neon flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full"
      {...fadeUp(0.05)}
    >
      <div className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: '#00FF88' }} />
      <span className="font-ui text-[12px] font-medium uppercase tracking-wider" style={{ color: '#00FF88' }}>
        Market validation without the audience
      </span>
    </motion.div>

    {/* Headline */}
    <motion.h1
      className="font-display font-bold text-phantom-text-primary max-w-4xl mx-auto mb-6"
      style={{ fontSize: 'clamp(36px, 7vw, 72px)', lineHeight: 1.05 }}
      {...fadeUp(0.1)}
    >
      Build invisible.<br />
      Launch inevitable.
    </motion.h1>

    {/* Subheadline */}
    <motion.p
      className="font-body text-phantom-text-secondary max-w-[560px] mx-auto mb-10 leading-relaxed"
      style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
      {...fadeUp(0.15)}
    >
      Phantom guides you through four phases of silent brand validation — so the first thing the market sees is proof, not potential.
    </motion.p>

    {/* CTAs */}
    <motion.div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-5" {...fadeUp(0.2)}>
      <Link to="/signup" className="btn-primary px-8 py-3 text-[15px]">
        Start building free
      </Link>
      <a href="#how-it-works" className="btn-secondary px-8 py-3 text-[15px]">
        See how it works
      </a>
    </motion.div>

    {/* Fine print */}
    <motion.p className="font-body text-[13px] text-phantom-text-muted mb-20" {...fadeUp(0.22)}>
      No credit card. No public profile. No noise.
    </motion.p>

    {/* Dashboard mockup */}
    <motion.div
      className="w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
    >
      <div
        className="bg-phantom-surface rounded overflow-hidden"
        style={{ border: '1px solid #1e1e1e' }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-phantom-border-subtle bg-[#0d0d0d]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#3a3a3a]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#3a3a3a]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#3a3a3a]" />
          <span className="font-body text-[11px] text-phantom-text-muted ml-2 opacity-50">
            phantom.app/brand/stealth-co/identify
          </span>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="label mb-1">Brand Workspace</p>
              <h3 className="font-display font-semibold text-[20px] text-phantom-text-primary">Stealth Co.</h3>
            </div>
            <span className="badge badge-active">Phase 02 Active</span>
          </div>

          {/* Phase progress */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Ghost Identity', pct: 100 },
              { label: 'Silent Test', pct: 60 },
              { label: 'Iteration Loop', pct: 0 },
              { label: 'Lock In', pct: 0 },
            ].map(({ label, pct }, i) => (
              <div key={label} className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-3">
                <p className="font-code text-[10px] text-phantom-lime mb-1">0{i + 1}</p>
                <p className="font-body text-[11px] text-phantom-text-secondary">{label}</p>
                <div className="progress-track mt-2">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Outreach', value: '48' },
              { label: 'Conversions', value: '9' },
              { label: 'Proof items', value: '5' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#0d0d0d] border border-phantom-border-subtle rounded p-4 text-center">
                <p className="font-code font-bold text-[28px] text-phantom-lime leading-none mb-1">{value}</p>
                <p className="label text-[10px]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  </section>
))

HeroSection.displayName = 'HeroSection'
export default HeroSection
