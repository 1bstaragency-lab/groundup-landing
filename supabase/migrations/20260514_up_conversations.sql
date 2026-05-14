-- uP AI Conversations table
-- Run this in your Supabase SQL editor

-- 1. up_conversations — stores all in-app and iMessage conversations
create table if not exists public.up_conversations (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  conversation_id  uuid not null default gen_random_uuid(),
  role             text not null check (role in ('user', 'assistant', 'system')),
  content          text not null,
  channel          text not null default 'app' check (channel in ('app', 'imessage', 'sms')),
  created_at       timestamptz not null default now()
);

-- Index for fast lookup by conversation
create index if not exists up_conversations_conv_idx  on public.up_conversations(conversation_id, created_at);
create index if not exists up_conversations_user_idx  on public.up_conversations(user_id, created_at desc);

-- RLS — users can only see their own messages
alter table public.up_conversations enable row level security;

create policy "Users see own conversations"
  on public.up_conversations for select
  using (auth.uid() = user_id);

create policy "Users insert own conversations"
  on public.up_conversations for insert
  with check (auth.uid() = user_id);

-- Service role (Netlify functions) bypasses RLS automatically


-- 2. Add phone_number to artist_profiles (for Linq iMessage delivery)
alter table public.artist_profiles
  add column if not exists phone_number text,
  add column if not exists tone        text default 'Assistant Manager';

-- Index for Linq webhook lookup by phone
create unique index if not exists artist_profiles_phone_idx
  on public.artist_profiles(phone_number)
  where phone_number is not null;
