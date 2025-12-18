import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station_id');

    if (!stationId) {
      return NextResponse.json({ error: 'station_id required' }, { status: 400 });
    }

    // Get station token from database
    const { data: stationToken } = await supabase
      .from('station_tokens')
      .select('*')
      .eq('station_id', stationId)
      .single();

    if (!stationToken) {
      return NextResponse.json({ token: null, holders: [] });
    }

    // Get top holders
    const { data: holders } = await supabase
      .from('token_holders')
      .select(`
        wallet_address,
        balance,
        percentage,
        users (farcaster_username)
      `)
      .eq('token_address', stationToken.address)
      .order('balance', { ascending: false })
      .limit(10);

    return NextResponse.json({
      token: {
        address: stationToken.address,
        symbol: stationToken.symbol,
        name: stationToken.name,
        total_supply: stationToken.total_supply,
        holder_count: stationToken.holder_count || 0,
        price_usd: stationToken.price_usd || 0,
        market_cap: stationToken.market_cap || 0,
        liquidity: stationToken.liquidity || 0,
        created_at: stationToken.created_at,
        clanker_url: stationToken.clanker_url,
      },
      holders: (holders || []).map((h: any) => ({
        wallet_address: h.wallet_address,
        display_name: h.users?.farcaster_username || null,
        balance: h.balance,
        percentage: h.percentage,
      })),
    });
  } catch (error) {
    console.error('Error fetching token:', error);
    return NextResponse.json({ token: null, holders: [] });
  }
}
