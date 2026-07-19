-- Tracks whether a waitlist signup has been pushed to a real account.
-- approved_user_id links back to the auth.users row created by the invite
-- (admin-approve-waitlist.ts), so we can trace which account came from
-- which waitlist entry.

alter table public.waitlist add column if not exists status text not null default 'pending';
alter table public.waitlist add column if not exists approved_at timestamptz;
alter table public.waitlist add column if not exists approved_user_id uuid references auth.users(id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'waitlist_status_check'
  ) then
    alter table public.waitlist add constraint waitlist_status_check check (status in ('pending', 'approved'));
  end if;
end $$;
