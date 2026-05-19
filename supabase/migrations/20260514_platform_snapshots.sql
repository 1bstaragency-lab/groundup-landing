-- Unified platform snapshots: Spotify, Apple Music, SoundCloud, TikTok
-- Public-data scraping only, no OAuth needed.

-- 1. URL columns on artist_preferences for each platform
alter table public.artist_preferences add column if not exists spotify_url     text;
alter table public.artist_preferences add column if not exists apple_music_url text;
alter table public.artist_preferences add column if not exists soundcloud_url  text;
alter table public.artist_preferences add column if not exists tiktok_url      text;

-- 2. Unified snapshots table (append-only time series)
create table if not exists public.platform_snapshots (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  platform     text        not null check (platform in ('spotify', 'apple_music', 'soundcloud', 'tiktok')),
  profile_id   text,                -- platform-native ID extracted from URL
  display_name text,                -- artist/username on that platform
  stats        jsonb       not null default '{}', -- platform-specific metric bag
  top_items    jsonb,               -- top tracks / popular videos / featured posts
  image_url    text,
  raw_meta     jsonb,
  fetched_at   timestamptz not null default now()
);

alter table public.platform_snapshots enable row level security;

create policy "Users read own platform snapshots"
  on public.platform_snapshots for select
  using (auth.uid() = user_id);

create policy "Service role inserts platform snapshots"
  on public.platform_snapshots for insert
  with check (false);

create index if not exists idx_platform_snapshots_user_time
  on public.platform_snapshots (user_id, platform, fetched_at desc);
