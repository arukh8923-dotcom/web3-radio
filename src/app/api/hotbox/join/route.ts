import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// POST /api/hotbox/join - Join a hotbox room
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const body = await request.json();
    const { room_id, wallet_address } = body;

    if (!room_id || !wallet_address) {
      return NextResponse.json({ error: 'room_id and wallet_address required' }, { status: 400 });
    }

    const normalizedAddress = wallet_address.toLowerCase();

    // Get room info
    const { data: room } = await supabase
      .from('hotbox_rooms')
      .select('*')
      .eq('id', room_id)
      .single();

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (!room.is_active) {
      return NextResponse.json({ error: 'Room is closed' }, { status: 400 });
    }

    if (room.max_members && room.member_count >= room.max_members) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    // Check token balance (placeholder - check VIBES balance)
    const { data: user } = await supabase
      .from('users')
      .select('vibes_balance')
      .eq('wallet_address', normalizedAddress)
      .single();

    const userBalance = user?.vibes_balance || 0;
    if (room.min_balance > 0 && userBalance < room.min_balance) {
      return NextResponse.json({ 
        success: false, 
        error: `Need ${room.min_balance} VIBES to enter (you have ${userBalance})` 
      }, { status: 400 });
    }

    // Check if already member
    const { data: existing } = await supabase
      .from('hotbox_members')
      .select('id')
      .eq('room_id', room_id)
      .eq('wallet_address', normalizedAddress)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already a member' });
    }

    // Add member
    const { error: memberError } = await supabase
      .from('hotbox_members')
      .insert({
        room_id,
        wallet_address: normalizedAddress,
        is_creator: false,
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      console.error('Error adding member:', memberError);
      return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
    }

    // Update member count
    await supabase
      .from('hotbox_rooms')
      .update({ member_count: room.member_count + 1 })
      .eq('id', room_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in join room:', error);
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
  }
}
