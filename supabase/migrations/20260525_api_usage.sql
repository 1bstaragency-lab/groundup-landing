-- Tracks Claude API token usage per message for cost reporting
-- claude-haiku-4-5: $0.80/MTok input, $4.00/MTok output
CREATE TABLE IF NOT EXISTS api_usage (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid          REFERENCES auth.users(id) ON DELETE SET NULL,
  phone_number  text,                          -- populated for guest users
  model         text          NOT NULL DEFAULT 'claude-haiku-4-5',
  input_tokens  int           NOT NULL DEFAULT 0,
  output_tokens int           NOT NULL DEFAULT 0,
  cost_usd      numeric(10,6) NOT NULL DEFAULT 0,
  channel       text          NOT NULL DEFAULT 'imessage',
  created_at    timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS api_usage_user_id_idx    ON api_usage (user_id);
CREATE INDEX IF NOT EXISTS api_usage_created_at_idx ON api_usage (created_at DESC);
CREATE INDEX IF NOT EXISTS api_usage_phone_idx      ON api_usage (phone_number) WHERE phone_number IS NOT NULL;
