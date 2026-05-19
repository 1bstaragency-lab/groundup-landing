-- Referrals: per-user shareable code + tracking who they referred

-- 1. Per-user referral code on artist_preferences (8-char alphanumeric)
alter table public.artist_preferences
  add column if not exists referral_code text unique;

-- 2. Referrals ledger
create table if not exists public.referrals (
  id                uuid        primary key default gen_random_uuid(),
  referrer_user_id  uuid        not null references auth.users(id) on delete cascade,
  referred_user_id  uuid        not null references auth.users(id) on delete cascade,
  referral_code     text        not null,
  status            text        not null default 'signed_up' check (status in ('signed_up', 'verified', 'upgraded')),
  points_awarded    int         not null default 0,
  created_at        timestamptz not null default now(),
  unique (referred_user_id)  -- one referrer per referred user
);

alter table public.referrals enable row level security;

-- Each user can read their own referrals (both as referrer and referred)
create policy "Users read their referrals"
  on public.referrals for select
  using (auth.uid() = referrer_user_id or auth.uid() = referred_user_id);

-- Only the service role inserts referrals (via signup webhook / API)
create policy "Service role inserts"
  on public.referrals for insert
  with check (false);

create index if not exists idx_referrals_referrer on public.referrals (referrer_user_id, created_at desc);

-- 3. Auto-generate referral_code for any existing rows missing one
-- Uses 8 random uppercase alphanumeric characters
update public.artist_preferences
  set referral_code = upper(substring(md5(random()::text) from 1 for 8))
  where referral_code is null;

-- 4. Trigger to auto-generate referral_code on insert
create or replace function public.set_default_referral_code()
returns trigger as $$
begin
  if new.referral_code is null then
    new.referral_code := upper(substring(md5(random()::text) from 1 for 8));
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_referral_code on public.artist_preferences;
create trigger trg_set_referral_code
  before insert on public.artist_preferences
  for each row execute function public.set_default_referral_code();
