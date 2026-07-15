-- Artist self-assessment fields captured on the waitlist popup (WaitlistModal).
-- years_active is a free-text answer. momentum_level/investment_level store
-- the human-readable slider label ("Bubbling Up"); *_score stores the 0-4
-- slider index for easy sorting/filtering.

alter table public.waitlist add column if not exists years_active     text;
alter table public.waitlist add column if not exists momentum_level   text;
alter table public.waitlist add column if not exists momentum_score   smallint;
alter table public.waitlist add column if not exists investment_level text;
alter table public.waitlist add column if not exists investment_score smallint;
