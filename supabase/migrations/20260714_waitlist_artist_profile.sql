-- Artist self-assessment fields captured on the waitlist popup (WaitlistModal).
-- Each *_level column stores the human-readable label ("Bubbling Up"); each
-- *_score column stores the 0-4 slider index for easy sorting/filtering.

alter table public.waitlist add column if not exists years_active           text;
alter table public.waitlist add column if not exists years_active_score     smallint;
alter table public.waitlist add column if not exists momentum_level         text;
alter table public.waitlist add column if not exists momentum_score         smallint;
alter table public.waitlist add column if not exists fanbase_level          text;
alter table public.waitlist add column if not exists fanbase_score          smallint;
alter table public.waitlist add column if not exists release_activity_level text;
alter table public.waitlist add column if not exists release_activity_score smallint;
alter table public.waitlist add column if not exists monthly_income_level   text;
alter table public.waitlist add column if not exists monthly_income_score   smallint;
