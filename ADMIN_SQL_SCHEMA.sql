-- GrounduP Admin Dashboard Tables
-- Run this in your Supabase SQL Editor

-- Bugs/Issues table
CREATE TABLE bugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Model usage tracking table
CREATE TABLE model_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  model_name VARCHAR(100) NOT NULL,
  tokens_input INT NOT NULL,
  tokens_output INT NOT NULL,
  cost_usd DECIMAL(10, 6) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- UGC Creators/Influencers table
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  platform VARCHAR(50),  -- 'TikTok', 'Instagram', 'YouTube', 'X / Twitter', etc.
  followers VARCHAR(50), -- '10K', '50K', '250K', '1M+', etc.
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'rejected')),
  ref_code VARCHAR(100) NOT NULL UNIQUE,
  referrals_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX idx_bugs_user_id ON bugs(user_id);
CREATE INDEX idx_bugs_status ON bugs(status);
CREATE INDEX idx_bugs_severity ON bugs(severity);
CREATE INDEX idx_model_usage_user_id ON model_usage(user_id);
CREATE INDEX idx_model_usage_created ON model_usage(created_at);
CREATE INDEX idx_creators_status ON creators(status);
CREATE INDEX idx_creators_ref_code ON creators(ref_code);
CREATE INDEX idx_creators_email ON creators(email);

-- Enable RLS (Row Level Security)
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admin only (service role bypasses these)
-- Anon users can't read these tables
CREATE POLICY "Bugs: No public access" ON bugs
  FOR SELECT USING (false);

CREATE POLICY "Model usage: No public access" ON model_usage
  FOR SELECT USING (false);

CREATE POLICY "Creators: Users can read public info" ON creators
  FOR SELECT USING (true);  -- Public can see creator profiles

-- Optional: allow users to submit bugs from the app
CREATE POLICY "Bugs: Users can insert own bugs" ON bugs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a view for admin stats (optional, makes the function simpler)
CREATE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM users WHERE subscription_tier != 'free') as paid_users,
  (SELECT COUNT(*) FROM users WHERE last_sign_in::date = CURRENT_DATE) as active_today,
  (SELECT COUNT(*) FROM users WHERE onboarded = true) as onboarded_users,
  (SELECT SUM(cost_usd) FROM model_usage WHERE created_at > NOW() - INTERVAL '30 days') as total_model_cost_30d,
  (SELECT COUNT(*) FROM bugs WHERE status = 'open') as open_bugs,
  (SELECT COUNT(*) FROM creators WHERE status = 'active') as active_creators;
