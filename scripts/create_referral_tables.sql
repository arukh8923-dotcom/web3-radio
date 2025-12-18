-- Referral System Tables
-- Run this in Supabase SQL Editor

-- Referrers table (users who can refer others)
CREATE TABLE IF NOT EXISTS referrers (
  wallet_address TEXT PRIMARY KEY,
  referral_code TEXT UNIQUE NOT NULL,
  total_referrals INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  total_vibes_earned NUMERIC DEFAULT 0,
  pending_vibes NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals table (individual referral relationships)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_address TEXT NOT NULL REFERENCES referrers(wallet_address),
  referred_address TEXT NOT NULL,
  referred_name TEXT,
  referral_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  vibes_earned NUMERIC DEFAULT 0,
  referrer_reward NUMERIC DEFAULT 10,
  referred_reward NUMERIC DEFAULT 10,
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referred_address)
);

-- Referral claims table (reward distribution history)
CREATE TABLE IF NOT EXISTS referral_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tx_hash TEXT,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VIBES spending table
CREATE TABLE IF NOT EXISTS vibes_spending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  feature TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tx_hash TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Song requests table (for RequestLine)
CREATE TABLE IF NOT EXISTS song_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  song_title TEXT NOT NULL,
  artist TEXT,
  vibes_staked NUMERIC NOT NULL,
  tx_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'expired', 'refunded')),
  fulfilled_by TEXT,
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  expired_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_address);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_address);
CREATE INDEX IF NOT EXISTS idx_referrers_code ON referrers(referral_code);
CREATE INDEX IF NOT EXISTS idx_vibes_spending_wallet ON vibes_spending(wallet_address);
CREATE INDEX IF NOT EXISTS idx_vibes_spending_feature ON vibes_spending(feature);
CREATE INDEX IF NOT EXISTS idx_song_requests_station ON song_requests(station_id);
CREATE INDEX IF NOT EXISTS idx_song_requests_status ON song_requests(status);

-- RLS Policies
ALTER TABLE referrers ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibes_spending ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_requests ENABLE ROW LEVEL SECURITY;

-- Allow all operations (API handles auth)
CREATE POLICY "Allow all referrers" ON referrers FOR ALL USING (true);
CREATE POLICY "Allow all referrals" ON referrals FOR ALL USING (true);
CREATE POLICY "Allow all claims" ON referral_claims FOR ALL USING (true);
CREATE POLICY "Allow all vibes_spending" ON vibes_spending FOR ALL USING (true);
CREATE POLICY "Allow all song_requests" ON song_requests FOR ALL USING (true);

-- Function to update referrer stats when listening time is recorded
CREATE OR REPLACE FUNCTION update_referral_listening_reward()
RETURNS TRIGGER AS $$
BEGIN
  -- Add listening reward to referrer (0.02 VIBES per hour)
  UPDATE referrers
  SET pending_vibes = pending_vibes + (NEW.listening_hours * 0.02)
  WHERE wallet_address = (
    SELECT referrer_address FROM referrals WHERE referred_address = NEW.wallet_address
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
