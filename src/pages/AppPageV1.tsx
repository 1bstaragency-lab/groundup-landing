/**
 * /app — Version A: Refined AI-image iPhone
 * White/silver bg · photorealistic phone screenshot · scroll-reveal + tilt
 */
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const IMESSAGE_LINK = 'https://start.msg.new/EEHfxKYWDk';

const CHIPS = ['💬 iMessage AI', '🎵 Release Planning', '🎯 Curator Matching', '📊 Meta Ads'];

const QUOTES = [
  { q: '"Like having a manager in my pocket."', a: 'R&B artist, 42K monthly listeners' },
  { q: '"Pitched 8 curators in one conversation."', a: 'Hip-Hop producer, Chicago' },
  { q: '"uP caught a deadline I completely forgot."', a: 'Independent artist, Atlanta' },
];

export function AppPageV1() {
  const phoneRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: phoneRef, offset: ['start end', 'center 60%'] });
  const y       = useTransform(scrollYProgress, [0, 1], [50, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.45], [0, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [10, 0]);

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: '#F4F3EF' }}>
      {/* gold top glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[70%] h-64 bg-[#FFD700]/12 blur-[100px] rounded-full" />
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-2xl mx-auto">
        <a href="/"><img src="/logo.webp" alt="GrounduP" className="h-9" /></a>
        <a href="/login" className="text-zinc-500 hover:text-zinc-900 text-[10px] font-black uppercase tracking-widest transition-colors">
          Sign In
        </a>
      </nav>

      {/* ── Main ── */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-2 pb-28 max-w-md mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center gap-5 w-full"
        >
          {/* Eyebrow */}
          <div className="px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ background: 'rgba(255,215,0,0.15)', borderColor: 'rgba(184,134,11,0.3)', color: '#7A5C00' }}>
            GrounduP Artist OS
          </div>

          {/* Headline */}
          <h1 className="text-[2.75rem] md:text-5xl font-black tracking-tighter leading-[1.05] text-zinc-900">
            Your career,<br />
            <span className="text-zinc-500">in your messages.</span>
          </h1>

          {/* Sub-copy */}
          <p className="text-zinc-600 text-[15px] leading-relaxed max-w-[280px]">
            uP is your iMessage AI — Spotify curator pitching, Meta ads, release strategy, all in one conversation.
          </p>

          {/* Social proof */}
          <div className="flex flex-col gap-2.5 w-full mt-1">
            {QUOTES.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.1, duration: 0.4 }}
                className="flex flex-col items-start text-left px-4 py-2.5 rounded-xl bg-white/70 border border-zinc-200"
              >
                <p className="text-zinc-700 text-[13px] font-semibold italic leading-snug">{item.q}</p>
                <p className="text-zinc-400 text-[11px] font-medium mt-0.5">{item.a}</p>
              </motion.div>
            ))}
          </div>

          {/* ── iPhone scroll-reveal ── */}
          <div ref={phoneRef} className="w-full mt-4 flex justify-center" style={{ perspective: '1000px' }}>
            <motion.div
              style={{ y, opacity, rotateX }}
              whileHover={{
                scale: 1.03, rotateY: 5, rotateX: -3,
                transition: { type: 'spring', stiffness: 220, damping: 22 },
              }}
              className="cursor-pointer"
            >
              {/* Subtle phone glow */}
              <div className="relative">
                <div className="absolute inset-0 rounded-[2.5rem] bg-[#FFD700]/15 blur-2xl scale-90" />
                <img
                  src="/up-imessage-preview.png"
                  alt="uP iMessage conversation"
                  className="relative w-56 rounded-[2.5rem] select-none"
                  style={{ boxShadow: '0 28px 70px rgba(0,0,0,0.18), 0 6px 20px rgba(0,0,0,0.1)' }}
                  draggable={false}
                />
              </div>
            </motion.div>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {CHIPS.map((c) => (
              <div key={c} className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-zinc-600 border border-zinc-200 bg-white"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                {c}
              </div>
            ))}
          </div>

          {/* ── CTA ── */}
          <a href={IMESSAGE_LINK}
            className="w-full h-14 rounded-2xl font-black text-[15px] tracking-wide flex items-center justify-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: '#FFD700', color: '#000', boxShadow: '0 4px 28px rgba(255,215,0,0.4), inset 0 1px 0 rgba(255,255,255,0.35)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z"/>
            </svg>
            Text uP — Start Free
          </a>

          <p className="text-zinc-400 text-[11px] font-medium -mt-3">
            Opens iMessage · No app download needed
          </p>

          <a href={IMESSAGE_LINK} className="text-[12px] font-black uppercase tracking-widest transition-colors mt-1"
            style={{ color: '#B8860B' }}>
            10 free messages · No credit card →
          </a>
        </motion.div>
      </main>
    </div>
  );
}

export default AppPageV1;
