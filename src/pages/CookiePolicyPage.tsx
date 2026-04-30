import { memo } from 'react'
import { motion } from 'framer-motion'
import NavigationDock from '@/components/NavigationDock'
import FooterSection from '@/components/FooterSection'

const CookiePolicyPage = memo(() => {
  return (
    <div className="relative min-h-screen bg-phantom-black">
      <NavigationDock />

      <main className="pt-24 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <p className="label text-phantom-lime mb-4">Legal</p>
            <h1 className="font-display font-bold text-[40px] md:text-[56px] text-phantom-text-primary leading-tight mb-6">
              Cookie Policy
            </h1>
            <p className="font-body text-[14px] text-phantom-text-muted mb-12">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </motion.div>

          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          >
            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                What Are Cookies
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                Phantom uses cookies and similar tracking technologies to improve your experience, analyze usage patterns, and provide personalized features. This Cookie Policy explains what cookies we use, why we use them, and how you can control them.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Types of Cookies We Use
              </h2>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Essential Cookies
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                These cookies are necessary for the platform to function and cannot be disabled. They enable core functionality such as:
              </p>
              <ul className="space-y-2 list-none p-0 mb-4">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Authentication and account access
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Security and fraud prevention
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Session management
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Load balancing and performance optimization
                </li>
              </ul>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Functional Cookies
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                These cookies enable enhanced functionality and personalization, such as:
              </p>
              <ul className="space-y-2 list-none p-0 mb-4">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Remembering your preferences and settings
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Saving your progress in multi-step workflows
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Customizing content based on your usage
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Providing chat and support features
                </li>
              </ul>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Analytics Cookies
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                These cookies help us understand how visitors interact with our platform by collecting and reporting information anonymously:
              </p>
              <ul className="space-y-2 list-none p-0 mb-4">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Pages visited and features used
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Time spent on pages
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Navigation paths and click patterns
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Error messages and technical issues
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Device and browser information
                </li>
              </ul>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-4">
                We use analytics providers such as Google Analytics to help us analyze this data. These providers may use cookies to collect information about your use of our platform and other websites.
              </p>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Marketing Cookies
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                These cookies are used to deliver relevant advertisements and track campaign effectiveness:
              </p>
              <ul className="space-y-2 list-none p-0 mb-4">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Showing you relevant ads on other websites
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Measuring the effectiveness of advertising campaigns
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Limiting the number of times you see an ad
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Retargeting visitors who have shown interest
                </li>
              </ul>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                Marketing cookies require your consent and can be disabled through your cookie preferences.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Third-Party Cookies
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                We use third-party services that may set cookies on your device. These include:
              </p>
              <ul className="space-y-2 list-none p-0 mb-3">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Google Analytics:</span> For usage analytics and insights
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Stripe:</span> For payment processing
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Authentication Providers:</span> For social login (Google, GitHub)
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Email Service Providers:</span> For transactional and marketing emails
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Advertising Networks:</span> For retargeting and ad delivery
                </li>
              </ul>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                These third parties have their own privacy policies and cookie policies. We recommend reviewing their policies to understand how they use cookies.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                How Long Cookies Last
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                Cookies can be either session cookies or persistent cookies:
              </p>
              <ul className="space-y-2 list-none p-0">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Session cookies:</span> Temporary cookies that are deleted when you close your browser
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Persistent cookies:</span> Remain on your device for a set period (typically 30 days to 2 years) or until you delete them
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                How to Control Cookies
              </h2>
              
              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Cookie Preferences
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-4">
                When you first visit Phantom, you will see a cookie banner allowing you to accept or customize your cookie preferences. You can change your preferences at any time through your account settings.
              </p>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Browser Settings
              </h3>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                Most browsers allow you to control cookies through their settings. You can:
              </p>
              <ul className="space-y-2 list-none p-0 mb-4">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Block all cookies
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Block third-party cookies only
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Delete cookies after each browsing session
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  Receive notifications when cookies are set
                </li>
              </ul>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-4">
                Please note that blocking or deleting cookies may affect your ability to use certain features of Phantom. Essential cookies cannot be disabled as they are necessary for the platform to function.
              </p>

              <h3 className="font-display font-semibold text-[18px] text-phantom-text-primary mb-3 mt-6">
                Browser-Specific Instructions
              </h3>
              <ul className="space-y-2 list-none p-0">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Chrome:</span> Settings → Privacy and security → Cookies and other site data
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Firefox:</span> Settings → Privacy & Security → Cookies and Site Data
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Safari:</span> Preferences → Privacy → Manage Website Data
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Edge:</span> Settings → Cookies and site permissions → Manage and delete cookies
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Opt-Out of Targeted Advertising
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                You can opt out of targeted advertising through:
              </p>
              <ul className="space-y-2 list-none p-0">
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Digital Advertising Alliance:</span>{' '}
                  <a href="http://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-phantom-lime hover:underline">
                    optout.aboutads.info
                  </a>
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Network Advertising Initiative:</span>{' '}
                  <a href="http://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-phantom-lime hover:underline">
                    optout.networkadvertising.org
                  </a>
                </li>
                <li className="font-body text-[15px] text-phantom-text-secondary leading-relaxed pl-6 relative">
                  <span className="absolute left-0 top-[10px] w-2 h-2 rounded-full bg-phantom-lime/70" />
                  <span className="font-medium text-phantom-text-primary">Google Ads Settings:</span>{' '}
                  <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-phantom-lime hover:underline">
                    adssettings.google.com
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Do Not Track Signals
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                Some browsers have a "Do Not Track" feature that signals to websites that you do not want your online activities tracked. Currently, there is no industry standard for how to respond to Do Not Track signals. Phantom does not currently respond to Do Not Track signals, but you can control cookies through your browser settings and our cookie preferences.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Changes to This Policy
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of material changes by updating the "Last updated" date at the top of this policy.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-[24px] text-phantom-text-primary mb-4">
                Contact Us
              </h2>
              <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-3">
                If you have questions about our use of cookies, please contact us:
              </p>
              <div className="card bg-phantom-surface-dark">
                <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed mb-2">
                  <span className="font-medium text-phantom-text-primary">Privacy:</span>{' '}
                  <a href="mailto:privacy@phantom.app" className="text-phantom-lime hover:underline">
                    privacy@phantom.app
                  </a>
                </p>
                <p className="font-body text-[15px] text-phantom-text-secondary leading-relaxed">
                  <span className="font-medium text-phantom-text-primary">Support:</span>{' '}
                  <a href="mailto:support@phantom.app" className="text-phantom-lime hover:underline">
                    support@phantom.app
                  </a>
                </p>
              </div>
            </section>

            <div className="pt-8 mt-8 border-t border-phantom-border-subtle">
              <p className="font-body text-[13px] text-phantom-text-muted leading-relaxed">
                By continuing to use Phantom, you consent to our use of cookies as described in this Cookie Policy.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
})

CookiePolicyPage.displayName = 'CookiePolicyPage'
export default CookiePolicyPage
