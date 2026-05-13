-- ─────────────────────────────────────────────────────────────────────────────
-- grounduP  ·  Supabase Schema  ·  v2
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- generated_images
create table if not exists public.generated_images (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  description  text not null,
  style        text not null,
  mood         text not null,
  aspect_ratio text not null,
  image_url    text not null,
  prompt_used  text not null,
  created_at   timestamptz not null default now()
);

alter table public.generated_images enable row level security;

create policy "Users can read own images"
  on public.generated_images for select
  using (auth.uid() = user_id);

create policy "Users can insert own images"
  on public.generated_images for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own images"
  on public.generated_images for delete
  using (auth.uid() = user_id);

-- generated_videos
create table if not exists public.generated_videos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  concept       text not null,
  style         text not null,
  duration      text not null,
  description   text not null,
  video_url     text,
  thumbnail_url text,
  prompt_used   text not null,
  status        text not null default 'pending',
  created_at    timestamptz not null default now()
);

alter table public.generated_videos enable row level security;

create policy "Users can read own videos"
  on public.generated_videos for select
  using (auth.uid() = user_id);

create policy "Users can insert own videos"
  on public.generated_videos for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own videos"
  on public.generated_videos for delete
  using (auth.uid() = user_id);

-- Index for fast user lookups (both tables)
create index if not exists generated_images_user_idx on public.generated_images(user_id, created_at desc);
create index if not exists generated_videos_user_idx on public.generated_videos(user_id, created_at desc);
