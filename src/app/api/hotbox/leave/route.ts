import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/hotbox/leave - Leave a hotbox room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room_id, wallet_address } = body;

    if (!room_id || !wallet_address) {
      return NextResponse.json({ error: 'room_id and wallet_address required' }, { status: 400 });
    }

    const normalizedAddress = wallet_address.toLowerCase();

    // Remove member
    const { error } = await supabase
      .from('hotbox_members')
      .delete()
      .eq('room_id', room_id)
      .eq('wallet_address', normalizedAddress);

    if (error) {
      console.error('Error removing member:', error);
    }

    // Update member count
    const { data: room } = await supabase
      .from('hotbox_rooms')
      .select('member_count')
      .eq('id', room_id)
      .single();

    if (room) {
      await supabase
        .from('hotbox_rooms')
        .update({ member_count: Math.max(0, room.member_count - 1) })
        .eq('id', room_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in leave room:', error);
    return NextResponse.json({ error: 'Failed to leave room' }, { status: 500 });
  }
}
