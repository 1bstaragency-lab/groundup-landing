/**
 * WaitlistModal — the single, reusable "join the waitlist" popup.
 *
 * Replaces the old pattern of scrolling to a form at the bottom of the
 * page (or navigating to a standalone page) for every CTA click. Keeping
 * visitors on the page they're already reading is lower-friction and
 * loses fewer people mid-intent.
 *
 * Triggered from anywhere via `window.dispatchEvent(new CustomEvent(WAITLIST_OPEN_EVENT))`,
 * or the `openWaitlistModal()` helper below. Mounted once at the App root
 * so every route can trigger it without prop drilling.
 */
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../supabaseClient'

export const WAITLIST_OPEN_EVENT = 'gup:waitlist-open'

/** Helper to open the modal from any component: `openWaitlistModal()`. */
export function openWaitlistModal() {
  window.dispatchEvent(new CustomEvent(WAITLIST_OPEN_EVENT))
}

// ─── Data-referenced sliders ──────────────────────────────────────────────
// Each stop pairs a plain-English label with a concrete number range, so the
// slider reads as a real self-assessment instead of a vague 1-5 scale.
interface SliderStop { label: string; sub: string }

const MOMENTUM: SliderStop[] = [
  { label: 'Just Starting Out', sub: '0–1K monthly listeners' },
  { label: 'Building Buzz',     sub: '1K–10K monthly listeners' },
  { label: 'Bubbling Up',       sub: '10K–50K monthly listeners' },
  { label: 'On The Rise',       sub: '50K–250K monthly listeners' },
  { label: 'Taking Off',        sub: '250K+ monthly listeners' },
]

const INVESTMENT: SliderStop[] = [
  { label: 'Not Much Yet',        sub: '$0–500 invested' },
  { label: 'Getting Started',     sub: '$500–2K invested' },
  { label: 'Building It Out',     sub: '$2K–10K invested' },
  { label: 'Serious Investment',  sub: '$10K–50K invested' },
  { label: 'All In',              sub: '$50K+ invested' },
]

function DataSlider({
  label, stops, value, onChange,
}: {
  label:    string
  stops:    SliderStop[]
  value:    number
  onChange: (v: number) => void
}) {
  const current = stops[value]
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-white/45">{label}</label>
        <span className="text-[#FFD700] text-[10px] font-black text-right">{current.label}</span>
      </div>
      <input
        type="range"
        min={0}
        max={stops.length - 1}
        step={1}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-[#FFD700] cursor-pointer"
      />
      <div className="flex items-center justify-between mt-1">
        <span className="text-white/25 text-[8px] font-bold uppercase tracking-wide">{stops[0].sub}</span>
        <span className="text-[#FFD700]/70 text-[9px] font-bold">{current.sub}</span>
        <span className="text-white/25 text-[8px] font-bold uppercase tracking-wide">{stops[stops.length - 1].sub}</span>
      </div>
    </div>
  )
}

export function WaitlistModal() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [yearsActive, setYearsActive] = useState('')
  const [momentum, setMomentum]       = useState(0)
  const [investment, setInvestment]   = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [referralCode, setReferralCode] = useState('')
  const [position, setPosition] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const h = () => setOpen(true)
    window.addEventListener(WAITLIST_OPEN_EVENT, h)
    return () => window.removeEventListener(WAITLIST_OPEN_EVENT, h)
  }, [])

  // Close on ESC
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', h)
      document.body.style.overflow = ''
    }
  }, [open])

  function close() {
    setOpen(false)
    // Reset for next open, after the exit animation finishes
    setTimeout(() => {
      setSubmitted(false)
      setError(null)
      setName('')
      setEmail('')
      setYearsActive('')
      setMomentum(0)
      setInvestment(0)
      setPosition(null)
      setCopied(false)
    }, 250)
  }

  async function handleSubmit(e: React.FormEvent) {
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
      const refCode = btoa(trimmed).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)
      const { error: insertErr } = await supabase.from('waitlist').insert([{
        email: trimmed,
        artist_name: name.trim() || null,
        referral_code: refCode,
        source: 'popup',
        years_active:       yearsActive.trim() || null,
        momentum_level:     MOMENTUM[momentum].label,
        momentum_score:     momentum,
        investment_level:   INVESTMENT[investment].label,
        investment_score:   investment,
      }])
      if (insertErr && !/duplicate|unique/i.test(insertErr.message)) {
        console.warn('[waitlist] insert error:', insertErr)
      }

      // Same "position" convention as the standalone /waitlist page —
      // base offset + real signup count, so numbers are consistent
      // across every entry point.
      const { count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
      if (typeof count === 'number') setPosition(count + 200)

      setReferralCode(refCode)
      setSubmitted(true)
    } catch (err) {
      console.error('[waitlist] error:', err)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  function copyInvite() {
    navigator.clipboard.writeText(`https://groundupapp.com/?ref=${referralCode}`).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={close}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md pointer-events-auto rounded-3xl border border-white/10 overflow-hidden max-h-[92vh] flex flex-col"
              style={{
                background: 'linear-gradient(160deg, #0F0F0F 0%, #0A0A0A 100%)',
                boxShadow:  '0 40px 80px rgba(0,0,0,0.6), 0 0 80px rgba(255,215,0,0.08)',
              }}
            >
              {/* gold glow */}
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[80%] h-48 bg-[#FFD700]/15 blur-[100px] rounded-full pointer-events-none" />

              {/* Close */}
              <button
                onClick={close}
                className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                aria-label="Close"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              <div className="relative px-8 pt-8 pb-6 overflow-y-auto" data-lenis-prevent>
                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
                        <span className="text-[#FFD700] text-[9px] font-black uppercase tracking-[0.25em]">Early Access Waitlist</span>
                      </div>
                      <h2 className="text-white text-2xl font-black tracking-tighter leading-tight mb-1.5">Get on the list.</h2>
                      <p className="text-white/40 text-xs font-medium mb-5">
                        Limited early access. We're approving artists in waves — join now to get in early.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-2.5 text-left">
                        <input
                          type="text"
                          placeholder="ARTIST NAME (OPTIONAL)"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl font-bold text-sm outline-none bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-[#FFD700]/40 transition-colors"
                        />
                        <input
                          type="email"
                          placeholder="EMAIL ADDRESS"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl font-bold text-sm outline-none bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-[#FFD700]/40 transition-colors"
                        />
                        <input
                          type="text"
                          placeholder="HOW LONG HAVE YOU BEEN MAKING MUSIC?"
                          value={yearsActive}
                          onChange={e => setYearsActive(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl font-bold text-sm outline-none bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-[#FFD700]/40 transition-colors"
                        />

                        {/* Data-referenced self-assessment sliders */}
                        <div className="pt-2 pb-0.5 space-y-3 border-t border-white/8 mt-3">
                          <DataSlider label="Overall motion in the industry" stops={MOMENTUM} value={momentum} onChange={setMomentum} />
                          <DataSlider label="Invested in your career"       stops={INVESTMENT} value={investment} onChange={setInvestment} />
                        </div>

                        {error && <p className="text-red-400 text-[11px] font-bold px-1">{error}</p>}
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full h-12 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-1"
                          style={{ background: '#FFD700', color: '#000', boxShadow: '0 4px 20px rgba(255,215,0,0.35)' }}
                        >
                          {loading ? 'Joining…' : 'Join Waitlist →'}
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                      className="text-center"
                    >
                      <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-[0.4em] mb-1.5">You're on the list</p>
                      <p className="text-6xl font-black tracking-tighter text-white leading-none mb-4">#{position ?? '—'}</p>
                      <p className="text-white/40 text-sm font-medium mb-6">
                        We'll text or email you when your spot opens.
                      </p>
                      <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-[0.25em] mb-2">Your Invite Code</p>
                      <div className="rounded-xl px-4 py-3 mb-5 select-all bg-black/40 border border-white/10">
                        <code className="text-sm font-mono tracking-wider text-white">{referralCode}</code>
                      </div>
                      <p className="text-white/30 text-[11px] font-medium mb-5 leading-relaxed">
                        Share it — every artist who joins with your code moves you up the list.
                      </p>
                      <button
                        onClick={copyInvite}
                        className="w-full h-13 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        style={{ background: '#FFD700', color: '#000', boxShadow: '0 4px 20px rgba(255,215,0,0.35)' }}
                      >
                        {copied ? 'Copied ✓' : 'Copy Invite Link'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default WaitlistModal
