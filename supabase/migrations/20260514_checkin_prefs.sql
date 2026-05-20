-- Daily check-in preferences (proactive uP iMessages)
alter table public.artist_preferences
  add column if not exists checkin_enabled    boolean      not null default false,
  add column if not exists checkin_hour       smallint     not null default 9,   -- 0-23 in user's local time
  add column if not exists checkin_timezone   text         not null default 'America/New_York',
  add column if not exists checkin_frequency  text         not null default 'daily'
    check (checkin_frequency in ('daily', 'weekdays', 'weekly')),
  add column if not exists last_checkin_at    timestamptz;

create index if not exists idx_artist_preferences_checkin
  on public.artist_preferences (checkin_enabled, checkin_hour)
  where checkin_enabled = true;
