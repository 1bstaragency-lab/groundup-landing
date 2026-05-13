-- V8: Gmail OAuth token storage

ALTER TABLE artist_preferences
  ADD COLUMN IF NOT EXISTS gmail_refresh_token text,
  ADD COLUMN IF NOT EXISTS gmail_connected_at  timestamptz;
