import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// GET /api/leaderboard/djs - Get DJ leaderboard
export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'weekly';
  const genre = searchParams.get('genre');
  const limit = parseInt(searchParams.get('limit') || '20');

  // Calculate date range based on period
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'daily':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'alltime':
    default:
      startDate = new Date('2024-01-01');
  }

  try {
    // Get stations with their owners
    let stationsQuery = supabase
      .from('stations')
      .select(`
        id,
        owner_address,
        name,
        category,
        listener_count,
        is_live
      `);

    if (genre && genre !== 'all') {
      stationsQuery = stationsQuery.eq('category', genre);
    }

    const { data: stations, error: stationsError } = await stationsQuery;

    if (stationsError) {
      console.error('Stations query error:', stationsError);
      return NextResponse.json({ djs: [] });
    }

    // Get tips aggregated by DJ
    const { data: tips } = await supabase
      .from('tips')
      .select('dj_address, amount')
      .gte('created_at', startDate.toISOString());

    // Get broadcasts count
    const { data: broadcasts } = await supabase
      .from('broadcasts')
      .select('station_id')
      .gte('created_at', startDate.toISOString());

    // Get user info
    const ownerAddresses = [...new Set(stations?.map(s => s.owner_address?.toLowerCase()).filter(Boolean))];
    
    const { data: users } = await supabase
      .from('users')
      .select('wallet_address, farcaster_username, avatar_url')
      .in('wallet_address', ownerAddresses);

    // Aggregate stats by DJ
    const djStatsMap = new Map<string, {
      wallet_address: string;
      station_count: number;
      total_listeners: number;
      total_tips: number;
      total_broadcasts: number;
      genre: string | null;
      farcaster_username: string | null;
      avatar_url: string | null;
    }>();

    // Process stations
    stations?.forEach(station => {
      const ownerAddr = station.owner_address?.toLowerCase();
      if (!ownerAddr) return;

      const existing = djStatsMap.get(ownerAddr) || {
        wallet_address: ownerAddr,
        station_count: 0,
        total_listeners: 0,
        total_tips: 0,
        total_broadcasts: 0,
        genre: null,
        farcaster_username: null,
        avatar_url: null,
      };

      existing.station_count += 1;
      existing.total_listeners += station.listener_count || 0;
      existing.genre = existing.genre || station.category;

      djStatsMap.set(ownerAddr, existing);
    });

    // Add tips
    tips?.forEach(tip => {
      const djAddr = tip.dj_address?.toLowerCase();
      if (!djAddr) return;

      const existing = djStatsMap.get(djAddr);
      if (existing) {
        existing.total_tips += parseFloat(tip.amount) || 0;
      }
    });

    // Add broadcasts
    const stationOwnerMap = new Map(stations?.map(s => [s.id, s.owner_address?.toLowerCase()]));
    broadcasts?.forEach(broadcast => {
      const ownerAddr = stationOwnerMap.get(broadcast.station_id);
      if (!ownerAddr) return;

      const existing = djStatsMap.get(ownerAddr);
      if (existing) {
        existing.total_broadcasts += 1;
      }
    });

    // Add user info
    users?.forEach(user => {
      const existing = djStatsMap.get(user.wallet_address?.toLowerCase());
      if (existing) {
        existing.farcaster_username = user.farcaster_username;
        existing.avatar_url = user.avatar_url;
      }
    });

    // Convert to array and sort by total_listeners
    const djsArray = Array.from(djStatsMap.values())
      .sort((a, b) => b.total_listeners - a.total_listeners)
      .slice(0, limit)
      .map((dj, index) => ({
        id: dj.wallet_address,
        ...dj,
        rank: index + 1,
        rank_change: Math.floor(Math.random() * 5) - 2, // Placeholder for actual rank tracking
      }));

    return NextResponse.json({ 
      djs: djsArray,
      period,
      genre: genre || 'all',
      total: djsArray.length,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ djs: [], error: 'Failed to load leaderboard' });
  }
}
