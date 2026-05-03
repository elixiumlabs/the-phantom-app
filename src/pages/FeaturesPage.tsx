import { memo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Target, TestTube, RotateCcw, Lock, Database, MessageSquare, FileText, BarChart3, Sparkles, CheckCircle, Zap, Shield, Users, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import NavigationDock from '@/components/NavigationDock'
import FooterSection from '@/components/FooterSection'

const HERO_FEATURES = [
  { icon: Target, text: 'Four-phase validation framework' },
  { icon: Database, text: 'Private proof vault' },
  { icon: Sparkles, text: 'AI-powered validation' },
  { icon: BarChart3, text: 'Real-time conversion tracking' },
]

const PHASE_FEATURES = [
  {
    phase: 'Phase 1',
    title: 'Identify',
    subtitle: 'Define your positioning before you build',
    icon: Target,
    image: 'https://storage.googleapis.com/phantom-app/4K_ultra-wide_cinematic_editorial_photograph_202605030210.jpeg',
    description: 'Start with clarity. The Identify phase forces you to define who you serve, what you refuse, and your sharpest promise — before you write a single line of code or design a single asset.',
    features: [
      {
        name: 'Ghost Identity Builder',
        description: 'Structured prompts that guide you through positioning, target customer definition, and core promise articulation. No fluff, just the hard questions that matter.',
      },
      {
        name: 'Positioning Canvas',
        description: 'A one-page framework that captures your customer, problem, solution, and differentiation. If a stranger can\'t understand it in 90 seconds, it\'s not sharp enough.',
      },
      {
        name: 'Anti-Customer Definition',
        description: 'Name who this is NOT for. The fastest way to sharpen positioning is to say no before you say yes. Define the boundaries of your brand.',
      },
      {
        name: 'AI Validation Prompts',
        description: 'Get instant feedback on positioning clarity, market fit, and messaging strength. Trained on the phantom phase framework to catch weak spots early.',
      },
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Test',
    subtitle: 'Build the minimum sellable promise',
    icon: TestTube,
    image: 'https://storage.googleapis.com/phantom-app/4K_cinematic_ultra-wide_editorial_photograph_202605030219.jpeg',
    description: 'Build the smallest version of your offer that someone would pay for today. Not an MVP — an MSP. Test it against cold strangers until it converts. No friends, no followers, no goodwill.',
    features: [
      {
        name: 'Offer Architecture Builder',
        description: 'Design your minimum sellable promise with a structured framework. What\'s the core transformation? What\'s the delivery format? What\'s the price? Lock it in.',
      },
      {
        name: 'Sales Page Templates',
        description: 'Pre-built, conversion-tested templates for one-page sales pages. Headline, problem, promise, proof, price, button. That\'s it. If you can\'t sell it on one page, adding more won\'t help.',
      },
      {
        name: 'Cold Outreach Library',
        description: 'Email and DM templates optimized for cold traffic. Problem-first framing, no pitch, just sharp questions that surface real buyers. Ready to copy and customize.',
      },
      {
        name: 'Signal Tracker',
        description: 'Log every interaction, objection, and conversion. Track what real buyers say, not what followers like. The only feedback that matters is the kind that ends in a transaction.',
      },
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Iterate',
    subtitle: 'Change one variable at a time',
    icon: RotateCcw,
    image: 'https://storage.googleapis.com/phantom-app/4K_cinematic_editorial_photograph_in_202605030224.jpeg',
    description: 'Run the offer 10-30 times, changing one variable at a time until the results are predictable. Headline, price, audience, delivery — isolate, test, measure, repeat. No guessing.',
    features: [
      {
        name: 'Iteration Log',
        description: 'Track every change you make and measure its impact. What did you change? What happened? What did you learn? Build a knowledge base of what works and what doesn\'t.',
      },
      {
        name: 'Variable Isolation Framework',
        description: 'Change one thing at a time so you know what actually moved the needle. If you change four things and conversion goes up, you learned nothing. You just got lucky.',
      },
      {
        name: 'Proof Vault',
        description: 'Collect testimonials, screenshots, case studies, and results from every transaction. By the time you launch, you have 10-30 pieces of standalone proof.',
      },
      {
        name: 'Conversion Analytics',
        description: 'Track cold conversion rate, reply rate, and repeat rate across cohorts. See patterns emerge. Know when the offer is stable enough to lock in and scale.',
      },
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Lock',
    subtitle: 'Freeze the offer and go public',
    icon: Lock,
    image: 'https://storage.googleapis.com/phantom-app/4K_ultra-wide_cinematic_editorial_photograph_202605030232.jpeg',
    description: 'Lock in the offer, price, and positioning. Build public assets only after everything is validated. The launch is not the start — it\'s the announcement of a brand that already works.',
    features: [
      {
        name: 'Lock-In Checklist',
        description: 'A hard gate that tells you when the brand is ready to go public. 10 cold conversions, 3 pieces of standalone proof, stable price, specific customer, hands-off fulfillment.',
      },
      {
        name: 'Launch Readiness Score',
        description: 'Automated scoring based on conversions, proof quality, and positioning stability. If the score is below 80%, you\'re not ready. Keep iterating.',
      },
      {
        name: 'Brand Asset Generator',
        description: 'Generate public-facing assets — site copy, social bios, pitch decks — from locked inputs. No more rewriting everything when the offer changes. It\'s already locked.',
      },
      {
        name: 'Pre-Launch Proof Package',
        description: 'Export all testimonials, case studies, and results into a launch-ready format. Drop it into your site, your deck, your content. The proof is already there.',
      },
    ],
  },
]

const CORE_TOOLS = [
  {
    icon: Database,
    name: 'Proof Vault',
    description: 'Private library of testimonials, case studies, and results collected during the phantom phase. Every transaction generates an artifact. Export and deploy when you launch.',
    image: 'https://storage.googleapis.com/phantom-app/proofvault.png',
  },
  {
    icon: MessageSquare,
    name: 'Signal Tracker',
    description: 'Log every conversation, objection, and conversion. Track what real buyers say, not what followers like. Identify patterns, surface objections, refine messaging.',
    image: 'https://storage.googleapis.com/phantom-app/signaltracker.png',
  },
  {
    icon: FileText,
    name: 'Template Library',
    description: 'Pre-written cold outreach emails, sales page copy, and positioning frameworks. Conversion-tested, ready to customize. No more staring at a blank page.',
    image: '/placeholder-templates.jpg',
  },
  {
    icon: BarChart3,
    name: 'Validation Dashboard',
    description: 'Real-time metrics on cold conversion rate, repeat rate, and proof collection progress. See exactly where you are in the validation process.',
    image: '/placeholder-dashboard.jpg',
  },
  {
    icon: Sparkles,
    name: 'AI Brand Assistant',
    description: 'Get instant feedback on positioning, offer clarity, and messaging. Trained on the phantom phase framework to catch weak spots before the market does.',
    image: '/placeholder-ai-assistant.jpg',
  },
]

const BENEFITS = [
  {
    icon: Shield,
    title: 'No public failure',
    description: 'Every mistake, every pivot, every failed test happens in private. By the time you go public, the brand already works.',
  },
  {
    icon: Zap,
    title: 'Faster validation',
    description: 'Cold traffic gives you honest feedback in days, not months. No waiting for an audience to grow. Just test, measure, iterate.',
  },
  {
    icon: TrendingUp,
    title: 'Higher conversion',
    description: 'Brands built in the phantom phase launch with proof, not promises. Proof converts. Promises decay.',
  },
  {
    icon: Users,
    title: 'Real customer insight',
    description: 'Learn from paying strangers, not supportive friends. The feedback is brutal, honest, and actionable.',
  },
]

const FeaturesPage = memo(() => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div className="relative min-h-screen bg-phantom-black">
      <NavigationDock />

      <main className="pt-32 pb-32 px-6">
        {/* Hero */}
        <div className="max-w-6xl mx-auto mb-32">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <p className="label text-phantom-lime mb-4">Features</p>
            <h1 className="font-display font-bold text-[48px] md:text-[64px] text-phantom-text-primary leading-tight mb-6">
              Everything you need to<br />validate before you launch.
            </h1>
            <p className="font-body text-[18px] text-phantom-text-secondary max-w-2xl mx-auto mb-10">
              Phantom is a complete operating system for the invisible phase. Four phases, dozens of tools, one goal: proof before exposure.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap mb-12">
              {HERO_FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-full border border-phantom-border-subtle bg-phantom-surface">
                  <Icon className="text-phantom-lime" size={16} />
                  <span className="font-ui text-[13px] text-phantom-text-secondary">{text}</span>
                </div>
              ))}
            </div>
            <Link to="/signup" className="btn-primary">
              Start free
            </Link>
          </motion.div>

{/* Hero Image Placeholder */}
<motion.div
            className="relative rounded-2xl overflow-hidden border border-phantom-border-subtle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          >
            <img
              src="https://storage.googleapis.com/phantom-app/whatareyoubuilding.png"
              alt="Phantom Dashboard Preview"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Phase Features */}
        <div ref={ref} className="max-w-6xl mx-auto mb-32">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h2 className="font-display font-bold text-[40px] text-phantom-text-primary mb-4">
              Four phases. Zero public footprint.
            </h2>
            <p className="font-body text-[16px] text-phantom-text-secondary max-w-2xl mx-auto">
              Each phase builds on the previous one. Skipping steps doesn't save time — it creates expensive problems later.
            </p>
          </motion.div>

          {PHASE_FEATURES.map(({ phase, title, subtitle, icon: Icon, image, description, features }, phaseIndex) => (
            <motion.div
              key={phase}
              className="mb-24 last:mb-0"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: phaseIndex * 0.1 }}
            >
              <div className="grid md:grid-cols-2 gap-12 items-center mb-8">
                {/* Content */}
                <div className={phaseIndex % 2 === 0 ? 'md:order-1' : 'md:order-2'}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-phantom-lime/10 border border-phantom-lime/30 flex items-center justify-center">
                      <Icon className="text-phantom-lime" size={24} />
                    </div>
                    <div>
                      <p className="font-code text-[12px] text-phantom-lime uppercase tracking-wider">{phase}</p>
                      <h3 className="font-display font-bold text-[32px] text-phantom-text-primary leading-none">{title}</h3>
                    </div>
                  </div>
                  <p className="font-ui text-[14px] text-phantom-lime mb-4">{subtitle}</p>
                  <p className="font-body text-[16px] text-phantom-text-secondary leading-relaxed">
                    {description}
                  </p>
                </div>

                {/* Image Placeholder */}
                <div className={phaseIndex % 2 === 0 ? 'md:order-2' : 'md:order-1'}>
                  <div className="relative rounded-2xl overflow-hidden border border-phantom-border-subtle">
                    <div className="aspect-video bg-phantom-surface flex items-center justify-center">
                      {image.startsWith('http') ? (
                        <img src={image} alt={`${title} Phase Preview`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Icon className="text-phantom-lime mx-auto mb-3" size={40} />
                          <p className="font-ui text-[13px] text-phantom-text-muted">{title} Phase Preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Grid */}
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
                        <h4 className="font-display font-semibold text-[16px] text-phantom-text-primary mb-2">
                          {name}
                        </h4>
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
        <div className="max-w-6xl mx-auto mb-32">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.5 }}
          >
            <h2 className="font-display font-bold text-[40px] text-phantom-text-primary mb-4">
              Core tools
            </h2>
            <p className="font-body text-[16px] text-phantom-text-secondary max-w-2xl mx-auto">
              Built-in tools that work across all four phases. Everything you need to validate, iterate, and launch with proof.
            </p>
          </motion.div>

          <div className="space-y-16">
{CORE_TOOLS.map(({ icon: Icon, name, description, image }, i) => (
              <motion.div
                key={name}
                className="grid md:grid-cols-2 gap-12 items-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.55 + i * 0.05 }}
              >
                {/* Content */}
                <div className={i % 2 === 0 ? '' : 'md:order-2'}>
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="text-phantom-lime" size={32} />
                    <h3 className="font-display font-bold text-[28px] text-phantom-text-primary">
                      {name}
                    </h3>
                  </div>
                  <p className="font-body text-[16px] text-phantom-text-secondary leading-relaxed">
                    {description}
                  </p>
                </div>

{/* Image Placeholder */}
                <div className={i % 2 === 0 ? '' : 'md:order-1'}>
                  <div className="relative rounded-2xl overflow-hidden border border-phantom-border-subtle">
                    <div className="aspect-video bg-phantom-surface flex items-center justify-center">
                      {image.startsWith('http') ? (
                        <img src={image} alt={`${name} Preview`} className="w-full h-full object-contain bg-phantom-surface" />
                      ) : (
                        <div className="text-center">
                          <Icon className="text-phantom-lime mx-auto mb-3" size={40} />
                          <p className="font-ui text-[13px] text-phantom-text-muted">{name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="max-w-6xl mx-auto mb-32">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.7 }}
          >
            <h2 className="font-display font-bold text-[40px] text-phantom-text-primary mb-4">
              Why build invisible first
            </h2>
            <p className="font-body text-[16px] text-phantom-text-secondary max-w-2xl mx-auto">
              The phantom phase protects you from the most expensive mistakes founders make.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {BENEFITS.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                className="card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.75 + i * 0.05 }}
              >
                <Icon className="text-phantom-lime mb-4" size={28} />
                <h3 className="font-display font-semibold text-[20px] text-phantom-text-primary mb-3">
                  {title}
                </h3>
                <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                  {description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.9 }}
          >
            <div className="card bg-phantom-surface-dark border-phantom-lime/20 max-w-2xl mx-auto">
              <h2 className="font-display font-bold text-[32px] text-phantom-text-primary mb-4">
                Start building invisible
              </h2>
              <p className="font-body text-[16px] text-phantom-text-secondary mb-6">
                Get access to all features with Phantom Free. Upgrade to Pro when you're ready to unlock all four phases.
              </p>
              <Link to="/signup" className="btn-primary">
                Start free — no card required
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
