import { memo } from 'react'
import { motion } from 'framer-motion'
import { Target, Zap, Shield, Users } from 'lucide-react'
import NavigationDock from '@/components/NavigationDock'
import FooterSection from '@/components/FooterSection'

const PRINCIPLES = [
  {
    icon: Target,
    title: 'Build invisible first',
    description: 'The best brands are validated in private before they ever go public. Exposure without proof is just noise.',
  },
  {
    icon: Zap,
    title: 'Speed through discipline',
    description: 'Moving fast does not mean skipping steps. It means doing the right things in the right order, so nothing has to be redone.',
  },
  {
    icon: Shield,
    title: 'Proof over hype',
    description: 'A single paying customer is worth more than 10,000 followers. We optimize for transactions, not attention.',
  },
  {
    icon: Users,
    title: 'Built for builders',
    description: 'Phantom is not for agencies or enterprises. It is for solo founders and small teams who are building something real from scratch.',
  },
]

const STORY_BLOCKS = [
  {
    title: 'The problem we saw',
    content: 'Every year, thousands of founders launch brands that fail within six months. Not because the product was bad, or the marketing was weak, but because they went public before they were ready. They announced the idea, built an audience, and then tried to figure out the offer. By the time they had something worth selling, the attention was gone.',
  },
  {
    title: 'Why it happens',
    content: 'The default advice is to "build in public" — share your journey, grow an audience, launch with momentum. But this only works if you already know what you are building and who it is for. For most founders, the first six months are chaos. The offer changes, the positioning shifts, the price moves. Doing all of that in public is expensive, exhausting, and often fatal.',
  },
  {
    title: 'What we built',
    content: 'Phantom is the operating system for the invisible phase — the period between "I have an idea" and "I have proof." It is a structured, four-phase framework that forces founders to validate the offer, collect proof, and lock in positioning before they ever go public. No audience required. No social presence needed. Just cold traffic, real transactions, and honest feedback.',
  },
  {
    title: 'Who it is for',
    content: 'Phantom is built for solo founders, solopreneurs, and small teams who are starting from zero. No existing audience, no investor backing, no safety net. Just an idea and the discipline to test it properly before betting everything on a public launch. If that is you, this is your tool.',
  },
]

const AboutPage = memo(() => {
  return (
    <div className="relative min-h-screen bg-phantom-black">
      <NavigationDock />

      <main className="pt-24 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <p className="label text-phantom-lime mb-4">About Phantom</p>
            <h1 className="font-display font-bold text-[48px] md:text-[64px] text-phantom-text-primary leading-tight mb-6">
              Built for the invisible phase.
            </h1>
            <p className="font-body text-[18px] text-phantom-text-secondary max-w-2xl mx-auto">
              Phantom is the framework and toolset for founders who want to validate their brand before they launch it. No audience required. No public footprint. Just proof.
            </p>
          </motion.div>

          {/* Mission */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          >
            <div className="card bg-phantom-surface-dark border-phantom-lime/20">
              <h2 className="font-display font-bold text-[28px] text-phantom-text-primary mb-4">
                Our mission
              </h2>
              <p className="font-body text-[17px] text-phantom-text-secondary leading-relaxed mb-4">
                We believe the best brands are built invisible and launched inevitable. That means doing the hard work of validation, iteration, and proof-building in private — before the market is watching, before the algorithm is judging, before the audience has an opinion.
              </p>
              <p className="font-body text-[17px] text-phantom-text-secondary leading-relaxed">
                Phantom exists to give founders the structure, tools, and discipline to build that way. To test offers against cold strangers, collect real proof, and lock in positioning before going public. So that when the launch happens, it is not a gamble — it is a receipt for work already done.
              </p>
            </div>
          </motion.div>

          {/* Story */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
          >
            <h2 className="font-display font-bold text-[32px] text-phantom-text-primary mb-10 text-center">
              How we got here
            </h2>
            <div className="space-y-8">
              {STORY_BLOCKS.map(({ title, content }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut', delay: 0.2 + i * 0.05 }}
                >
                  <h3 className="font-display font-bold text-[22px] text-phantom-text-primary mb-3">
                    {title}
                  </h3>
                  <p className="font-body text-[16px] text-phantom-text-secondary leading-relaxed">
                    {content}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Principles */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.25 }}
          >
            <h2 className="font-display font-bold text-[32px] text-phantom-text-primary mb-10 text-center">
              What we believe
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {PRINCIPLES.map(({ icon: Icon, title, description }, i) => (
                <motion.div
                  key={title}
                  className="card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 + i * 0.05 }}
                >
                  <Icon className="text-phantom-lime mb-4" size={28} />
                  <h3 className="font-display font-semibold text-[20px] text-phantom-text-primary mb-3">{title}</h3>
                  <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">{description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.35 }}
          >
            <h2 className="font-display font-bold text-[32px] text-phantom-text-primary mb-6 text-center">
              Built by founders, for founders
            </h2>
            <div className="card bg-phantom-surface-dark max-w-2xl mx-auto">
              <p className="font-body text-[16px] text-phantom-text-secondary leading-relaxed mb-4">
                Phantom was built by a small team of founders who have launched, failed, and relaunched enough times to know what works and what does not. We have burned money on premature launches, wasted attention on unvalidated offers, and learned the expensive way that going public too early is the fastest way to kill a brand.
              </p>
              <p className="font-body text-[16px] text-phantom-text-secondary leading-relaxed">
                This tool is the system we wish we had the first time. It is opinionated, structured, and unforgiving — because the market is all three of those things. If you are looking for a tool that cheers you on no matter what, this is not it. But if you want a tool that forces you to do the work that actually matters, you are in the right place.
              </p>
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.4 }}
          >
            <div className="card border-phantom-lime/20">
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                What we stand for
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-phantom-lime/20 border border-phantom-lime/30 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-phantom-lime" />
                  </div>
                  <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                    <span className="text-phantom-text-primary font-medium">Validation over vanity.</span> We do not care about follower counts, viral posts, or social proof. We care about paying customers and repeatable conversions.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-phantom-lime/20 border border-phantom-lime/30 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-phantom-lime" />
                  </div>
                  <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                    <span className="text-phantom-text-primary font-medium">Structure over inspiration.</span> Motivation fades. Systems persist. Phantom is a system, not a motivational poster.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-phantom-lime/20 border border-phantom-lime/30 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-phantom-lime" />
                  </div>
                  <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                    <span className="text-phantom-text-primary font-medium">Honesty over hype.</span> We will not tell you your idea is great if it is not. We will not tell you to launch if you are not ready. We will tell you the truth, even when it is uncomfortable.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-phantom-lime/20 border border-phantom-lime/30 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-phantom-lime" />
                  </div>
                  <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                    <span className="text-phantom-text-primary font-medium">Builders over spectators.</span> Phantom is not for people who want to talk about building. It is for people who are actually doing it.
                  </p>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
})

AboutPage.displayName = 'AboutPage'
export default AboutPage
