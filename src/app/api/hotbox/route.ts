import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { CONTRACTS } from '@/constants/addresses';

// GET /api/hotbox - Get hotbox rooms list
export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get('station_id');
  const walletAddress = searchParams.get('wallet');

  try {
    let query = supabase
      .from('hotbox_rooms')
      .select('*, stations(name, frequency)')
      .eq('is_active', true)
      .order('member_count', { ascending: false });

    if (stationId) {
      query = query.eq('station_id', stationId);
    }

    const { data: rooms, error } = await query;

    if (error) {
      console.error('Error fetching rooms:', error);
      return NextResponse.json({ rooms: [], user_balance: 0 });
    }

    // Get user VIBES balance if wallet provided
    let userBalance = 0;
    if (walletAddress) {
      const { data: user } = await supabase
        .from('users')
        .select('vibes_balance')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();
      userBalance = user?.vibes_balance || 0;
    }

    // Enrich with creator names
    const enrichedRooms = await Promise.all(
      (rooms || []).map(async (room) => {
        const { data: creator } = await supabase
          .from('users')
          .select('farcaster_username')
          .eq('wallet_address', room.creator_address)
          .single();

        return {
          ...room,
          station_name: (room.stations as any)?.name || 'Unknown',
          frequency: (room.stations as any)?.frequency || 420.0,
          creator_name: creator?.farcaster_username || null,
          token_gate_symbol: 'VIBES', // Placeholder
        };
      })
    );

    return NextResponse.json({ rooms: enrichedRooms, user_balance: userBalance });
  } catch (error) {
    console.error('Error in hotbox API:', error);
    return NextResponse.json({ rooms: [], user_balance: 0 });
  }
}

// POST /api/hotbox - Create a new hotbox room
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const body = await request.json();
    const { name, description, station_id, creator_address, min_balance, max_members, is_private } = body;

    if (!name || !creator_address) {
      return NextResponse.json({ error: 'name and creator_address required' }, { status: 400 });
    }

    const { data: room, error } = await supabase
      .from('hotbox_rooms')
      .insert({
        name,
        description,
        station_id,
        creator_address: creator_address.toLowerCase(),
        token_gate_address: CONTRACTS.VIBES_TOKEN, // Default to VIBES token
        min_balance: min_balance || 0,
        max_members,
        is_private: is_private || false,
        is_active: true,
        member_count: 1,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }

    // Add creator as first member
    await supabase.from('hotbox_members').insert({
      room_id: room.id,
      wallet_address: creator_address.toLowerCase(),
      is_creator: true,
      joined_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, room });
  } catch (error) {
    console.error('Error in create room:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
