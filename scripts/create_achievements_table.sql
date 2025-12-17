-- User Achievements table for Web3 Radio
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  nft_minted BOOLEAN DEFAULT FALSE,
  nft_tx_hash TEXT,
  nft_token_id TEXT,
  minted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_achievements_unique 
  ON user_achievements(wallet_address, achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_wallet ON user_achievements(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_achievements_minted ON user_achievements(nft_minted);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read achievements" ON user_achievements
  FOR SELECT USING (true);

CREATE POLICY "System can insert achievements" ON user_achievements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update achievements" ON user_achievements
  FOR UPDATE USING (true);

-- Tune-ins table for tracking station visits
CREATE TABLE IF NOT EXISTS tune_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  frequency DECIMAL(5,1),
  tuned_in_at TIMESTAMPTZ DEFAULT NOW(),
  tuned_out_at TIMESTAMPTZ,
  duration_seconds INTEGER
);

CREATE INDEX IF NOT EXISTS idx_tune_ins_wallet ON tune_ins(wallet_address);
CREATE INDEX IF NOT EXISTS idx_tune_ins_station ON tune_ins(station_id);

ALTER TABLE tune_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tune_ins" ON tune_ins
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert tune_ins" ON tune_ins
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update tune_ins" ON tune_ins
  FOR UPDATE USING (true);

-- Add total_listening_minutes to user_preferences if not exists
ALTER TABLE user_preferences 
  ADD COLUMN IF NOT EXISTS total_listening_minutes INTEGER DEFAULT 0;
