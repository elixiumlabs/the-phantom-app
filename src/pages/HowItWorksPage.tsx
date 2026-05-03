import { memo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import NavigationDock from '@/components/NavigationDock'
import FooterSection from '@/components/FooterSection'
import PhaseFlipCard from '@/components/PhaseFlipCard'

const PHASES = [
  {
    number: '01',
    title: 'Ghost Identity',
    subtitle: 'Define the problem and the working hypothesis. Nothing public yet.',
    description: 'Map the audience, the problem, and your unfair advantages. Build a working brand hypothesis that exists only inside Phantom.',
    features: [
      'Problem statement refiner',
      'Unfair advantage extractor',
      'Hypothesis positioning',
      'Audience language',
    ],
    badge: 'Start here',
  },
  {
    number: '02',
    title: 'Silent Test',
    subtitle: 'Present the minimum offer where the problem already lives.',
    description: 'Build the smallest version of the offer. Test it in real rooms. Track replies, conversions, and objections — ignore everything else.',
    features: [
      'Minimum offer builder',
      'Where-to-test finder',
      'Outreach generator',
      'Conversion tracker',
    ],
    badge: 'Validates demand',
  },
  {
    number: '03',
    title: 'Iteration Loop',
    subtitle: 'Fix what the data tells you. One variable at a time.',
    description: 'Diagnose what is failing. Change one variable. Document the result. No public pivots, no audience to manage — just market signal.',
    features: [
      'Offer diagnosis',
      'Single-variable suggester',
      'Iteration version log',
      'Objection response library',
    ],
    badge: 'Builds proof',
  },
  {
    number: '04',
    title: 'Lock In',
    subtitle: 'Repeatable conversions. Validated messaging. Surface with leverage.',
    description: 'Lock in positioning built from buyer language, not preference. Assemble the proof package. Export the brand guide. Now you go live.',
    features: [
      'Positioning from data',
      'Brand identity recommender',
      'Proof package curator',
      'Lock-in PDF export',
    ],
    badge: 'Go live',
  },
]

const HowItWorksPage = memo(() => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div className="relative min-h-screen bg-phantom-black">
      <NavigationDock />

      <main className="pt-24 pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <p className="label text-phantom-lime mb-4">The four phases</p>
            <h1 className="font-display font-bold text-[48px] md:text-[56px] text-phantom-text-primary leading-tight mb-6">
              From ghost to live.<br />
              In the right order.
            </h1>
            <p className="font-body text-[18px] text-phantom-text-secondary max-w-2xl mx-auto">
              Phantom guides you through four phases — from hypothesis to validated brand. Each phase unlocks when the previous one is complete.
            </p>
          </motion.div>

          {/* Phases */}
          <div ref={ref} className="mb-20">
            <motion.p
              className="font-body text-[15px] text-phantom-text-secondary text-center mb-12"
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            >
              Hover any phase to see the apps inside it.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PHASES.map((phase, i) => (
                <motion.div
                  key={phase.number}
                  initial={{ opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 + i * 0.08 }}
                >
                  <PhaseFlipCard {...phase} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Why this order */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.5 }}
          >
            <div className="card bg-phantom-surface-dark border-phantom-lime/20 max-w-3xl mx-auto">
              <h2 className="font-display font-bold text-[28px] text-phantom-text-primary mb-4">
                Why this order matters
              </h2>
              <div className="space-y-4 font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                <p>
                  Most founders build backwards. They pick a name, design a logo, write positioning, build the product — then try to find buyers.
                </p>
                <p>
                  Phantom reverses that. You start with the problem and the people who have it. You test the offer before you build it. You iterate in private until the data tells you it works.
                </p>
                <p>
                  Only then — when you have proof, validated messaging, and repeatable conversions — do you lock in the brand and go public.
                </p>
                <p className="text-phantom-lime font-medium">
                  The result: You launch with leverage, not hope.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.6 }}
          >
            <div className="card bg-phantom-surface-dark border-phantom-lime/20 max-w-3xl mx-auto">
              <h2 className="font-display font-bold text-[36px] text-phantom-text-primary mb-4">
                Ready to start?
              </h2>
              <p className="font-body text-[16px] text-phantom-text-secondary mb-8 max-w-xl mx-auto">
                Phase 1 is free. No credit card required. Start building your ghost identity today.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link to="/signup" className="btn-primary">
                  Start Phase 1 free
                </Link>
                <Link to="/features" className="btn-secondary">
                  See all features
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
})

HowItWorksPage.displayName = 'HowItWorksPage'
export default HowItWorksPage
