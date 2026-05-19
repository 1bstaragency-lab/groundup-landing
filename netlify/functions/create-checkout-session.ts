/**
 * Stripe Checkout Session
 *
 * Creates a Stripe Checkout URL for the user to subscribe to Pro or Growth.
 * On success Stripe redirects to returnUrl; on cancel back to cancelUrl.
 * The webhook handler (stripe-webhook.ts) upgrades plan_tier when the session
 * completes.
 *
 * POST body: { userId: string, tier: 'pro' | 'growth', returnUrl?: string, cancelUrl?: string }
 *
 * Required Netlify env vars:
 *   STRIPE_SECRET_KEY
 *   STRIPE_PRICE_PRO     — recurring Price ID for the $29/mo Pro plan
 *   STRIPE_PRICE_GROWTH  — recurring Price ID for the $55/mo Growth plan
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import type { Handler } from '@netlify/functions'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const STRIPE_KEY    = process.env.STRIPE_SECRET_KEY     ?? ''
const PRICE_PRO     = process.env.STRIPE_PRICE_PRO       ?? ''
const PRICE_GROWTH  = process.env.STRIPE_PRICE_GROWTH    ?? ''
const SUPABASE_URL  = process.env.VITE_SUPABASE_URL      ?? ''
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  let body: { userId?: string; tier?: 'pro' | 'growth'; returnUrl?: string; cancelUrl?: string }
  try { body = JSON.parse(event.body ?? '{}') }
  catch { return { statusCode: 400, headers: CORS, body: 'Invalid JSON' } }

  const { userId, tier, returnUrl, cancelUrl } = body
  if (!userId || (tier !== 'pro' && tier !== 'growth')) {
    return { statusCode: 400, headers: CORS, body: 'userId + tier (pro|growth) required' }
  }

  const priceId = tier === 'pro' ? PRICE_PRO : PRICE_GROWTH

  if (!STRIPE_KEY || !priceId) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        error: 'not_configured',
        message: `Stripe is not configured for ${tier} yet — STRIPE_SECRET_KEY / STRIPE_PRICE_${tier.toUpperCase()} missing.`,
      }),
    }
  }

  try {
    const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2025-04-30.basil' })

    // Look up user email + any existing stripe_customer_id
    let customer: string | undefined
    let userEmail: string | undefined
    if (SUPABASE_URL && SUPABASE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
      const { data: prefs } = await supabase
        .from('artist_preferences')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .maybeSingle()
      customer = prefs?.stripe_customer_id ?? undefined

      const { data: authUser } = await supabase.auth.admin.getUserById(userId)
      userEmail = authUser?.user?.email ?? undefined
    }

    const session = await stripe.checkout.sessions.create({
      mode:                 'subscription',
      payment_method_types: ['card'],
      line_items:           [{ price: priceId, quantity: 1 }],
      success_url:          returnUrl ?? 'https://groundupapp.com/dashboard/home?welcome=1',
      cancel_url:           cancelUrl ?? 'https://groundupapp.com/dashboard/profile',
      client_reference_id:  userId,
      customer,
      customer_email:       customer ? undefined : userEmail,
      subscription_data: {
        trial_period_days: tier === 'pro' ? 7 : undefined,
        metadata:          { supabase_user_id: userId, tier },
      },
      metadata:             { supabase_user_id: userId, tier },
      allow_promotion_codes: true,
    })

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, url: session.url }),
    }
  } catch (err) {
    console.error('[create-checkout-session] Stripe error:', err)
    return {
      statusCode: 502,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: String(err) }),
    }
  }
}
