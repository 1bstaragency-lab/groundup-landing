-- Migration V3: Add onboarding fields to artist_preferences
-- Run this in Supabase SQL Editor

ALTER TABLE artist_preferences
  ADD COLUMN IF NOT EXISTS role        text,
  ADD COLUMN IF NOT EXISTS career_stage text,
  ADD COLUMN IF NOT EXISTS goals        text[] DEFAULT '{}';

-- If artist_preferences table doesn't exist yet, create it fresh:
CREATE TABLE IF NOT EXISTS artist_preferences (
  user_id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_name       text NOT NULL DEFAULT '',
  genre             text NOT NULL DEFAULT '',
  bio               text NOT NULL DEFAULT '',
  tone              text NOT NULL DEFAULT 'Conversational',
  role              text,
  career_stage      text,
  goals             text[] DEFAULT '{}',
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE artist_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile"   ON artist_preferences;
DROP POLICY IF EXISTS "Users can upsert own profile" ON artist_preferences;

CREATE POLICY "Users can view own profile"
  ON artist_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own profile"
  ON artist_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON artist_preferences FOR UPDATE
  USING (auth.uid() = user_id);
