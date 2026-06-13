import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PanInfo, Variants } from 'framer-motion'
import { CheckCircle, ArrowRight, ArrowLeft, Loader2, Zap, Users, TrendingUp, Music, Smartphone, Star, X, Check } from 'lucide-react'
import { MeshGradient } from '@paper-design/shaders-react'
import { useIsMobile } from '../hooks/useIsMobile'

const PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'X / Twitter', 'Other']
const FOLLOWER_RANGES = ['Under 10K', '10K – 50K', '50K – 250K', '250K – 1M', '1M+']

const STEPS = [
  {
    num: '01',
    label: 'App Walkthroughs',
    headline: ['Show Them', 'How You Work.'],
    body: 'Your audience wants to see real workflows, not ads. Walk them through exactly how you use GrounduP — the more specific, the better.',
    cards: [
      { emoji: '🎬', text: 'How I pitched 50 playlists in 20 minutes with AI' },
      { emoji: '📱', text: 'My full release planning process inside GrounduP' },
      { emoji: '⚙️', text: 'Setting up a curator outreach campaign from scratch' },
      { emoji: '☀️', text: 'Day in the life of an indie artist using GrounduP' },
    ],
    tip: 'Screen recordings perform best. Show real data — real streams, real curator responses, real results.',
  },
  {
    num: '02',
    label: 'Before & After',
    headline: ['Document', 'The Journey.'],
    body: 'Nothing converts like proof. Show where you started and where GrounduP took you. Raw and authentic beats polished every time.',
    cards: [
      { emoji: '📊', text: 'Spotify stats side-by-side — before vs. after 30 days' },
      { emoji: '🏆', text: 'I got 3 playlist placements in my first week — here\'s how' },
      { emoji: '📅', text: '30-day challenge series — daily short-form updates' },
      { emoji: '🤖', text: 'What happened when I let AI run my music marketing' },
    ],
    tip: 'Start filming now, even before big results. The journey content is what builds trust before the payoff.',
  },
  {
    num: '03',
    label: 'Tips for Artists',
    headline: ['Teach,', "Don't Sell."],
    body: 'Educational content drives the most sign-ups. Help artists understand the game — with GrounduP as the tool that makes it all possible.',
    cards: [
      { emoji: '❌', text: '5 playlist pitching mistakes indie artists make' },
      { emoji: '🗓️', text: 'How to plan your entire EP campaign in one afternoon' },
      { emoji: '📬', text: 'The curator outreach strategy that actually works in 2025' },
      { emoji: '📈', text: 'Why most indie artists plateau — and how to break through' },
    ],
    tip: 'Make it evergreen. Content that\'s still valuable in 6 months compounds. Skills + GrounduP = unstoppable.',
  },
]

const BENEFITS = [
  { icon: <Zap size={18} />, label: 'Your Unique Ref Code', desc: 'Every user you bring in is tracked to you. Forever.' },
  { icon: <Star size={18} />, label: 'Creator Perks', desc: 'Early access to new features and a premium plan on us.' },
  { icon: <Users size={18} />, label: 'Join the Inner Circle', desc: 'Monthly calls, direct line to the founders, and a say in what we build.' },
]

type FormState = { name: string; email: string; platform: string; followers: string; handle: string; notes: string }

const slideVariants: Variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -60 : 60, opacity: 0 }),
}

export function CreatorOnboarding() {
  const isMobile = useIsMobile()

  const [modalOpen, setModalOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [form, setForm] = useState<FormState>({ name: '', email: '', platform: '', followers: '', handle: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [refCode, setRefCode] = useState<string | null>(null)

  function openModal() {
    setStep(0)
    setDir(1)
    setModalOpen(true)
  }

  function next() {
    if (step < STEPS.length - 1) {
      setDir(1)
      setStep(s => s + 1)
    } else {
      setModalOpen(false)
      setTimeout(() => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' }), 150)
    }
  }

  function prev() {
    if (step > 0) {
      setDir(-1)
      setStep(s => s - 1)
    }
  }

  function toggleCard(key: string) {
    setSelected(s => {
      const n = new Set(s)
      n.has(key) ? n.delete(key) : n.add(key)
      return n
    })
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -60) next()
    else if (info.offset.x > 60) prev()
  }

  useEffect(() => {
    if (!modalOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape') setModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen, step])

  function setField(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.platform) {
      setError('Please fill in your name, email, and platform.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/.netlify/functions/creator-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Something went wrong.'); setSubmitting(false); return }
      setRefCode(json.ref_code)
    } catch {
      setError('Network error. Check your connection and try again.')
    }
    setSubmitting(false)
  }

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-x-hidden">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        {isMobile ? (
          <>
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(184,134,11,0.18) 0%, rgba(255,215,0,0.07) 40%, transparent 70%)' }} />
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(255,215,0,0.12) 0%, transparent 65%)' }} />
          </>
        ) : (
          <>
            <MeshGradient className="absolute inset-0 w-full h-full" colors={['#000000', '#FFD700', '#B8860B', '#1A1A1A', '#000000']} speed={0.3} />
            <MeshGradient className="absolute inset-0 w-full h-full opacity-30" colors={['#000000', '#ffffff', '#FFD700', '#000000']} speed={0.2} />
          </>
        )}
      </div>

      {/* ── IMMERSIVE MODAL ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
            style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)' }}
            onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}
          >
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col"
              style={{
                background: 'rgba(8,8,12,0.98)',
                border: '1px solid rgba(255,215,0,0.12)',
                maxHeight: '92vh',
              }}
            >
              {/* Progress bar */}
              <div className="h-0.5 w-full bg-white/6 relative overflow-hidden rounded-t-3xl">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[#FFD700]"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-7 pt-5 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-[#FFD700] text-[11px] font-black tracking-widest uppercase">{current.num} / 03</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-white/35 text-[11px] font-black tracking-widest uppercase">{current.label}</span>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/25 hover:text-white/70 hover:bg-white/8 transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Draggable content area */}
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                className="flex-1 overflow-y-auto cursor-grab active:cursor-grabbing"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={step}
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    className="px-7 pb-6 relative"
                  >
                    {/* Watermark step number */}
                    <div
                      className="absolute right-4 top-0 font-black select-none pointer-events-none"
                      style={{ fontSize: 'clamp(80px, 18vw, 140px)', lineHeight: 1, color: 'rgba(255,215,0,0.04)', letterSpacing: '-0.05em' }}
                      aria-hidden="true"
                    >
                      {current.num}
                    </div>

                    {/* Headline */}
                    <div className="relative mb-5">
                      {current.headline.map((line, i) => (
                        <motion.div
                          key={`${step}-line-${i}`}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.06 + i * 0.08, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                          className="font-black uppercase leading-[1.0] tracking-tighter"
                          style={{ fontSize: 'clamp(28px, 6vw, 48px)' }}
                        >
                          {line}
                        </motion.div>
                      ))}
                    </div>

                    {/* Body */}
                    <motion.p
                      key={`${step}-body`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.22, duration: 0.28 }}
                      className="text-white/50 text-sm leading-relaxed mb-6 max-w-lg"
                    >
                      {current.body}
                    </motion.p>

                    {/* Idea cards — selectable */}
                    <div className="grid grid-cols-2 gap-2.5 mb-6">
                      {current.cards.map((card, i) => {
                        const key = `${step}-${i}`
                        const isSelected = selected.has(key)
                        return (
                          <motion.button
                            key={key}
                            initial={{ opacity: 0, y: 14, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.28 + i * 0.06, duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                            onClick={() => toggleCard(key)}
                            className="relative text-left rounded-2xl p-4 transition-all duration-200 group"
                            style={{
                              background: isSelected ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${isSelected ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.08)'}`,
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {/* Checkmark */}
                            <AnimatePresence>
                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.5 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                                  style={{ background: '#FFD700' }}
                                >
                                  <Check size={11} strokeWidth={3} className="text-black" />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="text-xl mb-2.5 leading-none">{card.emoji}</div>
                            <p
                              className="text-xs leading-snug font-semibold transition-colors"
                              style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)' }}
                            >
                              {card.text}
                            </p>
                          </motion.button>
                        )
                      })}
                    </div>

                    {/* Pro tip */}
                    <motion.div
                      key={`${step}-tip`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.52, duration: 0.26 }}
                      className="rounded-2xl px-4 py-3.5 flex items-start gap-3"
                      style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.1)' }}
                    >
                      <span className="text-base shrink-0 mt-0.5">💡</span>
                      <div>
                        <span className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest mr-2">Pro Tip</span>
                        <span className="text-white/45 text-xs leading-relaxed">{current.tip}</span>
                      </div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Footer nav */}
              <div className="flex items-center justify-between px-7 pt-3 pb-6 border-t border-white/5 shrink-0">
                <motion.button
                  onClick={prev}
                  className="flex items-center gap-1.5 text-white/30 text-xs font-black uppercase tracking-widest hover:text-white/60 transition-colors"
                  animate={{ opacity: step === 0 ? 0 : 1 }}
                  style={{ pointerEvents: step === 0 ? 'none' : 'auto' }}
                >
                  <ArrowLeft size={12} /> Back
                </motion.button>

                {/* Step dots */}
                <div className="flex items-center gap-1.5">
                  {STEPS.map((_, i) => (
                    <motion.div
                      key={i}
                      onClick={() => { setDir(i > step ? 1 : -1); setStep(i) }}
                      className="rounded-full cursor-pointer transition-all duration-300"
                      animate={{
                        width: i === step ? 20 : 6,
                        background: i === step ? '#FFD700' : i < step ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.15)',
                      }}
                      style={{ height: 6 }}
                    />
                  ))}
                </div>

                <motion.button
                  onClick={next}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest bg-[#FFD700] text-black hover:bg-[#ffe033] transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isLast ? 'Apply' : 'Next'} <ArrowRight size={12} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <a href="/" className="flex items-center gap-2.5 group">
          <img src="/logo.webp" alt="GrounduP" className="h-10 opacity-80 group-hover:opacity-100 transition-opacity" />
        </a>
        <a href="/" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors">
          groundupapp.com ↗
        </a>
      </nav>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center px-6 pt-14 pb-20 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FFD700]/20 bg-[#FFD700]/8 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse" />
          <span className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest">Creator Program — Now Open</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.92] mb-6">
          Create Content.<br />
          <span className="text-[#FFD700]">Grow Artists.</span>
        </h1>

        <p className="text-white/50 text-lg font-medium leading-relaxed max-w-xl mx-auto mb-10">
          Partner with GrounduP and get rewarded for bringing independent artists onto the platform that's changing how music careers are built.
        </p>

        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-yellow-300 transition-colors"
        >
          Apply Now <ArrowRight size={14} />
        </button>
      </motion.section>

      {/* What is GrounduP */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-6 py-16 max-w-5xl mx-auto"
      >
        <div className="grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-4">What We Built</p>
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight mb-5">
              The Operating System for Independent Artists
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-4">
              GrounduP is an AI-powered platform that helps indie artists run their careers like a label — release planning, playlist pitching, curator outreach, analytics, and more. All in one place.
            </p>
            <p className="text-white/50 text-base leading-relaxed">
              We're building the tool we wish existed when we were grinding. Artists who use GrounduP get more placements, more streams, and more control over their career — without needing a manager or a label deal.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: '10K+', label: 'Artists on waitlist' },
              { value: '50+', label: 'Features shipped' },
              { value: '3', label: 'Plans — Starter to Label' },
              { value: '∞', label: 'Upside for creators' },
            ].map(s => (
              <div key={s.label} className="bg-white/4 border border-white/8 rounded-2xl p-5 backdrop-blur-sm">
                <div className="text-3xl font-black text-[#FFD700] tracking-tighter mb-1">{s.value}</div>
                <div className="text-white/40 text-xs font-bold uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Content brief */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-6 py-16 max-w-5xl mx-auto"
      >
        <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-4 text-center">What We're Looking For</p>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-center mb-12">Content That Converts</h2>

        <div className="grid sm:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <div key={s.label} className="bg-white/4 border border-white/8 rounded-2xl p-6 hover:border-[#FFD700]/30 transition-colors backdrop-blur-sm">
              <div className="w-10 h-10 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-xl flex items-center justify-center text-[#FFD700] mb-5">
                {[<Smartphone size={22} />, <TrendingUp size={22} />, <Music size={22} />][i]}
              </div>
              <h3 className="font-black text-base uppercase tracking-tight mb-3">{s.label}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-[#FFD700]/6 border border-[#FFD700]/15 rounded-2xl p-6 backdrop-blur-sm">
          <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-2">Your CTA</p>
          <p className="text-white/70 text-sm leading-relaxed">
            Every piece of content should drive viewers to <strong className="text-white">groundupapp.com</strong> or the iOS app. Use your unique ref link so every sign-up is tracked back to you.
          </p>
        </div>
      </motion.section>

      {/* Benefits */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-6 py-16 max-w-5xl mx-auto"
      >
        <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-4 text-center">What You Get</p>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-center mb-12">The Deal</h2>

        <div className="grid sm:grid-cols-3 gap-4">
          {BENEFITS.map(b => (
            <div key={b.label} className="flex flex-col items-center text-center bg-white/4 border border-white/8 rounded-2xl p-8 hover:border-[#FFD700]/30 transition-colors backdrop-blur-sm">
              <div className="w-12 h-12 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-2xl flex items-center justify-center text-[#FFD700] mb-5">{b.icon}</div>
              <h3 className="font-black text-sm uppercase tracking-tight mb-2">{b.label}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Application form */}
      <motion.section
        id="apply"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-6 py-20 max-w-xl mx-auto"
      >
        <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-4 text-center">Apply</p>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-center mb-3">Join the Creator Program</h2>
        <p className="text-white/40 text-sm text-center mb-10">We review every application and respond within 48 hours.</p>

        <AnimatePresence mode="wait">
          {refCode ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-20 h-20 bg-[#FFD700]/15 border border-[#FFD700]/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={36} className="text-[#FFD700]" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-3">Application Received!</h3>
              <p className="text-white/40 text-sm mb-8">We'll review your application and reach out within 48 hours. Here's your referral code for when you're approved:</p>
              <div className="bg-white/4 border border-[#FFD700]/30 rounded-2xl p-6 mb-6 backdrop-blur-sm">
                <div className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-2">Your Ref Code</div>
                <div className="font-mono text-white text-2xl font-black tracking-wider">{refCode}</div>
              </div>
              <p className="text-white/30 text-xs">Screenshot this — you'll need it when approved to activate your creator link.</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Full Name *</label>
                <input type="text" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Your name" required
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm font-medium placeholder-white/20 focus:outline-none focus:border-[#FFD700]/40 transition-colors" />
              </div>
              <div>
                <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Email *</label>
                <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="your@email.com" required
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm font-medium placeholder-white/20 focus:outline-none focus:border-[#FFD700]/40 transition-colors" />
              </div>
              <div>
                <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Primary Platform *</label>
                <select value={form.platform} onChange={e => setField('platform', e.target.value)} required
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm font-medium focus:outline-none focus:border-[#FFD700]/40 transition-colors">
                  <option value="" disabled className="bg-black">Select platform…</option>
                  {PLATFORMS.map(p => <option key={p} value={p} className="bg-black">{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Follower Count</label>
                <select value={form.followers} onChange={e => setField('followers', e.target.value)}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm font-medium focus:outline-none focus:border-[#FFD700]/40 transition-colors">
                  <option value="" className="bg-black">Select range…</option>
                  {FOLLOWER_RANGES.map(r => <option key={r} value={r} className="bg-black">{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Social Handle</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-bold">@</span>
                  <input type="text" value={form.handle} onChange={e => setField('handle', e.target.value)} placeholder="yourhandle"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 text-white text-sm font-medium placeholder-white/20 focus:outline-none focus:border-[#FFD700]/40 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">
                  Why do you want to partner? <span className="normal-case text-white/20">(optional)</span>
                </label>
                <textarea value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="Tell us about your audience and why you're a good fit…" rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium placeholder-white/20 focus:outline-none focus:border-[#FFD700]/40 transition-colors resize-none" />
              </div>
              {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</motion.p>}
              <button type="submit" disabled={submitting}
                className="w-full py-4 bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-yellow-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <>Submit Application <ArrowRight size={14} /></>}
              </button>
              <p className="text-white/20 text-xs text-center pt-2">By applying you agree to create authentic content about GrounduP and comply with platform guidelines.</p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/6 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/logo.webp" alt="GrounduP" className="h-7 opacity-40" />
        </div>
        <p className="text-white/20 text-xs font-medium">
          © {new Date().getFullYear()} GrounduP ·{' '}
          <a href="/privacy" className="hover:text-white/40 transition-colors">Privacy Policy</a>
        </p>
      </footer>
    </div>
  )
}
