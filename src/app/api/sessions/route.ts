import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/sessions - Get sessions list
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get('station_id');
  const walletAddress = searchParams.get('wallet');
  const activeOnly = searchParams.get('active') === 'true';

  try {
    let query = supabase
      .from('sessions')
      .select(`
        id,
        station_id,
        title,
        description,
        dj_address,
        frequency,
        start_time,
        end_time,
        duration_minutes,
        attendee_count,
        max_attendees,
        is_active,
        nft_image_url,
        vibes_reward,
        stations (name)
      `)
      .order('start_time', { ascending: false })
      .limit(20);

    if (stationId) {
      query = query.eq('station_id', stationId);
    }

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json({ sessions: [], user_statuses: {} });
    }

    // Get user statuses if wallet provided
    let userStatuses: Record<string, any> = {};
    if (walletAddress && sessions && sessions.length > 0) {
      const sessionIds = sessions.map(s => s.id);
      const { data: attendances } = await supabase
        .from('session_attendances')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .in('session_id', sessionIds);

      if (attendances) {
        attendances.forEach(a => {
          userStatuses[a.session_id] = {
            session_id: a.session_id,
            joined_at: a.joined_at,
            attendance_minutes: a.attendance_minutes,
            eligible_for_nft: a.eligible_for_nft,
            nft_claimed: a.nft_claimed,
            nft_token_id: a.nft_token_id,
          };
        });
      }
    }

    // Get DJ names
    const enrichedSessions = await Promise.all(
      (sessions || []).map(async (session) => {
        const { data: user } = await supabase
          .from('users')
          .select('farcaster_username')
          .eq('wallet_address', session.dj_address)
          .single();

        // Check if claimable (ended and user attended 10+ mins)
        const userStatus = userStatuses[session.id];
        const isClaimable = !session.is_active && 
          userStatus?.eligible_for_nft && 
          !userStatus?.nft_claimed;

        return {
          ...session,
          station_name: (session.stations as any)?.name || 'Unknown Station',
          dj_name: user?.farcaster_username || null,
          is_claimable: isClaimable,
        };
      })
    );

    return NextResponse.json({
      sessions: enrichedSessions,
      user_statuses: userStatuses,
    });
  } catch (error) {
    console.error('Error in sessions API:', error);
    return NextResponse.json({ sessions: [], user_statuses: {} });
  }
}

// POST /api/sessions - Create a new session (DJ only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      station_id,
      dj_address,
      title,
      description,
      duration_minutes,
      max_attendees,
      vibes_reward,
    } = body;

    if (!station_id || !dj_address || !title) {
      return NextResponse.json(
        { error: 'station_id, dj_address, and title required' },
        { status: 400 }
      );
    }

    // Get station info
    const { data: station } = await supabase
      .from('stations')
      .select('frequency')
      .eq('id', station_id)
      .single();

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        station_id,
        dj_address: dj_address.toLowerCase(),
        title,
        description,
        frequency: station?.frequency || 420.0,
        start_time: new Date().toISOString(),
        duration_minutes: duration_minutes || 60,
        max_attendees,
        vibes_reward: vibes_reward || 100,
        is_active: true,
        attendee_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Error in create session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
