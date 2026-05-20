"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Loader2, Phone, ChevronDown, Share, Plus, SquarePlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const COUNTRY_CODES = [
  { code: '+1',   flag: '🇺🇸', label: 'US' },
  { code: '+1',   flag: '🇨🇦', label: 'CA' },
  { code: '+44',  flag: '🇬🇧', label: 'UK' },
  { code: '+61',  flag: '🇦🇺', label: 'AU' },
  { code: '+234', flag: '🇳🇬', label: 'NG' },
  { code: '+33',  flag: '🇫🇷', label: 'FR' },
  { code: '+49',  flag: '🇩🇪', label: 'DE' },
  { code: '+81',  flag: '🇯🇵', label: 'JP' },
  { code: '+82',  flag: '🇰🇷', label: 'KR' },
  { code: '+55',  flag: '🇧🇷', label: 'BR' },
  { code: '+52',  flag: '🇲🇽', label: 'MX' },
  { code: '+27',  flag: '🇿🇦', label: 'ZA' },
  { code: '+31',  flag: '🇳🇱', label: 'NL' },
  { code: '+34',  flag: '🇪🇸', label: 'ES' },
]

// ─── Store badges (decorative — open the waitlist, don't link to stores) ──────

function AppStoreBadge({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-3 bg-black border border-white/25 active:border-white/50 hover:border-white/50 rounded-2xl px-5 h-[60px] w-full sm:w-auto sm:min-w-[185px] transition-all active:scale-[0.98]"
      aria-label="Download on the App Store"
    >
      <svg className="w-7 h-7 fill-white shrink-0" viewBox="0 0 384 512">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
      </svg>
      <div className="text-left leading-tight">
        <p className="text-white/65 text-[10px] font-medium uppercase tracking-wide">Download on the</p>
        <p className="text-white text-[17px] font-semibold tracking-tight -mt-0.5">App Store</p>
      </div>
    </button>
  )
}

function GooglePlayBadge({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-3 bg-black border border-white/25 active:border-white/50 hover:border-white/50 rounded-2xl px-5 h-[60px] w-full sm:w-auto sm:min-w-[185px] transition-all active:scale-[0.98]"
      aria-label="Get it on Google Play"
    >
      <svg className="w-7 h-7 shrink-0" viewBox="0 0 512 512">
        <linearGradient id="ggp1" x1="46" x2="280" y1="69" y2="303" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00C3FF"/><stop offset="1" stopColor="#1BE2FA"/>
        </linearGradient>
        <linearGradient id="ggp2" x1="282" x2="513" y1="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFCE00"/><stop offset="1" stopColor="#FFEA00"/>
        </linearGradient>
        <linearGradient id="ggp3" x1="46" x2="280" y1="443" y2="209" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#DE2453"/><stop offset="1" stopColor="#FE3944"/>
        </linearGradient>
        <linearGradient id="ggp4" x1="60" x2="280" y1="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#11D574"/><stop offset="1" stopColor="#01F176"/>
        </linearGradient>
        <path fill="url(#ggp1)" d="M60 32c-12 6-17 20-17 36v376c0 16 5 30 17 36l232-232L60 32z"/>
        <path fill="url(#ggp2)" d="M376 168l-72 76 72 76 92-52c20-12 20-36 0-48l-92-52z"/>
        <path fill="url(#ggp3)" d="M60 480c12 6 27 4 41-4l275-156-72-76L60 480z"/>
        <path fill="url(#ggp4)" d="M101 28c-14-8-29-10-41-4l244 244 72-76L101 28z"/>
      </svg>
      <div className="text-left leading-tight">
        <p className="text-white/65 text-[10px] font-medium uppercase tracking-wide">Get it on</p>
        <p className="text-white text-[17px] font-semibold tracking-tight -mt-0.5">Google Play</p>
      </div>
    </button>
  )
}

// ─── Add-to-Home-Screen tutorial ──────────────────────────────────────────────
// Stylized iPhone mockups demonstrating the 3 taps to install the web app as a
// home-screen icon while the native app is in early beta.

function PhoneMock({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full aspect-[9/16] max-w-[140px] mx-auto rounded-[1.6rem] border border-white/15 bg-zinc-900 overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      {/* notch */}
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-black/60 z-10" />
      {children}
    </div>
  )
}

function HomeScreenTutorial() {
  return (
    <div className="w-full">
      <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em] mb-2">★ While you wait</p>
      <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Add it to your home screen</h3>
      <p className="text-white/40 text-xs font-medium mb-6 max-w-sm mx-auto">
        Get a one-tap icon for GrounduP — looks & feels just like the native app.
        Takes 5 seconds on iPhone (Safari):
      </p>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-2">
        {/* Step 1 — Tap Share */}
        <div>
          <PhoneMock>
            <div className="absolute inset-0 flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <div className="w-9 h-9 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center">
                  <span className="text-[#FFD700] font-black text-sm">U</span>
                </div>
              </div>
              {/* Safari bottom bar */}
              <div className="border-t border-white/10 bg-zinc-950/80 px-2 py-2 flex items-center justify-around">
                <span className="text-white/20 text-[8px]">‹</span>
                <span className="text-white/20 text-[8px]">›</span>
                <motion.div
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  className="w-5 h-5 rounded-md bg-[#FFD700]/20 border border-[#FFD700]/50 flex items-center justify-center"
                >
                  <Share size={10} className="text-[#FFD700]" />
                </motion.div>
                <span className="text-white/20 text-[8px]">▢</span>
              </div>
            </div>
          </PhoneMock>
          <p className="text-white/60 text-[10px] font-bold text-center mt-2">1. Tap <span className="text-[#FFD700]">Share</span></p>
        </div>

        {/* Step 2 — Add to Home Screen */}
        <div>
          <PhoneMock>
            <div className="absolute inset-0 flex flex-col justify-end p-1.5">
              <div className="rounded-xl bg-zinc-800/90 border border-white/10 overflow-hidden">
                <div className="px-2 py-1.5 border-b border-white/5 flex items-center gap-1.5">
                  <Plus size={8} className="text-white/30" />
                  <span className="text-white/30 text-[7px]">Copy</span>
                </div>
                <motion.div
                  animate={{ backgroundColor: ['rgba(255,215,0,0)', 'rgba(255,215,0,0.18)', 'rgba(255,215,0,0)'] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  className="px-2 py-1.5 flex items-center gap-1.5"
                >
                  <SquarePlus size={9} className="text-[#FFD700]" />
                  <span className="text-white text-[7px] font-bold leading-tight">Add to Home Screen</span>
                </motion.div>
              </div>
            </div>
          </PhoneMock>
          <p className="text-white/60 text-[10px] font-bold text-center mt-2">2. <span className="text-[#FFD700]">Add to Home Screen</span></p>
        </div>

        {/* Step 3 — Confirm */}
        <div>
          <PhoneMock>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#B8860B] flex items-center justify-center shadow-[0_0_12px_rgba(255,215,0,0.4)]">
                <span className="text-black font-black text-sm">U</span>
              </div>
              <span className="text-white text-[7px] font-bold">GrounduP</span>
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
                className="px-3 py-1 rounded-full bg-[#FFD700] flex items-center gap-1"
              >
                <span className="text-black text-[7px] font-black uppercase">Add</span>
              </motion.div>
            </div>
          </PhoneMock>
          <p className="text-white/60 text-[10px] font-bold text-center mt-2">3. Tap <span className="text-[#FFD700]">Add</span></p>
        </div>
      </div>

      <p className="text-white/20 text-[10px] font-medium mt-3">
        On Android: tap the ⋮ menu → "Add to Home screen."
      </p>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function AppFunnel() {
  const navigate = useNavigate()
  const [revealed, setRevealed]   = useState(false)   // waitlist form shown
  const [submitted, setSubmitted] = useState(false)   // phone captured
  const [cc, setCc]               = useState('+1')
  const [phone, setPhone]         = useState('')
  const [busy, setBusy]           = useState(false)
  const [err, setErr]             = useState<string | null>(null)
  const [position, setPosition]   = useState<number | null>(null)

  useEffect(() => {
    try { localStorage.setItem('gup_source', 'tiktok_funnel') } catch { /* noop */ }
  }, [])

  function reveal() {
    setRevealed(true)
    window.scrollTo({ top: 0 })
  }

  async function submitPhone() {
    setErr(null)
    if (!phone.trim()) { setErr('Phone number required.'); return }
    setBusy(true)
    try {
      const res = await fetch('/.netlify/functions/waitlist-join', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cc + phone.replace(/\D/g, ''), source: 'tiktok_funnel' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!data.ok) {
        setErr(data.error === 'invalid_phone' ? "That number doesn't look right." : 'Something glitched — try again.')
      } else {
        if (typeof data.position === 'number') setPosition(data.position)
        setSubmitted(true)
        window.scrollTo({ top: 0 })
      }
    } catch {
      setErr('Network error — try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="min-h-[100dvh] bg-black text-white overflow-x-hidden relative"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Lighter blur on mobile — big blurs tank mobile GPU/scroll perf */}
      <div className="absolute -top-24 -left-24 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-[#FFD700]/8 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-[#B8860B]/8 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

      <header className="relative z-10 px-5 py-4 flex items-center justify-between">
        <button onClick={() => { if (revealed || submitted) { setRevealed(false); setSubmitted(false) } }} className="font-black text-sm uppercase tracking-tighter">GrounduP</button>
        <a href="/login" className="text-white/40 active:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Sign In</a>
      </header>

      <main className="relative z-10 px-5">
        <AnimatePresence mode="wait">

          {/* ─── HERO view ─────────────────────────────────── */}
          {!revealed && !submitted && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md mx-auto text-center flex flex-col items-center justify-center min-h-[calc(100dvh-140px)]"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFD700]/8 border border-[#FFD700]/20 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse" />
                <span className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest">Now in early beta access</span>
              </div>

              <h1 className="text-[2.75rem] leading-[0.92] sm:text-5xl font-black tracking-tighter uppercase mb-4">
                Run your whole<br />music career<br />
                <span className="text-[#FFD700]">from a text.</span>
              </h1>

              <p className="text-white/55 text-[15px] font-medium leading-snug mb-8 max-w-[20rem] mx-auto">
                AI release rollouts, real-time stats, and your own music exec texting you when it matters. <span className="text-white/80">2,000+ artists</span> already inside.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-4 justify-center w-full">
                <AppStoreBadge onClick={reveal} />
                <GooglePlayBadge onClick={reveal} />
              </div>

              <button
                onClick={() => navigate('/signup')}
                className="py-2 text-white/40 active:text-white text-[12px] font-bold uppercase tracking-widest transition-colors"
              >
                Or continue on web →
              </button>
            </motion.div>
          )}

          {/* ─── FORM view (top-aligned so keyboard never hides it) ── */}
          {revealed && !submitted && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md mx-auto text-center pt-6"
            >
              <button onClick={() => setRevealed(false)} className="mb-6 text-white/30 active:text-white/70 text-[11px] font-black uppercase tracking-widest">← Back</button>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse" />
                <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">App launching soon</span>
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Get early access</h2>
              <p className="text-white/40 text-sm font-medium mb-6 max-w-[19rem] mx-auto">
                Drop your number — uP texts you the install link the moment beta opens, plus founding-artist perks.
              </p>

              <div className="flex gap-2 mb-3">
                <div className="relative">
                  <select
                    value={cc}
                    onChange={e => setCc(e.target.value)}
                    className="appearance-none bg-zinc-950 border border-white/10 rounded-2xl pl-4 pr-9 py-4 text-white font-bold text-sm outline-none focus:border-[#FFD700]/30"
                  >
                    {COUNTRY_CODES.map((c, i) => (
                      <option key={`${c.code}-${i}`} value={c.code} className="bg-zinc-950">{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                </div>
                <div className="flex-1 flex items-center bg-zinc-950 border border-white/10 focus-within:border-[#FFD700]/30 rounded-2xl px-4 transition-colors">
                  <Phone size={14} className="text-white/20 mr-2 shrink-0" />
                  <input
                    type="tel" inputMode="tel"
                    placeholder="(555) 000-0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitPhone()}
                    className="flex-1 bg-transparent text-white text-base font-bold outline-none placeholder-white/20 min-w-0"
                  />
                </div>
              </div>

              <p className="text-white/20 text-[10px] font-medium mb-5">One text. No spam. Reply STOP anytime.</p>

              <button
                onClick={submitPhone}
                disabled={busy || !phone.trim()}
                className={`w-full h-14 rounded-2xl font-black text-base uppercase tracking-tight transition-all flex items-center justify-center gap-2 ${
                  phone.trim()
                    ? 'bg-[#FFD700] text-black active:scale-[0.98] shadow-[0_8px_32px_rgba(255,215,0,0.25)]'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                {busy ? <><Loader2 size={16} className="animate-spin" /> Saving your spot…</> : <>Reserve my spot <ArrowRight size={18} /></>}
              </button>
              {err && <p className="text-red-400 text-[11px] font-bold mt-3">{err}</p>}
            </motion.div>
          )}

          {/* ─── DONE view (scrollable for the tutorial) ───── */}
          {submitted && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md mx-auto text-center pt-8 pb-12"
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 16, stiffness: 220, delay: 0.05 }}
                className="mb-5"
              >
                <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.4em] mb-1">You're on the list</p>
                <p className="text-7xl font-black tracking-tighter text-white leading-none">#{position ?? '—'}</p>
              </motion.div>

              <div className="flex items-center justify-center gap-2 text-white/40 text-xs font-medium mb-7">
                <Check size={14} className="text-green-400" />
                <span>We just texted you the welcome message</span>
              </div>

              <button
                onClick={() => navigate('/signup')}
                className="w-full h-14 rounded-2xl bg-[#FFD700] text-black font-black text-base uppercase tracking-tight transition-transform active:scale-[0.98] shadow-[0_8px_32px_rgba(255,215,0,0.25)] flex items-center justify-center gap-2 mb-2"
              >
                Skip the line — continue on web
                <ArrowRight size={18} />
              </button>
              <p className="text-white/20 text-[10px] font-medium mb-10">Same uP. Same data. No install required.</p>

              <HomeScreenTutorial />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 px-5 py-6 text-center">
        <p className="text-white/15 text-[10px] font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} GrounduP · The Artist OS
        </p>
      </footer>
    </div>
  )
}
