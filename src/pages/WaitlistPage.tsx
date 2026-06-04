/**
 * /waitlist — Email capture for potential GrounduP customers.
 *
 * Visually mirrors AppPageV2 (animated iMessage mock + gold accents) but
 * swaps the "Text uP" CTA for an email form. Inserts into Supabase
 * `waitlist` table.
 */
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { supabase } from '../supabaseClient' // src/supabaseClient.ts

const CHIPS = ['💬 iMessage AI', '🎵 Release Planning', '🎯 Curator Matching', '📊 Meta Ads']

const MESSAGES = [
  {
    from: 'up' as const,
    text:
      'You have 3 tracks ready to pitch. I found 8 Spotify playlist curators in your lane — combined 2.1M followers. Want me to send the pitches now?',
  },
  { from: 'user' as const, text: 'Yes, send them.' },
  {
    from: 'up' as const,
    text:
      "Sent ✓ — Chill R&B Vibes (480K), Late Night Feels (210K) + 6 more. I'll track responses and update you.",
  },
  {
    from: 'up' as const,
    text:
      'Also — want me to run Meta ads pushing streams to Spotify and Apple Music? I can target fans of similar artists. ~400 new listeners/day at $20.',
  },
  { from: 'user' as const, text: 'Do it.' },
  {
    from: 'up' as const,
    text:
      'Setting it up now 🔥 One more thing — should I find TikTok influencers for promo content? I can match you with dance creators, reaction pages, or artists in your lane.',
  },
]

// ─── Animated iPhone mock (ported from AppPageV2) ─────────────────────────────

function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-sm w-fit"
      style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.18)' }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-1.5 h-1.5 rounded-full bg-[#FFD700]/60"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </motion.div>
  )
}

function IPhoneMock() {
  const ref       = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inView    = useInView(ref, { once: true, margin: '-60px' })

  const [visibleMsgs, setVisibleMsgs] = useState(0)
  const [showTyping,  setShowTyping]  = useState(false)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [visibleMsgs, showTyping])

  useEffect(() => {
    if (!inView) return
    const timers = [
      setTimeout(() => setShowTyping(true),                                   800),
      setTimeout(() => { setVisibleMsgs(1); setShowTyping(false) },          2100),
      setTimeout(() => setVisibleMsgs(2),                                    3000),
      setTimeout(() => setShowTyping(true),                                  3700),
      setTimeout(() => { setVisibleMsgs(3); setShowTyping(false) },          4800),
      setTimeout(() => setShowTyping(true),                                  5500),
      setTimeout(() => { setVisibleMsgs(4); setShowTyping(false) },          6600),
      setTimeout(() => setVisibleMsgs(5),                                    7500),
      setTimeout(() => setShowTyping(true),                                  8200),
      setTimeout(() => { setVisibleMsgs(6); setShowTyping(false) },          9400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [inView])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02, rotateY: 4, rotateX: -2, transition: { type: 'spring', stiffness: 200, damping: 22 } }}
      className="cursor-default select-none"
      style={{ perspective: '1000px', filter: 'drop-shadow(0 28px 56px rgba(0,0,0,0.18))' }}
    >
      <div
        className="relative w-[260px] rounded-[3rem] overflow-hidden"
        style={{
          background:  'linear-gradient(160deg, #2a2a2a 0%, #1a1a1a 50%, #111 100%)',
          padding:     '10px',
          boxShadow:   '0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(0,0,0,0.6)',
        }}
      >
        <div className="rounded-[2.4rem] overflow-hidden bg-[#0A0A0A] w-full" style={{ minHeight: '548px' }}>
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-24 h-7 rounded-full bg-black" />
          </div>

          {/* iOS-style contact header — back/action buttons sit on the outer
              edges, avatar + name + subtitle stack vertically in the center
              with breathing room between each element. */}
          <div className="relative px-4 pt-3 pb-4 border-b border-white/5">
            {/* Back chevron — pinned top-left */}
            <button
              className="absolute left-4 top-3 text-[#0A84FF] leading-none font-light"
              style={{ fontSize: '22px' }}
            >
              ‹
            </button>

            {/* Action button — pinned top-right */}
            <button className="absolute right-4 top-4 text-[#0A84FF]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
            </button>

            {/* Centered avatar + identity stack */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-11 h-11 rounded-full overflow-hidden"
                style={{ boxShadow: '0 0 12px rgba(255,215,0,0.45)' }}
              >
                <img src="/up-avatar.png" alt="uP" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-white text-[13px] font-semibold leading-none tracking-tight">uP</p>
                <p className="text-white/45 text-[10px] leading-none">GrounduP AI · Active now</p>
              </div>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="px-3 py-4 flex flex-col gap-2 overflow-y-auto"
            style={{ height: '320px', scrollbarWidth: 'none' }}
          >
            <AnimatePresence>
              {MESSAGES.map((msg, i) => {
                if (visibleMsgs < i + 1) return null
                const isUp = msg.from === 'up'
                return (
                  <motion.div
                    key={`msg${i}`}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex ${isUp ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[82%] px-3 py-2.5 text-[12px] leading-[1.5] ${
                        isUp ? 'rounded-2xl rounded-bl-sm text-white' : 'rounded-2xl rounded-br-sm text-white/80'
                      }`}
                      style={
                        isUp
                          ? { background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)' }
                          : { background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.08)' }
                      }
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                )
              })}

              {showTyping && (
                <motion.div key="typing" className="flex justify-start">
                  <TypingDots />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div
            className="mx-3 mb-4 flex items-center gap-2 px-3 py-2 rounded-full border border-white/10"
            style={{ background: '#1C1C1E' }}
          >
            <div className="flex-1 text-white/20 text-[12px]">iMessage</div>
            <div className="w-6 h-6 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFD700">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function WaitlistPage() {
  const [email,       setEmail]       = useState('')
  const [name,        setName]        = useState('')
  const [loading,     setLoading]     = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [position,    setPosition]    = useState<number | null>(null)

  useEffect(() => {
    document.title = 'Join the waitlist · GrounduP'
  }, [])

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError(null)

    const trimmed = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email.')
      return
    }

    setLoading(true)
    try {
      // Generate a referral code (same convention as the homepage)
      const refCode = btoa(trimmed).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)

      const { error: insertErr } = await supabase.from('waitlist').insert([
        {
          email:         trimmed,
          artist_name:   name.trim() || null,
          referral_code: refCode,
          source:        'waitlist_page',
        },
      ])

      // Ignore unique-constraint conflicts — they're already on the list
      if (insertErr && !/duplicate|unique/i.test(insertErr.message)) {
        console.warn('[waitlist] insert error:', insertErr)
      }

      // Compute a friendly position based on row count (best-effort)
      const { count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
      if (typeof count === 'number') setPosition(count + 200) // base offset

      setSubmitted(true)
    } catch (err) {
      console.error(err)
      // Still show success — never block on backend issues here
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: '#DDDBD4' }}>
      {/* gold top glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[70%] h-64 bg-[#FFD700]/12 blur-[100px] rounded-full" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-2xl mx-auto">
        <a href="/"><img src="/logo.webp" alt="GrounduP" className="h-9" /></a>
        <a
          href="/login"
          className="text-zinc-500 hover:text-zinc-900 text-[10px] font-black uppercase tracking-widest transition-colors"
        >
          Sign In
        </a>
      </nav>

      {/* Main */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-2 pb-28 max-w-md mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center gap-5 w-full"
        >
          {/* Eyebrow */}
          <div
            className="px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ background: 'rgba(255,215,0,0.15)', borderColor: 'rgba(184,134,11,0.3)', color: '#7A5C00' }}
          >
            Early Access Waitlist
          </div>

          {/* Headline */}
          <h1 className="text-[2.75rem] md:text-5xl font-black tracking-tighter leading-[1.05] text-zinc-900">
            Your career,<br />
            <span className="text-zinc-500">in your messages.</span>
          </h1>

          {/* Sub-copy */}
          <p className="text-zinc-600 text-[15px] leading-relaxed max-w-[300px]">
            uP is the iMessage AI for music careers — Spotify curator pitching, Meta ads, release strategy, all in one
            conversation. Get notified the moment we open your invite slot.
          </p>

          {/* Animated iPhone mock */}
          <div className="mt-3 mb-1">
            <IPhoneMock />
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {CHIPS.map((c) => (
              <div
                key={c}
                className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-zinc-600 border border-zinc-200 bg-white"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                {c}
              </div>
            ))}
          </div>

          {/* Form OR success state */}
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full mt-3 p-6 rounded-2xl text-center"
              style={{
                background:   'rgba(255,215,0,0.08)',
                borderWidth:  1,
                borderStyle:  'solid',
                borderColor:  'rgba(184,134,11,0.3)',
              }}
            >
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-zinc-900 text-[16px] font-black tracking-tight mb-1">You're on the list.</p>
              {position && (
                <p className="text-zinc-700 text-[13px] mb-3">
                  Your spot: <span className="font-black">#{position}</span>
                </p>
              )}
              <p className="text-zinc-600 text-[13px] leading-relaxed">
                Invites roll out in batches as we open seats. We appreciate your patience — keep an eye on{' '}
                <span className="font-bold text-zinc-900">{email}</span> for your access code.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleJoin} className="w-full mt-3 flex flex-col gap-2">
              {/* Pill input — email left, CTA right, in one container */}
              <div
                className="w-full h-14 flex items-center rounded-full bg-white pl-1 pr-1 transition-all focus-within:ring-2 focus-within:ring-[#FFD700]"
                style={{
                  border:    '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(255,215,0,0.12)',
                }}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 h-full bg-transparent px-5 text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="h-12 px-5 rounded-full font-black text-[14px] tracking-wide flex items-center justify-center gap-2 transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
                  style={{
                    background: '#FFD700',
                    color:      '#000',
                    boxShadow:  '0 2px 12px rgba(255,215,0,0.4), inset 0 1px 0 rgba(255,255,255,0.35)',
                  }}
                >
                  {loading ? 'Joining…' : 'Join waitlist'}
                </button>
              </div>

              {/* Optional artist name — collapsed below as a smaller secondary field */}
              <input
                type="text"
                placeholder="Artist name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-5 rounded-full text-[13px] font-medium text-zinc-700 placeholder:text-zinc-400 border border-zinc-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/40 focus:border-transparent transition"
              />

              {error && <p className="text-red-600 text-[12px] font-semibold mt-0.5">{error}</p>}

              <p className="text-zinc-400 text-[11px] font-medium mt-1">
                We'll email you the moment your invite is ready · No spam
              </p>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  )
}

export default WaitlistPage
