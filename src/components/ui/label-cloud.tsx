"use client"

import { motion } from "framer-motion"

const LABELS = [
  '10K Projects',
  'Interscope Records',
  'Geffen Records',
  'Simple Stupid Records',
  'Atlantic Records',
]

/**
 * "Powering releases at" social-proof strip — record labels using GrounduP.
 * Wordmark treatment (no third-party logo assets) styled in the GrounduP
 * gold/chrome language, with a subtle marquee on mobile and a static grid
 * on desktop.
 */
export function LabelCloud() {
  return (
    <section className="py-20 px-6 bg-black border-y border-white/5 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-[#FFD700] text-[10px] font-black uppercase tracking-[0.4em] mb-3">
          Trusted by artists & teams signed to
        </p>
        <p className="text-center text-white/30 text-sm font-medium mb-12 max-w-md mx-auto">
          We've run rollouts for artists and management teams across these rosters.
        </p>

        {/* Desktop: static centered grid */}
        <div className="hidden md:flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {LABELS.map((label, i) => (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="text-white/45 hover:text-white text-xl lg:text-2xl font-black uppercase tracking-tight transition-colors duration-300 whitespace-nowrap"
            >
              {label}
            </motion.span>
          ))}
        </div>

        {/* Mobile: seamless marquee */}
        <div className="md:hidden relative">
          {/* edge fades */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
          <div className="flex gap-10 animate-[labelmarquee_24s_linear_infinite] w-max">
            {[...LABELS, ...LABELS].map((label, i) => (
              <span
                key={`${label}-${i}`}
                className="text-white/45 text-lg font-black uppercase tracking-tight whitespace-nowrap"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes labelmarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
