import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Users, TrendingUp, Gift, CheckCircle, ArrowRight, Calculator } from 'lucide-react'
import { Link } from 'react-router-dom'
import NavigationDock from '@/components/NavigationDock'
import FooterSection from '@/components/FooterSection'

const BENEFITS = [
  {
    icon: DollarSign,
    title: '30% recurring commission',
    description: 'Earn 30% of every payment for the lifetime of each customer you refer. Monthly or annual, you get paid as long as they stay.',
  },
  {
    icon: Users,
    title: 'No cap on earnings',
    description: 'Refer 10 customers or 1,000 — there is no limit. The more you refer, the more you earn. Simple math.',
  },
  {
    icon: TrendingUp,
    title: '90-day cookie window',
    description: 'If someone clicks your link and signs up within 90 days, you get credit. Long window, high conversion.',
  },
  {
    icon: Gift,
    title: 'Exclusive resources',
    description: 'Custom landing pages, email templates, social assets, and conversion-tested copy you can use immediately.',
  },
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Apply to the program', description: 'Fill out a short application. We review and approve within 48 hours.' },
  { step: '2', title: 'Get your unique link', description: 'Access your affiliate dashboard with tracking links, resources, and real-time stats.' },
  { step: '3', title: 'Share with your audience', description: 'Post your link in content, emails, social, or anywhere your audience hangs out.' },
  { step: '4', title: 'Earn recurring revenue', description: 'Get paid monthly via PayPal or Stripe. Track every referral, conversion, and commission in your dashboard.' },
]

const FAQ = [
  {
    q: 'Who is a good fit for the affiliate program?',
    a: 'Creators, educators, consultants, and community builders who work with early-stage founders, solopreneurs, or anyone building a brand from scratch. If your audience is trying to validate ideas before going public, they need Phantom.',
  },
  {
    q: 'How much can I realistically earn?',
    a: 'It depends on your audience size and engagement. A creator with 5,000 engaged followers referring 10 customers per month at $44/month would earn $132/month in recurring revenue. That compounds every month as you add more referrals.',
  },
  {
    q: 'When do I get paid?',
    a: 'Commissions are paid monthly, 30 days after the referred customer\'s payment clears. This protects against refunds and chargebacks. Minimum payout is $50.',
  },
  {
    q: 'What if someone cancels?',
    a: 'If a customer cancels, you stop earning commissions on that customer. But all previous commissions you earned are yours to keep. If they resubscribe later through your link, commissions resume.',
  },
  {
    q: 'Can I refer myself or use my own link?',
    a: 'No. Self-referrals are not allowed and will result in removal from the program. The program is designed to reward genuine referrals, not self-dealing.',
  },
  {
    q: 'Do you provide marketing materials?',
    a: 'Yes. You get access to pre-written email templates, social post copy, banner images, and custom landing pages optimized for conversion. Everything is plug-and-play.',
  },
]

const AffiliatesPage = memo(() => {
  const [referrals, setReferrals] = useState(10)
  
  const monthlyEarnings = referrals * 13.20
  const annualEarnings = monthlyEarnings * 12
  const threeYearEarnings = annualEarnings * 3

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
            <p className="label text-phantom-lime mb-4">Phantom Affiliates</p>
            <h1 className="font-display font-bold text-[48px] md:text-[64px] text-phantom-text-primary leading-tight mb-6">
              Get paid to share Phantom.
            </h1>
            <p className="font-body text-[18px] text-phantom-text-secondary max-w-2xl mx-auto mb-8">
              Earn 30% recurring commission for every customer you refer. No caps, no tricks, no fine print. Just clean revenue for helping founders build the right way.
            </p>
            <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
              Apply to the program
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Benefits */}
          <motion.div
            className="mb-24"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          >
            <h2 className="font-display font-bold text-[32px] text-phantom-text-primary text-center mb-12">
              Why join the program
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {BENEFITS.map(({ icon: Icon, title, description }, i) => (
                <motion.div
                  key={title}
                  className="card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 + i * 0.05 }}
                >
                  <Icon className="text-phantom-lime mb-4" size={28} />
                  <h3 className="font-display font-semibold text-[20px] text-phantom-text-primary mb-3">{title}</h3>
                  <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">{description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* How it works */}
          <motion.div
            className="mb-24"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
          >
            <h2 className="font-display font-bold text-[32px] text-phantom-text-primary text-center mb-12">
              How it works
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {HOW_IT_WORKS.map(({ step, title, description }, i) => (
                <motion.div
                  key={step}
                  className="relative"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: 0.25 + i * 0.05 }}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-phantom-lime/10 border border-phantom-lime/30 mb-4">
                    <span className="font-code text-[20px] font-bold text-phantom-lime">{step}</span>
                  </div>
                  <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-2">{title}</h3>
                  <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">{description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Earnings Calculator */}
          <motion.div
            className="mb-24"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
          >
            <div className="card bg-phantom-surface-dark border-phantom-lime/20 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Calculator className="text-phantom-lime" size={28} />
                <h2 className="font-display font-bold text-[28px] text-phantom-text-primary">
                  Earnings Calculator
                </h2>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="font-ui text-[15px] text-phantom-text-primary font-medium">
                    Monthly referrals
                  </label>
                  <span className="font-code text-[24px] text-phantom-lime font-bold">
                    {referrals}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={referrals}
                  onChange={(e) => setReferrals(Number(e.target.value))}
                  className="w-full h-2 bg-phantom-border rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #89F336 0%, #89F336 ${referrals}%, #222222 ${referrals}%, #222222 100%)`
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="font-body text-[12px] text-phantom-text-muted">1</span>
                  <span className="font-body text-[12px] text-phantom-text-muted">100</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-xl bg-phantom-surface border border-phantom-border-subtle">
                  <p className="font-ui text-[12px] text-phantom-text-muted uppercase tracking-wider mb-2">
                    Monthly
                  </p>
                  <p className="font-code text-[28px] text-phantom-lime font-bold">
                    ${monthlyEarnings.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-phantom-surface border border-phantom-border-subtle">
                  <p className="font-ui text-[12px] text-phantom-text-muted uppercase tracking-wider mb-2">
                    Annual
                  </p>
                  <p className="font-code text-[28px] text-phantom-lime font-bold">
                    ${annualEarnings.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-phantom-surface border border-phantom-border-subtle">
                  <p className="font-ui text-[12px] text-phantom-text-muted uppercase tracking-wider mb-2">
                    3-Year Total
                  </p>
                  <p className="font-code text-[28px] text-phantom-lime font-bold">
                    ${threeYearEarnings.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-phantom-border-subtle">
                <p className="font-body text-[13px] text-phantom-text-secondary text-center">
                  Based on {referrals} monthly referrals to Phantom Pro ($44/month). Earnings are recurring as long as customers remain subscribed.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Commission breakdown */}
          <motion.div
            className="mb-24"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.35 }}
          >
            <div className="card bg-phantom-surface-dark border-phantom-lime/20 max-w-3xl mx-auto">
              <h2 className="font-display font-bold text-[28px] text-phantom-text-primary mb-6 text-center">
                Commission breakdown
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-phantom-border-subtle">
                  <div>
                    <p className="font-ui text-[15px] text-phantom-text-primary font-medium">Phantom Pro Monthly</p>
                    <p className="font-body text-[13px] text-phantom-text-muted">$44/month subscription</p>
                  </div>
                  <div className="text-right">
                    <p className="font-code text-[20px] text-phantom-lime font-bold">$13.20</p>
                    <p className="font-body text-[12px] text-phantom-text-muted">per month, recurring</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-phantom-border-subtle">
                  <div>
                    <p className="font-ui text-[15px] text-phantom-text-primary font-medium">Phantom Pro Annual</p>
                    <p className="font-body text-[13px] text-phantom-text-muted">$444/year subscription</p>
                  </div>
                  <div className="text-right">
                    <p className="font-code text-[20px] text-phantom-lime font-bold">$133.20</p>
                    <p className="font-body text-[12px] text-phantom-text-muted">per year, recurring</p>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="font-body text-[13px] text-phantom-text-secondary text-center">
                    Commissions continue for the lifetime of the customer. If they stay for 2 years, you earn for 2 years.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.4 }}
          >
            <h2 className="font-display font-bold text-[32px] text-phantom-text-primary text-center mb-12">
              Frequently asked questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {FAQ.map(({ q, a }, i) => (
                <motion.div
                  key={q}
                  className="card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut', delay: 0.4 + i * 0.03 }}
                >
                  <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3">{q}</h3>
                  <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">{a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.45 }}
          >
            <div className="card bg-phantom-surface-dark border-phantom-lime/20 max-w-2xl mx-auto">
              <h2 className="font-display font-bold text-[28px] text-phantom-text-primary mb-4">
                Ready to start earning?
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary mb-6">
                Apply now and get approved within 48 hours. Start sharing your link and earning recurring revenue immediately.
              </p>
              <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
                Apply to the program
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
})

AffiliatesPage.displayName = 'AffiliatesPage'
export default AffiliatesPage
