-- Add Stripe customer reference to artist_preferences
-- Set by stripe-webhook.ts on first checkout, used by create-portal-session.ts
alter table public.artist_preferences
  add column if not exists stripe_customer_id text;

create unique index if not exists idx_artist_preferences_stripe_customer
  on public.artist_preferences (stripe_customer_id)
  where stripe_customer_id is not null;
