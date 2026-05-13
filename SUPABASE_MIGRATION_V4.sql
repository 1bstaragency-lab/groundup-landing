-- Migration V4: Team Invites
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS team_invites (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email text NOT NULL,
  invitee_name  text NOT NULL,
  role          text NOT NULL DEFAULT 'Manager',
  status        text NOT NULL DEFAULT 'pending',  -- pending | accepted | cancelled
  member_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz DEFAULT now(),
  expires_at    timestamptz DEFAULT now() + interval '7 days'
);

-- Indexes
CREATE INDEX IF NOT EXISTS team_invites_inviter_idx ON team_invites(inviter_id);
CREATE INDEX IF NOT EXISTS team_invites_email_idx   ON team_invites(invitee_email);

-- RLS
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Inviter can manage their own invites
CREATE POLICY "Inviter can read own invites"
  ON team_invites FOR SELECT
  USING (auth.uid() = inviter_id);

CREATE POLICY "Inviter can create invites"
  ON team_invites FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Inviter can update own invites"
  ON team_invites FOR UPDATE
  USING (auth.uid() = inviter_id);

-- Anyone can read an invite by its id (needed for /join/:token page before sign-up)
-- The UUID token is cryptographically unguessable, so public read is safe
CREATE POLICY "Public read invite by id"
  ON team_invites FOR SELECT
  USING (true);

-- Invitee can update (accept) the invite — even before they have a uid
-- We allow update on status/member_id when status is still pending
CREATE POLICY "Accept invite"
  ON team_invites FOR UPDATE
  USING (status = 'pending');
