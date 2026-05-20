"use client"

import { useState } from "react"
import { Lock, Sparkles, ArrowUpRight, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { usePlan } from "../../hooks/usePlan"
import { useAuth } from "../../hooks/useAuth"
import type { PlanTier } from "../../types/auth.types"

interface PlanGateProps {
  required:    PlanTier
  feature?:    string
  /** Render mode: 'block' replaces the gated content with an upgrade card; 'overlay' blurs behind it; 'silent' returns null. */
  mode?:       'block' | 'overlay' | 'silent'
  children:    React.ReactNode
  onUpgrade?:  () => void
}

const TIER_NAME: Record<PlanTier, string> = {
  free:   'Starter',
  pro:    'Pro',
  growth: 'Growth',
}

export function PlanGate({
  required,
  feature = 'this feature',
  mode = 'block',
  children,
  onUpgrade,
}: PlanGateProps) {
  const plan = usePlan()
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [err, setErr]   = useState<string | null>(null)

  async function handleUpgradeClick() {
    if (onUpgrade) { onUpgrade(); return }

    // If not authenticated, bounce to the public pricing page
    if (!user) {
      window.location.assign('/pricing')
      return
    }

    // Authenticated → kick off Stripe Checkout directly. Growth = growth tier;
    // anything else routes to Pro (we don't sell Starter, Plant is sales).
    const tier = required === 'growth' ? 'growth' : 'pro'
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch('/.netlify/functions/create-checkout-session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:    user.id,
          tier,
          returnUrl: window.location.href + '?upgraded=1',
          cancelUrl: window.location.href,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (data.ok && data.url) {
        window.location.href = data.url
        return
      }
      setErr(
        data.error === 'not_configured'
          ? "Checkout isn't connected yet — Stripe keys still need to be added on the server."
          : data.message ?? 'Could not start checkout. Try again in a moment.'
      )
    } catch {
      setErr('Network error — try again.')
    } finally {
      setBusy(false)
    }
  }

  if (plan.loading || plan.isAtLeast(required)) {
    return <>{children}</>
  }

  if (mode === 'silent') return null

  const upgradeCard = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative w-full rounded-2xl border border-[#FFD700]/20 bg-gradient-to-br from-[#FFD700]/8 via-zinc-950 to-zinc-950 p-6 sm:p-8 overflow-hidden"
    >
      {/* glow accent */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#FFD700]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#FFD700]/15 border border-[#FFD700]/25 flex items-center justify-center">
            <Lock size={13} className="text-[#FFD700]" />
          </div>
          <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em]">
            {TIER_NAME[required]} Required
          </p>
        </div>

        <h4 className="text-white font-black text-lg sm:text-xl tracking-tighter mb-2">
          Unlock {feature}
        </h4>
        <p className="text-white/40 text-sm font-medium mb-5 max-w-md">
          You're on the <span className="text-white/70 font-bold">{TIER_NAME[plan.tier]}</span> plan.
          Upgrade to <span className="text-[#FFD700] font-bold">{TIER_NAME[required]}</span> to unlock {feature}.
        </p>

        <button
          onClick={handleUpgradeClick}
          disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-[0_0_24px_rgba(255,215,0,0.25)] disabled:opacity-60 disabled:hover:scale-100"
        >
          {busy
            ? <><Loader2 size={12} className="animate-spin" /> Opening checkout…</>
            : <><Sparkles size={12} /> Upgrade to {TIER_NAME[required]} <ArrowUpRight size={13} /></>}
        </button>

        {err && (
          <p className="mt-3 text-[10px] font-medium text-[#FFD700]/70 max-w-md">{err}</p>
        )}
      </div>
    </motion.div>
  )

  if (mode === 'overlay') {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none blur-[2px] opacity-40">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {upgradeCard}
        </div>
      </div>
    )
  }

  return upgradeCard
}

/** Inline pill showing the user's current tier — e.g. for the dashboard header */
export function PlanBadge({ onClick }: { onClick?: () => void }) {
  const plan = usePlan()
  const color =
    plan.tier === 'growth' ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
  : plan.tier === 'pro'    ? 'bg-[#FFD700]/15 border-[#FFD700]/30 text-[#FFD700]'
  :                          'bg-white/5 border-white/10 text-white/40'

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all hover:scale-[1.05] ${color}`}
    >
      <Sparkles size={9} />
      {TIER_NAME[plan.tier]}
    </button>
  )
}
