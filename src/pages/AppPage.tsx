import { motion } from 'framer-motion';

const IMESSAGE_LINK = 'https://start.msg.new/EEHfxKYWDk';

const CHIPS = ['💬 iMessage AI', '🎵 Release Planning', '🎯 Curator Matching'];

export function AppPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#FFD700]/8 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FFD700]/5 blur-[120px] rounded-full" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-4xl mx-auto">
        <a href="/">
          <img src="/logo.webp" alt="GrounduP" className="h-10" />
        </a>
        <a
          href="/login"
          className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
        >
          Sign In
        </a>
      </nav>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-8 pb-24 max-w-lg mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center gap-5 w-full"
        >
          {/* Eyebrow */}
          <div className="px-3 py-1.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/25">
            <span className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.2em]">
              GrounduP Artist OS
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1]">
            Your career,<br />
            <span className="text-white/50">in your messages.</span>
          </h1>

          {/* Sub-copy */}
          <p className="text-white/40 text-[15px] leading-relaxed max-w-xs">
            uP is your personal music career AI — strategy, releases, and curator connections, all through iMessage.
          </p>

          {/* Mock conversation — AI-generated iPhone screenshot */}
          <div className="w-full mt-2 flex justify-center">
            <img
              src="/up-imessage-preview.png"
              alt="uP iMessage conversation preview"
              className="w-56 rounded-[2rem] shadow-[0_24px_80px_rgba(0,0,0,0.7)]"
              draggable={false}
            />
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {CHIPS.map((chip) => (
              <div
                key={chip}
                className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-[12px] font-semibold"
              >
                {chip}
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={IMESSAGE_LINK}
            className="w-full mt-2 h-14 rounded-2xl bg-[#FFD700] text-black font-black text-[15px] tracking-wide flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_40px_rgba(255,215,0,0.25)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z"/>
            </svg>
            Text uP on iMessage
          </a>

          <p className="text-white/20 text-[11px] font-medium -mt-2">
            Opens iMessage · Free to start
          </p>
        </motion.div>
      </main>
    </div>
  );
}

export default AppPage;
