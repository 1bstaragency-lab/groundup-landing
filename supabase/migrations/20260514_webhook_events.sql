-- webhook_events: unconditional log of every POST to blooio-webhook
-- Used to verify whether Blooio is actually calling our webhook when iMessages arrive.
create table if not exists public.webhook_events (
  id          uuid        primary key default gen_random_uuid(),
  source      text        not null default 'blooio',
  headers     jsonb,
  payload     jsonb,
  ip          text,
  created_at  timestamptz not null default now()
);

alter table public.webhook_events enable row level security;

-- Only service role can read (no anon access to raw webhook bodies)
create policy "Service role only" on public.webhook_events for all using (false);

create index if not exists webhook_events_created_idx on public.webhook_events(created_at desc);
