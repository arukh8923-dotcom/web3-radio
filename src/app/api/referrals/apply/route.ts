import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/referrals/apply - Apply a referral code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address, referral_code } = body;

    if (!wallet_address || !referral_code) {
      return NextResponse.json(
        { error: 'Wallet address and referral code required' },
        { status: 400 }
      );
    }

    const normalizedAddress = wallet_address.toLowerCase();
    const normalizedCode = referral_code.toUpperCase().trim();

    // Check if user already has a referrer
    const { data: existingRelation } = await supabase
      .from('referral_relationships')
      .select('id')
      .eq('referred_address', normalizedAddress)
      .single();

    if (existingRelation) {
      return NextResponse.json(
        { success: false, error: 'You already have a referrer' },
        { status: 400 }
      );
    }

    // Find referrer by code
    const { data: referrer } = await supabase
      .from('user_referrals')
      .select('wallet_address')
      .eq('referral_code', normalizedCode)
      .single();

    if (!referrer) {
      return NextResponse.json(
        { success: false, error: 'Invalid referral code' },
        { status: 400 }
      );
    }

    // Can't refer yourself
    if (referrer.wallet_address === normalizedAddress) {
      return NextResponse.json(
        { success: false, error: 'Cannot use your own referral code' },
        { status: 400 }
      );
    }

    // Create relationship
    const { error: relationError } = await supabase
      .from('referral_relationships')
      .insert({
        referrer_address: referrer.wallet_address,
        referred_address: normalizedAddress,
        joined_at: new Date().toISOString(),
        is_active: true,
        vibes_earned: 0,
      });

    if (relationError) {
      console.error('Error creating relationship:', relationError);
      return NextResponse.json(
        { success: false, error: 'Failed to apply referral code' },
        { status: 500 }
      );
    }

    // Update referrer stats
    await supabase
      .from('user_referrals')
      .update({
        total_referrals: supabase.rpc('increment', { x: 1 }),
        active_referrals: supabase.rpc('increment', { x: 1 }),
        pending_vibes: supabase.rpc('increment', { x: 50 }), // Signup bonus
      })
      .eq('wallet_address', referrer.wallet_address);

    // TODO: Award VIBES tokens on-chain
    // For now, just track in database
    // Both referrer and referred should get 50 VIBES

    return NextResponse.json({
      success: true,
      message: 'Referral code applied successfully! Rewards will be distributed when $VIBES launches.',
      referrer_address: referrer.wallet_address,
    });
  } catch (error) {
    console.error('Error applying referral code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to apply referral code' },
      { status: 500 }
    );
  }
}
