/**
 * /mvp — Mobile app MVP preview.
 *
 * A self-contained demo of the GrounduP mobile app's onboarding flow,
 * rendered inside a phone frame on desktop and fullscreen on mobile.
 *
 * Flow:
 *   1. Splash (logo, 1.6s)
 *   2. Welcome ("Tap to start")
 *   3. Artist name input
 *   4. Genre selection (chips)
 *   5. Career stage selection (chips)
 *   6. Primary goal selection (chips)
 *   7. Done — "uP is texting you" + Open iMessage CTA
 *
 * No backend persistence yet — this is a UI/flow MVP. State stays in
 * component memory until the user opens iMessage.
 */
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const IMESSAGE_LINK = 'https://start.msg.new/EEHfxKYWDk'

type StepId = 'splash' | 'welcome' | 'name' | 'genre' | 'stage' | 'goal' | 'done'

const GENRES = ['Hip-Hop', 'R&B', 'Pop', 'Indie', 'Electronic', 'Rock', 'Country', 'Latin', 'Afrobeats', 'Other']
const STAGES = [
  { id: 'starting',  label: 'Just starting out',         sub: 'Under 1k monthly listeners' },
  { id: 'building',  label: 'Building an audience',      sub: '1k – 10k monthly listeners' },
  { id: 'growing',   label: 'Actively growing',          sub: '10k – 100k monthly listeners' },
  { id: 'scaling',   label: 'Scaling my career',         sub: '100k+ monthly listeners' },
]
const GOALS = [
  { id: 'streams',   emoji: '🎯', label: 'Grow Spotify streams' },
  { id: 'releases',  emoji: '📅', label: 'Plan a release' },
  { id: 'ads',       emoji: '📊', label: 'Run Meta / TikTok ads' },
  { id: 'curators',  emoji: '✨', label: 'Pitch to curators' },
  { id: 'revenue',   emoji: '💰', label: 'Make money from music' },
  { id: 'sync',      emoji: '📺', label: 'Land sync placements' },
]

export default function MvpAppView() {
  const [step,        setStep]        = useState<StepId>('splash')
  const [artistName,  setArtistName]  = useState('')
  const [genre,       setGenre]       = useState<string | null>(null)
  const [stageId,     setStageId]     = useState<string | null>(null)
  const [goalId,      setGoalId]      = useState<string | null>(null)

  useEffect(() => {
    document.title = 'GrounduP — Mobile MVP'
  }, [])

  // Auto-advance splash → welcome
  useEffect(() => {
    if (step !== 'splash') return
    const t = setTimeout(() => setStep('welcome'), 1600)
    return () => clearTimeout(t)
  }, [step])

  function goTo(next: StepId) { setStep(next) }

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-0 sm:p-8 overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#FFD700]/8 blur-[160px] rounded-full" />
      </div>

      {/* Phone frame (desktop) / fullscreen (mobile) */}
      <div
        className="relative w-full max-w-[400px] h-dvh sm:h-[800px] sm:rounded-[3.5rem] overflow-hidden bg-black sm:p-3"
        style={{
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 60px 120px rgba(0,0,0,0.5)',
          background:'linear-gradient(160deg, #1c1c1e 0%, #050505 50%, #1c1c1e 100%)',
        }}
      >
        {/* Inner screen */}
        <div className="relative w-full h-full sm:rounded-[3rem] overflow-hidden bg-[#050505]">
          {/* Status bar */}
          <StatusBar />

          {/* Step content */}
          <AnimatePresence mode="wait">
            {step === 'splash'  && <SplashStep  key="splash" />}
            {step === 'welcome' && <WelcomeStep key="welcome" onStart={() => goTo('name')} />}
            {step === 'name'    && <NameStep    key="name"
              value={artistName}
              onChange={setArtistName}
              onNext={() => goTo('genre')}
              onBack={() => goTo('welcome')} />}
            {step === 'genre'   && <ChipStep    key="genre"
              eyebrow="Step 2 of 4"
              question="What's your sound?"
              options={GENRES.map(g => ({ id: g, label: g }))}
              selected={genre}
              onSelect={(v) => { setGenre(v); goTo('stage') }}
              onBack={() => goTo('name')} />}
            {step === 'stage'   && <ChipStep    key="stage"
              eyebrow="Step 3 of 4"
              question="Where's your career at?"
              options={STAGES.map(s => ({ id: s.id, label: s.label, sub: s.sub }))}
              selected={stageId}
              onSelect={(v) => { setStageId(v); goTo('goal') }}
              onBack={() => goTo('genre')}
              stacked />}
            {step === 'goal'    && <ChipStep    key="goal"
              eyebrow="Step 4 of 4"
              question="What should uP help with first?"
              options={GOALS.map(g => ({ id: g.id, label: g.label, emoji: g.emoji }))}
              selected={goalId}
              onSelect={(v) => { setGoalId(v); goTo('done') }}
              onBack={() => goTo('stage')}
              stacked />}
            {step === 'done'    && <DoneStep    key="done"
              name={artistName || 'Artist'}
              goal={GOALS.find(g => g.id === goalId)?.label} />}
          </AnimatePresence>

          {/* Progress dots — hidden on splash + welcome + done */}
          {step !== 'splash' && step !== 'welcome' && step !== 'done' && (
            <ProgressDots step={step} />
          )}
        </div>
      </div>

      {/* Quick exit (top-left) — back to main site */}
      <a
        href="/"
        className="hidden sm:flex fixed top-6 left-6 items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-black/60 backdrop-blur-md text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors z-10"
      >
        ← Back to site
      </a>
    </div>
  )
}

// ─── Status bar ─────────────────────────────────────────────────────────────
function StatusBar() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      const h = d.getHours() % 12 || 12
      const m = d.getMinutes().toString().padStart(2, '0')
      setTime(`${h}:${m}`)
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="absolute top-0 left-0 right-0 z-30 px-6 pt-3 flex items-center justify-between text-white text-[12px] font-semibold pointer-events-none">
      <span>{time}</span>
      <div className="flex items-center gap-1.5">
        <svg width="16" height="10" viewBox="0 0 16 10" fill="white"><path d="M1 6.5h2v2H1zM5 4.5h2v4H5zM9 2.5h2v6H9zM13 .5h2v8h-2z"/></svg>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="white"><path d="M7 1.6a8.4 8.4 0 015.5 2L13.6 2.5a10 10 0 00-13.3 0L1.4 3.6A8.4 8.4 0 017 1.6zm0 3.4a5 5 0 013.1 1.1L11.2 5a6.6 6.6 0 00-8.5 0l1.1 1.1A5 5 0 017 5zm0 3.4l1.4-1.4-1.4-1.5L5.6 7l1.4 1.4z"/></svg>
        <div className="flex items-center">
          <div className="w-6 h-3 border border-white rounded-sm relative">
            <div className="absolute inset-0.5 bg-white rounded-[1px]" style={{ width: '70%' }} />
          </div>
          <div className="w-0.5 h-1.5 bg-white ml-0.5 rounded-r-sm" />
        </div>
      </div>
    </div>
  )
}

// ─── Step 1: Splash ─────────────────────────────────────────────────────────
function SplashStep() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]"
    >
      {/* Brand mark — gu-icon.png (square logo asset) */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
        className="relative mb-7"
        style={{ filter: 'drop-shadow(0 0 50px rgba(255,215,0,0.45))' }}
      >
        <img
          src="/gu-icon.png"
          alt="GrounduP"
          className="w-28 h-28 object-contain"
        />
      </motion.div>

      {/* Wordmark — logo.webp (GrounduP type-only lockup) */}
      <motion.img
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        src="/logo.webp"
        alt="GrounduP"
        className="h-7 object-contain"
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-3"
      >
        Artist OS
      </motion.p>
    </motion.div>
  )
}

// ─── Step 2: Welcome ────────────────────────────────────────────────────────
function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
    >
      {/* Brand icon (gu-icon.png) — no gold backplate, lets the asset breathe */}
      <div
        className="mb-6"
        style={{ filter: 'drop-shadow(0 0 32px rgba(255,215,0,0.35))' }}
      >
        <img
          src="/gu-icon.png"
          alt="GrounduP"
          className="w-16 h-16 object-contain"
        />
      </div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
        <span className="text-[#FFD700] text-[9px] font-black uppercase tracking-[0.25em]">
          Your AI Music Manager
        </span>
      </div>
      <h1 className="text-white text-4xl font-black tracking-tighter leading-[1.05] mb-3">
        Your career,<br />in your messages.
      </h1>
      <p className="text-white/50 text-sm leading-relaxed max-w-[280px] mb-10">
        uP runs your music career through iMessage — Spotify pitches, ad campaigns, release plans.
      </p>
      <button
        onClick={onStart}
        className="w-full max-w-[280px] h-14 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background:'#FFD700',
          color:'#000',
          boxShadow:'0 8px 24px rgba(255,215,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        Get Started →
      </button>
      <p className="text-white/30 text-[11px] mt-4">Takes under 60 seconds</p>
    </motion.div>
  )
}

// ─── Step 3: Name input ─────────────────────────────────────────────────────
function NameStep({
  value, onChange, onNext, onBack,
}: {
  value: string
  onChange: (v: string) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.32 }}
      className="absolute inset-0 flex flex-col px-8 pt-20 pb-24"
    >
      <BackButton onBack={onBack} />
      <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.25em] mb-4">
        Step 1 of 4
      </p>
      <h2 className="text-white text-3xl font-black tracking-tighter leading-tight mb-3">
        What's your artist name?
      </h2>
      <p className="text-white/40 text-sm mb-8">uP will use this when texting you.</p>

      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your name…"
        onKeyDown={(e) => { if (e.key === 'Enter' && value.trim()) onNext() }}
        className="w-full h-14 px-5 rounded-2xl bg-zinc-900 border border-white/10 text-white text-base font-semibold placeholder:text-white/30 focus:outline-none focus:border-[#FFD700]/50 transition-colors"
      />

      <div className="mt-auto" />
      <button
        onClick={onNext}
        disabled={!value.trim()}
        className="w-full h-14 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:hover:scale-100 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background:'#FFD700',
          color:'#000',
          boxShadow:'0 8px 24px rgba(255,215,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        Continue →
      </button>
    </motion.div>
  )
}

// ─── Steps 4-6: Chip-style selection ────────────────────────────────────────
function ChipStep({
  eyebrow, question, options, selected, onSelect, onBack, stacked,
}: {
  eyebrow:  string
  question: string
  options:  { id: string; label: string; sub?: string; emoji?: string }[]
  selected: string | null
  onSelect: (id: string) => void
  onBack:   () => void
  stacked?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.32 }}
      className="absolute inset-0 flex flex-col px-8 pt-20 pb-24"
    >
      <BackButton onBack={onBack} />
      <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.25em] mb-4">
        {eyebrow}
      </p>
      <h2 className="text-white text-3xl font-black tracking-tighter leading-tight mb-8">
        {question}
      </h2>

      <div className={`flex-1 overflow-y-auto ${stacked ? 'flex flex-col gap-2.5' : 'flex flex-wrap gap-2'}`}>
        {options.map(opt => {
          const isSel = selected === opt.id
          if (stacked) {
            return (
              <button
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  isSel
                    ? 'bg-[#FFD700] border-[#FFD700] text-black'
                    : 'bg-zinc-900 border-white/8 text-white hover:border-[#FFD700]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  {opt.emoji && <span className="text-xl shrink-0">{opt.emoji}</span>}
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-[13px] tracking-tight ${isSel ? 'text-black' : 'text-white'}`}>
                      {opt.label}
                    </p>
                    {opt.sub && (
                      <p className={`text-[11px] mt-0.5 ${isSel ? 'text-black/60' : 'text-white/40'}`}>
                        {opt.sub}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          }
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className={`px-4 py-2.5 rounded-full border text-[13px] font-black transition-all ${
                isSel
                  ? 'bg-[#FFD700] border-[#FFD700] text-black'
                  : 'bg-zinc-900 border-white/8 text-white hover:border-[#FFD700]/40'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Step 7: Done ───────────────────────────────────────────────────────────
function DoneStep({ name, goal }: { name: string; goal?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{
          background: '#FFD700',
          boxShadow:  '0 0 60px rgba(255,215,0,0.5)',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
      <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.25em] mb-3">
        All Set
      </p>
      <h2 className="text-white text-3xl font-black tracking-tighter leading-tight mb-3">
        Welcome to uP,<br />{name}.
      </h2>
      <p className="text-white/50 text-sm leading-relaxed max-w-[280px] mb-8">
        {goal ? <>I'm on it — first task: <span className="text-[#FFD700] font-bold">{goal.toLowerCase()}</span>. </> : null}
        Tap below to open iMessage and I'll text you the first step.
      </p>
      <a
        href={IMESSAGE_LINK}
        className="w-full max-w-[280px] h-14 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background:'#FFD700',
          color:'#000',
          boxShadow:'0 8px 24px rgba(255,215,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        Open iMessage →
      </a>
      <p className="text-white/30 text-[11px] mt-4">uP · +1 (310) 919-9037</p>
    </motion.div>
  )
}

// ─── UI bits ────────────────────────────────────────────────────────────────
function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="absolute top-12 left-6 w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center z-10"
      aria-label="Back"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function ProgressDots({ step }: { step: StepId }) {
  const order: StepId[] = ['name', 'genre', 'stage', 'goal']
  const idx = order.indexOf(step)
  return (
    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 pointer-events-none">
      {order.map((s, i) => (
        <div
          key={s}
          className="h-1 rounded-full transition-all"
          style={{
            width:      i <= idx ? '24px' : '8px',
            background: i <= idx ? '#FFD700' : 'rgba(255,255,255,0.15)',
          }}
        />
      ))}
    </div>
  )
}
