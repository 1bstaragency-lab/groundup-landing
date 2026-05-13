-- V5: Add plan_tier to artist_preferences
-- Run this in Supabase SQL editor

ALTER TABLE artist_preferences
  ADD COLUMN IF NOT EXISTS plan_tier text NOT NULL DEFAULT 'free'
  CHECK (plan_tier IN ('free', 'pro', 'growth'));

-- Index for fast plan lookups (e.g. webhook updating a user's tier)
CREATE INDEX IF NOT EXISTS idx_artist_preferences_plan_tier
  ON artist_preferences (plan_tier);

-- Stripe webhook will UPDATE plan_tier to 'pro' or 'growth' on successful payment
-- and back to 'free' on subscription cancellation / expiry.
-- The webhook function (netlify/functions/stripe-webhook.ts) handles this.
