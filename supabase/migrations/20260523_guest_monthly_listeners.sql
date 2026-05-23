-- Add monthly_listeners to guest_profiles for the iMessage onboarding flow
-- (collected as question 1 before goal and email)

ALTER TABLE guest_profiles
  ADD COLUMN IF NOT EXISTS monthly_listeners text;
