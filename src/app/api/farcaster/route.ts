import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// GET /api/farcaster?address=0x... - Get Farcaster profile by wallet address
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }

  try {
    // First check if we have cached data in our database
    const supabase = createServerSupabase();
    const { data: cachedUser } = await supabase
      .from('users')
      .select('farcaster_fid, farcaster_username, avatar_url')
      .eq('wallet_address', address.toLowerCase())
      .single();

    if (cachedUser?.farcaster_username) {
      return NextResponse.json({
        fid: cachedUser.farcaster_fid,
        username: cachedUser.farcaster_username,
        pfp: cachedUser.avatar_url,
        cached: true,
      });
    }

    // Fetch from Neynar API (free tier)
    const neynarRes = await fetch(
      `https://api.neynar.com/v2/farcaster/user/by_verification?address=${address}`,
      {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY || 'NEYNAR_API_DOCS',
        },
      }
    );

    if (!neynarRes.ok) {
      // No Farcaster account found for this address
      return NextResponse.json({ fid: null, username: null, pfp: null });
    }

    const neynarData = await neynarRes.json();
    const user = neynarData.user;

    if (!user) {
      return NextResponse.json({ fid: null, username: null, pfp: null });
    }

    // Cache the result in our database
    await supabase
      .from('users')
      .upsert({
        wallet_address: address.toLowerCase(),
        farcaster_fid: user.fid,
        farcaster_username: user.username,
        avatar_url: user.pfp_url,
        last_active: new Date().toISOString(),
      }, {
        onConflict: 'wallet_address',
      });

    return NextResponse.json({
      fid: user.fid,
      username: user.username,
      pfp: user.pfp_url,
      displayName: user.display_name,
    });
  } catch (error) {
    console.error('Farcaster API error:', error);
    return NextResponse.json({ fid: null, username: null, pfp: null });
  }
}
