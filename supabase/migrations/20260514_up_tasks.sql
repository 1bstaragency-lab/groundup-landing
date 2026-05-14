-- up_tasks: action items extracted by uP from any conversation (app or iMessage)
create table if not exists public.up_tasks (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  content         text        not null,
  source          text        not null default 'app' check (source in ('app', 'imessage')),
  conversation_id uuid,
  status          text        not null default 'pending' check (status in ('pending', 'done')),
  created_at      timestamptz not null default now()
);

alter table public.up_tasks enable row level security;

create policy "Users manage own tasks"
  on public.up_tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists up_tasks_user_status_idx on public.up_tasks(user_id, status, created_at desc);
