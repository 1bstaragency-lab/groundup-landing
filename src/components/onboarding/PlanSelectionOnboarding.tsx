"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Sparkles, Loader2, Star, Zap, Building2 } from "lucide-react"
import type { PlanTier } from "../../types/auth.types"
import { LiquidButton } from "../ui/liquid-glass-button"

interface PlanOption {
  tier:       PlanTier | 'plant'
  name:       string
  price:      string
  period:     string
  trialBadge?:string
  icon:       React.ReactNode
  accent:     string
  highlight?: boolean
  features:   string[]
  cta:        string
}

const PLANS: PlanOption[] = [
  {
    tier:    'free',
    name:    'Starter',
    price:   '$0',
    period:  'forever',
    icon:    <Sparkles size={18} />,
    accent:  '#9ca3af',
    features: [
      'Full Artist OS dashboard',
      '1 active release',
      'uP AI (5 messages/day)',
      'Community access',
    ],
    cta: 'Continue free',
  },
  {
    tier:       'pro',
    name:       'Pro',
    price:      '$29',
    period:     '/ month',
    trialBadge: '7-day free trial',
    icon:       <Star size={18} />,
    accent:     '#FFD700',
    highlight:  true,
    features: [
      'Unlimited releases',
      'uP AI — 100 msgs/day + iMessage',
      'Real-time streaming analytics',
      'Priority AI processing',
      'Playlist pitch submissions',
    ],
    cta: 'Start 7-day free trial',
  },
  {
    tier:    'growth',
    name:    'Growth',
    price:   '$55',
    period:  '/ month',
    icon:    <Zap size={18} />,
    accent:  '#9ca3af',
    features: [
      'Everything in Pro',
      'uP AI — 500 msgs/day',
      'Team collaboration (3 seats)',
      'Influencer network access',
      'Priority support',
    ],
    cta: 'Get Growth',
  },
  {
    tier:    'plant',
    name:    'Plant',
    price:   'Custom',
    period:  'pricing',
    icon:    <Building2 size={18} />,
    accent:  '#9ca3af',
    features: [
      'Everything in Growth',
      'Unlimited team seats',
      'Multi-artist management',
      'Dedicated account manager',
      'White-label options',
    ],
    cta: 'Talk to Us',
  },
]

interface Props {
  userId:      string
  artistName?: string
  onComplete:  (tier: PlanTier) => Promise<void> | void
}

export function PlanSelectionOnboarding({ userId, artistName, onComplete }: Props) {
  const [selected, setSelected] = useState<PlanOption['tier']>('pro')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleContinue() {
    setError(null)

    // Free → just complete onboarding
    if (selected === 'free') {
      setLoading(true)
      await onComplete('free')
      setLoading(false)
      return
    }

    // Plant → external sales contact
    if (selected === 'plant') {
      window.location.href = 'mailto:hello@groundupapp.com?subject=Plant tier inquiry'
      return
    }

    // Pro / Growth → Stripe Checkout
    setLoading(true)
    try {
      const res = await fetch('/.netlify/functions/create-checkout-session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tier:      selected,
          returnUrl: `${window.location.origin}/dashboard/home?welcome=1`,
          cancelUrl: window.location.href,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (data.ok && data.url) {
        // Save current onboarding intent and bounce to Stripe
        await onComplete(selected as PlanTier)
        window.location.href = data.url
        return
      }

      // Stripe not configured yet — fall back to completing as free with a note
      setError(
        data.error === 'not_configured'
          ? "Checkout isn't set up yet — we'll start you on Starter and you can upgrade anytime from your dashboard."
          : data.message ?? 'Could not start checkout.'
      )
      // Auto-complete as free after a short pause so user isn't stuck
      setTimeout(async () => {
        await onComplete('free')
      }, 2200)
    } catch {
      setError('Network error — completing your account on the Starter plan.')
      setTimeout(async () => { await onComplete('free') }, 2200)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl"
    >
      {/* Header */}
      <div className="text-center mb-10 px-4">
        <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.35em] mb-3">
          Final Step{artistName ? ` · ${artistName}` : ''}
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase leading-none mb-3">
          Choose your plan
        </h2>
        <p className="text-white/40 text-sm font-medium max-w-md mx-auto">
          Try Pro free for 7 days. Cancel anytime. No credit card on Starter.
        </p>
      </div>

      {/* Plan cards — 2x2 on mobile, 4-col on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {PLANS.map(p => {
          const isSelected = selected === p.tier
          return (
            <button
              key={p.tier}
              onClick={() => setSelected(p.tier)}
              className={`relative text-left p-5 rounded-2xl border transition-all flex flex-col ${
                isSelected
                  ? 'border-[#FFD700]/40 bg-[#FFD700]/[0.06] shadow-[0_0_24px_rgba(255,215,0,0.15)]'
                  : p.highlight
                    ? 'border-[#FFD700]/20 bg-zinc-950/80 hover:border-[#FFD700]/35'
                    : 'border-white/8 bg-zinc-950/60 hover:border-white/15'
              }`}
            >
              {/* Most Popular */}
              {p.highlight && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#FFD700] text-black text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Icon + name */}
              <div className="flex items-center gap-2 mb-3 mt-1">
                <div
                  className="h-7 w-7 rounded-lg border flex items-center justify-center"
                  style={{ borderColor: `${p.accent}30`, background: `${p.accent}15`, color: p.accent }}
                >
                  {p.icon}
                </div>
                <p className="text-white font-black text-sm tracking-tight">{p.name}</p>
                {isSelected && (
                  <div className="ml-auto w-4 h-4 rounded-full bg-[#FFD700] flex items-center justify-center">
                    <Check size={9} strokeWidth={3} className="text-black" />
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-black text-white tracking-tight">{p.price}</span>
                <span className="text-white/30 text-[11px] font-bold">{p.period}</span>
              </div>
              {p.trialBadge && (
                <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest mb-3">✦ {p.trialBadge}</p>
              )}
              {!p.trialBadge && <div className="mb-3" />}

              {/* Features */}
              <ul className="space-y-1.5 mb-2 flex-1">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/60 text-[11px] leading-snug">
                    <Check size={10} strokeWidth={3} className="text-[#FFD700]/70 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>

      {/* Error / status banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 rounded-2xl bg-[#FFD700]/8 border border-[#FFD700]/25 mb-4"
        >
          <p className="text-[#FFD700] text-xs font-medium leading-relaxed">{error}</p>
        </motion.div>
      )}

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <LiquidButton onClick={handleContinue} disabled={loading} className="w-full sm:w-auto sm:min-w-[280px] justify-center">
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Setting up…</span>
          ) : (
            PLANS.find(p => p.tier === selected)?.cta ?? 'Continue'
          )}
        </LiquidButton>
        <button
          onClick={() => setSelected('free')}
          className="text-white/30 hover:text-white/70 text-[10px] font-black uppercase tracking-widest transition-colors"
        >
          Skip for now — start free
        </button>
      </div>
    </motion.div>
  )
}
