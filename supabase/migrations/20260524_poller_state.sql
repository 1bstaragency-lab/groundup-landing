-- Tracks state for scheduled pollers (key-value store)
CREATE TABLE IF NOT EXISTS poller_state (
  key        text        PRIMARY KEY,
  value      text        NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
