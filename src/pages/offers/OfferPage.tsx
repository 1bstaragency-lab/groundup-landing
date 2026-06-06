/**
 * Shared offer landing page. Reads config by slug from offerConfig.ts.
 *
 * Used by:
 *   /free      → 30 days free Pro
 *   /curators  → 50 free Spotify curator pitches
 *   /ads       → $50 Meta ad credit
 *   /rollout   → Free 8-week rollout plan
 *   /presave   → 3x pre-save boost
 *
 * Visual matches WaitlistPage (gold-on-cream brand, animated iPhone mock,
 * iOS-spaced contact header). CTA links straight to iMessage instead of
 * capturing email.
 */
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { IMESSAGE_LINK, OFFERS, type DemoMessage, type OfferConfig } from './offerConfig'
import { usePaywallTracking } from '../../hooks/usePaywallTracking'

// ─── Animated iPhone mock (matches WaitlistPage) ──────────────────────────────

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

function IPhoneMock({ messages }: { messages: DemoMessage[] }) {
  const ref       = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inView    = useInView(ref, { once: true, margin: '-60px' })

  const [visibleMsgs, setVisibleMsgs] = useState(0)
  const [showTyping,  setShowTyping]  = useState(false)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [visibleMsgs, showTyping])

  // Generate timer sequence based on message count
  useEffect(() => {
    if (!inView) return
    const timers: ReturnType<typeof setTimeout>[] = []
    let elapsed = 600

    messages.forEach((m, i) => {
      if (m.from === 'up') {
        const typingStart = elapsed
        const reveal      = elapsed + 1100
        timers.push(setTimeout(() => setShowTyping(true), typingStart))
        timers.push(setTimeout(() => { setVisibleMsgs(i + 1); setShowTyping(false) }, reveal))
        elapsed = reveal + 700
      } else {
        timers.push(setTimeout(() => setVisibleMsgs(i + 1), elapsed))
        elapsed += 900
      }
    })

    return () => timers.forEach(clearTimeout)
  }, [inView, messages])

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
          background: 'linear-gradient(160deg, #2a2a2a 0%, #1a1a1a 50%, #111 100%)',
          padding:    '10px',
          boxShadow:  '0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(0,0,0,0.6)',
        }}
      >
        <div className="rounded-[2.4rem] overflow-hidden bg-[#0A0A0A] w-full" style={{ minHeight: '548px' }}>
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-24 h-7 rounded-full bg-black" />
          </div>

          {/* iOS contact header with breathing room */}
          <div className="relative px-4 pt-3 pb-4 border-b border-white/5">
            <button
              className="absolute left-4 top-3 text-[#0A84FF] leading-none font-light"
              style={{ fontSize: '22px' }}
            >
              ‹
            </button>
            <button className="absolute right-4 top-4 text-[#0A84FF]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
            </button>
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
              {messages.map((msg, i) => {
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
                      className={`max-w-[82%] px-3 py-2.5 text-[12px] leading-[1.5] whitespace-pre-line ${
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

// ─── Headline renderers ──────────────────────────────────────────────────────

/**
 * Color-blocked editorial statement headline. Expects exactly 3 lines:
 *   line 1 → gold block  (e.g. "$300")
 *   line 2 → flowing dark text  (e.g. "of music management.")
 *   line 3 → black block with gold text  (e.g. "Free.")
 *
 * Looks like a bold magazine-cover statement instead of a normal H1.
 */
function ColorBlockHeadline({ text }: { text: string }) {
  const [topLine, midLine, bottomLine] = text.split('\n')

  return (
    <div className="w-full flex flex-col items-center gap-2.5">
      {topLine && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block px-7 py-2 rounded-2xl"
          style={{
            background: '#FFD700',
            boxShadow:  '0 10px 32px rgba(255,215,0,0.45), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}
        >
          <span className="block text-[4.5rem] md:text-[5.5rem] font-black tracking-tighter leading-none text-black">
            {topLine}
          </span>
        </motion.div>
      )}

      {midLine && (
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
          className="text-[1.85rem] md:text-[2.15rem] font-black tracking-tight leading-[1.15] text-zinc-900"
        >
          {midLine}
        </motion.h1>
      )}

      {bottomLine && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block px-6 py-1.5 rounded-2xl bg-zinc-900"
          style={{ boxShadow: '0 10px 32px rgba(0,0,0,0.25)' }}
        >
          <span
            className="block text-[2.6rem] md:text-[3rem] font-black tracking-tighter leading-none uppercase"
            style={{ color: '#FFD700' }}
          >
            {bottomLine}
          </span>
        </motion.div>
      )}
    </div>
  )
}

// ─── CTA Icons ────────────────────────────────────────────────────────────────

function CtaIcon({ name }: { name: OfferConfig['ctaIcon'] }) {
  if (name === 'check') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (name === 'spark') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.4H22l-6.3 4.6 2.4 7.4L12 17l-6.1 4.4 2.4-7.4L2 9.4h7.6L12 2z" />
      </svg>
    )
  }
  // default: message bubble
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z" />
    </svg>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function OfferPage({ offerId }: { offerId: string }) {
  const offer = OFFERS[offerId]
  const { trackCta } = usePaywallTracking(offer ? `offer:${offerId}` : '')

  useEffect(() => {
    if (offer) document.title = `${offer.eyebrow} · GrounduP`
  }, [offer])

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-600">
        Offer not found.
      </div>
    )
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
          {/* Eyebrow chip */}
          <div
            className="px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ background: 'rgba(255,215,0,0.15)', borderColor: 'rgba(184,134,11,0.3)', color: '#7A5C00' }}
          >
            {offer.eyebrow}
          </div>

          {/* Headline — color-block statement OR default H1 based on offer style */}
          {offer.headlineStyle === 'colorBlock' ? (
            <ColorBlockHeadline text={offer.headline} />
          ) : (
            <h1 className="text-[2.6rem] md:text-5xl font-black tracking-tighter leading-[1.05] text-zinc-900 whitespace-pre-line">
              {offer.headline}
            </h1>
          )}

          {/* Persistent product identity — shows on every offer page so the
              forefront is always "uP is an iMessage AI manager" before the
              offer-specific value prop. */}
          <div className="flex items-center gap-2 -mt-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#FFD700', boxShadow: '0 0 8px rgba(255,215,0,0.6)' }} />
            <p className="text-zinc-700 text-[11px] font-black uppercase tracking-[0.18em]">
              uP · Your AI Music Manager · In iMessage
            </p>
          </div>

          {/* Sub-copy */}
          <p className="text-zinc-600 text-[15px] leading-relaxed max-w-[340px]">
            {offer.subline}
          </p>

          {/* Animated iPhone mock with offer-specific conversation */}
          <div className="mt-3 mb-1">
            <IPhoneMock messages={offer.messages} />
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {offer.chips.map((c) => (
              <div
                key={c}
                className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-zinc-600 border border-zinc-200 bg-white"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                {c}
              </div>
            ))}
          </div>

          {/* Primary CTA → iMessage */}
          <a
            href={IMESSAGE_LINK}
            onClick={() => trackCta({ position: 'primary' })}
            className="w-full h-14 rounded-2xl font-black text-[15px] tracking-wide flex items-center justify-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-[0.98] mt-2"
            style={{
              background: '#FFD700',
              color:      '#000',
              boxShadow:  '0 4px 28px rgba(255,215,0,0.4), inset 0 1px 0 rgba(255,255,255,0.35)',
            }}
          >
            <CtaIcon name={offer.ctaIcon ?? 'message'} />
            {offer.ctaText}
          </a>

          <p className="text-zinc-400 text-[11px] font-medium -mt-2">
            {offer.trustLine}
          </p>

          <a
            href={IMESSAGE_LINK}
            onClick={() => trackCta({ position: 'secondary' })}
            className="text-[12px] font-black uppercase tracking-widest transition-colors mt-1"
            style={{ color: '#B8860B' }}
          >
            Opens iMessage · No app needed →
          </a>

          {/* Secondary: join waitlist if not ready */}
          <a
            href="/waitlist"
            className="text-zinc-400 hover:text-zinc-700 text-[11px] font-semibold underline underline-offset-4 mt-4 transition-colors"
          >
            Not ready? Join the waitlist instead
          </a>
        </motion.div>
      </main>
    </div>
  )
}

export default OfferPage
