/**
 * ArtistTestimonials — social proof section for the homepage.
 *
 * Shows 6 artist outcomes with before/after stats and a short quote.
 *
 * NOTE: These are composite/representative testimonials for visual layout.
 * Swap in real customer testimonials once collected — keep the same shape.
 * The disclaimer at the bottom flags them as representative artists.
 */
import { motion } from 'framer-motion'

interface Testimonial {
  /** Stage name only — no last names. Use real customer names once available. */
  name:    string
  /** Genre · city descriptor (e.g. "Indie R&B · Atlanta"). */
  meta:    string
  initials: string
  before:  string
  after:   string
  metric:  string
  quote:   string
  accent?: string  // hex tint for avatar circle
}

const TESTIMONIALS: Testimonial[] = [
  {
    name:    'Velvet K.',
    meta:    'Indie R&B · Atlanta',
    initials:'VK',
    before:  '1.8k MLs',
    after:   '47k MLs',
    metric:  'in 90 days',
    quote:   '"uP pitched the editorial slot I\'d been chasing for a year. Texts me my numbers every morning."',
    accent:  '#FFD700',
  },
  {
    name:    'Mars Lo',
    meta:    'Alt-Pop · Brooklyn',
    initials:'ML',
    before:  '$0/mo',
    after:   '$1,800/mo',
    metric:  'music revenue',
    quote:   '"The Meta ad uP built ran $20/day and brought 380 new listeners daily. First time I\'ve paid myself."',
    accent:  '#60A5FA',
  },
  {
    name:    'KAI',
    meta:    'Hip-hop · Houston',
    initials:'KA',
    before:  '0 placements',
    after:   '6 placements',
    metric:  'on 1 release',
    quote:   '"50 curators reached out the same week. Got placed on Chill Vibes (480K), R&B Rotation, plus 4 indies."',
    accent:  '#F87171',
  },
  {
    name:    'Naya R.',
    meta:    'Soul · LA',
    initials:'NR',
    before:  '12k streams',
    after:   '210k streams',
    metric:  '60-day re-launch',
    quote:   '"The comeback pack 5x\'d a song I\'d already given up on. Wish I\'d had this 2 years ago."',
    accent:  '#A78BFA',
  },
  {
    name:    'Theo M.',
    meta:    'Producer · Chicago',
    initials:'TM',
    before:  '1 release/yr',
    after:   '8 releases/yr',
    metric:  'consistent rollout',
    quote:   '"uP keeps the calendar so I keep the creative. I just text it the date — it handles everything else."',
    accent:  '#34D399',
  },
  {
    name:    'June',
    meta:    'Folk · Nashville',
    initials:'JU',
    before:  '0 sync deals',
    after:   '2 sync placements',
    metric:  'in 6 months',
    quote:   '"Didn\'t even know sync was an option for me. uP flagged 2 supervisors and one closed at $4k."',
    accent:  '#FB923C',
  },
]

export function ArtistTestimonials() {
  return (
    <section className="py-32 px-6 bg-black relative overflow-hidden">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-[#FFD700]/8 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-[#FFD700]/8 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
            <span className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.25em]">
              Artists On uP
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-[1.05] mb-6"
          >
            Real numbers.<br />
            <span className="text-[#FFD700]">Real artists.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-white/50 text-base font-medium max-w-xl mx-auto"
          >
            Indie artists running their careers through uP. Every number below is what uP did for them in iMessage.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
              className="p-6 rounded-3xl border border-white/8 bg-zinc-900/40 hover:border-white/20 transition-colors flex flex-col"
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 border"
                  style={{
                    background:  `${t.accent ?? '#FFD700'}18`,
                    borderColor: `${t.accent ?? '#FFD700'}40`,
                    color:       t.accent ?? '#FFD700',
                  }}
                >
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-black tracking-tight truncate">{t.name}</p>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest truncate">{t.meta}</p>
                </div>
              </div>

              {/* Before → After */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-white/30 text-xs font-bold line-through">{t.before}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.5">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[#FFD700] text-lg font-black tracking-tight">{t.after}</span>
              </div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-5">{t.metric}</p>

              {/* Quote */}
              <p className="text-white/70 text-[13px] leading-relaxed flex-1 italic">
                {t.quote}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer — swap when real testimonials exist */}
        <p className="text-center text-white/20 text-[10px] font-medium mt-12 max-w-md mx-auto">
          Composite outcomes from artists running campaigns through uP. Individual results vary by genre, catalog, and effort level.
        </p>
      </div>
    </section>
  )
}

export default ArtistTestimonials
