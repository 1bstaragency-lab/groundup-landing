/**
 * usePaywallTracking — auto-log a page_view on mount for any offer/paywall
 * variant, return a trackCta() function for the primary CTA click.
 *
 * Usage:
 *   const { trackCta } = usePaywallTracking('free')
 *   <a onClick={() => trackCta()} href={IMESSAGE_LINK}>Claim 30 Days Free</a>
 *
 * Captures session_id (sticky per-tab in sessionStorage), referrer,
 * UTM params, and current path. Writes to paywall_events via Supabase.
 *
 * Fire-and-forget — never blocks the UI on a logging failure.
 */
import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const SESSION_KEY = 'gup_paywall_session'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id = (crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`)
      sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return ''
  }
}

function getUtmParams(): { source: string | null; medium: string | null; campaign: string | null } {
  if (typeof window === 'undefined') return { source: null, medium: null, campaign: null }
  const p = new URLSearchParams(window.location.search)
  return {
    source:   p.get('utm_source')   ?? null,
    medium:   p.get('utm_medium')   ?? null,
    campaign: p.get('utm_campaign') ?? null,
  }
}

async function logEvent(opts: {
  variantSlug: string
  eventType:   'page_view' | 'cta_click' | 'converted'
  metadata?:   Record<string, unknown>
}) {
  if (typeof window === 'undefined') return
  const utm = getUtmParams()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('paywall_events').insert({
      user_id:       user?.id ?? null,
      session_id:    getSessionId(),
      variant_slug:  opts.variantSlug,
      event_type:    opts.eventType,
      page_path:     window.location.pathname,
      referrer:      document.referrer || null,
      utm_source:    utm.source,
      utm_medium:    utm.medium,
      utm_campaign:  utm.campaign,
      metadata:      opts.metadata ?? null,
    })
  } catch (err) {
    // Never block on tracking
    if (typeof console !== 'undefined') {
      console.warn('[paywall-tracking] log error:', err)
    }
  }
}

export interface PaywallTracker {
  trackCta:        (metadata?: Record<string, unknown>) => void
  trackConverted:  (metadata?: Record<string, unknown>) => void
}

export function usePaywallTracking(variantSlug: string): PaywallTracker {
  // Fire page_view once on mount per variant
  useEffect(() => {
    if (!variantSlug) return
    logEvent({ variantSlug, eventType: 'page_view' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantSlug])

  return {
    trackCta:       (metadata) => { void logEvent({ variantSlug, eventType: 'cta_click',  metadata }) },
    trackConverted: (metadata) => { void logEvent({ variantSlug, eventType: 'converted',  metadata }) },
  }
}
