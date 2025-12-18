import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// Generate referral code from wallet address
function generateReferralCode(address: string): string {
  return `W3R-${address.slice(2, 6).toUpperCase()}${address.slice(-4).toUpperCase()}`;
}

// GET - Get referral stats and list
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Missing wallet address' }, { status: 400 });
    }

    const walletLower = wallet.toLowerCase();
    const referralCode = generateReferralCode(wallet);

    // Get or create referral record
    let { data: referrer } = await supabase
      .from('referrers')
      .select('*')
      .eq('wallet_address', walletLower)
      .single();

    if (!referrer) {
      // Create new referrer record
      const { data: newReferrer } = await supabase
        .from('referrers')
        .insert({
          wallet_address: walletLower,
          referral_code: referralCode,
          total_referrals: 0,
          active_referrals: 0,
          total_vibes_earned: 0,
          pending_vibes: 0,
        })
        .select()
        .single();
      referrer = newReferrer;
    }

    // Get referrals list
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_address', walletLower)
      .order('created_at', { ascending: false });

    // Check if user has a referrer
    const { data: userReferral } = await supabase
      .from('referrals')
      .select('referrer_address')
      .eq('referred_address', walletLower)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://web3radio.xyz';

    return NextResponse.json({
      stats: {
        referral_code: referralCode,
        total_referrals: referrer?.total_referrals || 0,
        active_referrals: referrer?.active_referrals || 0,
        total_vibes_earned: referrer?.total_vibes_earned || 0,
        pending_vibes: referrer?.pending_vibes || 0,
        referral_link: `${baseUrl}?ref=${referralCode}`,
      },
      referrals: referrals?.map((r) => ({
        id: r.id,
        referred_address: r.referred_address,
        referred_name: r.referred_name,
        joined_at: r.created_at,
        is_active: r.is_active,
        vibes_earned: r.vibes_earned || 0,
      })) || [],
      has_referrer: !!userReferral,
    });
  } catch (error) {
    console.error('Error in GET /api/referrals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
