-- V9: Add priority to calendar_events

ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'none'
    CHECK (priority IN ('none', 'low', 'medium', 'high'));
