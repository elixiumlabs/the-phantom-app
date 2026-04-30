import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut', delay },
})

const HeroSection = memo(() => (
  <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 overflow-hidden">
    {/* Background Image */}
    <div 
      className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
      style={{ backgroundImage: 'url(https://storage.googleapis.com/phantom-app/4K_cinematic_editorial_fashion_photograph_202604291017.jpeg)' }}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-phantom-bg/60 via-phantom-bg/80 to-phantom-bg" />

    {/* Label */}
    <motion.div
      className="liquid-glass-neon flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full relative z-10"
      {...fadeUp(0.05)}
    >
      <div className="w-1.5 h-1.5 rounded-full animate-pulse-dot bg-phantom-lime" />
      <span className="font-ui text-[12px] font-medium uppercase tracking-wider text-phantom-lime">
        Market validation without the audience
      </span>
    </motion.div>

    {/* Headline */}
    <motion.h1
      className="font-display font-bold text-phantom-text-primary max-w-4xl mx-auto mb-6 relative z-10 tracking-normal"
      style={{ fontSize: 'clamp(36px, 7vw, 72px)', lineHeight: 1.05 }}
      {...fadeUp(0.1)}
    >
      Build invisible.<br />
      Launch inevitable.
    </motion.h1>

    {/* Subheadline */}
    <motion.p
      className="font-body text-phantom-text-secondary max-w-[560px] mx-auto mb-10 leading-relaxed relative z-10"
      style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
      {...fadeUp(0.15)}
    >
      Phantom guides you through four phases of silent brand validation — so the first thing the market sees is proof, not potential.
    </motion.p>

    {/* CTAs */}
    <motion.div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-5 relative z-10" {...fadeUp(0.2)}>
      <Link to="/signup" className="btn-primary px-8 py-3 text-[15px]">
        Start building free
      </Link>
      <a href="#how-it-works" className="btn-secondary px-8 py-3 text-[15px]">
        See how it works
      </a>
    </motion.div>

    {/* Fine print */}
    <motion.p className="font-body text-[13px] text-phantom-text-muted relative z-10" {...fadeUp(0.22)}>
      No credit card. No public profile. No noise.
    </motion.p>

  </section>
))

HeroSection.displayName = 'HeroSection'
export default HeroSection
