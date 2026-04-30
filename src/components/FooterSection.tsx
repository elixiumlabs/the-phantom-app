import { memo } from 'react'
import { Link } from 'react-router-dom'
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
            <li>
              <Link to="/features" className="font-body text-[14px] text-phantom-text-secondary hover:text-phantom-text-primary transition-colors no-underline">
                Features
              </Link>
            </li>
            <li>
              <a href="#pricing" className="font-body text-[14px] text-phantom-text-secondary hover:text-phantom-text-primary transition-colors no-underline">
                Pricing
              </a>
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
