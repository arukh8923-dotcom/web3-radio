-- Chat Reports table for community moderation
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS chat_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  reporter_address TEXT NOT NULL,
  station_id UUID,
  reason TEXT DEFAULT 'inappropriate',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT
);

-- Add is_hidden column to live_chat if not exists
ALTER TABLE live_chat ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_reports_message ON chat_reports(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_reports_station ON chat_reports(station_id);
CREATE INDEX IF NOT EXISTS idx_chat_reports_status ON chat_reports(status);
CREATE INDEX IF NOT EXISTS idx_live_chat_hidden ON live_chat(is_hidden);

-- Enable RLS
ALTER TABLE chat_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can create reports" ON chat_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read reports" ON chat_reports
  FOR SELECT USING (true);

-- Unique constraint to prevent duplicate reports
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_reports_unique 
  ON chat_reports(message_id, reporter_address);
