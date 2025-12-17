-- Subscriptions table for Web3 Radio
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id UUID REFERENCES stations(id) ON DELETE SET NULL,
  station_name TEXT NOT NULL,
  station_address TEXT,
  tier_id TEXT NOT NULL,
  tier_name TEXT NOT NULL,
  subscriber_address TEXT NOT NULL,
  price TEXT DEFAULT '0',
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  auto_renew BOOLEAN DEFAULT FALSE,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber ON subscriptions(subscriber_address);
CREATE INDEX IF NOT EXISTS idx_subscriptions_station ON subscriptions(station_name);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expiry ON subscriptions(expiry_date);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read subscriptions" ON subscriptions
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
  FOR UPDATE USING (true);

-- Function to auto-expire subscriptions
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'active' AND expiry_date < NOW();
END;
$$ LANGUAGE plpgsql;
