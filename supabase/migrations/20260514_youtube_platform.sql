-- Add YouTube to the platform set; keep older apple_music/tiktok values
-- in the check constraint so any historical rows remain valid.

alter table public.artist_preferences add column if not exists youtube_url text;

alter table public.platform_snapshots
  drop constraint if exists platform_snapshots_platform_check;

alter table public.platform_snapshots
  add constraint platform_snapshots_platform_check
  check (platform in ('spotify', 'soundcloud', 'youtube', 'apple_music', 'tiktok'));
