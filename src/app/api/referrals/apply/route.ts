import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// Referral reward in VIBES (will be distributed when claimed)
const REFERRAL_REWARD_VIBES = 10; // Both referrer and referred get this

// POST - Apply referral code
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const body = await request.json();
    const { wallet_address, referral_code } = body;

    if (!wallet_address || !referral_code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const walletLower = wallet_address.toLowerCase();
    const codeUpper = referral_code.toUpperCase();

    // Check if user already has a referrer
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_address', walletLower)
      .single();

    if (existingReferral) {
      return NextResponse.json({ success: false, error: 'You already have a referrer' });
    }

    // Find referrer by code
    const { data: referrer } = await supabase
      .from('referrers')
      .select('*')
      .eq('referral_code', codeUpper)
      .single();

    if (!referrer) {
      return NextResponse.json({ success: false, error: 'Invalid referral code' });
    }

    // Can't refer yourself
    if (referrer.wallet_address === walletLower) {
      return NextResponse.json({ success: false, error: 'Cannot use your own referral code' });
    }

    // Get user info if available
    const { data: userData } = await supabase
      .from('users')
      .select('base_name, farcaster_username')
      .eq('wallet_address', walletLower)
      .single();

    const referredName = userData?.base_name || userData?.farcaster_username || null;

    // Create referral record
    const { error: insertError } = await supabase.from('referrals').insert({
      referrer_address: referrer.wallet_address,
      referred_address: walletLower,
      referred_name: referredName,
      referral_code: codeUpper,
      is_active: true,
      vibes_earned: 0,
      referrer_reward: REFERRAL_REWARD_VIBES,
      referred_reward: REFERRAL_REWARD_VIBES,
      reward_claimed: false,
    });

    if (insertError) {
      console.error('Error creating referral:', insertError);
      return NextResponse.json({ success: false, error: 'Failed to apply referral' });
    }

    // Update referrer stats
    await supabase
      .from('referrers')
      .update({
        total_referrals: (referrer.total_referrals || 0) + 1,
        active_referrals: (referrer.active_referrals || 0) + 1,
        pending_vibes: (referrer.pending_vibes || 0) + REFERRAL_REWARD_VIBES,
      })
      .eq('wallet_address', referrer.wallet_address);

    return NextResponse.json({
      success: true,
      message: `Referral applied! You and your referrer will each receive ${REFERRAL_REWARD_VIBES} VIBES.`,
      reward: REFERRAL_REWARD_VIBES,
    });
  } catch (error) {
    console.error('Error in POST /api/referrals/apply:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
