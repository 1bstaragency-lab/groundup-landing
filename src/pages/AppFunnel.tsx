"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Loader2, MessageCircle, Sparkles, Phone, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/** Replace once stores actually list the app. */
const APP_STORE_URL    = 'https://apps.apple.com/app/grounduphq/id0000000000'
const PLAY_STORE_URL   = 'https://play.google.com/store/apps/details?id=com.grounduphq.app'

type Step = 'hero' | 'phone' | 'done'

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

// ─── Store badges ────────────────────────────────────────────────────────────

function AppStoreBadge({ onClick }: { onClick?: (e: React.MouseEvent) => void }) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="flex items-center gap-2.5 bg-black border border-white/25 hover:border-white/50 rounded-xl px-4 py-2.5 transition-all hover:scale-[1.02] active:scale-[0.99] flex-1 sm:flex-initial sm:min-w-[170px]"
      aria-label="Download on the App Store"
    >
      {/* Apple logo */}
      <svg className="w-6 h-6 fill-white shrink-0" viewBox="0 0 384 512">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
      </svg>
      <div className="text-left leading-tight">
        <p className="text-white/65 text-[9px] font-medium uppercase tracking-wide">Download on the</p>
        <p className="text-white text-[15px] font-semibold tracking-tight -mt-0.5">App Store</p>
      </div>
    </a>
  )
}

function GooglePlayBadge({ onClick }: { onClick?: (e: React.MouseEvent) => void }) {
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="flex items-center gap-2.5 bg-black border border-white/25 hover:border-white/50 rounded-xl px-4 py-2.5 transition-all hover:scale-[1.02] active:scale-[0.99] flex-1 sm:flex-initial sm:min-w-[170px]"
      aria-label="Get it on Google Play"
    >
      {/* Google Play multicolor triangle */}
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 512 512">
        <linearGradient id="ggp1" x1="46" x2="280" y1="69" y2="303" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00C3FF"/>
          <stop offset="1" stopColor="#1BE2FA"/>
        </linearGradient>
        <linearGradient id="ggp2" x1="282" x2="513" y1="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFCE00"/>
          <stop offset="1" stopColor="#FFEA00"/>
        </linearGradient>
        <linearGradient id="ggp3" x1="46" x2="280" y1="443" y2="209" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#DE2453"/>
          <stop offset="1" stopColor="#FE3944"/>
        </linearGradient>
        <linearGradient id="ggp4" x1="60" x2="280" y1="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#11D574"/>
          <stop offset="1" stopColor="#01F176"/>
        </linearGradient>
        <path fill="url(#ggp1)" d="M60 32c-12 6-17 20-17 36v376c0 16 5 30 17 36l232-232L60 32z"/>
        <path fill="url(#ggp2)" d="M376 168l-72 76 72 76 92-52c20-12 20-36 0-48l-92-52z"/>
        <path fill="url(#ggp3)" d="M60 480c12 6 27 4 41-4l275-156-72-76L60 480z"/>
        <path fill="url(#ggp4)" d="M101 28c-14-8-29-10-41-4l244 244 72-76L101 28z"/>
      </svg>
      <div className="text-left leading-tight">
        <p className="text-white/65 text-[9px] font-medium uppercase tracking-wide">Get it on</p>
        <p className="text-white text-[15px] font-semibold tracking-tight -mt-0.5">Google Play</p>
      </div>
    </a>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function AppFunnel() {
  const navigate = useNavigate()
  const [step, setStep]         = useState<Step>('hero')
  const [cc, setCc]             = useState('+1')
  const [phone, setPhone]       = useState('')
  const [busy, setBusy]         = useState(false)
  const [err, setErr]           = useState<string | null>(null)
  const [position, setPosition] = useState<number | null>(null)

  useEffect(() => {
    try { localStorage.setItem('gup_source', 'tiktok_funnel') } catch { /* noop */ }
  }, [])

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
        setStep('done')
      }
    } catch {
      setErr('Network error — try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#FFD700]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-[#B8860B]/8 rounded-full blur-[120px] pointer-events-none" />

      <header className="relative z-10 px-5 py-5 flex items-center justify-between">
        <a href="/" className="font-black text-sm uppercase tracking-tighter">GrounduP</a>
        <a href="/login" className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Sign In</a>
      </header>

      <div className="relative z-10 px-5 mb-8">
        <div className="flex gap-2 max-w-md mx-auto">
          {['hero', 'phone', 'done'].map((s, i) => {
            const idx  = ['hero', 'phone', 'done'].indexOf(step)
            const done = i <= idx
            return (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${done ? 'bg-[#FFD700]' : 'bg-white/10'}`} />
            )
          })}
        </div>
      </div>

      <main className="relative z-10 px-5 pb-12 flex flex-col items-center justify-center min-h-[calc(100dvh-160px)]">
        <AnimatePresence mode="wait">

          {/* ── Hero ───────────────────────────────────────── */}
          {step === 'hero' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md text-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFD700]/8 border border-[#FFD700]/20 mb-6">
                <Sparkles size={11} className="text-[#FFD700]" />
                <span className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest">
                  The Artist OS · Pocket Edition
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-[0.95] mb-4">
                Run your whole<br />music career<br />
                <span className="text-[#FFD700]">from a text.</span>
              </h1>

              <p className="text-white/50 text-sm sm:text-base font-medium leading-relaxed mb-8 max-w-sm mx-auto">
                Real-time analytics, AI release rollouts, and your personal music exec — uP — texting you when it matters. Used by 2,000+ indie artists.
              </p>

              {/* Store badges */}
              <div className="flex flex-col sm:flex-row gap-2.5 mb-5 justify-center">
                <AppStoreBadge onClick={() => setTimeout(() => setStep('phone'), 350)} />
                <GooglePlayBadge onClick={() => setTimeout(() => setStep('phone'), 350)} />
              </div>

              {/* Waitlist CTA */}
              <button
                onClick={() => setStep('phone')}
                className="w-full h-14 rounded-2xl bg-[#FFD700] text-black font-black text-base uppercase tracking-tight transition-transform hover:scale-[1.02] active:scale-[0.99] shadow-[0_8px_32px_rgba(255,215,0,0.25)] flex items-center justify-center gap-2"
              >
                Join the waitlist
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => navigate('/signup')}
                className="mt-5 text-white/40 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors"
              >
                Or continue on web →
              </button>
            </motion.div>
          )}

          {/* ── Phone ──────────────────────────────────────── */}
          {step === 'phone' && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/25 flex items-center justify-center mx-auto mb-5">
                <MessageCircle size={22} className="text-[#FFD700]" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase mb-3">
                We'll text you<br />the link.
              </h2>
              <p className="text-white/40 text-sm font-medium mb-7">
                Drop your number — uP will text you the App Store / Play Store link the moment the app drops, plus early access perks.
              </p>

              <div className="flex gap-2 mb-3">
                <div className="relative">
                  <select
                    value={cc}
                    onChange={e => setCc(e.target.value)}
                    className="appearance-none bg-zinc-950 border border-white/10 rounded-2xl pl-4 pr-9 py-4 text-white font-bold text-sm outline-none focus:border-[#FFD700]/30 cursor-pointer"
                  >
                    {COUNTRY_CODES.map((c, i) => (
                      <option key={`${c.code}-${i}`} value={c.code} className="bg-zinc-950">
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                </div>
                <div className="flex-1 flex items-center bg-zinc-950 border border-white/10 focus-within:border-[#FFD700]/30 rounded-2xl px-4 transition-colors">
                  <Phone size={14} className="text-white/20 mr-2 shrink-0" />
                  <input
                    type="tel"
                    inputMode="tel"
                    autoFocus
                    placeholder="(555) 000-0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitPhone()}
                    className="flex-1 bg-transparent text-white text-base font-bold outline-none placeholder-white/20 min-w-0"
                  />
                </div>
              </div>

              <p className="text-white/20 text-[10px] font-medium mb-5">
                One text. No spam. Reply STOP anytime.
              </p>

              <button
                onClick={submitPhone}
                disabled={busy || !phone.trim()}
                className={`w-full h-14 rounded-2xl font-black text-base uppercase tracking-tight transition-all flex items-center justify-center gap-2 ${
                  phone.trim()
                    ? 'bg-[#FFD700] text-black hover:scale-[1.02] shadow-[0_8px_32px_rgba(255,215,0,0.25)]'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                {busy ? <><Loader2 size={16} className="animate-spin" /> Saving your spot…</> : <>Reserve my spot <ArrowRight size={18} /></>}
              </button>

              {err && <p className="text-red-400 text-[11px] font-bold mt-3">{err}</p>}

              <button onClick={() => setStep('hero')} className="mt-5 text-white/30 hover:text-white/70 text-[10px] font-black uppercase tracking-widest transition-colors">
                ← Back
              </button>
            </motion.div>
          )}

          {/* ── Done ───────────────────────────────────────── */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md text-center"
            >
              {/* Big position number */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 16, stiffness: 220, delay: 0.05 }}
                className="mb-6"
              >
                <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.4em] mb-2">
                  You're on the list
                </p>
                <p className="text-7xl sm:text-8xl font-black tracking-tighter text-white leading-none">
                  #{position ?? '—'}
                </p>
              </motion.div>

              <div className="flex items-center justify-center gap-2 text-white/40 text-xs font-medium mb-8">
                <Check size={14} className="text-green-400" />
                <span>We just texted you the welcome message</span>
              </div>

              <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em] mb-3">
                ★ Don't wait in line
              </p>
              <h3 className="text-2xl font-black tracking-tighter uppercase mb-5 max-w-xs mx-auto leading-tight">
                The web app is<br/>live right now.
              </h3>

              <button
                onClick={() => navigate('/signup')}
                className="w-full h-14 rounded-2xl bg-[#FFD700] text-black font-black text-base uppercase tracking-tight transition-transform hover:scale-[1.02] active:scale-[0.99] shadow-[0_8px_32px_rgba(255,215,0,0.25)] flex items-center justify-center gap-2"
              >
                Skip the line — continue on web
                <ArrowRight size={18} />
              </button>

              <p className="text-white/20 text-[10px] font-medium mt-4">
                Same uP. Same data. No install required.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 px-5 pb-6 text-center">
        <p className="text-white/15 text-[10px] font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} GrounduP · The Artist OS
        </p>
      </footer>
    </div>
  )
}
