/**
 * Stripe Customer Portal Session
 *
 * Creates a portal session URL for a logged-in user to manage their
 * subscription (update payment method, view invoices, cancel, etc).
 *
 * POST body: { userId: string, returnUrl?: string }
 *
 * Required Netlify env vars:
 *   STRIPE_SECRET_KEY
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import type { Handler } from '@netlify/functions'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const STRIPE_KEY    = process.env.STRIPE_SECRET_KEY ?? ''
const SUPABASE_URL  = process.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  if (!STRIPE_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'not_configured', message: 'Stripe is not configured on the server yet.' }),
    }
  }

  let body: { userId?: string; returnUrl?: string }
  try { body = JSON.parse(event.body ?? '{}') }
  catch { return { statusCode: 400, headers: CORS, body: 'Invalid JSON' } }

  const { userId, returnUrl } = body
  if (!userId) {
    return { statusCode: 400, headers: CORS, body: 'userId required' }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Look up Stripe customer ID for this user
  const { data: prefs } = await supabase
    .from('artist_preferences')
    .select('stripe_customer_id, plan_tier')
    .eq('user_id', userId)
    .maybeSingle()

  if (!prefs?.stripe_customer_id) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        error: 'no_subscription',
        message: 'No active subscription yet — upgrade to Pro to manage billing.',
      }),
    }
  }

  try {
    const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2025-04-30.basil' })
    const session = await stripe.billingPortal.sessions.create({
      customer:   prefs.stripe_customer_id,
      return_url: returnUrl ?? 'https://groundupapp.com/dashboard/profile',
    })

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, url: session.url }),
    }
  } catch (err) {
    console.error('[create-portal-session] Stripe error:', err)
    return {
      statusCode: 502,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: String(err) }),
    }
  }
}
