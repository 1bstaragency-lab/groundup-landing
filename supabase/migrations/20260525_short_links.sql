-- Short-lived URL shortener for magic links sent via iMessage
-- Codes expire after 24 hours; the /go/:code function cleans up on read.
CREATE TABLE IF NOT EXISTS short_links (
  code        text        PRIMARY KEY,
  url         text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Auto-delete expired rows
CREATE INDEX IF NOT EXISTS short_links_expires_at_idx ON short_links (expires_at);
