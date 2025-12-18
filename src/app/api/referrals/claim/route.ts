import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Claim referral rewards (distributes VIBES)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address } = body;

    if (!wallet_address) {
      return NextResponse.json({ error: 'Missing wallet address' }, { status: 400 });
    }

    const walletLower = wallet_address.toLowerCase();

    // Get referrer record
    const { data: referrer } = await supabase
      .from('referrers')
      .select('*')
      .eq('wallet_address', walletLower)
      .single();

    if (!referrer) {
      return NextResponse.json({ error: 'No referral account found' }, { status: 404 });
    }

    const pendingVibes = referrer.pending_vibes || 0;

    if (pendingVibes <= 0) {
      return NextResponse.json({ success: false, error: 'No pending rewards to claim' });
    }

    // In production, this would:
    // 1. Call a smart contract to transfer VIBES from treasury to user
    // 2. Or use a backend wallet to send VIBES
    // For now, we just update the database

    // Mark rewards as claimed
    const { error: updateError } = await supabase
      .from('referrers')
      .update({
        total_vibes_earned: (referrer.total_vibes_earned || 0) + pendingVibes,
        pending_vibes: 0,
      })
      .eq('wallet_address', walletLower);

    if (updateError) {
      console.error('Error claiming rewards:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to claim rewards' });
    }

    // Mark individual referrals as claimed
    await supabase
      .from('referrals')
      .update({ reward_claimed: true })
      .eq('referrer_address', walletLower)
      .eq('reward_claimed', false);

    // Record claim transaction
    await supabase.from('referral_claims').insert({
      wallet_address: walletLower,
      amount: pendingVibes,
      claimed_at: new Date().toISOString(),
      // tx_hash would be added after actual on-chain transfer
    });

    return NextResponse.json({
      success: true,
      claimed: pendingVibes,
      message: `Successfully claimed ${pendingVibes} VIBES!`,
      // In production: tx_hash: '0x...'
    });
  } catch (error) {
    console.error('Error in POST /api/referrals/claim:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
