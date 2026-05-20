-- App funnel waitlist (phone-first, separate from email-first marketing waitlist)
create table if not exists public.app_waitlist (
  id          uuid        primary key default gen_random_uuid(),
  phone       text        unique not null,
  source      text        not null default 'tiktok_funnel',
  position    int         not null,
  created_at  timestamptz not null default now()
);

alter table public.app_waitlist enable row level security;
create policy "Service role only" on public.app_waitlist for all using (false);
create index if not exists idx_app_waitlist_created on public.app_waitlist(created_at desc);
