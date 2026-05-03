import { memo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
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
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="relative min-h-screen bg-phantom-black">
      <NavigationDock />

      <main className="relative">
        {/* Hero - 2 Split with Background */}
        <div className="relative pt-32 pb-32 px-6">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: 'url(https://storage.googleapis.com/phantom-app/4K_ultra-wide_editorial_fashion_photograph_202605031225.jpeg)',
              backgroundColor: '#000000'
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-phantom-black/70 via-30% via-phantom-black/75 via-60% via-phantom-black/90 to-phantom-black" />
          
          <div className="relative z-10 max-w-7xl mx-auto mb-32">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left - Content */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="mt-20"
              >
                <p className="label text-phantom-lime mb-6">The four phases</p>
                <h1 className="font-display font-bold text-[48px] md:text-[64px] text-phantom-text-primary leading-[1.1] mb-8">
                  From ghost to live.<br />
                  In the right order.
                </h1>
                <p className="font-body text-[18px] text-phantom-text-secondary leading-[1.7] mb-10">
                  Phantom guides you through four phases — from hypothesis to validated brand. Each phase unlocks when the previous one is complete.
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <Link to="/signup" className="btn-primary">
                    Start Phase 1 free
                  </Link>
                  <Link to="/pricing" className="btn-secondary">
                    See pricing
                  </Link>
                </div>
              </motion.div>


            </div>
          </div>
        </div>

        {/* Rest of content */}
        <div className="px-6 pb-32">
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
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Left - Image Placeholder */}
                <div 
                  className="aspect-square rounded-2xl bg-phantom-surface-dark border border-phantom-lime/20 bg-cover bg-center"
                  style={{ backgroundImage: 'url(https://storage.googleapis.com/phantom-app/4K_ultra-wide_cinematic_editorial_SaaS_202605031303.jpeg)' }}
                />
                
                {/* Right - Content */}
                <div className="card bg-phantom-surface-dark border-phantom-lime/20">
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
              </div>
            </div>
          </motion.div>

          {/* Phase Transitions */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.6 }}
          >
            <h2 className="font-display font-bold text-[32px] text-phantom-text-primary text-center mb-12">
              How phases unlock
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="card bg-phantom-surface-dark border-phantom-lime/10">
                <div className="text-phantom-lime font-mono text-[13px] mb-3">Phase 1 → 2</div>
                <h3 className="font-display font-bold text-[20px] text-phantom-text-primary mb-2">
                  Hypothesis complete
                </h3>
                <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">
                  You've defined the problem, audience, and positioning hypothesis. Now you're ready to test if anyone actually wants it.
                </p>
              </div>
              <div className="card bg-phantom-surface-dark border-phantom-lime/10">
                <div className="text-phantom-lime font-mono text-[13px] mb-3">Phase 2 → 3</div>
                <h3 className="font-display font-bold text-[20px] text-phantom-text-primary mb-2">
                  First signal received
                </h3>
                <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">
                  You've run your first tests and collected data. Now you iterate on what's not working until conversions become repeatable.
                </p>
              </div>
              <div className="card bg-phantom-surface-dark border-phantom-lime/10">
                <div className="text-phantom-lime font-mono text-[13px] mb-3">Phase 3 → 4</div>
                <h3 className="font-display font-bold text-[20px] text-phantom-text-primary mb-2">
                  Validation achieved
                </h3>
                <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">
                  You have repeatable conversions and validated messaging. Now you lock in the brand identity and prepare to go public.
                </p>
              </div>
            </div>
          </motion.div>

          {/* The Phantom Method */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.7 }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display font-bold text-[32px] text-phantom-text-primary text-center mb-12">
                The Phantom Method
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-phantom-surface-dark border-phantom-lime/10">
                  <div className="w-10 h-10 rounded-full bg-phantom-lime/10 flex items-center justify-center mb-4">
                    <span className="text-phantom-lime text-[20px]">🎯</span>
                  </div>
                  <h3 className="font-display font-bold text-[20px] text-phantom-text-primary mb-2">
                    Problem-first, not product-first
                  </h3>
                  <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">
                    Start with the problem and the people who have it. Your offer is the solution to a validated pain point, not a feature list looking for buyers.
                  </p>
                </div>
                <div className="card bg-phantom-surface-dark border-phantom-lime/10">
                  <div className="w-10 h-10 rounded-full bg-phantom-lime/10 flex items-center justify-center mb-4">
                    <span className="text-phantom-lime text-[20px]">🔬</span>
                  </div>
                  <h3 className="font-display font-bold text-[20px] text-phantom-text-primary mb-2">
                    Test before you build
                  </h3>
                  <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">
                    Validate demand with the minimum viable offer. Get real market signal before investing months in development or branding.
                  </p>
                </div>
                <div className="card bg-phantom-surface-dark border-phantom-lime/10">
                  <div className="w-10 h-10 rounded-full bg-phantom-lime/10 flex items-center justify-center mb-4">
                    <span className="text-phantom-lime text-[20px]">🔁</span>
                  </div>
                  <h3 className="font-display font-bold text-[20px] text-phantom-text-primary mb-2">
                    Iterate in private
                  </h3>
                  <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">
                    Fix what's broken without public pivots or audience confusion. Change one variable at a time until the data tells you it works.
                  </p>
                </div>
                <div className="card bg-phantom-surface-dark border-phantom-lime/10">
                  <div className="w-10 h-10 rounded-full bg-phantom-lime/10 flex items-center justify-center mb-4">
                    <span className="text-phantom-lime text-[20px]">🚀</span>
                  </div>
                  <h3 className="font-display font-bold text-[20px] text-phantom-text-primary mb-2">
                    Launch with proof
                  </h3>
                  <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">
                    Go public only when you have validated messaging, repeatable conversions, and buyer language. Launch with leverage, not hope.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Common Mistakes */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.8 }}
          >
            <div className="card bg-phantom-surface-dark border-red-500/20 max-w-3xl mx-auto">
              <h2 className="font-display font-bold text-[28px] text-phantom-text-primary mb-6">
                What NOT to do
              </h2>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="text-red-500 text-[20px] flex-shrink-0">✕</div>
                  <div>
                    <h3 className="font-display font-bold text-[16px] text-phantom-text-primary mb-1">
                      Don't skip to branding
                    </h3>
                    <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">
                      Picking a name and logo before validating demand is building on sand. Brand comes last, after you know what works.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-red-500 text-[20px] flex-shrink-0">✕</div>
                  <div>
                    <h3 className="font-display font-bold text-[16px] text-phantom-text-primary mb-1">
                      Don't test multiple variables at once
                    </h3>
                    <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">
                      If you change your offer, messaging, and audience simultaneously, you won't know what caused the result. One variable at a time.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-red-500 text-[20px] flex-shrink-0">✕</div>
                  <div>
                    <h3 className="font-display font-bold text-[16px] text-phantom-text-primary mb-1">
                      Don't pivot publicly
                    </h3>
                    <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">
                      Public pivots confuse your audience and kill momentum. Stay in ghost mode until you have repeatable conversions.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-red-500 text-[20px] flex-shrink-0">✕</div>
                  <div>
                    <h3 className="font-display font-bold text-[16px] text-phantom-text-primary mb-1">
                      Don't ignore objections
                    </h3>
                    <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">
                      Every "no" contains signal. Track objections, diagnose the root cause, and iterate until they disappear.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Success Metrics */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.9 }}
          >
            <h2 className="font-display font-bold text-[32px] text-phantom-text-primary text-center mb-12">
              What success looks like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <div className="card bg-phantom-surface-dark border-phantom-lime/10">
                <div className="font-mono text-[13px] text-phantom-lime mb-3">Phase 1 Success</div>
                <h3 className="font-display font-bold text-[20px] text-phantom-text-primary mb-3">
                  Clear hypothesis
                </h3>
                <ul className="space-y-2 font-body text-[14px] text-phantom-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-phantom-lime flex-shrink-0">→</span>
                    <span>Specific problem statement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-phantom-lime flex-shrink-0">→</span>
                    <span>Defined target audience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-phantom-lime flex-shrink-0">→</span>
                    <span>Documented unfair advantages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-phantom-lime flex-shrink-0">→</span>
                    <span>Working positioning hypothesis</span>
                  </li>
                </ul>
              </div>
              <div className="card bg-phantom-surface-dark border-phantom-lime/10">
                <div className="font-mono text-[13px] text-phantom-lime mb-3">Phase 2 Success</div>
                <h3 className="font-display font-bold text-[20px] text-phantom-text-primary mb-3">
                  Market signal
                </h3>
                <ul className="space-y-2 font-body text-[14px] text-phantom-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-phantom-lime flex-shrink-0">→</span>
                    <span>Minimum offer tested in real rooms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-phantom-lime flex-shrink-0">→</span>
                    <span>Reply rate and conversion data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-phantom-lime flex-shrink-0">→</span>
                    <span>Documented objections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-phantom-lime flex-shrink-0">→</span>
                    <span>Clear diagnosis of what's failing</span>
                  </li>
                </ul>
              </div>
              <div className="card bg-phantom-surface-dark border-phantom-lime/10">
                <div className="font-mono text-[13px] text-phantom-lime mb-3">Phase 3 Success</div>
                <h3 className="font-display font-bold text-[20px] text-phantom-text-primary mb-3">
                  Repeatable conversions
                </h3>
                <ul className="space-y-2 font-body text-[14px] text-phantom-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-phantom-lime flex-shrink-0">→</span>
                    <span>Consistent conversion rate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-phantom-lime flex-shrink-0">→</span>
                    <span>Validated messaging that works</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-phantom-lime flex-shrink-0">→</span>
                    <span>Iteration log showing improvement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-phantom-lime flex-shrink-0">→</span>
                    <span>Objections resolved or minimized</span>
                  </li>
                </ul>
              </div>
              <div className="card bg-phantom-surface-dark border-phantom-lime/10">
                <div className="font-mono text-[13px] text-phantom-lime mb-3">Phase 4 Success</div>
                <h3 className="font-display font-bold text-[20px] text-phantom-text-primary mb-3">
                  Launch-ready brand
                </h3>
                <ul className="space-y-2 font-body text-[14px] text-phantom-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-phantom-lime flex-shrink-0">→</span>
                    <span>Positioning built from buyer language</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-phantom-lime flex-shrink-0">→</span>
                    <span>Brand identity recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-phantom-lime flex-shrink-0">→</span>
                    <span>Proof package with testimonials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-phantom-lime flex-shrink-0">→</span>
                    <span>Exportable brand guide</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 1.0 }}
          >
            <h2 className="font-display font-bold text-[32px] text-phantom-text-primary text-center mb-12">
              Common questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {[
                {
                  q: 'How long does each phase take?',
                  a: "It depends on your testing velocity. Phase 1 can be done in a day. Phase 2 takes as long as your first test cycle (usually 1-2 weeks). Phase 3 is iterative — it ends when you have repeatable conversions. Phase 4 is fast once you have the data.",
                },
                {
                  q: 'Can I skip a phase?',
                  a: "No. Each phase builds on the previous one. Skipping ahead means you're building without validation — which is exactly what Phantom is designed to prevent.",
                },
                {
                  q: 'What if my hypothesis is wrong?',
                  a: "That's the point. Phase 2 and 3 exist to catch that. If your hypothesis fails, you iterate in private until you find what works — without burning your reputation or audience.",
                },
                {
                  q: 'Do I need to build the full product first?',
                  a: 'No. Phase 2 is about testing the minimum viable offer — a landing page, a Notion doc, a Loom video. You validate demand before you build.',
                },
                {
                  q: 'What if I already have a brand?',
                  a: "You can still use Phantom to validate a new offer, pivot, or test a new market. The process works whether you're starting from scratch or iterating on something existing.",
                },
              ].map((faq, i) => (
                <div key={i} className="card bg-phantom-surface-dark border-phantom-lime/10 cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-[18px] text-phantom-text-primary">
                      {faq.q}
                    </h3>
                    <ChevronDown
                      className="text-phantom-text-secondary transition-transform duration-200 shrink-0"
                      size={20}
                      style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </div>
                  {openFaq === i && (
                    <motion.p
                      className="font-body text-[14px] text-phantom-text-secondary leading-relaxed mt-3 pt-3 border-t border-phantom-border-subtle"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {faq.a}
                    </motion.p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 1.1 }}
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
