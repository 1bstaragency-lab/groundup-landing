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

type StepId =
  | 'splash' | 'welcome'
  | 'name'         // step 1 — who they are
  | 'genre'        // step 2 — what they make
  | 'stage'        // step 3 — where they are
  | 'cadence'      // step 4 — how often they ship
  | 'pain'         // step 5 — what's hurting (multi-select)
  | 'investment'   // step 6 — budget reality
  | 'vision'       // step 7 — 90-day target outcome
  | 'goal'         // step 8 — first action uP should take
  | 'ready'        // celebration before the tools tour
  | 'tools'        // feature grid — show what they get inside the app
  | 'handoff'      // "all of this runs through iMessage" + the iMessage CTA

const TOTAL_STEPS = 8

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

// Step 4 — Release cadence (how often they ship)
const CADENCES = [
  { id: 'never',    label: 'Haven\'t released yet',       sub: 'Working on the first drop' },
  { id: 'yearly',   label: 'Once or twice a year',        sub: 'Slow and intentional' },
  { id: 'quarterly',label: 'Every 2–3 months',            sub: 'Building momentum' },
  { id: 'monthly',  label: 'Monthly or more',             sub: 'Aggressive release cycle' },
]

// Step 5 — Pain points (MULTI-SELECT — the "we get you" moment)
const PAIN_POINTS = [
  { id: 'overwhelm', emoji: '💭', label: "I don't know what to focus on" },
  { id: 'budget',    emoji: '💸', label: 'No budget for paid promo' },
  { id: 'alone',     emoji: '🙋', label: "I'm doing this alone" },
  { id: 'curators',  emoji: '📭', label: 'Pitched curators, no replies' },
  { id: 'time',      emoji: '⏰', label: 'No time between music + marketing' },
  { id: 'fans',      emoji: '🎯', label: "I don't know who my fans are" },
  { id: 'tracking',  emoji: '📊', label: "Can't tell what's actually working" },
  { id: 'fade',      emoji: '🔥', label: 'My releases flop after week 1' },
]

// Step 6 — Monthly investment (budget reality check)
const INVESTMENTS = [
  { id: 'zero',  label: '$0 — bootstrapping',     sub: 'Pure organic growth' },
  { id: 'small', label: 'Under $100 / month',     sub: 'Tight budget, test small' },
  { id: 'mid',   label: '$100 – $500 / month',    sub: 'Some room to invest' },
  { id: 'large', label: '$500+ / month',          sub: 'Ready to scale' },
]

// Step 7 — 90-day vision (where do you want to be?)
const VISIONS = [
  { id: '1k',        emoji: '🎯', label: 'First 1k monthly listeners' },
  { id: 'editorial', emoji: '★',  label: 'First Spotify editorial pickup' },
  { id: '100',       emoji: '💰', label: 'First $100 from my music' },
  { id: 'show',      emoji: '🎫', label: 'First sold-out local show' },
  { id: 'sync',      emoji: '📺', label: 'First sync placement' },
  { id: 'consistent',emoji: '🚀', label: 'Just want to release consistently' },
]

export default function MvpAppView() {
  const [step,        setStep]        = useState<StepId>('splash')
  const [artistName,  setArtistName]  = useState('')
  const [genre,       setGenre]       = useState<string | null>(null)
  const [stageId,     setStageId]     = useState<string | null>(null)
  const [cadenceId,   setCadenceId]   = useState<string | null>(null)
  const [pains,       setPains]       = useState<string[]>([])
  const [investmentId,setInvestmentId]= useState<string | null>(null)
  const [visionId,    setVisionId]    = useState<string | null>(null)
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
            {step === 'genre'   && <BubbleStep  key="genre"
              eyebrow={`Step 2 of ${TOTAL_STEPS}`}
              question="What's your sound?"
              options={GENRES}
              selected={genre}
              onSelect={(v) => { setGenre(v); goTo('stage') }}
              onBack={() => goTo('name')} />}
            {step === 'stage'   && <ChipStep    key="stage"
              eyebrow={`Step 3 of ${TOTAL_STEPS}`}
              question="Where's your career at?"
              options={STAGES.map(s => ({ id: s.id, label: s.label, sub: s.sub }))}
              selected={stageId}
              onSelect={(v) => { setStageId(v); goTo('cadence') }}
              onBack={() => goTo('genre')}
              stacked />}
            {step === 'cadence' && <ChipStep    key="cadence"
              eyebrow={`Step 4 of ${TOTAL_STEPS}`}
              question="How often do you release?"
              options={CADENCES.map(c => ({ id: c.id, label: c.label, sub: c.sub }))}
              selected={cadenceId}
              onSelect={(v) => { setCadenceId(v); goTo('pain') }}
              onBack={() => goTo('stage')}
              stacked />}
            {step === 'pain'    && <MultiChipStep key="pain"
              eyebrow={`Step 5 of ${TOTAL_STEPS}`}
              question="What's been blocking your growth?"
              hint="Tap everything that feels true. uP works around these."
              options={PAIN_POINTS}
              selected={pains}
              onChange={setPains}
              onNext={() => goTo('investment')}
              onBack={() => goTo('cadence')} />}
            {step === 'investment' && <ChipStep    key="investment"
              eyebrow={`Step 6 of ${TOTAL_STEPS}`}
              question="What's your monthly music budget?"
              options={INVESTMENTS.map(o => ({ id: o.id, label: o.label, sub: o.sub }))}
              selected={investmentId}
              onSelect={(v) => { setInvestmentId(v); goTo('vision') }}
              onBack={() => goTo('pain')}
              stacked />}
            {step === 'vision'  && <ChipStep    key="vision"
              eyebrow={`Step 7 of ${TOTAL_STEPS}`}
              question="What does winning look like in 90 days?"
              options={VISIONS.map(v => ({ id: v.id, label: v.label, emoji: v.emoji }))}
              selected={visionId}
              onSelect={(v) => { setVisionId(v); goTo('goal') }}
              onBack={() => goTo('investment')}
              stacked />}
            {step === 'goal'    && <ChipStep    key="goal"
              eyebrow={`Step 8 of ${TOTAL_STEPS}`}
              question="What should uP help with first?"
              options={GOALS.map(g => ({ id: g.id, label: g.label, emoji: g.emoji }))}
              selected={goalId}
              onSelect={(v) => { setGoalId(v); goTo('ready') }}
              onBack={() => goTo('vision')}
              stacked />}

            {step === 'ready'   && <ReadyStep   key="ready"
              name={artistName || 'Artist'}
              onContinue={() => goTo('tools')} />}
            {step === 'tools'   && <ToolsStep   key="tools"
              onContinue={() => goTo('handoff')} />}
            {step === 'handoff' && <HandoffStep key="handoff"
              goal={GOALS.find(g => g.id === goalId)?.label} />}
          </AnimatePresence>

          {/* Progress dots — only during the 8 onboarding question steps */}
          {(step === 'name' || step === 'genre' || step === 'stage' || step === 'cadence' ||
            step === 'pain' || step === 'investment' || step === 'vision' || step === 'goal') && (
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
      {/* Brand mark — gu-icon.png (single primary logo, no duplicate wordmark) */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
        className="relative mb-5"
        style={{ filter: 'drop-shadow(0 0 60px rgba(255,215,0,0.5))' }}
      >
        <img
          src="/gu-icon.png"
          alt="GrounduP"
          className="w-36 h-36 object-contain"
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]"
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
        Step 1 of {TOTAL_STEPS}
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

// ─── Step 4 (genre): Floating bubbles ───────────────────────────────────────
// Hardcoded positions + sizes so the cluster looks organically balanced.
// Each entry: x/y are % of the container, size is px.
const BUBBLE_LAYOUT: { x: number; y: number; size: number }[] = [
  { x: 18, y:  4, size: 88 },  // Hip-Hop  (top-left, large)
  { x: 62, y:  2, size: 72 },  // R&B
  { x: 42, y: 22, size: 84 },  // Pop      (center-top)
  { x:  4, y: 22, size: 76 },  // Indie
  { x: 70, y: 22, size: 80 },  // Electronic
  { x: 18, y: 44, size: 80 },  // Rock
  { x: 56, y: 44, size: 84 },  // Country
  { x:  6, y: 66, size: 76 },  // Latin
  { x: 38, y: 66, size: 92 },  // Afrobeats (lower-center, largest)
  { x: 72, y: 66, size: 72 },  // Other
]

function BubbleStep({
  eyebrow, question, options, selected, onSelect, onBack,
}: {
  eyebrow:  string
  question: string
  options:  string[]
  selected: string | null
  onSelect: (id: string) => void
  onBack:   () => void
}) {
  // Local state lets us play the highlight/enlarge animation BEFORE advancing
  const [picked, setPicked] = useState<string | null>(null)

  function tap(id: string) {
    if (picked) return // ignore subsequent taps while advancing
    setPicked(id)
    // Hold the satisfaction beat, then move on
    setTimeout(() => onSelect(id), 520)
  }

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
      <h2 className="text-white text-3xl font-black tracking-tighter leading-tight mb-6">
        {question}
      </h2>

      {/* Bubble play area */}
      <div className="relative flex-1 -mx-2">
        {options.map((label, i) => {
          const pos       = BUBBLE_LAYOUT[i] ?? { x: 30, y: 30, size: 76 }
          const isPicked  = picked === label
          const isSel     = selected === label
          // Each bubble has its own gentle float — different duration/delay per index
          // so they don't move in lockstep.
          const floatDur  = 3.2 + (i % 4) * 0.4
          const floatDelay = (i * 0.18) % 1.4

          return (
            <motion.button
              key={label}
              onClick={() => tap(label)}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{
                opacity: 1,
                scale: isPicked ? 1.28 : 1,
                y:     isPicked ? 0 : [0, -8, 0],
              }}
              transition={{
                opacity:  { duration: 0.4, delay: i * 0.05 },
                scale:    { type: 'spring', stiffness: 320, damping: 16 },
                y:        isPicked
                  ? { duration: 0 }
                  : { duration: floatDur, repeat: Infinity, ease: 'easeInOut', delay: floatDelay },
              }}
              whileTap={{ scale: 0.92 }}
              className={`absolute rounded-full font-black text-[12px] tracking-tight flex items-center justify-center text-center px-2 transition-colors ${
                isPicked || isSel
                  ? 'text-black'
                  : 'text-white/90'
              }`}
              style={{
                left:       `${pos.x}%`,
                top:        `${pos.y}%`,
                width:      pos.size,
                height:     pos.size,
                background: isPicked || isSel
                  ? '#FFD700'
                  : 'radial-gradient(circle at 35% 30%, #2a2a2a 0%, #18181b 70%, #0d0d0d 100%)',
                boxShadow:  isPicked || isSel
                  ? '0 0 36px rgba(255,215,0,0.55), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -8px 16px rgba(0,0,0,0.25)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -6px 16px rgba(0,0,0,0.4), 0 6px 18px rgba(0,0,0,0.35)',
                border:     isPicked || isSel
                  ? '1px solid rgba(255,215,0,0.6)'
                  : '1px solid rgba(255,255,255,0.06)',
                zIndex:     isPicked ? 10 : 1,
              }}
            >
              {label}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Steps 5-6: Chip-style selection (stacked cards) ─────────────────────────
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

      <div className={`${stacked ? 'flex-1 overflow-y-auto flex flex-col gap-2.5' : 'grid grid-cols-3 gap-2 content-start auto-rows-min'}`}>
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
          // Non-stacked grid tile — fixed-height compact card, not a stretched pill
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className={`h-16 rounded-2xl border text-[12px] font-black transition-all flex items-center justify-center text-center px-2 ${
                isSel
                  ? 'bg-[#FFD700] border-[#FFD700] text-black'
                  : 'bg-zinc-900 border-white/8 text-white/90 hover:border-[#FFD700]/40 hover:bg-zinc-800'
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

// ─── Step 5: Pain points (multi-select) ─────────────────────────────────────
// Differs from ChipStep because users pick 1+ pain points and tap "Continue"
// explicitly. This step is the "we see you" moment in the flow — uP uses
// these answers to tailor its strategy AND its empathy.
function MultiChipStep({
  eyebrow, question, hint, options, selected, onChange, onNext, onBack,
}: {
  eyebrow:  string
  question: string
  hint:     string
  options:  { id: string; emoji: string; label: string }[]
  selected: string[]
  onChange: (next: string[]) => void
  onNext:   () => void
  onBack:   () => void
}) {
  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.32 }}
      className="absolute inset-0 flex flex-col px-8 pt-20 pb-24"
    >
      <BackButton onBack={onBack} />
      <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.25em] mb-3">
        {eyebrow}
      </p>
      <h2 className="text-white text-3xl font-black tracking-tighter leading-tight mb-2">
        {question}
      </h2>
      <p className="text-white/40 text-[12px] font-medium mb-6">{hint}</p>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {options.map(opt => {
          const isSel = selected.includes(opt.id)
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`text-left px-4 py-3 rounded-2xl border transition-all flex items-center gap-3 ${
                isSel
                  ? 'bg-[#FFD700] border-[#FFD700] text-black'
                  : 'bg-zinc-900 border-white/8 text-white hover:border-[#FFD700]/40'
              }`}
            >
              <span className="text-lg shrink-0">{opt.emoji}</span>
              <span className={`flex-1 font-black text-[12px] tracking-tight ${
                isSel ? 'text-black' : 'text-white'
              }`}>
                {opt.label}
              </span>
              {isSel && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      <button
        onClick={onNext}
        disabled={selected.length === 0}
        className="w-full h-14 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:hover:scale-100 hover:scale-[1.02] active:scale-[0.98] mt-3"
        style={{
          background:'#FFD700',
          color:'#000',
          boxShadow:'0 8px 24px rgba(255,215,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        Continue ({selected.length} picked) →
      </button>
    </motion.div>
  )
}

// ─── Step 9a: Ready — celebrate, intro the tour ─────────────────────────────
function ReadyStep({ name, onContinue }: { name: string; onContinue: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
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
      <p className="text-white/50 text-sm leading-relaxed max-w-[280px] mb-10">
        Here's your full Artist OS — every tool you need to run your career.
      </p>
      <button
        onClick={onContinue}
        className="w-full max-w-[280px] h-14 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background:'#FFD700',
          color:'#000',
          boxShadow:'0 8px 24px rgba(255,215,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        See My Tools →
      </button>
    </motion.div>
  )
}

// ─── Step 7b: Tools — what they get inside the Artist OS ────────────────────

interface ToolStat { label: string; value: string }
interface ToolDemo {
  /** Headline shown at the top of the detail sheet */
  headline: string
  /** 2 hero numbers shown as a stat row */
  stats:    [ToolStat, ToolStat]
  /** Mini iMessage demo — what uP texts you for this tool */
  upMsg:    string
  /** Your reply to uP (optional) */
  userMsg?: string
}

interface Tool {
  id:        string
  icon:      string
  title:     string
  sub:       string
  /** Per-tile CTA — distinct per tool so the grid doesn't read as repetitive */
  ctaLabel:  string
  demo:      ToolDemo
}

const TOOLS: Tool[] = [
  {
    id: 'releases', icon: '◯', title: 'Releases', sub: 'Drop calendar + rollout',
    ctaLabel: 'Preview a release plan',
    demo: {
      headline: 'Plan your next drop, end to end.',
      stats: [
        { label: 'Days to launch', value: '12' },
        { label: 'Tasks complete', value: '8/12' },
      ],
      upMsg:   '"Drank In My Cup" drops in 12 days. Spotify pitch is due Friday — I drafted it. Approve to send?',
      userMsg: 'Approve.',
    },
  },
  {
    id: 'campaigns', icon: '⏱', title: 'Campaigns', sub: 'Meta + TikTok ads',
    ctaLabel: 'See ad results',
    demo: {
      headline: 'Run paid ads, no dashboards.',
      stats: [
        { label: 'New listeners today', value: '412' },
        { label: 'Cost per listener',   value: '$0.12' },
      ],
      upMsg:   'Today\'s Meta campaign brought 412 new listeners at $0.12 each. Want me to scale to $75/day?',
      userMsg: 'Scale it.',
    },
  },
  {
    id: 'influencer', icon: '⊕', title: 'Influencer Reach', sub: 'Curators + creators',
    ctaLabel: 'Read a curator reply',
    demo: {
      headline: 'Pitch curators, automatically.',
      stats: [
        { label: 'Active conversations', value: '5' },
        { label: 'Curators in your lane', value: '28' },
      ],
      upMsg:   'DJ Smoov (92K) replied 🔥 — "Love this, adding to my Late Night Vibes playlist." Want me to thank them?',
      userMsg: 'Yes, do it.',
    },
  },
  {
    id: 'analytics', icon: '↗', title: 'Analytics', sub: 'Spotify + ad performance',
    ctaLabel: 'View live stats',
    demo: {
      headline: 'Track everything that matters.',
      stats: [
        { label: 'Monthly listeners', value: '1.2k' },
        { label: 'Growth this week',  value: '+18%' },
      ],
      upMsg:   'You\'re up 18% this week — your TikTok push paid off. Top track: "Drank In My Cup" (4.2k streams).',
    },
  },
  {
    id: 'kb', icon: '◌', title: 'Knowledge Base', sub: 'Videos + playbooks',
    ctaLabel: 'Browse the library',
    demo: {
      headline: 'Industry playbooks at your fingertips.',
      stats: [
        { label: 'Video playlists', value: '4' },
        { label: 'PDF guides',      value: '24' },
      ],
      upMsg:   'Found a guide on TikTok hooks that fits your next release. Want the 3-bullet summary?',
      userMsg: 'Send it.',
    },
  },
  {
    id: 'chat', icon: '✦', title: 'uP Chat', sub: 'Your 24/7 AI manager',
    ctaLabel: 'Read a real chat',
    demo: {
      headline: 'I\'m always one text away.',
      stats: [
        { label: 'Response time', value: '< 30s' },
        { label: 'Available',     value: '24 / 7' },
      ],
      upMsg:   'Morning check-in: Friday\'s curator pitches need approval, and your ad budget refreshes tomorrow. What do you want to tackle first?',
      userMsg: 'Curators.',
    },
  },
]

function ToolsStep({ onContinue }: { onContinue: () => void }) {
  const [expanded, setExpanded] = useState<Tool | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col px-6 pt-16 pb-8"
    >
      <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.25em] mb-3 px-2">
        Your Artist OS
      </p>
      <h2 className="text-white text-3xl font-black tracking-tighter leading-tight mb-2 px-2">
        Everything you need.
      </h2>
      <p className="text-white/40 text-sm font-medium mb-6 px-2">
        Tap any tool to see it work.
      </p>

      <div className="grid grid-cols-2 gap-2.5 flex-1 overflow-y-auto">
        {TOOLS.map((t, i) => (
          <motion.button
            key={t.id}
            onClick={() => setExpanded(t)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            whileTap={{ scale: 0.97 }}
            className="p-4 rounded-2xl border border-white/10 bg-zinc-900/60 flex flex-col justify-between text-left hover:border-[#FFD700]/40 hover:bg-zinc-900 transition-all group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-[#FFD700] text-lg font-black"
              style={{
                background: 'rgba(255,215,0,0.10)',
                border:     '1px solid rgba(255,215,0,0.25)',
              }}
            >
              {t.icon}
            </div>
            <div>
              <p className="text-white text-[12px] font-black uppercase tracking-tight leading-tight mb-1">
                {t.title}
              </p>
              <p className="text-white/40 text-[10px] font-medium leading-snug mb-2">
                {t.sub}
              </p>
              <p className="text-[#FFD700]/70 group-hover:text-[#FFD700] text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1 transition-colors">
                {t.ctaLabel} →
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      <button
        onClick={onContinue}
        className="w-full h-14 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] mt-4"
        style={{
          background:'#FFD700',
          color:'#000',
          boxShadow:'0 8px 24px rgba(255,215,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        Continue →
      </button>

      <AnimatePresence>
        {expanded && (
          <ToolDetailSheet tool={expanded} onClose={() => setExpanded(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Interactive bottom sheet for a single tool ─────────────────────────────
function ToolDetailSheet({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  return (
    <>
      {/* backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm"
      />

      {/* sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(_, info) => { if (info.offset.y > 80) onClose() }}
        className="absolute left-0 right-0 bottom-0 z-40 rounded-t-3xl bg-[#0A0A0A] border-t border-white/10 overflow-hidden"
        style={{ maxHeight: '90%' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        <div className="px-6 pb-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-[#FFD700] text-xl font-black"
              style={{
                background: 'rgba(255,215,0,0.12)',
                border:     '1px solid rgba(255,215,0,0.3)',
              }}
            >
              {tool.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-[0.25em]">
                Live preview
              </p>
              <p className="text-white text-[15px] font-black tracking-tight">
                {tool.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
              aria-label="Close"
            >
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Headline */}
          <h3 className="text-white text-xl font-black tracking-tight leading-tight mb-5">
            {tool.demo.headline}
          </h3>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {tool.demo.stats.map(s => (
              <div
                key={s.label}
                className="p-4 rounded-2xl border border-[#FFD700]/15 bg-[#FFD700]/5"
              >
                <p className="text-[#FFD700] text-2xl font-black tracking-tight leading-none mb-2">
                  {s.value}
                </p>
                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest leading-snug">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Mini iMessage demo */}
          <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.25em] mb-3">
            How uP texts you
          </p>
          <div className="space-y-2">
            <div className="flex justify-start">
              <div
                className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-md text-white text-[12px] leading-snug"
                style={{
                  background:'rgba(255,215,0,0.10)',
                  border:    '1px solid rgba(255,215,0,0.22)',
                }}
              >
                {tool.demo.upMsg}
              </div>
            </div>
            {tool.demo.userMsg && (
              <div className="flex justify-end">
                <div
                  className="max-w-[70%] px-3.5 py-2.5 rounded-2xl rounded-br-md text-black text-[12px] font-semibold leading-snug"
                  style={{ background:'#FFD700' }}
                >
                  {tool.demo.userMsg}
                </div>
              </div>
            )}
          </div>

          {/* Got it */}
          <button
            onClick={onClose}
            className="w-full h-12 rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center mt-6 border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </>
  )
}

// ─── Step 7c: Handoff — "all of this runs through iMessage" ─────────────────
function HandoffStep({ goal }: { goal?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
    >
      {/* iMessage bubble visual */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className="relative mb-6"
      >
        {/* Soft green iMessage-style gradient bubble */}
        <div
          className="w-24 h-24 rounded-[2rem] flex items-center justify-center"
          style={{
            background:'linear-gradient(160deg, #34c759 0%, #25a043 100%)',
            boxShadow: '0 0 60px rgba(52,199,89,0.45), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}
        >
          <svg width="42" height="42" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z" />
          </svg>
        </div>
      </motion.div>

      <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.25em] mb-3">
        One Channel · All Tools
      </p>
      <h2 className="text-white text-3xl font-black tracking-tighter leading-tight mb-4">
        It all runs through<br />iMessage.
      </h2>
      <p className="text-white/55 text-sm leading-relaxed max-w-[300px] mb-8">
        Every tool you just saw — releases, ads, curators, analytics — happens by texting{' '}
        <span className="text-[#FFD700] font-bold">uP</span>.{' '}
        {goal && <>Your first ask: <span className="text-[#FFD700] font-bold">{goal.toLowerCase()}</span>. </>}
        No more dashboards. Just message uP.
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
        Message uP →
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
  const order: StepId[] = ['name', 'genre', 'stage', 'cadence', 'pain', 'investment', 'vision', 'goal']
  const idx = order.indexOf(step)
  return (
    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 pointer-events-none px-6">
      {order.map((s, i) => (
        <div
          key={s}
          className="h-1 rounded-full transition-all"
          style={{
            width:      i <= idx ? '18px' : '6px',
            background: i <= idx ? '#FFD700' : 'rgba(255,255,255,0.15)',
          }}
        />
      ))}
    </div>
  )
}
