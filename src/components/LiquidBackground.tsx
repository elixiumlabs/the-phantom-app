import { memo } from 'react'

const LiquidBackground = memo(() => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-phantom-black">
    <div className="liquid-orb liquid-orb-1" />
    <div className="liquid-orb liquid-orb-2" />
    <div className="liquid-orb liquid-orb-3" />
  </div>
))

LiquidBackground.displayName = 'LiquidBackground'
export default LiquidBackground
