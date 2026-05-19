-- Spotify scraped data persistence
-- We don't use the official OAuth — just scrape what's publicly visible on
-- open.spotify.com/artist/{id} pages and store snapshots over time.

-- 1. Add spotify_url to artist_preferences so each artist can save their link
alter table public.artist_preferences
  add column if not exists spotify_url text;

-- 2. Snapshots — append-only historical record so we can chart growth
create table if not exists public.spotify_snapshots (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users(id) on delete cascade,
  artist_id         text        not null, -- spotify artist ID extracted from URL
  artist_name       text,
  monthly_listeners int,
  followers         int,
  top_tracks        jsonb,     -- [{ name, plays, albumArt }]
  raw_meta          jsonb,     -- og tags + JSON-LD for debugging / future fields
  fetched_at        timestamptz not null default now()
);

alter table public.spotify_snapshots enable row level security;

create policy "Users read own snapshots"
  on public.spotify_snapshots for select
  using (auth.uid() = user_id);

create policy "Service role inserts"
  on public.spotify_snapshots for insert
  with check (false);

create index if not exists idx_spotify_snapshots_user_time
  on public.spotify_snapshots (user_id, fetched_at desc);
