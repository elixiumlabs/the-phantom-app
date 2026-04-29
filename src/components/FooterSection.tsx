import { memo } from 'react'
import { Twitter, Linkedin } from 'lucide-react'

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
          <p className="font-body text-[13px] text-phantom-text-muted">
            © 2025 Phantom. All rights reserved.
          </p>
        </div>

        {/* Center */}
        <div>
          <p className="label mb-4">Product</p>
          <ul className="space-y-2">
            {['Features', 'Pricing', 'Changelog', 'Roadmap'].map(item => (
              <li key={item}>
                <a href={`#${item.toLowerCase()}`} className="font-body text-[14px] text-phantom-text-secondary hover:text-phantom-text-primary transition-colors no-underline">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Right */}
        <div>
          <p className="label mb-4">Legal</p>
          <ul className="space-y-2">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <li key={item}>
                <a href="#" className="font-body text-[14px] text-phantom-text-secondary hover:text-phantom-text-primary transition-colors no-underline">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between pt-8 border-t border-phantom-border-subtle">
        <div className="flex items-center gap-4">
          <a href="#" className="text-phantom-text-muted hover:text-phantom-text-primary transition-colors" aria-label="Twitter">
            <Twitter size={18} />
          </a>
          <a href="#" className="text-phantom-text-muted hover:text-phantom-text-primary transition-colors" aria-label="LinkedIn">
            <Linkedin size={18} />
          </a>
        </div>
      </div>
    </div>
  </footer>
))

FooterSection.displayName = 'FooterSection'
export default FooterSection
