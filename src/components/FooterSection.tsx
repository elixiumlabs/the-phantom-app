import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const DiscordIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

const RedditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547l-.8 3.747c1.824.07 3.48.632 4.674 1.488c.308-.309.73-.491 1.207-.491c.968 0 1.754.786 1.754 1.754c0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87c-3.874 0-7.004-2.176-7.004-4.87c0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754c.463 0 .898.196 1.207.49c1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197a.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248c.687 0 1.248-.561 1.248-1.249c0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25c0 .687.561 1.248 1.249 1.248c.688 0 1.249-.561 1.249-1.249c0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094a.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913c.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463a.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73c-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
)

interface SocialItem {
  icon: React.ComponentType
  label: string
  href: string
}

const SOCIAL_ITEMS: SocialItem[] = [
  { icon: Github, label: 'GitHub', href: '#' },
  { icon: DiscordIcon, label: 'Discord', href: '#' },
  { icon: RedditIcon, label: 'Reddit', href: '#' },
]

const SocialButton = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const handleClick = (index: number) => {
    setActiveIndex(index)
    setTimeout(() => setActiveIndex(null), 300)
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <motion.div
        animate={{ opacity: isVisible ? 0 : 1 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <button
          className={cn(
            'relative h-8 px-4',
            'bg-phantom-surface-dark',
            'hover:bg-phantom-surface-light',
            'text-phantom-text-secondary',
            'border border-phantom-border-subtle',
            'rounded-md',
            'transition-colors duration-200',
            'font-body text-[13px]'
          )}
        >
          Follow us
        </button>
      </motion.div>

      <motion.div
        animate={{ width: isVisible ? 'auto' : 0 }}
        className="absolute top-0 left-0 flex h-8 overflow-hidden"
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      >
        {SOCIAL_ITEMS.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.a
              key={item.label}
              href={item.href}
              animate={{
                opacity: isVisible ? 1 : 0,
                x: isVisible ? 0 : -20,
              }}
              aria-label={item.label}
              className={cn(
                'h-8 w-8',
                'flex items-center justify-center',
                'bg-phantom-lime',
                'text-phantom-black',
                i === 0 && 'rounded-l-md',
                i === SOCIAL_ITEMS.length - 1 && 'rounded-r-md',
                'border-phantom-black/10 border-r last:border-r-0',
                'hover:bg-phantom-lime/90',
                'outline-none',
                'relative overflow-hidden',
                'transition-colors duration-200'
              )}
              onClick={() => handleClick(i)}
              transition={{
                duration: 0.3,
                ease: [0.23, 1, 0.32, 1],
                delay: isVisible ? i * 0.05 : 0,
              }}
            >
              <motion.div
                animate={{ scale: activeIndex === i ? 0.85 : 1 }}
                className="relative z-10"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <Icon />
              </motion.div>
              <motion.div
                animate={{ opacity: activeIndex === i ? 0.15 : 0 }}
                className="absolute inset-0 bg-phantom-black"
                initial={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              />
            </motion.a>
          )
        })}
      </motion.div>
    </div>
  )
}

const FooterSection = memo(() => (
  <footer className="bg-[#080808] border-t border-phantom-border-subtle py-16 px-6">
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-3 gap-12 mb-12">
        {/* Left */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-phantom-lime" />
            <span className="font-display font-bold text-[16px] text-phantom-text-primary">PHANTOM</span>
          </div>
          <p className="font-body text-[13px] text-phantom-text-muted mb-6">
            Build invisible. Launch inevitable.
          </p>
          <p className="font-body text-[13px] text-phantom-text-muted mb-4">
            © 2026 Elixium Digital. All Rights Reserved.
          </p>
          <SocialButton />
        </div>

        {/* Center */}
        <div>
          <p className="label mb-4">Product</p>
          <ul className="space-y-2">
            <li>
              <Link to="/features" className="font-body text-[14px] text-phantom-text-secondary hover:text-phantom-text-primary transition-colors no-underline">
                Features
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="font-body text-[14px] text-phantom-text-secondary hover:text-phantom-text-primary transition-colors no-underline">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/status" className="font-body text-[14px] text-phantom-text-secondary hover:text-phantom-text-primary transition-colors no-underline">
                System Status
              </Link>
            </li>
            <li>
              <Link to="/affiliates" className="font-body text-[14px] text-phantom-text-secondary hover:text-phantom-text-primary transition-colors no-underline">
                Affiliates
              </Link>
            </li>
          </ul>
        </div>

        {/* Right */}
        <div>
          <p className="label mb-4">Legal</p>
          <ul className="space-y-2">
            <li>
              <Link to="/refund-policy" className="font-body text-[14px] text-phantom-text-secondary hover:text-phantom-text-primary transition-colors no-underline">
                Refund Policy
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="font-body text-[14px] text-phantom-text-secondary hover:text-phantom-text-primary transition-colors no-underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms-of-service" className="font-body text-[14px] text-phantom-text-secondary hover:text-phantom-text-primary transition-colors no-underline">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/cookie-policy" className="font-body text-[14px] text-phantom-text-secondary hover:text-phantom-text-primary transition-colors no-underline">
                Cookie Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
))

FooterSection.displayName = 'FooterSection'
export default FooterSection
