-- Both waitlist entry points (WaitlistModal popup + the standalone
-- /waitlist page) insert a `source` value the table never had a column
-- for. Postgres rejects inserts with unknown columns, and both call sites
-- swallow that error and show "success" anyway ("never block on backend
-- issues") — so submissions through either flow have likely been failing
-- to actually save. This adds the missing column so they persist.

alter table public.waitlist add column if not exists source text;
