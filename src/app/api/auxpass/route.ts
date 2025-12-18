import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station_id');
    const wallet = searchParams.get('wallet');

    if (!stationId) {
      return NextResponse.json({ error: 'station_id required' }, { status: 400 });
    }

    // Get station info
    const { data: station } = await supabase
      .from('stations')
      .select('id, name, frequency')
      .eq('id', stationId)
      .single();

    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    // Get aux pass state
    const { data: auxPass } = await supabase
      .from('aux_passes')
      .select(`
        *,
        holder:users!aux_passes_current_holder_fkey (
          wallet_address,
          farcaster_username,
          avatar_url
        )
      `)
      .eq('station_id', stationId)
      .single();

    // Get queue
    const { data: queue } = await supabase
      .from('aux_queue')
      .select(`
        position,
        joined_at,
        users (
          wallet_address,
          farcaster_username,
          avatar_url
        )
      `)
      .eq('station_id', stationId)
      .order('position', { ascending: true });

    // Calculate time remaining
    let timeRemaining = 0;
    if (auxPass?.session_start) {
      const sessionStart = new Date(auxPass.session_start).getTime();
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      timeRemaining = Math.max(0, (auxPass.session_duration || 300) - elapsed);
    }

    // Get user vibes balance if wallet provided
    let userVibes = 0;
    if (wallet) {
      const { data: user } = await supabase
        .from('users')
        .select('vibes_balance')
        .eq('wallet_address', wallet.toLowerCase())
        .single();
      userVibes = user?.vibes_balance || 0;
    }

    return NextResponse.json({
      aux_state: {
        station_id: station.id,
        station_name: station.name,
        frequency: station.frequency,
        current_holder: auxPass?.holder ? {
          wallet_address: auxPass.holder.wallet_address,
          display_name: auxPass.holder.farcaster_username,
          avatar_url: auxPass.holder.avatar_url,
          vibes_balance: 0,
        } : null,
        session_start: auxPass?.session_start || null,
        session_duration: auxPass?.session_duration || 300,
        queue: (queue || []).map((q: any, i: number) => ({
          wallet_address: q.users?.wallet_address,
          display_name: q.users?.farcaster_username,
          avatar_url: q.users?.avatar_url,
          position: q.position || i + 1,
          joined_at: q.joined_at,
          vibes_balance: 0,
        })),
        min_vibes_required: auxPass?.min_vibes_required || 100,
        is_active: auxPass?.is_active || false,
        time_remaining: timeRemaining,
      },
      user_vibes: userVibes,
    });
  } catch (error) {
    console.error('Error fetching aux state:', error);
    return NextResponse.json({ error: 'Failed to fetch aux state' }, { status: 500 });
  }
}
