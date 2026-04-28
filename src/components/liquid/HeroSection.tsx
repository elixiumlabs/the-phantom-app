import { memo } from 'react';
import { motion } from 'framer-motion';

type HeroSectionProps = {
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
};

const spring = {
  type: 'spring',
  stiffness: 120,
  damping: 20,
} as const;

export const HeroSection = memo(function HeroSection({ onPrimaryAction, onSecondaryAction }: HeroSectionProps) {
  return (
    <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 pb-20 pt-36 text-center">
      <motion.div
        className="glass-panel mb-6 inline-flex items-center gap-3 rounded-full px-5 py-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <motion.span
          className="h-2 w-2 rounded-full bg-[#c8f135]"
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
        <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-[0.16em] text-[#c8f135]">
          Market validation without the audience
        </span>
      </motion.div>

      <motion.h1
        className="max-w-4xl font-['Syne'] text-5xl font-bold leading-[1.02] text-[#f0f0f0] md:text-7xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, mass: 1.05, delay: 0.08 }}
      >
        Build invisible.
        <br />
        Launch inevitable.
      </motion.h1>

      <motion.p
        className="mt-6 max-w-2xl font-['DM_Mono'] text-base text-[#9a9a9a] md:text-xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.16 }}
      >
        Phantom guides you through four phases of silent brand validation — so the first thing the market sees is proof,
        not potential.
      </motion.p>

      <motion.div
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.2 }}
      >
        <motion.button
          className="glass-panel rounded-xl border border-[#d8ff66]/40 bg-[#c8f135] px-6 py-3 font-['Space_Grotesk'] text-sm font-semibold uppercase tracking-[0.1em] text-[#0a0a0a]"
          onClick={onPrimaryAction}
          whileHover={{ scale: 1.04, backdropFilter: 'blur(80px)' }}
          whileTap={{ scale: 0.98 }}
          transition={spring}
        >
          Start Building Free
        </motion.button>

        <motion.button
          className="glass-panel rounded-xl border border-white/20 px-6 py-3 font-['Space_Grotesk'] text-sm uppercase tracking-[0.1em] text-[#f0f0f0]"
          onClick={onSecondaryAction}
          whileHover={{ scale: 1.03, backdropFilter: 'blur(72px)' }}
          whileTap={{ scale: 0.98 }}
          transition={spring}
        >
          See How It Works
        </motion.button>
      </motion.div>

      <p className="mt-5 font-['DM_Mono'] text-xs text-[#555555]">No credit card. No public profile. No noise.</p>

      <motion.div
        className="glass-panel glass-panel-strong mt-14 w-full overflow-hidden rounded-3xl border border-white/20"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.26 }}
      >
        <div className="glass-noise pointer-events-none absolute inset-0" />
        <div className="grid gap-4 p-6 md:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-black/25 p-5 text-left backdrop-blur-2xl">
            <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-[0.16em] text-[#c8f135]">Phase Tracker</h3>
            <p className="mt-3 font-['DM_Mono'] text-sm text-[#f0f0f0]">01 Identify · 02 Test · 03 Iterate · 04 Lock</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/25 p-5 text-left backdrop-blur-2xl">
            <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-[0.16em] text-[#c8f135]">Signal Graph</h3>
            <p className="mt-3 font-['DM_Mono'] text-sm text-[#f0f0f0]">Replies +24% · Conversions +11% · Objections -32%</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-black/25 p-5 text-left backdrop-blur-2xl">
            <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-[0.16em] text-[#c8f135]">Proof Vault</h3>
            <p className="mt-3 font-['DM_Mono'] text-sm text-[#f0f0f0]">12 Testimonials · 6 Case Studies · 18 Results</p>
          </article>
        </div>
      </motion.div>
    </section>
  );
});
