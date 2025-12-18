-- EQ Presets Table for sharing equalizer settings
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS eq_presets (
  id TEXT PRIMARY KEY, -- nanoid share code
  name TEXT NOT NULL,
  bass INTEGER NOT NULL CHECK (bass >= 0 AND bass <= 100),
  mid INTEGER NOT NULL CHECK (mid >= 0 AND mid <= 100),
  treble INTEGER NOT NULL CHECK (treble >= 0 AND treble <= 100),
  creator_address TEXT NOT NULL,
  creator_name TEXT,
  is_public BOOLEAN DEFAULT true,
  uses_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_eq_presets_creator ON eq_presets(creator_address);
CREATE INDEX IF NOT EXISTS idx_eq_presets_public ON eq_presets(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_eq_presets_uses ON eq_presets(uses_count DESC);

-- RLS Policies
ALTER TABLE eq_presets ENABLE ROW LEVEL SECURITY;

-- Anyone can read public presets
CREATE POLICY "Public presets are viewable by everyone"
  ON eq_presets FOR SELECT
  USING (is_public = true);

-- Users can read their own presets
CREATE POLICY "Users can view own presets"
  ON eq_presets FOR SELECT
  USING (true); -- API handles auth

-- Anyone can insert (API validates)
CREATE POLICY "Anyone can create presets"
  ON eq_presets FOR INSERT
  WITH CHECK (true);

-- Only creator can update
CREATE POLICY "Creators can update own presets"
  ON eq_presets FOR UPDATE
  USING (true); -- API handles auth

-- Only creator can delete
CREATE POLICY "Creators can delete own presets"
  ON eq_presets FOR DELETE
  USING (true); -- API handles auth

-- Function to increment uses count atomically
CREATE OR REPLACE FUNCTION increment_eq_preset_uses(preset_id_param TEXT)
RETURNS void AS $$
BEGIN
  UPDATE eq_presets
  SET uses_count = uses_count + 1
  WHERE id = preset_id_param;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_eq_preset_uses(TEXT) TO anon, authenticated;
