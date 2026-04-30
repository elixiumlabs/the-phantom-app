import { memo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Target, TestTube, RotateCcw, Lock, Database, MessageSquare, FileText, BarChart3, Sparkles, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import NavigationDock from '@/components/NavigationDock'
import FooterSection from '@/components/FooterSection'

const PHASE_FEATURES = [
  {
    phase: 'Phase 1: Identify',
    icon: Target,
    color: '#89F336',
    description: 'Define your positioning, target customer, and core promise before building anything.',
    features: [
      { name: 'Ghost Identity Builder', description: 'Structured prompts to define who you serve, what you refuse, and your sharpest promise.' },
      { name: 'Positioning Canvas', description: 'One-page doc that forces clarity on customer, problem, solution, and differentiation.' },
      { name: 'Anti-Customer Definition', description: 'Name who this is NOT for — the fastest way to sharpen positioning.' },
      { name: 'AI Validation Prompts', description: 'Get instant feedback on positioning clarity and market fit before you build.' },
    ],
  },
  {
    phase: 'Phase 2: Test',
    icon: TestTube,
    color: '#89F336',
    description: 'Build the minimum sellable promise and test it against cold strangers until it converts.',
    features: [
      { name: 'Offer Architecture Builder', description: 'Design the smallest version of your offer that someone would pay for today.' },
      { name: 'Sales Page Templates', description: 'Pre-built, conversion-tested templates for one-page sales pages.' },
      { name: 'Cold Outreach Library', description: 'Email and DM templates optimized for cold traffic, not warm audiences.' },
      { name: 'Signal Tracker', description: 'Log every interaction, objection, and conversion to identify patterns.' },
    ],
  },
  {
    phase: 'Phase 3: Iterate',
    icon: RotateCcw,
    color: '#89F336',
    description: 'Run the offer 10-30 times, changing one variable at a time until the results are predictable.',
    features: [
      { name: 'Iteration Log', description: 'Track every change you make — headline, price, audience — and measure impact.' },
      { name: 'Variable Isolation Framework', description: 'Change one thing at a time so you know what actually moved the needle.' },
      { name: 'Proof Vault', description: 'Collect testimonials, screenshots, and case studies from every transaction.' },
      { name: 'Conversion Analytics', description: 'Track cold conversion rate, reply rate, and repeat rate across cohorts.' },
    ],
  },
  {
    phase: 'Phase 4: Lock',
    icon: Lock,
    color: '#89F336',
    description: 'Freeze the offer, price, and positioning. Build public assets only after everything is validated.',
    features: [
      { name: 'Lock-In Checklist', description: 'A hard gate that tells you when the brand is ready to go public.' },
      { name: 'Launch Readiness Score', description: 'Automated scoring based on conversions, proof, and positioning stability.' },
      { name: 'Brand Asset Generator', description: 'Generate public-facing assets — site copy, social bios, pitch decks — from locked inputs.' },
      { name: 'Pre-Launch Proof Package', description: 'Export all testimonials, case studies, and results into a launch-ready format.' },
    ],
  },
]

const CORE_TOOLS = [
  {
    icon: Database,
    name: 'Proof Vault',
    description: 'Private library of testimonials, case studies, and results collected during the phantom phase. Export and deploy when you launch.',
  },
  {
    icon: MessageSquare,
    name: 'Signal Tracker',
    description: 'Log every conversation, objection, and conversion. Track what real buyers say, not what followers like.',
  },
  {
    icon: FileText,
    name: 'Template Library',
    description: 'Pre-written cold outreach emails, sales page copy, and positioning frameworks you can use immediately.',
  },
  {
    icon: BarChart3,
    name: 'Validation Dashboard',
    description: 'Real-time metrics on cold conversion rate, repeat rate, and proof collection progress.',
  },
  {
    icon: Sparkles,
    name: 'AI Brand Assistant',
    description: 'Get instant feedback on positioning, offer clarity, and messaging — trained on the phantom phase framework.',
  },
]

const FeaturesPage = memo(() => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div className="relative min-h-screen bg-phantom-black">
      <NavigationDock />

      <main className="pt-24 pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <p className="label text-phantom-lime mb-4">Features</p>
            <h1 className="font-display font-bold text-[48px] md:text-[64px] text-phantom-text-primary leading-tight mb-6">
              Everything you need to<br />validate before you launch.
            </h1>
            <p className="font-body text-[18px] text-phantom-text-secondary max-w-2xl mx-auto mb-8">
              Phantom is a complete operating system for the invisible phase. Four phases, dozens of tools, one goal: proof before exposure.
            </p>
            <Link to="/signup" className="btn-primary">
              Start free
            </Link>
          </motion.div>

          {/* Phase Features */}
          <div ref={ref} className="mb-24">
            {PHASE_FEATURES.map(({ phase, icon: Icon, description, features }, phaseIndex) => (
              <motion.div
                key={phase}
                className="mb-16 last:mb-0"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: phaseIndex * 0.1 }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-phantom-lime/10 border border-phantom-lime/30 flex items-center justify-center shrink-0">
                    <Icon className="text-phantom-lime" size={24} />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-[28px] text-phantom-text-primary mb-2">
                      {phase}
                    </h2>
                    <p className="font-body text-[16px] text-phantom-text-secondary">
                      {description}
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {features.map(({ name, description }, i) => (
                    <motion.div
                      key={name}
                      className="card"
                      initial={{ opacity: 0, y: 12 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                      transition={{ duration: 0.3, ease: 'easeOut', delay: phaseIndex * 0.1 + i * 0.05 }}
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-phantom-lime shrink-0 mt-0.5" size={18} />
                        <div>
                          <h3 className="font-display font-semibold text-[16px] text-phantom-text-primary mb-1">
                            {name}
                          </h3>
                          <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">
                            {description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Core Tools */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.5 }}
          >
            <h2 className="font-display font-bold text-[36px] text-phantom-text-primary text-center mb-12">
              Core tools
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CORE_TOOLS.map(({ icon: Icon, name, description }, i) => (
                <motion.div
                  key={name}
                  className="card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: 0.55 + i * 0.05 }}
                >
                  <Icon className="text-phantom-lime mb-4" size={28} />
                  <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3">
                    {name}
                  </h3>
                  <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">
                    {description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.7 }}
          >
            <div className="card bg-phantom-surface-dark border-phantom-lime/20 max-w-2xl mx-auto">
              <h2 className="font-display font-bold text-[28px] text-phantom-text-primary mb-4">
                Start building invisible
              </h2>
              <p className="font-body text-[16px] text-phantom-text-secondary mb-6">
                Get access to all features with Phantom Free. Upgrade to Pro when you are ready to unlock all four phases.
              </p>
              <Link to="/signup" className="btn-primary">
                Start free
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
})

FeaturesPage.displayName = 'FeaturesPage'
export default FeaturesPage
