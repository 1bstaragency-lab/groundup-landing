import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role — bypasses RLS
);

const BLOOIO_API_KEY = process.env.BLOOIO_API_KEY ?? '';

// Send iMessage reply via Blooio (fire-and-forget — errors are logged only)
async function sendBlooioMsg(to: string, text: string): Promise<void> {
  if (!BLOOIO_API_KEY) return;
  try {
    const res = await fetch('https://backend.blooio.com/v1/api/messages', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${BLOOIO_API_KEY}`,
      },
      body: JSON.stringify({ to, text }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('[stripe-webhook] Blooio send error:', res.status, err);
    }
  } catch (err) {
    console.error('[stripe-webhook] Blooio network error:', err);
  }
}

async function setPlanTier(userId: string, tier: 'free' | 'pro' | 'growth') {
  await supabase
    .from('artist_preferences')
    .update({ plan_tier: tier })
    .eq('user_id', userId);
}

export const handler: Handler = async (event) => {
  // Diagnostic: GET ?status=<userId> → current plan_tier + stripe linkage.
  // Lets us confirm whether the webhook actually flipped the tier.
  if (event.httpMethod === 'GET') {
    const userId = event.queryStringParameters?.status;
    if (!userId) return { statusCode: 400, body: 'pass ?status=<userId>' };
    const { data, error } = await supabase
      .from('artist_preferences')
      .select('plan_tier, stripe_customer_id, artist_name')
      .eq('user_id', userId)
      .maybeSingle();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, error: error?.message }),
    };
  }

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
      const session    = stripeEvent.data.object as Stripe.Checkout.Session;
      const clientRef  = session.client_reference_id;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

      if (clientRef?.startsWith('guest_')) {
        // ── Guest iMessage user paying for the first time ─────────────────────
        const phone = clientRef.slice(6); // strip 'guest_' prefix
        const email = session.customer_details?.email;

        if (phone && email) {
          // Fetch their onboarding data from guest_profiles
          const { data: guestProfile } = await supabase
            .from('guest_profiles')
            .select('artist_name, genre, goal')
            .eq('phone_number', phone)
            .maybeSingle();

          const artistName = guestProfile?.artist_name ?? '';

          // Create a verified Supabase auth user from their checkout email
          const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
            email,
            phone,
            email_confirm: true,
            user_metadata: { artist_name: artistName },
          });

          let userId: string | null = null;

          if (!createError && newUserData?.user) {
            userId = newUserData.user.id;
          } else if (createError) {
            // Email already registered — look up the existing user
            console.warn('[stripe-webhook] createUser error (may already exist):', createError.message);
            // Query auth.users via service role
            const { data: existingList } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
            const existing = existingList?.users?.find(u => u.email === email);
            if (existing) userId = existing.id;
          }

          if (userId) {
            // Upsert artist_preferences — plan tier + Stripe customer
            await supabase.from('artist_preferences').upsert({
              user_id:             userId,
              artist_name:         artistName,
              plan_tier:           'pro',
              stripe_customer_id:  customerId ?? null,
              onboarding_complete: false,
            }, { onConflict: 'user_id' });

            // Upsert artist_profiles — phone linkage (enables future iMessage routing)
            await supabase.from('artist_profiles').upsert({
              user_id:      userId,
              artist_name:  artistName,
              phone_number: phone,
              tone:         'Assistant Manager',
            }, { onConflict: 'user_id' });
          }

          // Generate a magic link and deliver it via iMessage (+ email fallback)
          const { data: magicData } = await supabase.auth.admin.generateLink({
            type:  'magiclink',
            email,
          });
          const magicLink = (magicData as { properties?: { action_link?: string } })?.properties?.action_link;

          if (magicLink) {
            await sendBlooioMsg(phone,
              `You're in! 🔥 Your 7-day free trial just started.\n\nTap this link to set up your GrounduP dashboard — no password needed:\n${magicLink}\n\nThen come back here and keep texting me 🎵`);
          } else {
            await sendBlooioMsg(phone,
              `You're in! 🔥 Your 7-day free trial just started.\n\nCheck your email (${email}) for your GrounduP login link.\n\nThen keep texting me — your conversations carry over.`);
          }
        }

      } else if (clientRef) {
        // ── Registered user upgrading plan ────────────────────────────────────
        const userId = clientRef;
        await setPlanTier(userId, 'pro');
        if (customerId) {
          await supabase.from('artist_preferences')
            .update({ stripe_customer_id: customerId })
            .eq('user_id', userId);
        }
      }
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
