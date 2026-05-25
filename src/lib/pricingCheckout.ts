/**
 * Shared "Start checkout from pricing card" flow.
 *
 * Used by the public landing page, the standalone /pricing page, and (later)
 * any other CTA that needs to drop a user into Stripe Checkout for a plan.
 *
 * Handles the three flows in one place:
 *   1. Plant tier → mailto (sales contact)
 *   2. Pro / Growth + signed in     → POST /create-checkout-session, redirect
 *   3. Pro / Growth + not signed in → stash intent in localStorage,
 *                                      send to /signup. After signup the user
 *                                      lands on /dashboard/home which checks
 *                                      the intent and finishes the checkout.
 */
import type { NavigateFunction } from 'react-router-dom'

export type PlanIntent = 'pro' | 'growth'

const INTENT_KEY = 'gup_intent_plan'

export function savePlanIntent(tier: PlanIntent) {
  try { localStorage.setItem(INTENT_KEY, tier) } catch { /* noop */ }
}

export function readPlanIntent(): PlanIntent | null {
  try {
    const v = localStorage.getItem(INTENT_KEY)
    return v === 'pro' || v === 'growth' ? v : null
  } catch { return null }
}

export function clearPlanIntent() {
  try { localStorage.removeItem(INTENT_KEY) } catch { /* noop */ }
}

/** Map UI plan names to Stripe price tiers. */
function planToTier(planName: string): PlanIntent | 'plant' | null {
  const n = planName.toLowerCase()
  if (n === 'pro')    return 'pro'
  if (n === 'growth') return 'growth'
  if (n === 'plant')  return 'plant'
  return null
}

/**
 * Open Stripe Checkout for the given tier as the given user.
 * Returns true if redirect was initiated, false otherwise.
 */
export async function openCheckout(userId: string, tier: PlanIntent): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch('/.netlify/functions/create-checkout-session', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        tier,
        returnUrl: `${window.location.origin}/dashboard/home?upgraded=1`,
        cancelUrl: window.location.href,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (data.ok && data.url) {
      window.location.href = data.url
      return { ok: true }
    }
    return {
      ok: false,
      message: data.error === 'not_configured'
        ? "Checkout isn't connected yet — Stripe keys still need to be added on the server."
        : data.message ?? 'Could not start checkout. Try again in a moment.',
    }
  } catch {
    return { ok: false, message: 'Network error — try again.' }
  }
}

/**
 * Single entry-point used by the pricing card click handler.
 * Pass the plan name from PricingPage's onSelect, the current user's id
 * (or null), and a navigate function.
 */
export async function handlePricingClick(opts: {
  planName: string
  userId:   string | null
  navigate: NavigateFunction
}): Promise<{ message?: string } | void> {
  const { planName, userId, navigate } = opts
  const tier = planToTier(planName)
  if (!tier) return

  if (tier === 'plant') {
    window.location.href = 'mailto:hello@groundupapp.com?subject=GrounduP Plant tier inquiry'
    return
  }

  // Not signed in → stash intent and route to login
  // (iMessage onboarding already created their account — they just need to log in)
  if (!userId) {
    savePlanIntent(tier)
    navigate(`/login?plan=${tier}`)
    return
  }

  // Signed in → checkout immediately
  const result = await openCheckout(userId, tier)
  if (!result.ok) return { message: result.message }
}
