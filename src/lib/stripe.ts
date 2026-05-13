const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const PRICE_ID        = import.meta.env.VITE_STRIPE_PRICE_ID        as string | undefined;

export const stripeConfigured = Boolean(PUBLISHABLE_KEY && PRICE_ID);

export async function redirectToCheckout(userId: string): Promise<void> {
  if (!PUBLISHABLE_KEY || !PRICE_ID) {
    console.warn('[Stripe] Keys not configured — set VITE_STRIPE_PUBLISHABLE_KEY and VITE_STRIPE_PRICE_ID');
    return;
  }

  // Dynamically loaded so the bundle doesn't require @stripe/stripe-js at build time
  // until VITE_STRIPE_PUBLISHABLE_KEY is actually set.
  // loadStripe loaded lazily — avoids requiring @stripe/stripe-js in the build
  // until Stripe env vars are actually set.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripeJs = await (Function('return import("@stripe/stripe-js")')() as Promise<any>);
  const { loadStripe } = stripeJs;
  const stripe = await loadStripe(PUBLISHABLE_KEY);
  if (!stripe) return;

  await stripe.redirectToCheckout({
    lineItems: [{ price: PRICE_ID, quantity: 1 }],
    mode: 'subscription',
    successUrl: `${window.location.origin}/dashboard?upgraded=1`,
    cancelUrl:  `${window.location.origin}/dashboard`,
    clientReferenceId: userId,
  });
}
