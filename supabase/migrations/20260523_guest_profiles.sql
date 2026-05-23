-- Guest profiles: tracks new users who text in via the /app iMessage link
-- before they have a full GrounduP account. Keyed by phone number.
-- onboarding_step: 0=new 1=asked name 2=asked genre 3=asked goal 4=active chat
-- message_count: increments each reply; gate at 10 for free tier

CREATE TABLE IF NOT EXISTS guest_profiles (
  phone_number     text PRIMARY KEY,
  artist_name      text,
  genre            text,
  goal             text,
  onboarding_step  integer      NOT NULL DEFAULT 0,
  message_count    integer      NOT NULL DEFAULT 0,
  created_at       timestamptz  NOT NULL DEFAULT now(),
  updated_at       timestamptz  NOT NULL DEFAULT now()
);

-- No RLS needed — only accessed via service role key from the webhook function.
-- If you want to expose this to the dashboard later, add:
--   ALTER TABLE guest_profiles ENABLE ROW LEVEL SECURITY;
