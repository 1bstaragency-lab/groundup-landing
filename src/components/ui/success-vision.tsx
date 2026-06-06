/**
 * SuccessVision — "This is the artist uP gets you to."
 *
 * Reusable success-vision section. Shows the graduated-artist outcomes
 * (streams, revenue, releases, network) plus the accolade trophy case,
 * so every visitor sees the future-self before they see the price.
 *
 * Used on:
 *   - LandingPage (homepage) between "Meet uP" and "Intelligent Workflows"
 *   - Future paywall walkthroughs (PaywallShell will mount this)
 */
import { motion } from 'framer-motion'

const OUTCOMES: { label: string; before: string; after: string; unit?: string }[] = [
  { label: 'Monthly Spotify listeners', before: '< 2k',      after: '50k – 200k+' },
  { label: 'Music revenue / month',     before: '$0 – $50',  after: '$800 – $3k' },
  { label: 'Releases per year',         before: '1 – 2',     after: '6 – 10' },
  { label: 'Active curator network',    before: '0',         after: '30+ relationships' },
  { label: 'Editorial placements',      before: '0',         after: '3 – 6 per release' },
  { label: 'Sync / brand deals',        before: '0',         after: '1 – 3 closed' },
]

const ACCOLADES: { icon: string; title: string; sub: string }[] = [
  { icon: '★', title: 'Spotify Editorial',  sub: 'First playlist placement' },
  { icon: '🎯', title: '10k Stream Month',  sub: 'First milestone unlocked' },
  { icon: '💰', title: '$1k Revenue Month', sub: 'Music starts paying you' },
  { icon: '📺', title: 'Sync Placement',    sub: 'TV, film, or ad license' },
  { icon: '🎫', title: 'Sold-Out Show',     sub: 'First room you packed' },
  { icon: '✓', title: 'Verified Artist',    sub: 'Spotify badge unlocked' },
]

export function SuccessVision({ ctaHref = '#signup', ctaLabel = 'Start the plan' }: {
  ctaHref?: string
  ctaLabel?: string
}) {
  return (
    <section className="py-32 px-6 bg-black relative overflow-hidden">
      {/* Soft gold floor glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-[#FFD700]/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
            <span className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.25em]">
              The Graduated Artist
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.95] mb-6"
          >
            This is the artist<br />
            <span className="text-[#FFD700]">uP gets you to.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-white/50 text-base md:text-lg max-w-2xl mx-auto font-medium"
          >
            Not theoretical. This is the 12-month blueprint uP runs for you, week by week.
          </motion.p>
        </div>

        {/* Before → After outcomes grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {OUTCOMES.map((o, i) => (
            <motion.div
              key={o.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="p-6 rounded-3xl border border-white/8 bg-zinc-900/40 hover:border-[#FFD700]/30 transition-colors group"
            >
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-4">
                {o.label}
              </p>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-white/30 text-sm font-bold line-through">{o.before}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.5" className="opacity-60 group-hover:opacity-100 transition-opacity">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-[#FFD700] text-2xl font-black tracking-tight">{o.after}</p>
            </motion.div>
          ))}
        </div>

        {/* Trophy case */}
        <div className="mb-20">
          <p className="text-center text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            Milestones you'll unlock
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {ACCOLADES.map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="p-4 rounded-2xl border border-white/8 bg-zinc-900/60 text-center hover:border-[#FFD700]/40 hover:bg-zinc-900 transition-all"
              >
                <div className="text-2xl mb-2" aria-hidden>{a.icon}</div>
                <p className="text-white text-[11px] font-black uppercase tracking-wide leading-tight">{a.title}</p>
                <p className="text-white/35 text-[9px] font-medium mt-1 leading-snug">{a.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Closing CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-white text-2xl md:text-3xl font-black tracking-tighter mb-2">
            Your turn.
          </p>
          <p className="text-white/40 text-sm font-medium mb-8 max-w-md mx-auto">
            uP texts you the first step the moment you sign up.
          </p>
          <a
            href={ctaHref}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest transition-transform hover:scale-105 active:scale-[0.98]"
            style={{
              background: '#FFD700',
              color:      '#000',
              boxShadow:  '0 8px 32px rgba(255,215,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}
          >
            {ctaLabel}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default SuccessVision
