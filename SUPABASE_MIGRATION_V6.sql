-- V6: Phone notifications + calendar events persistence

-- Add phone and SMS notification opt-in to artist profiles
ALTER TABLE artist_preferences
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS sms_notifications boolean NOT NULL DEFAULT false;

-- Store calendar events so scheduled-texts can read upcoming dates
CREATE TABLE IF NOT EXISTS calendar_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL,
  event_type  text NOT NULL DEFAULT 'General',
  event_date  date NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by user + date
CREATE INDEX IF NOT EXISTS calendar_events_user_date_idx ON calendar_events (user_id, event_date);

-- RLS: users can only see and edit their own events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own events"
  ON calendar_events
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can read all events (for scheduled-texts function)
CREATE POLICY "Service role reads all events"
  ON calendar_events
  FOR SELECT
  USING (true);
