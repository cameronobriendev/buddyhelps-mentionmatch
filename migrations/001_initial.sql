-- MentionMatch Requests Table
-- Run this in Turso console or via CLI: turso db shell your-db-name < migrations/001_initial.sql

CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT (datetime('now')),

  -- Writer info
  writer_name TEXT,
  writer_email TEXT,
  publication TEXT,

  -- Request details
  request_topic TEXT,
  request_details TEXT,
  deadline TEXT,
  expertise_needed TEXT,

  -- Raw payload from webhook (for debugging)
  raw_payload TEXT,

  -- Our workflow
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'drafting', 'responded', 'skipped')),
  draft_response TEXT,
  final_response TEXT,
  responded_at TEXT,
  notes TEXT
);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);

-- Index for sorting by date
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);
