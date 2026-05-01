import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Zap, Shield, TrendingUp, Users, Sparkles, Lock, Loader } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import NavigationDock from '@/components/NavigationDock'
import FooterSection from '@/components/FooterSection'
import { useAuth } from '@/contexts/AuthContext'
import { startCheckout, getPriceId } from '@/lib/billing'

const VALUE_STACK = [
  { item: 'Four-Phase Validation Framework', value: '$2,997' },
  { item: 'Ghost Identity Builder', value: '$497' },
  { item: 'Offer Architecture System', value: '$997' },
  { item: 'Cold Outreach Template Library', value: '$297' },
  { item: 'Signal Tracker & Analytics', value: '$497' },
  { item: 'Proof Vault (Unlimited)', value: '$397' },
  { item: 'AI Brand Assistant (Unlimited)', value: '$997' },
  { item: 'Iteration Log & Variable Tracking', value: '$297' },
  { item: 'Lock-In Checklist System', value: '$197' },
  { item: 'Launch Readiness Scoring', value: '$297' },
]

const COMPARISON_FEATURES = [
  {
    category: 'Core Framework',
    features: [
      { name: 'Phase 1: Identify (Positioning)', free: true, pro: true },
      { name: 'Phase 2: Test (Offer Validation)', free: true, pro: true },
      { name: 'Phase 3: Iterate (Optimization)', free: false, pro: true },
      { name: 'Phase 4: Lock (Launch Prep)', free: false, pro: true },
    ],
  },
  {
    category: 'Active Brands',
    features: [
      { name: 'Simultaneous brand projects', free: '1', pro: 'Unlimited' },
      { name: 'Brand switching', free: false, pro: true },
    ],
  },
  {
    category: 'Validation Tools',
    features: [
      { name: 'Signal Tracker entries', free: '30', pro: 'Unlimited' },
      { name: 'Proof Vault storage', free: '10 items', pro: 'Unlimited' },
      { name: 'AI validation prompts', free: '5/month', pro: 'Unlimited' },
      { name: 'Iteration log tracking', free: false, pro: true },
      { name: 'Variable isolation framework', free: false, pro: true },
    ],
  },
  {
    category: 'Templates & Resources',
    features: [
      { name: 'Cold outreach templates', free: 'Basic', pro: 'Full library' },
      { name: 'Sales page templates', free: '1', pro: 'All templates' },
      { name: 'Positioning frameworks', free: 'Basic', pro: 'Advanced' },
    ],
  },
  {
    category: 'Launch Tools',
    features: [
      { name: 'Lock-in checklist', free: false, pro: true },
      { name: 'Launch readiness score', free: false, pro: true },
      { name: 'Brand asset generator', free: false, pro: true },
      { name: 'Proof package export', free: false, pro: true },
    ],
  },
  {
    category: 'Support',
    features: [
      { name: 'Community access', free: true, pro: true },
      { name: 'Email support', free: 'Standard', pro: 'Priority' },
      { name: 'Response time', free: '48 hours', pro: '12 hours' },
    ],
  },
]

const GUARANTEES = [
  {
    icon: Shield,
    title: '14-day free trial',
    description: 'Test Phantom Pro risk-free. No credit card required.',
  },
  {
    icon: TrendingUp,
    title: '30-day money-back',
    description: 'Not satisfied? Full refund within 30 days. No questions asked.',
  },
  {
    icon: Lock,
    title: 'Cancel anytime',
    description: 'No contracts. No commitments. Cancel with one click.',
  },
]

const PricingPage = memo(() => {
  const [annual, setAnnual] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const proMonthlyPrice = 44
  const proAnnualPrice = 37
  const totalValue = VALUE_STACK.reduce((sum, item) => sum + parseInt(item.value.replace(/[$,]/g, '')), 0)
  const annualSavings = (proMonthlyPrice - proAnnualPrice) * 12

  const cadence = annual ? 'annual' : 'monthly'
  const proPriceConfigured = Boolean(getPriceId('phantom_pro', cadence))

  const handleProClick = async () => {
    if (authLoading) return
    if (!user) {
      navigate(`/signup?next=/pricing&intent=pro_${cadence}`)
      return
    }
    if (user.plan === 'phantom_pro') {
      navigate('/dashboard')
      return
    }
    setCheckoutLoading(true)
    setCheckoutError(null)
    try {
      await startCheckout('phantom_pro', cadence)
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Could not start checkout.')
      setCheckoutLoading(false)
    }
  }

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
            <p className="label text-phantom-lime mb-4">Pricing</p>
            <h1 className="font-display font-bold text-[48px] md:text-[72px] text-phantom-text-primary leading-tight mb-6">
              Two plans. Both built for<br />the phantom phase.
            </h1>
            <p className="font-body text-[18px] text-phantom-text-secondary max-w-2xl mx-auto">
              Start free. Upgrade when you're ready to unlock all four phases and scale your validation.
            </p>
          </motion.div>

          {/* Value Stack */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          >
            <div className="card bg-phantom-surface-dark border-phantom-lime/20 max-w-2xl mx-auto">
              <h2 className="font-display font-bold text-[28px] text-phantom-text-primary mb-2 text-center">
                Total Value: ${totalValue.toLocaleString()}
              </h2>
              <p className="font-body text-[14px] text-phantom-text-secondary text-center mb-6">
                Everything included in Phantom Pro
              </p>
              <div className="space-y-3 mb-6">
                {VALUE_STACK.map(({ item, value }) => (
                  <div key={item} className="flex items-center justify-between py-2 border-b border-phantom-border-subtle last:border-0">
                    <span className="font-body text-[14px] text-phantom-text-secondary">{item}</span>
                    <span className="font-code text-[14px] text-phantom-lime font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-phantom-lime/20">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[18px] text-phantom-text-primary font-bold">Your Price:</span>
                  <div className="text-right">
                    <span className="font-code text-[32px] text-phantom-lime font-bold">${annual ? proAnnualPrice : proMonthlyPrice}</span>
                    <span className="font-body text-[16px] text-phantom-text-secondary">/month</span>
                  </div>
                </div>
                <p className="font-body text-[13px] text-phantom-text-muted text-center mt-3">
                  That's {Math.round((1 - (annual ? proAnnualPrice : proMonthlyPrice) * 12 / totalValue) * 100)}% off the total value
                </p>
              </div>
            </div>
          </motion.div>

          {/* Toggle */}
          <motion.div
            className="flex justify-center mb-12"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
          >
            <div className="flex items-center rounded-full p-1 gap-0 bg-[#1a1a1a]">
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className="px-5 py-2 rounded-full font-ui text-[13px] font-medium transition-all duration-200"
                style={{
                  background: !annual ? '#89F336' : 'transparent',
                  color: !annual ? '#0a0a0a' : '#888888',
                }}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                className="px-5 py-2 rounded-full font-ui text-[13px] font-medium transition-all duration-200 flex items-center gap-2"
                style={{
                  background: annual ? '#89F336' : 'transparent',
                  color: annual ? '#0a0a0a' : '#888888',
                }}
              >
                Annual
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm"
                  style={{
                    background: annual ? 'rgba(0,0,0,0.2)' : '#142400',
                    color: annual ? '#0a0a0a' : '#89F336',
                  }}
                >
                  Save ${annualSavings}
                </span>
              </button>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
          >
            {/* Free */}
            <div className="card">
              <div className="mb-6">
                <h3 className="font-display font-bold text-[28px] text-phantom-text-primary mb-2">Phantom Free</h3>
                <p className="font-body text-[14px] text-phantom-text-secondary mb-6">
                  Everything you need to test your first idea.
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-code font-bold text-[48px] text-phantom-text-primary">$0</span>
                  <span className="font-body text-[16px] text-phantom-text-secondary">/ month</span>
                </div>
              </div>
              <Link to="/signup" className="btn-secondary w-full text-center mb-6">
                Start free
              </Link>
              <div className="space-y-3">
                <p className="font-ui text-[12px] text-phantom-text-muted uppercase tracking-wider">What's included:</p>
                <div className="flex items-start gap-2">
                  <Check className="text-phantom-lime shrink-0 mt-0.5" size={16} />
                  <span className="font-body text-[14px] text-phantom-text-secondary">Phase 1 & 2 access</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-phantom-lime shrink-0 mt-0.5" size={16} />
                  <span className="font-body text-[14px] text-phantom-text-secondary">1 active brand</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-phantom-lime shrink-0 mt-0.5" size={16} />
                  <span className="font-body text-[14px] text-phantom-text-secondary">30 signal tracker entries</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-phantom-lime shrink-0 mt-0.5" size={16} />
                  <span className="font-body text-[14px] text-phantom-text-secondary">10 proof vault items</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-phantom-lime shrink-0 mt-0.5" size={16} />
                  <span className="font-body text-[14px] text-phantom-text-secondary">5 AI prompts/month</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-phantom-lime shrink-0 mt-0.5" size={16} />
                  <span className="font-body text-[14px] text-phantom-text-secondary">Basic templates</span>
                </div>
              </div>
            </div>

            {/* Pro */}
            <div className="card border-phantom-lime relative">
              <div className="absolute -top-3 left-6">
                <span className="badge bg-phantom-lime text-phantom-black border-phantom-lime font-bold">
                  BEST VALUE
                </span>
              </div>
              <div className="mb-6">
                <h3 className="font-display font-bold text-[28px] text-phantom-text-primary mb-2">Phantom Pro</h3>
                <p className="font-body text-[14px] text-phantom-text-secondary mb-6">
                  For founders serious about validating before they launch.
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-code font-bold text-[48px] text-phantom-text-primary">
                    ${annual ? proAnnualPrice : proMonthlyPrice}
                  </span>
                  <span className="font-body text-[16px] text-phantom-text-secondary">/ month</span>
                </div>
                {annual && (
                  <p className="font-body text-[13px] text-phantom-lime">
                    Billed annually at ${proAnnualPrice * 12} — save ${annualSavings}/year
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => void handleProClick()}
                disabled={checkoutLoading || (!!user && !proPriceConfigured)}
                className="btn-primary w-full text-center mb-6 flex items-center justify-center gap-2"
                title={!proPriceConfigured ? 'Stripe price IDs not configured' : undefined}
              >
                {checkoutLoading ? (
                  <><Loader size={14} className="animate-spin" /> Loading...</>
                ) : user?.plan === 'phantom_pro' ? (
                  'You’re on Pro'
                ) : user ? (
                  'Upgrade to Pro'
                ) : (
                  'Start 14-day free trial'
                )}
              </button>
              {checkoutError && (
                <p className="font-body text-[13px] text-phantom-danger -mt-3 mb-4">{checkoutError}</p>
              )}
              <div className="space-y-3">
                <p className="font-ui text-[12px] text-phantom-text-muted uppercase tracking-wider">Everything in Free, plus:</p>
                <div className="flex items-start gap-2">
                  <Check className="text-phantom-lime shrink-0 mt-0.5" size={16} />
                  <span className="font-body text-[14px] text-phantom-text-secondary">All 4 phases unlocked</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-phantom-lime shrink-0 mt-0.5" size={16} />
                  <span className="font-body text-[14px] text-phantom-text-secondary">Unlimited active brands</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-phantom-lime shrink-0 mt-0.5" size={16} />
                  <span className="font-body text-[14px] text-phantom-text-secondary">Unlimited signal tracking</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-phantom-lime shrink-0 mt-0.5" size={16} />
                  <span className="font-body text-[14px] text-phantom-text-secondary">Unlimited proof vault</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-phantom-lime shrink-0 mt-0.5" size={16} />
                  <span className="font-body text-[14px] text-phantom-text-secondary">Unlimited AI validation</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-phantom-lime shrink-0 mt-0.5" size={16} />
                  <span className="font-body text-[14px] text-phantom-text-secondary">Full template library</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-phantom-lime shrink-0 mt-0.5" size={16} />
                  <span className="font-body text-[14px] text-phantom-text-secondary">Iteration log & tracking</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-phantom-lime shrink-0 mt-0.5" size={16} />
                  <span className="font-body text-[14px] text-phantom-text-secondary">Lock-in checklist</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-phantom-lime shrink-0 mt-0.5" size={16} />
                  <span className="font-body text-[14px] text-phantom-text-secondary">Priority support</span>
                </div>
              </div>
              <p className="font-body text-[13px] text-phantom-text-muted text-center mt-6 pt-6 border-t border-phantom-border-subtle">
                No card required for trial • Cancel anytime
              </p>
            </div>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.25 }}
          >
            <h2 className="font-display font-bold text-[36px] text-phantom-text-primary text-center mb-12">
              Feature comparison
            </h2>
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-phantom-border-subtle">
                    <th className="text-left py-4 px-4 font-display text-[16px] text-phantom-text-primary font-semibold">
                      Feature
                    </th>
                    <th className="text-center py-4 px-4 font-display text-[16px] text-phantom-text-primary font-semibold">
                      Free
                    </th>
                    <th className="text-center py-4 px-4 font-display text-[16px] text-phantom-lime font-semibold">
                      Pro
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map(({ category, features }) => (
                    <>
                      <tr key={category} className="border-t border-phantom-border-subtle">
                        <td colSpan={3} className="py-3 px-4">
                          <span className="font-ui text-[13px] text-phantom-lime uppercase tracking-wider font-medium">
                            {category}
                          </span>
                        </td>
                      </tr>
                      {features.map(({ name, free, pro }) => (
                        <tr key={name} className="border-t border-phantom-border-subtle/50">
                          <td className="py-3 px-4 font-body text-[14px] text-phantom-text-secondary">
                            {name}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {typeof free === 'boolean' ? (
                              free ? (
                                <Check className="text-phantom-lime mx-auto" size={18} />
                              ) : (
                                <X className="text-phantom-text-muted mx-auto" size={18} />
                              )
                            ) : (
                              <span className="font-body text-[13px] text-phantom-text-secondary">{free}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {typeof pro === 'boolean' ? (
                              pro ? (
                                <Check className="text-phantom-lime mx-auto" size={18} />
                              ) : (
                                <X className="text-phantom-text-muted mx-auto" size={18} />
                              )
                            ) : (
                              <span className="font-body text-[13px] text-phantom-lime font-medium">{pro}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Guarantees */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
          >
            <h2 className="font-display font-bold text-[36px] text-phantom-text-primary text-center mb-12">
              Zero-risk guarantee
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {GUARANTEES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="card text-center">
                  <Icon className="text-phantom-lime mx-auto mb-4" size={32} />
                  <h3 className="font-display font-semibold text-[20px] text-phantom-text-primary mb-2">
                    {title}
                  </h3>
                  <p className="font-body text-[14px] text-phantom-text-secondary leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.35 }}
          >
            <h2 className="font-display font-bold text-[36px] text-phantom-text-primary text-center mb-12">
              Common questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="card">
                <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3">
                  Can I switch between plans?
                </h3>
                <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                  Yes. Upgrade from Free to Pro anytime. Downgrade at the end of your billing period. Your data is preserved when switching.
                </p>
              </div>
              <div className="card">
                <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3">
                  What happens after the free trial?
                </h3>
                <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                  After 14 days, you'll be charged for your chosen plan. Cancel anytime during the trial and you won't be charged. No credit card required to start.
                </p>
              </div>
              <div className="card">
                <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3">
                  Do you offer refunds?
                </h3>
                <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                  Yes. Full refund within 30 days of purchase, no questions asked. See our refund policy for details.
                </p>
              </div>
              <div className="card">
                <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3">
                  Is my data secure?
                </h3>
                <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                  Absolutely. All data is encrypted in transit and at rest. We never share your data with third parties. Your brand work stays private until you choose to go public.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.4 }}
          >
            <div className="card bg-phantom-surface-dark border-phantom-lime/20 max-w-3xl mx-auto">
              <h2 className="font-display font-bold text-[36px] text-phantom-text-primary mb-4">
                Ready to build invisible?
              </h2>
              <p className="font-body text-[16px] text-phantom-text-secondary mb-8 max-w-xl mx-auto">
                Join founders who are validating their brands the right way — in private, with proof, before going public.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link to="/signup" className="btn-primary">
                  Start 14-day free trial
                </Link>
                <Link to="/features" className="btn-secondary">
                  See all features
                </Link>
              </div>
              <p className="font-body text-[13px] text-phantom-text-muted mt-6">
                No credit card required • Cancel anytime • 30-day money-back guarantee
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
})

PricingPage.displayName = 'PricingPage'
export default PricingPage
