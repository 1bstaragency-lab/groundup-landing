-- Run this in your Supabase SQL Editor before launching auth

-- Existing waitlist table (already documented in README)
create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text unique not null,
  phone text,
  artist_name text,
  platform text,
  social_handle text,
  role text,
  referral_code text,
  referred_by text
);

-- Artist preferences table (new for auth system)
create table if not exists artist_preferences (
  user_id uuid references auth.users(id) on delete cascade primary key,
  artist_name text not null,
  genre text not null default '',
  bio text not null default '',
  tone text not null default 'Professional'
    check (tone in ('Professional','Conversational','Direct','Analytical','Strategic')),
  onboarding_complete boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security: users can only read/write their own profile
alter table artist_preferences enable row level security;

create policy "Users read own profile"
  on artist_preferences for select
  using (auth.uid() = user_id);

create policy "Users upsert own profile"
  on artist_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users update own profile"
  on artist_preferences for update
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger artist_preferences_updated_at
  before update on artist_preferences
  for each row execute procedure update_updated_at();
