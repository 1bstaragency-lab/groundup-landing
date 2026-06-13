-- V10: Add handle and notes to creators table for UGC onboarding form

ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS handle TEXT,
  ADD COLUMN IF NOT EXISTS notes  TEXT;

-- Allow anonymous users to submit creator applications (INSERT only)
CREATE POLICY "Creators: Anyone can apply" ON creators
  FOR INSERT WITH CHECK (status = 'pending');
