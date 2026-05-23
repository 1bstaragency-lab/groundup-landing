import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

const IMESSAGE_LINK = 'https://start.msg.new/EEHfxKYWDk';

const CHIPS = [
  { icon: '💬', label: 'iMessage AI' },
  { icon: '🎵', label: 'Release Planning' },
  { icon: '🎯', label: 'Curator Matching' },
  { icon: '📊', label: 'Career Strategy' },
];

const SOCIAL_PROOF = [
  '"uP knew my drop date before I did."',
  '"Like having a manager in my pocket."',
  '"Pitched 3 curators in one convo."',
];

export function AppPage() {
  const phoneRef = useRef<HTMLDivElement>(null);
  const phoneInView = useInView(phoneRef, { once: true, margin: '-80px' });

  const { scrollYProgress } = useScroll({
    target: phoneRef,
    offset: ['start end', 'center center'],
  });
  const phoneY      = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const phoneOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const phoneRotate  = useTransform(scrollYProgress, [0, 1], [8, 0]);

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: '#F7F6F2' }}>

      {/* Subtle top glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-[#FFD700]/10 blur-[100px] rounded-full" />
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-2xl mx-auto">
        <a href="/">
          <img src="/logo.webp" alt="GrounduP" className="h-9" />
        </a>
        <a
          href="/login"
          className="text-zinc-400 hover:text-zinc-800 text-[10px] font-black uppercase tracking-widest transition-colors"
        >
          Sign In
        </a>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-4 pb-24 max-w-lg mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4 w-full"
        >
          {/* Eyebrow */}
          <div
            className="px-3.5 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ background: 'rgba(255,215,0,0.12)', borderColor: 'rgba(255,215,0,0.3)', color: '#8A6800' }}
          >
            GrounduP Artist OS
          </div>

          {/* Headline */}
          <h1 className="text-[2.6rem] md:text-5xl font-black tracking-tighter leading-[1.05] text-zinc-900">
            Your career,<br />
            <span className="text-zinc-400">in your messages.</span>
          </h1>

          {/* Sub-copy */}
          <p className="text-zinc-500 text-[15px] leading-relaxed max-w-xs">
            uP is your personal music career AI — strategy, releases, and curator connections, all through iMessage.
          </p>

          {/* Social proof */}
          <div className="flex flex-col gap-1 w-full mt-1">
            {SOCIAL_PROOF.map((q, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="text-zinc-400 text-[12px] font-medium italic"
              >
                {q}
              </motion.p>
            ))}
          </div>

          {/* ── CTA ──────────────────────────────────────────────────────── */}
          <a
            href={IMESSAGE_LINK}
            className="w-full mt-2 h-14 rounded-2xl font-black text-[15px] tracking-wide flex items-center justify-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: '#FFD700',
              color: '#000',
              boxShadow: '0 4px 30px rgba(255,215,0,0.35), 0 1px 0 rgba(255,255,255,0.4) inset',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z"/>
            </svg>
            Text uP — Start Free
          </a>
          <p className="text-zinc-400 text-[11px] font-medium -mt-2">
            Opens iMessage · No app download needed
          </p>

          {/* ── iPhone scroll reveal ─────────────────────────────────────── */}
          <div ref={phoneRef} className="w-full mt-6 flex justify-center perspective-[1200px]">
            <motion.div
              style={{ y: phoneY, opacity: phoneOpacity, rotateX: phoneRotate }}
              whileHover={{ scale: 1.03, rotateY: 4, rotateX: -2, transition: { type: 'spring', stiffness: 250, damping: 25 } }}
              className="cursor-pointer"
            >
              <motion.img
                src="/up-imessage-preview.png"
                alt="uP iMessage conversation"
                className="w-60 rounded-[2.5rem] select-none"
                style={{
                  boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12)',
                }}
                draggable={false}
                animate={phoneInView ? { opacity: 1 } : { opacity: 0 }}
              />
            </motion.div>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {CHIPS.map((c) => (
              <div
                key={c.label}
                className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-zinc-600 border border-zinc-200 bg-white"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              >
                {c.icon} {c.label}
              </div>
            ))}
          </div>

          {/* Bottom CTA repeat */}
          <a
            href={IMESSAGE_LINK}
            className="mt-4 text-[13px] font-black uppercase tracking-widest transition-colors"
            style={{ color: '#B8860B' }}
          >
            Get started for free →
          </a>
        </motion.div>
      </main>
    </div>
  );
}

export default AppPage;
