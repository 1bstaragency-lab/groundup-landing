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

-- Guest conversation history: stores each message so Claude has context
-- role: 'user' | 'assistant'

CREATE TABLE IF NOT EXISTS guest_conversations (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text         NOT NULL REFERENCES guest_profiles(phone_number) ON DELETE CASCADE,
  role         text         NOT NULL CHECK (role IN ('user', 'assistant')),
  content      text         NOT NULL,
  created_at   timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guest_conversations_phone_created
  ON guest_conversations (phone_number, created_at DESC);

-- No RLS needed — only accessed via service role key from the webhook function.
