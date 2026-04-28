import { memo, useState } from 'react';
import { motion } from 'framer-motion';

const navItems = ['Features', 'How It Works', 'Pricing', 'Changelog'] as const;

const spring = {
  type: 'spring',
  stiffness: 120,
  damping: 20,
} as const;

export const NavigationDock = memo(function NavigationDock() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.nav
      className="glass-panel glass-panel-strong fixed left-1/2 top-5 z-30 flex w-[min(92vw,720px)] -translate-x-1/2 items-center justify-between px-3 py-3"
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, mass: 0.95 }}
    >
      <div className="flex items-center gap-2 px-2">
        <span className="h-3 w-3 rounded-sm bg-[#c8f135]" />
        <span className="font-['Syne'] text-sm tracking-[0.2em] text-[#f0f0f0]">PHANTOM</span>
      </div>

      <ul className="flex items-center gap-1">
        {navItems.map((item, index) => {
          const active = hovered === index;

          return (
            <motion.li
              key={item}
              className="relative"
              onHoverStart={() => setHovered(index)}
              onHoverEnd={() => setHovered(null)}
              animate={{ scale: active ? 1.04 : 1, filter: `blur(${active ? 0 : 0.15}px)` }}
              transition={spring}
            >
              <motion.button
                type="button"
                className="relative overflow-hidden rounded-xl border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.1em] text-[#f0f0f0]"
                animate={{
                  paddingLeft: active ? '1.4rem' : '1rem',
                  paddingRight: active ? '1.4rem' : '1rem',
                  backdropFilter: `blur(${active ? 80 : 46}px) saturate(${active ? 180 : 140}%)`,
                  backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                }}
                transition={spring}
              >
                {item}
              </motion.button>
            </motion.li>
          );
        })}
      </ul>

      <motion.button
        type="button"
        className="rounded-xl bg-[#c8f135] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#0a0a0a]"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        transition={spring}
      >
        Start Free
      </motion.button>
    </motion.nav>
  );
});
