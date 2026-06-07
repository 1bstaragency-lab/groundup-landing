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
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMvpAppState, type MvpAppStateAPI, type ChatMsg } from './mvp/useMvpAppState'

// iMessage handoff is paused while we build the in-app flow.
// When ready: re-add a constant for start.msg.new/<linkId> and wire it
// into UpTab + the closing screens.

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
  | 'handoff'      // "all of this runs through iMessage" + Message uP CTA
  | 'paywall'      // 3-tier plan picker before iMessage opens
  | 'app'          // ← the in-product app shell (post-conversion)

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
  const [planId,      setPlanId]      = useState<string>('solo')   // chosen at paywall, default solo

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
              goal={GOALS.find(g => g.id === goalId)?.label}
              onContinue={() => goTo('paywall')} />}
            {step === 'paywall' && <PaywallStep key="paywall"
              onBack={() => goTo('handoff')}
              onPick={(p) => { setPlanId(p); goTo('app') }} />}
            {step === 'app'     && <AppShell    key="app"
              artistName={artistName || 'Artist'}
              planId={planId}
              onboardingCtx={{
                artistName: artistName || 'Artist',
                genre,
                goal: GOALS.find(g => g.id === goalId)?.label ?? null,
                pains,
              }}
              onSignOut={() => goTo('splash')} />}
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
    id: 'releases', icon: '💿', title: 'Releases', sub: 'Drop calendar + rollout',
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
    id: 'campaigns', icon: '📣', title: 'Campaigns', sub: 'Meta + TikTok ads',
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
    id: 'influencer', icon: '📈', title: 'Influencer Reach', sub: 'Curators + creators',
    ctaLabel: 'How it works',
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
    id: 'analytics', icon: '📊', title: 'Analytics', sub: 'Spotify + ad performance',
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
    id: 'kb', icon: '📖', title: 'Knowledge Base', sub: 'Videos + playbooks',
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
    id: 'chat', icon: 'orb', title: 'uP Chat', sub: 'Your 24/7 AI manager',
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
            {t.icon === 'orb' ? (
              // uP Chat tile renders the actual brand orb with halo
              <div
                className="w-10 h-10 rounded-full overflow-hidden mb-3 relative"
                style={{
                  boxShadow:
                    '0 0 6px rgba(255,215,0,0.75), 0 0 16px rgba(255,215,0,0.45), 0 0 36px rgba(255,215,0,0.22), inset 0 0 0 1px rgba(255,255,255,0.25)',
                }}
              >
                <img src="/up-avatar.png" alt="uP" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-xl"
                style={{
                  background: 'rgba(255,215,0,0.10)',
                  border:     '1px solid rgba(255,215,0,0.25)',
                }}
              >
                {t.icon}
              </div>
            )}
            <div>
              <p className="text-white text-[12px] font-black uppercase tracking-tight leading-tight mb-1">
                {t.title}
              </p>
              <p className="text-white/40 text-[10px] font-medium leading-snug mb-2">
                {t.sub}
              </p>
              <p className="text-[#FFD700]/70 group-hover:text-[#FFD700] text-[8px] font-black uppercase tracking-[0.14em] flex items-center gap-1 transition-colors mt-1.5">
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
function HandoffStep({ goal, onContinue }: { goal?: string; onContinue: () => void }) {
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

      <button
        onClick={onContinue}
        className="w-full max-w-[280px] h-14 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background:'#FFD700',
          color:'#000',
          boxShadow:'0 8px 24px rgba(255,215,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        Message uP →
      </button>
      <p className="text-white/30 text-[11px] mt-4">uP · +1 (310) 919-9037</p>
    </motion.div>
  )
}

// ─── Step 7d: Paywall — 4-tier plan picker (tap to expand, tap again to confirm)
function PaywallStep({ onBack, onPick }: { onBack: () => void; onPick: (planId: string) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [picked, setPicked] = useState<string | null>(null)

  // 1st tap on a tier → expand to show benefits
  // 2nd tap on the same tier → confirm + advance
  // Tap a different tier → switch expansion
  function choose(planId: string) {
    if (picked) return
    if (expanded === planId) {
      setPicked(planId)
      setTimeout(() => onPick(planId), 520)
    } else {
      setExpanded(planId)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.32 }}
      className="absolute inset-0 overflow-y-auto"
    >
      <div className="min-h-full flex flex-col px-5 pt-12 pb-5">
        <BackButton onBack={onBack} />

        <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-[0.25em] mb-1.5 px-1">
          Pick your plan
        </p>
        <h2 className="text-white text-xl font-black tracking-tighter leading-tight mb-1 px-1">
          Start with uP.
        </h2>
        <p className="text-white/45 text-[11px] font-medium mb-3.5 px-1">
          Tap a plan to see what's included. Tap again to start.
        </p>

      {(() => {
        const cards = [
          {
            id: 'solo',     eyebrow: '14-day free trial',   title: 'Solo',     tagline: 'Limited entry tier',
            price: '$4.99', per: '/ mo', afterTrial: 'Then $4.99 every month',
            compact: true,
            features: [
              { kind: 'in' as const,  label: 'Release Scheduler' },
              { kind: 'in' as const,  label: 'Video playlist library' },
              { kind: 'in' as const,  label: 'Influencer Network preview' },
              { kind: 'cap' as const, label: 'Outreach capped at 3 / month' },
              { kind: 'out' as const, label: 'No uP iMessage assistant' },
              { kind: 'out' as const, label: 'No Meta + TikTok ads' },
            ],
            highlighted: false,
          },
          {
            id: 'weekly', eyebrow: '3-day free trial', title: 'Weekly', tagline: 'Test the waters · Full access',
            price: '$9.99', per: '/ week', afterTrial: 'Then $9.99 every week',
            features: [
              { kind: 'in' as const, label: 'Everything in Solo' },
              { kind: 'in' as const, label: 'uP iMessage AI manager (unlimited)' },
              { kind: 'in' as const, label: 'Unlimited curator outreach' },
              { kind: 'in' as const, label: 'Meta + TikTok ad management' },
              { kind: 'in' as const, label: 'Full Knowledge Base access' },
              { kind: 'in' as const, label: 'Cancel anytime' },
            ],
            highlighted: false,
          },
          {
            id: 'monthly', eyebrow: '7-day free trial', title: 'Monthly', tagline: 'Most popular · Best value',
            price: '$29.99', per: '/ month', afterTrial: 'Then $29.99 every month',
            features: [
              { kind: 'in' as const, label: 'Everything in Weekly' },
              { kind: 'in' as const, label: 'Save 30% vs paying weekly' },
              { kind: 'in' as const, label: 'Priority uP responses (< 30s)' },
              { kind: 'in' as const, label: 'Advanced analytics dashboard' },
              { kind: 'in' as const, label: 'Monthly strategy review from uP' },
              { kind: 'in' as const, label: 'Early access to new tools' },
            ],
            highlighted: true,
          },
          {
            id: 'strategic', eyebrow: 'Premium · No trial', title: 'Strategic Artist', tagline: 'For serious careers',
            price: '$49.99', per: '/ mo', afterTrial: 'Cancel anytime',
            compact: true,
            features: [
              { kind: 'in' as const, label: 'Everything in Monthly' },
              { kind: 'in' as const, label: '1-on-1 strategy call (monthly)' },
              { kind: 'in' as const, label: 'Direct founder access' },
              { kind: 'in' as const, label: 'Custom release rollout playbooks' },
              { kind: 'in' as const, label: 'Beta features early access' },
              { kind: 'in' as const, label: 'Priority customer support' },
            ],
            highlighted: false,
          },
        ]

        return cards.map(c => (
          <PlanCard
            key={c.id}
            id={c.id}
            eyebrow={c.eyebrow}
            title={c.title}
            tagline={c.tagline}
            price={c.price}
            per={c.per}
            afterTrial={c.afterTrial}
            features={c.features}
            highlighted={c.highlighted}
            compact={c.compact}
            expanded={expanded === c.id}
            picked={picked === c.id}
            dimmed={expanded !== null && expanded !== c.id && picked === null}
            onPick={() => choose(c.id)}
          />
        ))
      })()}

      {/* Enterprise — labels + teams, no public pricing */}
      <a
        href="mailto:team@groundupapp.com?subject=GrounduP%20Enterprise%20Inquiry"
        className="mx-2 mt-1 p-3 rounded-2xl border border-white/10 bg-zinc-900/40 flex items-center gap-3 hover:border-[#FFD700]/35 hover:bg-zinc-900 transition-colors"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(140deg, rgba(255,215,0,0.16) 0%, rgba(255,215,0,0.04) 100%)',
            border:     '1px solid rgba(255,215,0,0.25)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2">
            <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-[11px] font-black uppercase tracking-wide leading-tight">
            Enterprise
          </p>
          <p className="text-white/40 text-[10px] font-medium leading-snug mt-0.5">
            Custom plans for labels, teams &amp; rosters
          </p>
        </div>
        <span className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest shrink-0">
          Tap to contact us →
        </span>
      </a>

        <p className="text-white/30 text-[10px] text-center mt-4 leading-relaxed px-4">
          Cancel anytime during your trial. Charged when the trial ends.
        </p>
      </div>
    </motion.div>
  )
}

// ─── PlanCard ────────────────────────────────────────────────────────────────
type PlanFeature = { kind: 'in' | 'cap' | 'out'; label: string }

function PlanCard({
  eyebrow, title, tagline, price, per, afterTrial, highlighted, compact, picked, expanded, dimmed, onPick,
  features,
}: {
  id:           string
  eyebrow:      string
  title:        string
  tagline:      string
  price:        string
  per:          string
  afterTrial:   string
  highlighted?: boolean
  compact?:     boolean
  picked:       boolean
  expanded:     boolean
  dimmed:       boolean
  onPick:       () => void
  features?:    PlanFeature[]
}) {
  // Compact (Solo + Strategic) tiers are visually muted in their default
  // resting state so the eye lands on Weekly + Monthly. Tapping any tier
  // restores full color + style.
  const isMuted = !!compact && !expanded && !picked
  const padCls = isMuted ? 'p-3' : 'p-3.5'
  const marginCls = 'mb-2'

  return (
    <motion.button
      onClick={onPick}
      whileTap={{ scale: 0.98 }}
      animate={{
        opacity: dimmed ? 0.4 : isMuted ? 0.7 : 1,
        scale:   expanded && !picked ? 1.01 : 1,
      }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`relative mx-2 ${marginCls} ${padCls} rounded-2xl border-2 text-left transition-colors ${
        picked
          ? 'bg-[#FFD700] border-[#FFD700]'
          : expanded
            ? 'bg-zinc-900 border-[#FFD700]'
            : isMuted
              ? 'bg-zinc-900/40 border-white/8 hover:border-white/20'
              : highlighted
                ? 'bg-zinc-900 border-[#FFD700]/60 hover:border-[#FFD700]'
                : 'bg-zinc-900/60 border-white/10 hover:border-[#FFD700]/40'
      }`}
      style={(highlighted || expanded) && !picked ? {
        boxShadow: expanded ? '0 0 40px rgba(255,215,0,0.28)' : '0 0 28px rgba(255,215,0,0.16)',
      } : undefined}
    >
      {highlighted && !picked && !expanded && (
        <div
          className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-[0.18em] z-10"
          style={{
            background: '#FFD700',
            color:      '#000',
            boxShadow:  '0 4px 12px rgba(255,215,0,0.45)',
          }}
        >
          Most Popular
        </div>
      )}

      <p className={`text-[8.5px] font-black uppercase tracking-[0.22em] ${isMuted ? 'mb-1' : 'mb-1.5'} ${
        picked
          ? 'text-black/70'
          : isMuted
            ? 'text-white/35'
            : 'text-[#FFD700]'
      }`}>
        {eyebrow}
      </p>

      {/* Compact (collapsed) layout — single tight row, muted styling */}
      {isMuted ? (
        <div className="flex items-baseline gap-2">
          <p className="text-white/80 text-base font-black tracking-tight">{title}</p>
          <p className="text-white/25 text-[9.5px] font-bold flex-1">{tagline}</p>
          <p className="text-white/85 text-base font-black tracking-tight">{price}<span className="text-white/30 text-[10px] font-bold">{per}</span></p>
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2 mb-0.5">
            <p className={`text-lg font-black tracking-tighter ${picked ? 'text-black' : 'text-white'}`}>{title}</p>
            <p className={`text-[10px] font-bold ${picked ? 'text-black/60' : 'text-white/40'}`}>{tagline}</p>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <p className={`${compact ? 'text-2xl' : 'text-[26px]'} font-black tracking-tighter ${picked ? 'text-black' : 'text-white'}`}>{price}</p>
            <p className={`text-[12px] font-bold ${picked ? 'text-black/60' : 'text-white/40'}`}>{per}</p>
          </div>
          <p className={`text-[9px] font-medium ${picked ? 'text-black/60' : 'text-white/35'}`}>{afterTrial}</p>
        </>
      )}

      {/* Features list only shows when this tier is expanded or already picked */}
      <AnimatePresence initial={false}>
        {(expanded || picked) && features && features.length > 0 && (
          <motion.ul
            key="features"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
            exit={{    opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="pt-2.5 border-t space-y-1.5 overflow-hidden"
            style={{ borderColor: picked ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)' }}
          >
            {features.map(f => (
              <li
                key={f.label}
                className={`flex items-center gap-2 text-[10px] leading-snug ${
                  picked ? 'text-black/80' : f.kind === 'out' ? 'text-white/40' : 'text-white/75'
                }`}
              >
                <FeatureGlyph kind={f.kind} picked={picked} />
                <span className={f.kind === 'out' ? 'line-through opacity-80' : ''}>{f.label}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* "Tap to confirm" prompt — shown only when expanded and not yet picked */}
      <AnimatePresence>
        {expanded && !picked && (
          <motion.div
            key="confirm-hint"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t flex items-center justify-center gap-1.5"
            style={{ borderColor: 'rgba(255,215,0,0.18)' }}
          >
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.2em]"
            >
              Tap to start {title} →
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// ─── App shell — bottom-tab navigator post-paywall ───────────────────────────

type TabId = 'home' | 'releases' | 'up' | 'network' | 'you'

interface TabDef {
  id:    TabId
  label: string
  /** Lucide-ish path (just stroke geometry) so we don't add a deps import */
  glyph: React.ReactNode
}

const APP_TABS: TabDef[] = [
  { id: 'home',     label: 'Home',
    glyph: <path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z" strokeLinecap="round" strokeLinejoin="round" /> },
  { id: 'releases', label: 'Releases',
    glyph: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></> },
  { id: 'up',       label: 'uP',
    glyph: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" /> },
  { id: 'network',  label: 'Network',
    glyph: <><circle cx="9" cy="7" r="3" /><circle cx="17" cy="11" r="2.5" /><path d="M3 21v-1a6 6 0 0 1 12 0v1M14 21v-1a4 4 0 0 1 7 0v1" strokeLinecap="round" /></> },
  { id: 'you',      label: 'You',
    glyph: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" strokeLinecap="round" /></> },
]

interface AppShellProps {
  artistName:    string
  planId:        string
  onboardingCtx: { artistName: string; genre?: string | null; goal?: string | null; pains?: string[] }
  onSignOut:     () => void
}

function AppShell({ artistName, planId, onboardingCtx, onSignOut }: AppShellProps) {
  const [tab, setTab] = useState<TabId>('home')
  const state = useMvpAppState({
    artistName: onboardingCtx.artistName,
    genre:      onboardingCtx.genre,
    goal:       onboardingCtx.goal,
    pains:      onboardingCtx.pains,
  })

  // When switching INTO the uP tab, clear the unread badge.
  function switchTab(next: TabId) {
    if (next === 'up') state.markChatSeen()
    setTab(next)
  }

  function handleSignOut() {
    state.resetAll()
    onSignOut()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex flex-col bg-[#050505]"
    >
      {/* Status bar already mounted by parent */}
      <div className="flex-1 overflow-y-auto pt-12 pb-24">
        <AnimatePresence mode="wait">
          {tab === 'home'     && <HomeTab     key="home"     artistName={artistName} onJumpTo={setTab} state={state} />}
          {tab === 'releases' && <ReleasesTab key="releases" state={state} />}
          {tab === 'up'       && <UpTab       key="up"       artistName={artistName} planId={planId} state={state} />}
          {tab === 'network'  && <NetworkTab  key="network"  planId={planId} />}
          {tab === 'you'      && <YouTab      key="you"      artistName={artistName} planId={planId} onSignOut={handleSignOut} />}
        </AnimatePresence>
      </div>

      {/* Bottom tab bar */}
      <nav
        className="absolute bottom-0 left-0 right-0 px-3 pt-2 pb-5 flex items-center justify-between"
        style={{
          background:'linear-gradient(180deg, rgba(10,10,10,0.6) 0%, #0A0A0A 60%)',
          borderTop:'1px solid rgba(255,255,255,0.06)',
          backdropFilter:'blur(20px)',
        }}
      >
        {APP_TABS.map(t => {
          const active = tab === t.id
          const isCenter = t.id === 'up'
          const badgeCount =
            t.id === 'up'      ? state.chatUnreadCount    :
            t.id === 'network' ? state.networkUnreadCount :
            0
          return (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className="relative flex-1 flex flex-col items-center gap-1 py-1.5 group"
            >
              {isCenter ? (
                // Center "uP" uses the real brand orb with the rich multi-layer
                // halo from the website hero — always glowing, brighter when
                // active so the dock pulses attention toward the AI manager.
                <div
                  className={`w-11 h-11 rounded-full overflow-hidden relative transition-all ${
                    active ? 'scale-110' : ''
                  }`}
                  style={{
                    boxShadow: active
                      ? '0 0 6px rgba(255,215,0,0.8), 0 0 18px rgba(255,215,0,0.55), 0 0 44px rgba(255,215,0,0.32), 0 0 80px rgba(255,215,0,0.16), inset 0 0 0 1px rgba(255,255,255,0.3)'
                      : '0 0 4px rgba(255,215,0,0.55), 0 0 14px rgba(255,215,0,0.3), 0 0 32px rgba(255,215,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.18)',
                  }}
                >
                  <img src="/up-avatar.png" alt="uP" className="w-full h-full object-cover" />
                </div>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                     stroke={active ? '#FFD700' : 'rgba(255,255,255,0.4)'}
                     strokeWidth="1.8"
                     className="transition-colors">
                  {t.glyph}
                </svg>
              )}
              <span
                className={`text-[9px] font-black uppercase tracking-[0.1em] transition-colors ${
                  active ? 'text-[#FFD700]' : 'text-white/35'
                } ${isCenter ? 'mt-0.5' : ''}`}
              >
                {t.label}
              </span>

              {/* Unread badge — bright red pill, native iOS style */}
              {badgeCount > 0 && !active && (
                <span
                  className="absolute top-0.5 right-1/2 translate-x-[14px] min-w-[16px] h-[16px] px-1 rounded-full bg-[#FF3B30] text-white text-[9px] font-black flex items-center justify-center"
                  style={{ boxShadow: '0 2px 6px rgba(255,59,48,0.4)' }}
                >
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </motion.div>
  )
}

// ─── Tab: Home ───────────────────────────────────────────────────────────────
function HomeTab({ artistName, onJumpTo, state }: { artistName: string; onJumpTo: (t: TabId) => void; state: MvpAppStateAPI }) {
  const latest        = state.latestUpMessage
  const tasks         = state.upcomingTasks
  const pendingAction = state.pendingActionMessage

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="px-5 pb-4"
    >
      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em] mb-1">
        Today
      </p>
      <h2 className="text-white text-2xl font-black tracking-tighter mb-5">
        Hey {artistName}.
      </h2>

      {/* uP latest message preview — live from chat state, inline action CTA */}
      {latest && (
        <div className="w-full p-4 rounded-2xl border border-[#FFD700]/25 bg-[#FFD700]/8 flex items-start gap-3.5 mb-3">
          <button
            onClick={() => onJumpTo('up')}
            className="flex items-start gap-3.5 flex-1 min-w-0 text-left"
          >
            <div
              className="w-11 h-11 rounded-full overflow-hidden shrink-0 mt-0.5 relative"
              style={{
                boxShadow:
                  '0 0 6px rgba(255,215,0,0.75), 0 0 18px rgba(255,215,0,0.5), 0 0 44px rgba(255,215,0,0.3), 0 0 80px rgba(255,215,0,0.14), inset 0 0 0 1px rgba(255,255,255,0.28)',
              }}
            >
              <img src="/up-avatar.png" alt="uP" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-[0.2em] mb-1">uP · {latest.ts}</p>
              <p className="text-white text-[12px] leading-snug line-clamp-3 whitespace-pre-line">
                {latest.text}
              </p>
              {/* Inline action button — fires the message's action without
                  forcing the user to jump into the Chat tab first */}
              {pendingAction?.action && pendingAction.id === latest.id && (
                <button
                  onClick={(e) => { e.stopPropagation(); state.runChatAction(pendingAction.id) }}
                  className="mt-2.5 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-transform hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    background: '#FFD700',
                    color:      '#000',
                    boxShadow:  '0 4px 12px rgba(255,215,0,0.35)',
                  }}
                >
                  {pendingAction.action.label}
                </button>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <Tile label="Monthly listeners"    value="1.2k" trend="+18%" />
        <Tile label="Active conversations" value="5"    trend="curators" />
      </div>

      {/* Today's tasks — pulled live from release state */}
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em]">
          Today's tasks
        </p>
        <button
          onClick={() => onJumpTo('releases')}
          className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
        >
          View all →
        </button>
      </div>
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="p-4 rounded-2xl border border-white/8 bg-zinc-900/40 text-center">
            <p className="text-white/40 text-[12px]">All caught up — nice work.</p>
          </div>
        ) : (
          tasks.map(t => (
            <button
              key={`${t.releaseId}-${t.idx}`}
              onClick={() => state.toggleTask(t.releaseId, t.idx)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/6 bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors text-left"
            >
              <div className="w-4 h-4 rounded-full border border-white/30 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white/85 text-[12px] leading-snug truncate">{t.label}</p>
                <p className="text-white/35 text-[9px] font-bold uppercase tracking-widest mt-0.5">{t.releaseTitle}</p>
              </div>
              {t.due && (
                <span className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest shrink-0">
                  {t.due}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </motion.div>
  )
}

function Tile({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="p-3.5 rounded-2xl border border-white/8 bg-zinc-900/60">
      <p className="text-white text-2xl font-black tracking-tight leading-none mb-1.5">{value}</p>
      <p className="text-white/40 text-[9px] font-black uppercase tracking-widest leading-snug">{label}</p>
      <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest mt-1">{trend}</p>
    </div>
  )
}

// (Old static TaskRow removed — Home tab now reads upcomingTasks from
// useMvpAppState and renders them as toggleable buttons.)

// ════════════════════════════════════════════════════════════════════════════
// Tab content — Releases · uP Chat · Network · You
// ════════════════════════════════════════════════════════════════════════════

const PLAN_META: Record<string, { label: string; color: string; outreachCap: number | null }> = {
  solo:      { label: 'Solo',             color: '#94A3B8', outreachCap: 3    },
  weekly:    { label: 'Weekly',           color: '#FFD700', outreachCap: null },
  monthly:   { label: 'Monthly',          color: '#FFD700', outreachCap: null },
  strategic: { label: 'Strategic Artist', color: '#A78BFA', outreachCap: null },
}

// ─── Releases — calendar + task list (releases live in MvpAppState) ────────
// (Release / ReleaseTask types now re-exported from useMvpAppState.ts)

function ReleasesTab({ state }: { state: MvpAppStateAPI }) {
  const releases = state.releases
  const [openId, setOpenId] = useState<string>(releases[0]?.id ?? '')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="px-5 pb-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.25em] mb-1">Releases</p>
          <h2 className="text-white text-2xl font-black tracking-tighter">Your drop calendar.</h2>
        </div>
        <button className="w-9 h-9 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center text-lg font-black">
          +
        </button>
      </div>

      {/* Mini calendar strip */}
      <div className="mb-5 p-3 rounded-2xl border border-white/8 bg-zinc-900/50">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white text-[12px] font-black uppercase tracking-wide">June 2026</p>
          <p className="text-white/40 text-[10px] font-bold">2 releases this month</p>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['M','T','W','T','F','S','S'].map((d, i) =>
            <p key={i} className="text-white/30 text-[9px] font-black text-center">{d}</p>
          )}
          {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
            const isRelease = day === 19
            const isToday   = day === 7
            return (
              <div
                key={day}
                className="aspect-square flex items-center justify-center rounded-md text-[10px] font-bold relative"
                style={{
                  background:
                    isRelease ? '#FFD700' :
                    isToday   ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color:
                    isRelease ? '#000' :
                    isToday   ? '#FFD700' : 'rgba(255,255,255,0.45)',
                  border: isToday ? '1px solid rgba(255,215,0,0.4)' : 'none',
                }}
              >
                {day}
                {isRelease && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[7px]">●</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Release cards */}
      <div className="space-y-3">
        {releases.map(r => {
          const isOpen   = openId === r.id
          const done     = r.tasks.filter(t => t.done).length
          const total    = r.tasks.length
          const pct      = Math.round((done / total) * 100)
          return (
            <div
              key={r.id}
              className="rounded-2xl border border-white/10 bg-zinc-900/60 overflow-hidden"
            >
              <button
                onClick={() => setOpenId(isOpen ? '' : r.id)}
                className="w-full p-3 flex items-center gap-3 text-left"
              >
                {/* Art */}
                <div
                  className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center text-2xl font-black"
                  style={{ background: r.art, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                >
                  {r.title[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest mb-0.5">
                    {r.type} · {r.daysOut <= 7 ? `${r.daysOut} days` : `${r.daysOut} days out`}
                  </p>
                  <p className="text-white text-[14px] font-black tracking-tight leading-tight truncate">
                    {r.title}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-2 h-1 rounded-full bg-white/8 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: r.accent, boxShadow: `0 0 8px ${r.accent}80` }}
                    />
                  </div>
                  <p className="text-white/40 text-[10px] font-bold mt-1.5">
                    {done} of {total} tasks · {pct}% complete
                  </p>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"
                     className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 pb-3 space-y-1.5 border-t border-white/5"
                >
                  {r.tasks.map((t, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); state.toggleTask(r.id, i) }}
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left hover:bg-white/3 transition-colors ${
                        t.done ? 'opacity-50' : ''
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          t.done ? 'bg-[#FFD700] border-[#FFD700]' : 'border-white/30'
                        }`}
                      >
                        {t.done && (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <p className={`flex-1 text-[12px] leading-snug ${
                        t.done ? 'text-white/55 line-through' : 'text-white'
                      }`}>
                        {t.label}
                      </p>
                      {t.due && !t.done && (
                        <span className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest">
                          {t.due}
                        </span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )
        })}
      </div>

      {/* Past releases archive */}
      {state.pastReleases.length > 0 && (
        <div className="mt-7">
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em]">
              Past Releases
            </p>
            <p className="text-white/25 text-[10px] font-bold">{state.pastReleases.length} live</p>
          </div>
          <div className="space-y-2">
            {state.pastReleases.map(p => (
              <button
                key={p.id}
                className="w-full p-3 rounded-2xl border border-white/8 bg-zinc-900/40 flex items-center gap-3 text-left hover:border-white/20 hover:bg-zinc-900/70 transition-colors"
              >
                <div
                  className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-lg font-black text-white"
                  style={{ background: p.art, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                >
                  {p.title[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-0.5">
                    {p.type} · {p.releasedDate}
                  </p>
                  <p className="text-white text-[13px] font-black tracking-tight leading-tight truncate">
                    {p.title}
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <p className="text-white text-[13px] font-black tracking-tight">{p.streams}</p>
                  <p
                    className="text-[9px] font-black uppercase tracking-widest mt-0.5"
                    style={{ color: p.accent }}
                  >
                    {p.weeklyDelta}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ─── uP Chat — full in-app conversation ─────────────────────────────────────
// ChatMsg type + seed data now live in mvp/useMvpAppState.ts
// import type { ChatMsg } from './mvp/useMvpAppState'  (already imported above)

const QUICK_ACTIONS = [
  'Plan next release',
  'Pitch curators',
  'Check stats',
  'Run an ad',
]

function UpTab({ artistName, planId, state }: { artistName: string; planId: string; state: MvpAppStateAPI }) {
  const locked = planId === 'solo'   // Solo plan: uP iMessage disabled
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom whenever chat updates (new message or pending typing)
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [state.chat, state.chatPending])

  function trySend(text: string) {
    if (locked) return
    const trimmed = text.trim()
    if (!trimmed || state.chatPending) return
    setInput('')
    state.sendChat(trimmed)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="h-full flex flex-col px-4 pb-2"
    >
      {/* Chat header — orb avatar w/ multi-layer halo matching website hero */}
      <div className="flex items-center gap-3 px-1 mb-4 shrink-0">
        <div
          className="w-12 h-12 rounded-full overflow-hidden relative"
          style={{
            boxShadow:
              '0 0 6px rgba(255,215,0,0.8), 0 0 18px rgba(255,215,0,0.55), 0 0 44px rgba(255,215,0,0.3), 0 0 80px rgba(255,215,0,0.14), inset 0 0 0 1px rgba(255,255,255,0.28)',
          }}
        >
          <img src="/up-avatar.png" alt="uP" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-[14px] font-black tracking-tight leading-tight">uP</p>
          <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] shadow-[0_0_6px_rgba(52,199,89,0.6)]" />
            Active now
          </p>
        </div>
      </div>

      {/* Solo-tier lock overlay */}
      {locked && (
        <div className="relative">
          <div className="absolute inset-0 z-10 rounded-2xl border border-[#FFD700]/30 bg-[#0A0A0A]/85 backdrop-blur-md flex flex-col items-center justify-center px-6 py-8 text-center"
               style={{ minHeight: '380px' }}>
            <div className="w-12 h-12 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/40 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2">
                <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </div>
            <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-[0.25em] mb-2">Pro feature</p>
            <h3 className="text-white text-xl font-black tracking-tight mb-2">uP Chat is locked.</h3>
            <p className="text-white/55 text-[12px] leading-snug max-w-[260px] mb-5">
              Your AI music manager works the moment you upgrade. {artistName}, you're on Solo — upgrade for unlimited messaging.
            </p>
            <button
              className="px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest"
              style={{ background:'#FFD700', color:'#000', boxShadow:'0 4px 14px rgba(255,215,0,0.35)' }}
            >
              Upgrade to Monthly →
            </button>
          </div>
          {/* Blurred chat preview underneath */}
          <ChatBubbles dimmed messages={state.chat} />
        </div>
      )}

      {!locked && (
        <>
          {/* Conversation — flex-1 takes remaining vertical space, only this scrolls */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto pr-1 -mr-1"
            style={{ scrollbarWidth: 'none' }}
          >
            <ChatBubbles messages={state.chat} onRunAction={state.runChatAction} />
            {state.chatPending && <TypingDots />}
          </div>

          {/* Composer pinned to bottom */}
          <div className="shrink-0 pt-3">
            {/* Quick actions — pre-fill input on tap */}
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {QUICK_ACTIONS.map(a => (
                <button
                  key={a}
                  onClick={() => trySend(a)}
                  disabled={state.chatPending}
                  className="shrink-0 px-3 py-1.5 rounded-full border border-white/10 bg-zinc-900 text-white/70 text-[11px] font-bold whitespace-nowrap hover:border-[#FFD700]/40 hover:text-white transition-colors disabled:opacity-40"
                >
                  {a}
                </button>
              ))}
            </div>

            {/* Input bar — real send */}
            <form
              onSubmit={(e) => { e.preventDefault(); trySend(input) }}
              className="flex items-center gap-2 p-2 rounded-full border border-white/10 bg-zinc-900/80"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={state.chatPending ? 'uP is thinking…' : 'Message uP…'}
                disabled={state.chatPending}
                className="flex-1 bg-transparent outline-none text-white text-[13px] px-3 placeholder:text-white/30 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || state.chatPending}
                className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40 transition-transform active:scale-90"
                style={{ background: '#FFD700' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>

            {/* Subtle context line under input */}
            <p className="text-white/25 text-[10px] text-center mt-2">
              uP knows {artistName.split(' ')[0]}'s genre, goal &amp; blocks
            </p>
          </div>
        </>
      )}
    </motion.div>
  )
}

function ChatBubbles({
  dimmed = false,
  messages,
  onRunAction,
}: {
  dimmed?:     boolean
  messages?:   ChatMsg[]
  onRunAction?: (msgId: string) => void
}) {
  const msgs = messages ?? []  // Solo lock overlay passes no messages → empty fallback
  return (
    <div className={`space-y-2.5 ${dimmed ? 'opacity-30 blur-[1.5px] pointer-events-none' : ''}`}>
      {msgs.map(m => {
        const isUp = m.from === 'up'
        if (m.card) {
          return (
            <div key={m.id} className="flex justify-start">
              <div
                className="max-w-[88%] p-3 rounded-2xl rounded-bl-md"
                style={{
                  background: 'rgba(255,215,0,0.07)',
                  border:     '1px solid rgba(255,215,0,0.2)',
                }}
              >
                <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest mb-1">{m.card.title}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-white text-[18px] font-black tracking-tight">{m.card.stat}</p>
                  <p className="text-white/55 text-[11px] font-medium">{m.card.sub}</p>
                </div>
              </div>
            </div>
          )
        }
        return (
          <div key={m.id} className={`flex flex-col ${isUp ? 'items-start' : 'items-end'}`}>
            <div
              className={`max-w-[80%] px-3.5 py-2.5 text-[12.5px] leading-snug whitespace-pre-line ${
                isUp ? 'rounded-2xl rounded-bl-md text-white' : 'rounded-2xl rounded-br-md text-black font-semibold'
              }`}
              style={isUp
                ? { background:'rgba(255,215,0,0.1)', border:'1px solid rgba(255,215,0,0.22)' }
                : { background:'#FFD700' }
              }
            >
              {m.text}
            </div>
            {/* Inline action button under uP messages — only when action is
                attached, unfulfilled, and a handler is provided */}
            {isUp && m.action && !m.action.done && onRunAction && (
              <button
                onClick={() => onRunAction(m.id)}
                className="mt-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-transform hover:scale-[1.03] active:scale-[0.97]"
                style={{
                  background: '#FFD700',
                  color:      '#000',
                  boxShadow:  '0 4px 12px rgba(255,215,0,0.35)',
                }}
              >
                {m.action.label}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex justify-start mt-2.5">
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-1 px-4 py-2.5 rounded-2xl rounded-bl-md"
        style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.22)' }}
      >
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="block w-1.5 h-1.5 rounded-full bg-[#FFD700]/70"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>
    </div>
  )
}

// ─── Network — outreach list (drives freemium tension) ──────────────────────
interface OutreachRow {
  id:        string
  name:      string
  followers: string
  initials:  string
  accent:    string
  status:    'replied' | 'pending' | 'opened' | 'queued'
  preview:   string
}

const OUTREACH: OutreachRow[] = [
  { id: 'o1', name: 'DJ Smoov',     followers: '92K', initials: 'DS', accent: '#FFD700',
    status: 'replied', preview: '"Love this — adding to Late Night Vibes 🔥"' },
  { id: 'o2', name: 'Curator Mara', followers: '480K', initials: 'CM', accent: '#A78BFA',
    status: 'opened',  preview: 'Read 2h ago · No reply yet' },
  { id: 'o3', name: 'Devon K',      followers: '210K', initials: 'DK', accent: '#60A5FA',
    status: 'pending', preview: 'Sent yesterday' },
]

const BROWSE: OutreachRow[] = [
  { id: 'b1', name: 'Soulful Vibes',  followers: '340K', initials: 'SV', accent: '#34D399', status: 'queued', preview: 'R&B · Indie' },
  { id: 'b2', name: 'After Hours FM', followers: '210K', initials: 'AH', accent: '#F87171', status: 'queued', preview: 'Late Night · Curated' },
  { id: 'b3', name: 'New Wave Pop',   followers: '580K', initials: 'NW', accent: '#FB923C', status: 'queued', preview: 'Pop · Editorial' },
]

function NetworkTab({ planId }: { planId: string }) {
  const plan = PLAN_META[planId] ?? PLAN_META.solo
  const cap  = plan.outreachCap
  const used = 2                            // demo: artist already used 2 of 3
  const atCap = cap !== null && used >= cap

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="px-5 pb-4"
    >
      <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.25em] mb-1">Network</p>
      <h2 className="text-white text-2xl font-black tracking-tighter mb-5">Curator outreach.</h2>

      {/* Quota tracker (only for capped plans) */}
      {cap !== null && (
        <div
          className="p-4 rounded-2xl border mb-5"
          style={{
            background:  atCap ? 'rgba(239,68,68,0.06)' : 'rgba(255,215,0,0.06)',
            borderColor: atCap ? 'rgba(239,68,68,0.25)' : 'rgba(255,215,0,0.2)',
          }}
        >
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-white text-[12px] font-black uppercase tracking-wide">
              Monthly Outreach
            </p>
            <p className="font-black text-lg">
              <span className={atCap ? 'text-[#EF4444]' : 'text-[#FFD700]'}>{used}</span>
              <span className="text-white/40 text-sm"> / {cap}</span>
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-white/8 overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width:      `${(used / cap) * 100}%`,
                background: atCap ? '#EF4444' : '#FFD700',
              }}
            />
          </div>
          <p className="text-white/45 text-[10.5px] leading-snug">
            {atCap
              ? "You've used all 3 monthly pitches. Upgrade for unlimited."
              : `${cap - used} pitch${cap - used === 1 ? '' : 'es'} left this month — refreshes June 30.`}
          </p>
          {(atCap || used === cap - 1) && (
            <button
              className="mt-3 w-full h-10 rounded-xl font-black text-[11px] uppercase tracking-widest"
              style={{ background:'#FFD700', color:'#000', boxShadow:'0 4px 14px rgba(255,215,0,0.3)' }}
            >
              Upgrade for unlimited →
            </button>
          )}
        </div>
      )}

      {/* Active conversations */}
      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em] mb-2.5">Active</p>
      <div className="space-y-2 mb-6">
        {OUTREACH.map(o => <OutreachCard key={o.id} row={o} />)}
      </div>

      {/* Browse list */}
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em]">Browse · 47 curators in your lane</p>
      </div>
      <div className="space-y-2">
        {BROWSE.map(b => (
          <div key={b.id} className="relative">
            <OutreachCard row={b} />
            {atCap && (
              <div className="absolute inset-0 rounded-2xl bg-black/45 backdrop-blur-[2px] flex items-center justify-center">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#FFD700]/30 bg-[#FFD700]/15">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.5">
                    <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                  <span className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest">Upgrade to unlock</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function OutreachCard({ row }: { row: OutreachRow }) {
  const statusColors: Record<OutreachRow['status'], { dot: string; label: string; text: string }> = {
    replied: { dot: '#34D399', label: 'Replied',     text: 'text-[#34D399]' },
    opened:  { dot: '#A78BFA', label: 'Opened',      text: 'text-[#A78BFA]' },
    pending: { dot: '#FFD700', label: 'Sent',        text: 'text-[#FFD700]' },
    queued:  { dot: '#64748B', label: 'Available',   text: 'text-white/45' },
  }
  const s = statusColors[row.status]
  return (
    <div className="p-3 rounded-2xl border border-white/8 bg-zinc-900/60 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[11px] shrink-0 border"
        style={{
          background:  `${row.accent}20`,
          borderColor: `${row.accent}50`,
          color:       row.accent,
        }}
      >
        {row.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-white text-[12px] font-black tracking-tight truncate">{row.name}</p>
          <p className="text-white/35 text-[10px] font-bold shrink-0">{row.followers}</p>
        </div>
        <p className="text-white/55 text-[10.5px] leading-snug truncate">{row.preview}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
        <span className={`text-[9px] font-black uppercase tracking-widest ${s.text}`}>{s.label}</span>
      </div>
    </div>
  )
}

// ─── You — profile / plan / analytics / settings ────────────────────────────
function YouTab({ artistName, planId, onSignOut }: { artistName: string; planId: string; onSignOut: () => void }) {
  const plan = PLAN_META[planId] ?? PLAN_META.solo
  const initials = artistName.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'A'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="px-5 pb-4"
    >
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center font-black text-xl"
          style={{ background: '#FFD700', color: '#000', boxShadow: '0 0 20px rgba(255,215,0,0.3)' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xl font-black tracking-tight leading-tight">{artistName}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest"
              style={{
                background:  `${plan.color}18`,
                color:       plan.color,
                border:      `1px solid ${plan.color}40`,
              }}
            >
              {plan.label}
            </span>
            <span className="text-white/35 text-[10px] font-bold">· Indie Artist</span>
          </div>
        </div>
      </div>

      {/* Analytics quick stats */}
      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em] mb-2.5">Your Career</p>
      <div className="grid grid-cols-3 gap-2 mb-5">
        <StatTile value="1.2k" label="Monthly listeners" trend="+18%" trendColor="#34D399" />
        <StatTile value="42k"  label="Total streams"     trend="this mo" trendColor="rgba(255,255,255,0.4)" />
        <StatTile value="3"    label="Releases live"     trend="2 upcoming" trendColor="rgba(255,255,255,0.4)" />
      </div>

      {/* Menu sections */}
      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em] mb-2.5">Account</p>
      <div className="rounded-2xl border border-white/8 bg-zinc-900/50 overflow-hidden mb-4">
        <MenuRow icon="◷" label="Plan & Billing"      detail={plan.label}  />
        <MenuRow icon="↗" label="Full Analytics"      detail="Spotify · Meta" />
        <MenuRow icon="◌" label="Knowledge Base"      detail="Videos + guides" />
        <MenuRow icon="⊡" label="Connected Platforms" detail="Spotify · Meta · Stripe" />
      </div>

      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em] mb-2.5">Preferences</p>
      <div className="rounded-2xl border border-white/8 bg-zinc-900/50 overflow-hidden mb-4">
        <MenuRow icon="◐" label="uP Notifications"   detail="Daily check-ins" />
        <MenuRow icon="◫" label="Goals & Vision"     detail="Editable" />
        <MenuRow icon="◇" label="Privacy"            detail="" />
      </div>

      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em] mb-2.5">Support</p>
      <div className="rounded-2xl border border-white/8 bg-zinc-900/50 overflow-hidden mb-6">
        <MenuRow icon="?" label="Help & FAQ"         detail="" />
        <MenuRow icon="✉" label="Contact uP team"    detail="" />
        <MenuRow icon="★" label="Rate the app"        detail="" />
      </div>

      <button
        onClick={onSignOut}
        className="w-full h-12 rounded-2xl border border-white/10 bg-zinc-900 text-white/50 hover:text-white hover:border-white/30 text-[11px] font-black uppercase tracking-widest transition-colors"
      >
        Sign out
      </button>

      <p className="text-white/20 text-[9px] text-center mt-4 font-bold tracking-widest uppercase">
        GrounduP · v1.0
      </p>
    </motion.div>
  )
}

function StatTile({ value, label, trend, trendColor }: { value: string; label: string; trend: string; trendColor: string }) {
  return (
    <div className="p-3 rounded-2xl border border-white/8 bg-zinc-900/50">
      <p className="text-white text-xl font-black tracking-tight leading-none mb-1">{value}</p>
      <p className="text-white/40 text-[9px] font-black uppercase tracking-widest leading-snug">{label}</p>
      <p className="text-[9px] font-black mt-1.5" style={{ color: trendColor }}>{trend}</p>
    </div>
  )
}

function MenuRow({ icon, label, detail }: { icon: string; label: string; detail: string }) {
  return (
    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors border-b border-white/5 last:border-b-0">
      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-[#FFD700] text-sm">
        {icon}
      </div>
      <p className="flex-1 text-left text-white text-[12px] font-bold tracking-tight">{label}</p>
      {detail && <p className="text-white/35 text-[10px] font-bold">{detail}</p>}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5">
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function FeatureGlyph({ kind, picked }: { kind: PlanFeature['kind']; picked: boolean }) {
  const color = picked ? '#000' : kind === 'in' ? '#FFD700' : kind === 'cap' ? '#F59E0B' : 'rgba(255,255,255,0.3)'
  if (kind === 'in') {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" className="shrink-0">
        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (kind === 'cap') {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" className="shrink-0">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" className="shrink-0">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
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
