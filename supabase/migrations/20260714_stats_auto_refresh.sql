-- Automatic platform-stats refresh on login (stats-refresh.ts).
-- Tracks when we last auto-synced an artist's connected platforms and
-- caches the latest Claude-generated headline about their numbers.

alter table public.artist_preferences add column if not exists last_auto_synced_at  timestamptz;
alter table public.artist_preferences add column if not exists latest_insight       text;
alter table public.artist_preferences add column if not exists insight_generated_at timestamptz;
