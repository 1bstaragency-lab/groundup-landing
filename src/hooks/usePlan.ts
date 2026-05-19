import { useAuth } from './useAuth'
import type { PlanTier } from '../types/auth.types'

// Ordering of tiers — higher index = higher tier
const TIER_ORDER: PlanTier[] = ['free', 'pro', 'growth']

const PLAN_LABELS: Record<PlanTier, string> = {
  free:   'Starter',
  pro:    'Pro',
  growth: 'Growth',
}

const PLAN_PRICES: Record<PlanTier, string> = {
  free:   '$0',
  pro:    '$29/mo',
  growth: '$55/mo',
}

// Hard limits per plan — keep in sync with marketing pages
export const PLAN_LIMITS = {
  free:   { releases: 1,  teamSeats: 1, imessageDailyMax: 5,   influencerNetwork: false, prioritySupport: false },
  pro:    { releases: -1, teamSeats: 1, imessageDailyMax: 100, influencerNetwork: false, prioritySupport: false },
  growth: { releases: -1, teamSeats: 3, imessageDailyMax: 500, influencerNetwork: true,  prioritySupport: true  },
} as const satisfies Record<PlanTier, Record<string, number | boolean>>

export interface PlanInfo {
  tier:        PlanTier
  label:       string
  priceLabel:  string
  loading:     boolean
  limits:      typeof PLAN_LIMITS[PlanTier]
  /** True if current tier is at or above the required tier */
  isAtLeast:   (required: PlanTier) => boolean
  /** True if a numeric usage (e.g. release count) is within the plan limit. -1 = unlimited. */
  hasCapacity: (used: number, limitKey: 'releases' | 'teamSeats') => boolean
}

export function usePlan(): PlanInfo {
  const { profile, loading } = useAuth()
  const tier: PlanTier = profile?.plan_tier ?? 'free'
  const limits = PLAN_LIMITS[tier]

  return {
    tier,
    label:      PLAN_LABELS[tier],
    priceLabel: PLAN_PRICES[tier],
    loading,
    limits,
    isAtLeast: (required) =>
      TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(required),
    hasCapacity: (used, key) => {
      const cap = limits[key] as number
      return cap === -1 || used < cap
    },
  }
}
