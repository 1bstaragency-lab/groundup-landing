"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Apple, Check, Loader2, MessageCircle, Sparkles, Phone, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/** Apple App Store URL — placeholder until iOS app is published */
const APP_STORE_URL = 'https://apps.apple.com/app/grounduphq/id0000000000'

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

export function AppFunnel() {
  const navigate = useNavigate()
  const [step, setStep]     = useState<Step>('hero')
  const [cc, setCc]         = useState('+1')
  const [phone, setPhone]   = useState('')
  const [busy, setBusy]     = useState(false)
  const [err, setErr]       = useState<string | null>(null)

  useEffect(() => {
    // Tag the visit so we know it came from this funnel (used for analytics
    // later & to keep the right plan-intent if they bounce to /signup).
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
      {/* Ambient glow */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#FFD700]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-[#B8860B]/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Lightweight top bar */}
      <header className="relative z-10 px-5 py-5 flex items-center justify-between">
        <a href="/" className="font-black text-sm uppercase tracking-tighter">GrounduP</a>
        <a href="/login" className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Sign In</a>
      </header>

      {/* Progress pips */}
      <div className="relative z-10 px-5 mb-8">
        <div className="flex gap-2 max-w-md mx-auto">
          {['hero', 'phone', 'done'].map((s, i) => {
            const idx  = ['hero', 'phone', 'done'].indexOf(step)
            const done = i <= idx
            return (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors duration-500 ${done ? 'bg-[#FFD700]' : 'bg-white/10'}`}
              />
            )
          })}
        </div>
      </div>

      <main className="relative z-10 px-5 pb-12 flex flex-col items-center justify-center min-h-[calc(100dvh-160px)]">
        <AnimatePresence mode="wait">
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

              {/* Primary CTA — App Store */}
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  // Move to phone step on next frame even if they actually
                  // jumped to the App Store — keeps the funnel flowing when
                  // they bounce back to the tab.
                  setTimeout(() => setStep('phone'), 250)
                }}
                className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-white text-black font-black text-base uppercase tracking-tight transition-transform hover:scale-[1.02] active:scale-[0.99] shadow-[0_8px_32px_rgba(255,255,255,0.15)]"
              >
                <Apple size={20} />
                Get on the App Store
              </a>

              <button
                onClick={() => setStep('phone')}
                className="mt-3 w-full h-14 rounded-2xl bg-[#FFD700] text-black font-black text-base uppercase tracking-tight transition-transform hover:scale-[1.02] active:scale-[0.99] shadow-[0_8px_32px_rgba(255,215,0,0.25)] flex items-center justify-center gap-2"
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
                Drop your number — uP will send you the App Store link the moment we launch, plus early access perks.
              </p>

              {/* Phone input */}
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
                {busy ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <>Join the waitlist <ArrowRight size={18} /></>}
              </button>

              {err && (
                <p className="text-red-400 text-[11px] font-bold mt-3">{err}</p>
              )}

              <button
                onClick={() => setStep('hero')}
                className="mt-5 text-white/30 hover:text-white/70 text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                ← Back
              </button>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md text-center"
            >
              <motion.div
                initial={{ scale: 0.7 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 14, stiffness: 240 }}
                className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6"
              >
                <Check size={28} strokeWidth={3} className="text-green-400" />
              </motion.div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase mb-3">
                You're in.
              </h2>
              <p className="text-white/50 text-sm font-medium mb-2">
                Check your iMessage — we just sent you a link.
              </p>
              <p className="text-white/30 text-[11px] font-medium mb-8">
                Don't see it? It can take 30 seconds.
              </p>

              <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em] mb-3">
                ★ Don't wait
              </p>
              <h3 className="text-2xl font-black tracking-tighter uppercase mb-5 max-w-xs mx-auto">
                The web app is live right now.
              </h3>

              <button
                onClick={() => navigate('/signup')}
                className="w-full h-14 rounded-2xl bg-[#FFD700] text-black font-black text-base uppercase tracking-tight transition-transform hover:scale-[1.02] active:scale-[0.99] shadow-[0_8px_32px_rgba(255,215,0,0.25)] flex items-center justify-center gap-2"
              >
                Continue on Web
                <ArrowRight size={18} />
              </button>

              <a
                href="/"
                className="mt-4 inline-flex items-center gap-2 text-white/30 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors"
              >
                Browse home →
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Tiny footer */}
      <footer className="relative z-10 px-5 pb-6 text-center">
        <p className="text-white/15 text-[10px] font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} GrounduP · The Artist OS
        </p>
      </footer>
    </div>
  )
}
