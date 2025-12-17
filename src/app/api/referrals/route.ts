import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Generate referral code from wallet address
function generateReferralCode(address: string): string {
  return `W3R-${address.slice(2, 6).toUpperCase()}${address.slice(-4).toUpperCase()}`;
}

// GET /api/referrals - Get referral stats and list
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('wallet');

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
  }

  const normalizedAddress = walletAddress.toLowerCase();
  const referralCode = generateReferralCode(walletAddress);

  try {
    // Get or create referral record
    let { data: referralRecord } = await supabase
      .from('user_referrals')
      .select('*')
      .eq('wallet_address', normalizedAddress)
      .single();

    if (!referralRecord) {
      // Create new referral record
      const { data: newRecord } = await supabase
        .from('user_referrals')
        .insert({
          wallet_address: normalizedAddress,
          referral_code: referralCode,
          total_referrals: 0,
          active_referrals: 0,
          total_vibes_earned: 0,
          pending_vibes: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      referralRecord = newRecord;
    }

    // Get referrals list
    const { data: referrals } = await supabase
      .from('referral_relationships')
      .select(`
        id,
        referred_address,
        joined_at,
        is_active,
        vibes_earned
      `)
      .eq('referrer_address', normalizedAddress)
      .order('joined_at', { ascending: false });

    // Enrich with user names
    const enrichedReferrals = await Promise.all(
      (referrals || []).map(async (ref) => {
        const { data: user } = await supabase
          .from('users')
          .select('farcaster_username')
          .eq('wallet_address', ref.referred_address)
          .single();

        return {
          ...ref,
          referred_name: user?.farcaster_username || null,
        };
      })
    );

    // Check if user has a referrer
    const { data: referrerCheck } = await supabase
      .from('referral_relationships')
      .select('referrer_address')
      .eq('referred_address', normalizedAddress)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://web3radio.app';

    return NextResponse.json({
      stats: {
        referral_code: referralCode,
        total_referrals: referralRecord?.total_referrals || 0,
        active_referrals: referralRecord?.active_referrals || 0,
        total_vibes_earned: referralRecord?.total_vibes_earned || 0,
        pending_vibes: referralRecord?.pending_vibes || 0,
        referral_link: `${baseUrl}?ref=${referralCode}`,
      },
      referrals: enrichedReferrals,
      has_referrer: !!referrerCheck,
    });
  } catch (error) {
    console.error('Error in referrals API:', error);
    // Return placeholder data
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://web3radio.app';
    return NextResponse.json({
      stats: {
        referral_code: referralCode,
        total_referrals: 0,
        active_referrals: 0,
        total_vibes_earned: 0,
        pending_vibes: 0,
        referral_link: `${baseUrl}?ref=${referralCode}`,
      },
      referrals: [],
      has_referrer: false,
    });
  }
}

// POST /api/referrals - Create referral record (called on signup)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address, referral_code } = body;

    if (!wallet_address) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const normalizedAddress = wallet_address.toLowerCase();
    const userReferralCode = generateReferralCode(wallet_address);

    // Create or update referral record
    const { error } = await supabase
      .from('user_referrals')
      .upsert({
        wallet_address: normalizedAddress,
        referral_code: userReferralCode,
        total_referrals: 0,
        active_referrals: 0,
        total_vibes_earned: 0,
        pending_vibes: 0,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'wallet_address',
      });

    if (error) {
      console.error('Error creating referral record:', error);
    }

    // If referral code provided, create relationship
    if (referral_code) {
      // Find referrer by code
      const { data: referrer } = await supabase
        .from('user_referrals')
        .select('wallet_address')
        .eq('referral_code', referral_code.toUpperCase())
        .single();

      if (referrer && referrer.wallet_address !== normalizedAddress) {
        // Create relationship
        await supabase
          .from('referral_relationships')
          .insert({
            referrer_address: referrer.wallet_address,
            referred_address: normalizedAddress,
            joined_at: new Date().toISOString(),
            is_active: true,
            vibes_earned: 0,
          });

        // Update referrer stats
        await supabase.rpc('increment_referral_count', {
          referrer_wallet: referrer.wallet_address,
        });

        // Award signup bonus (placeholder - on-chain pending)
        // Both referrer and referred get 50 VIBES
      }
    }

    return NextResponse.json({ 
      success: true,
      referral_code: userReferralCode,
    });
  } catch (error) {
    console.error('Error in create referral:', error);
    return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 });
  }
}
