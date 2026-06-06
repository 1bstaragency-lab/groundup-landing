-- ─────────────────────────────────────────────────────────────────────────────
-- paywall_events  —  unified conversion tracking
--
-- Logs every meaningful event on offer/waitlist/paywall pages so we can
-- see which variant drives which conversion at the admin dashboard level.
--
-- Events we record:
--   'page_view'   — someone hit a paywall/offer page
--   'cta_click'   — they clicked the primary CTA (iMessage / signup)
--   'converted'   — Stripe webhook or signup webhook fired success
--
-- Each row carries (variant_slug, event_type, optional user/session id,
-- referrer + utm + path). Anonymous rows are fine — many funnels start
-- before the user is identified.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS paywall_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id    text,
  variant_slug  text NOT NULL,                -- 'waitlist' | 'free' | 'ads' | etc.
  event_type    text NOT NULL,                -- 'page_view' | 'cta_click' | 'converted'
  page_path     text,
  referrer      text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  metadata      jsonb,                        -- offer-specific extras
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS paywall_events_variant_idx     ON paywall_events (variant_slug);
CREATE INDEX IF NOT EXISTS paywall_events_event_type_idx  ON paywall_events (event_type);
CREATE INDEX IF NOT EXISTS paywall_events_created_at_idx  ON paywall_events (created_at DESC);
CREATE INDEX IF NOT EXISTS paywall_events_session_idx     ON paywall_events (session_id);
CREATE INDEX IF NOT EXISTS paywall_events_variant_type_idx
  ON paywall_events (variant_slug, event_type, created_at DESC);

-- ─── RLS — anonymous can insert, only admin can read ────────────────────────
ALTER TABLE paywall_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS paywall_events_anon_insert ON paywall_events;
CREATE POLICY paywall_events_anon_insert
  ON paywall_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Service role bypasses RLS for the admin dashboard reads.
-- No SELECT policy is intentionally created → anon clients can't scrape it.
