"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Sparkles, Loader2, Star, Lock, ChevronDown, Zap, Building2 } from "lucide-react"
import type { PlanTier } from "../../types/auth.types"
import { LiquidButton } from "../ui/liquid-glass-button"

interface Props {
  userId:      string
  artistName?: string
  onComplete:  (tier: PlanTier) => Promise<void> | void
}

const PRO_PERKS = [
  'Unlimited releases & rollouts',
  'uP AI — 100 msgs/day in-app + iMessage',
  'Real-time streaming analytics',
  'Priority AI processing',
  'Playlist pitch submissions',
  'Full creative credits & content tools',
]

const FREE_LIMITS = [
  { ok: true,  text: 'Full dashboard access (read-only insights)' },
  { ok: false, text: '1 release max — no rollouts beyond that' },
  { ok: false, text: '5 uP AI messages per day · no iMessage' },
  { ok: false, text: 'No creative credits or content tools' },
  { ok: false, text: 'No streaming analytics / pitch submissions' },
]

interface OtherPlan {
  tier:     'growth' | 'plant'
  name:     string
  price:    string
  period:   string
  icon:     React.ReactNode
  features: string[]
  cta:      string
}

const OTHER_PLANS: OtherPlan[] = [
  {
    tier:    'growth',
    name:    'Growth',
    price:   '$55',
    period:  '/ month',
    icon:    <Zap size={14} />,
    features: ['Everything in Pro', 'uP AI — 500 msgs/day', 'Team collab (3 seats)', 'Influencer network'],
    cta:     'Choose Growth',
  },
  {
    tier:    'plant',
    name:    'Plant',
    price:   'Custom',
    period:  'pricing',
    icon:    <Building2 size={14} />,
    features: ['Everything in Growth', 'Unlimited team seats', 'Multi-artist roster', 'Dedicated manager'],
    cta:     'Talk to sales',
  },
]

type Choice = 'trial' | 'free' | 'growth' | 'plant'

export function PlanSelectionOnboarding({ userId, artistName, onComplete }: Props) {
  const [choice, setChoice]     = useState<Choice>('trial')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [showOther, setShowOther] = useState(false)

  async function startCheckout(tier: 'pro' | 'growth') {
    try {
      const res = await fetch('/.netlify/functions/create-checkout-session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tier,
          returnUrl: `${window.location.origin}/dashboard/home?welcome=1`,
          cancelUrl: window.location.href,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (data.ok && data.url) {
        await onComplete(tier as PlanTier)
        window.location.href = data.url
        return true
      }

      setError(
        data.error === 'not_configured'
          ? "Checkout isn't fully set up yet — starting you on Starter. You can upgrade anytime from your dashboard."
          : data.message ?? 'Could not start checkout. Putting you on Starter for now.'
      )
      setTimeout(async () => { await onComplete('free') }, 2400)
      return false
    } catch {
      setError('Network error — completing your account on Starter.')
      setTimeout(async () => { await onComplete('free') }, 2400)
      return false
    }
  }

  async function handleContinue() {
    setError(null)

    if (choice === 'free') {
      setLoading(true)
      await onComplete('free')
      setLoading(false)
      return
    }

    if (choice === 'plant') {
      window.location.href = 'mailto:hello@groundupapp.com?subject=Plant tier inquiry'
      return
    }

    // trial (pro) or growth
    setLoading(true)
    await startCheckout(choice === 'trial' ? 'pro' : 'growth')
    setLoading(false)
  }

  const ctaLabel =
    choice === 'trial'  ? 'Start 7-Day Free Trial' :
    choice === 'free'   ? 'Continue with Starter' :
    choice === 'growth' ? 'Get Growth' :
                          'Talk to Sales'

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-3xl"
    >
      {/* Header */}
      <div className="text-center mb-8 px-4">
        <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.35em] mb-3">
          Final Step{artistName ? ` · ${artistName}` : ''}
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase leading-none mb-3">
          How do you want to start?
        </h2>
        <p className="text-white/40 text-sm font-medium max-w-md mx-auto">
          Try Pro free for 7 days — no charge until your trial ends. Cancel anytime.
        </p>
      </div>

      {/* Two main choices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {/* PRO TRIAL — hero */}
        <button
          onClick={() => setChoice('trial')}
          className={`relative text-left p-6 rounded-3xl border-2 transition-all flex flex-col overflow-hidden ${
            choice === 'trial'
              ? 'border-[#FFD700]/60 bg-gradient-to-br from-[#FFD700]/[0.10] via-zinc-950 to-zinc-950 shadow-[0_0_40px_rgba(255,215,0,0.18)]'
              : 'border-[#FFD700]/15 bg-zinc-950/80 hover:border-[#FFD700]/35'
          }`}
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#FFD700]/15 blur-3xl pointer-events-none" />

          <div className="absolute top-3 right-3">
            <span className="bg-[#FFD700] text-black text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              Recommended
            </span>
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-9 w-9 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                <Star size={16} />
              </div>
              <div>
                <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest leading-none">7-Day Free Trial</p>
                <p className="text-white font-black text-xl tracking-tight">Pro</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-white/60 text-sm font-bold line-through">$29/mo</span>
              <span className="text-[#FFD700] font-black text-sm ml-2">Free for 7 days</span>
            </div>
            <p className="text-white/40 text-[10px] font-medium mb-4">
              Then $29/mo. Cancel anytime in the trial — no charge.
            </p>

            <ul className="space-y-2 mb-4 flex-1">
              {PRO_PERKS.map((perk, i) => (
                <li key={i} className="flex items-start gap-2 text-white/80 text-[12px] leading-snug">
                  <Check size={11} strokeWidth={3} className="text-[#FFD700] mt-0.5 shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>

            <div className={`flex items-center justify-center gap-2 h-9 rounded-xl border transition-all ${
              choice === 'trial'
                ? 'bg-[#FFD700] border-[#FFD700] text-black'
                : 'bg-transparent border-[#FFD700]/30 text-[#FFD700]'
            }`}>
              {choice === 'trial' && <Check size={11} strokeWidth={3} />}
              <span className="text-[10px] font-black uppercase tracking-widest">
                {choice === 'trial' ? 'Selected' : 'Pick this'}
              </span>
            </div>
          </div>
        </button>

        {/* FREE / STARTER — explicit limits */}
        <button
          onClick={() => setChoice('free')}
          className={`relative text-left p-6 rounded-3xl border-2 transition-all flex flex-col ${
            choice === 'free'
              ? 'border-white/30 bg-zinc-950/90'
              : 'border-white/8 bg-zinc-950/60 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
              <Lock size={16} />
            </div>
            <div>
              <p className="text-white/30 text-[9px] font-black uppercase tracking-widest leading-none">Limited Access</p>
              <p className="text-white/80 font-black text-xl tracking-tight">Starter</p>
            </div>
          </div>

          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-white font-black text-3xl tracking-tight">$0</span>
            <span className="text-white/30 text-xs font-bold">forever</span>
          </div>
          <p className="text-white/40 text-[10px] font-medium mb-4">
            Basic access. No payment required, ever.
          </p>

          <ul className="space-y-2 mb-4 flex-1">
            {FREE_LIMITS.map((item, i) => (
              <li key={i} className={`flex items-start gap-2 text-[12px] leading-snug ${item.ok ? 'text-white/60' : 'text-white/35'}`}>
                {item.ok
                  ? <Check size={11} strokeWidth={3} className="text-white/40 mt-0.5 shrink-0" />
                  : <X     size={11} strokeWidth={3} className="text-red-400/60 mt-0.5 shrink-0" />}
                {item.text}
              </li>
            ))}
          </ul>

          <div className={`flex items-center justify-center gap-2 h-9 rounded-xl border transition-all ${
            choice === 'free'
              ? 'bg-white/10 border-white/30 text-white'
              : 'bg-transparent border-white/15 text-white/40'
          }`}>
            {choice === 'free' && <Check size={11} strokeWidth={3} />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {choice === 'free' ? 'Selected' : 'No thanks — start basic'}
            </span>
          </div>
        </button>
      </div>

      {/* See other plans collapsible */}
      <div className="mb-6">
        <button
          onClick={() => setShowOther(v => !v)}
          className="flex items-center justify-center gap-2 w-full text-white/30 hover:text-white/60 text-[10px] font-black uppercase tracking-widest py-2 transition-colors"
        >
          <Sparkles size={10} />
          Need more power? See Growth & Plant
          <ChevronDown size={12} className={`transition-transform ${showOther ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showOther && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {OTHER_PLANS.map(p => (
                  <button
                    key={p.tier}
                    onClick={() => setChoice(p.tier)}
                    className={`text-left p-4 rounded-2xl border transition-all flex flex-col ${
                      choice === p.tier
                        ? 'border-white/30 bg-zinc-900/80'
                        : 'border-white/8 bg-zinc-950/40 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
                        {p.icon}
                      </div>
                      <div>
                        <p className="text-white font-black text-sm tracking-tight leading-none">{p.name}</p>
                        <p className="text-white/30 text-[10px] font-bold mt-0.5">{p.price} <span className="text-white/20">{p.period}</span></p>
                      </div>
                      {choice === p.tier && (
                        <div className="ml-auto w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                          <Check size={9} strokeWidth={3} className="text-white" />
                        </div>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-white/50 text-[11px]">
                          <Check size={9} strokeWidth={3} className="text-white/30 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3 rounded-2xl bg-[#FFD700]/8 border border-[#FFD700]/25 mb-4"
          >
            <p className="text-[#FFD700] text-xs font-medium leading-relaxed">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary CTA */}
      <div className="flex flex-col items-center gap-2">
        <LiquidButton onClick={handleContinue} disabled={loading} className="w-full sm:w-auto sm:min-w-[320px] justify-center">
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Setting up…</span>
          ) : (
            ctaLabel
          )}
        </LiquidButton>
        <p className="text-white/20 text-[10px] font-medium">
          {choice === 'trial' ? 'No credit card needed during trial' : choice === 'free' ? 'You can upgrade anytime from your dashboard' : ''}
        </p>
      </div>
    </motion.div>
  )
}
