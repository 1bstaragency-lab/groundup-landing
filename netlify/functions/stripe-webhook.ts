import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role — bypasses RLS
);

async function setPlanTier(userId: string, tier: 'free' | 'pro' | 'growth') {
  await supabase
    .from('artist_preferences')
    .update({ plan_tier: tier })
    .eq('user_id', userId);
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const sig       = event.headers['stripe-signature']!;
  const secret    = process.env.STRIPE_WEBHOOK_SECRET!;
  const rawBody   = event.body ?? '';

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { statusCode: 400, body: `Webhook Error: ${msg}` };
  }

  switch (stripeEvent.type) {
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      const userId  = session.client_reference_id;
      if (userId) await setPlanTier(userId, 'pro');
      break;
    }
    case 'customer.subscription.updated': {
      const sub    = stripeEvent.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (userId) {
        const active = sub.status === 'active' || sub.status === 'trialing';
        await setPlanTier(userId, active ? 'pro' : 'free');
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const sub    = stripeEvent.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (userId) await setPlanTier(userId, 'free');
      break;
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
