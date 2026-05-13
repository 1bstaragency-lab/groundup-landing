-- V7: Releases persistence for Rollouts section

CREATE TABLE IF NOT EXISTS releases (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        text NOT NULL,
  type         text NOT NULL CHECK (type IN ('Single', 'EP', 'Album', 'Mixtape')),
  release_date date NOT NULL,
  cover_art    text,
  feature      text,
  budget       text NOT NULL DEFAULT 'DIY / Low',
  focus_areas  text[] NOT NULL DEFAULT '{}',
  timeline     integer NOT NULL DEFAULT 4,
  checklist    jsonb NOT NULL DEFAULT '[]',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS releases_user_date_idx ON releases (user_id, release_date);

ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own releases"
  ON releases FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
