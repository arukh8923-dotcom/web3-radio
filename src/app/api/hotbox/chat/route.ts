import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/hotbox/chat - Send a chat message in hotbox room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room_id, wallet_address, message } = body;

    if (!room_id || !wallet_address || !message) {
      return NextResponse.json({ error: 'room_id, wallet_address, and message required' }, { status: 400 });
    }

    const normalizedAddress = wallet_address.toLowerCase();

    // Verify user is a member
    const { data: member } = await supabase
      .from('hotbox_members')
      .select('id')
      .eq('room_id', room_id)
      .eq('wallet_address', normalizedAddress)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Not a member of this room' }, { status: 403 });
    }

    // Get user info
    const { data: user } = await supabase
      .from('users')
      .select('farcaster_username')
      .eq('wallet_address', normalizedAddress)
      .single();

    // Insert message
    const { data: chatMessage, error } = await supabase
      .from('hotbox_chat')
      .insert({
        room_id,
        sender_address: normalizedAddress,
        sender_name: user?.farcaster_username || null,
        message: message.trim().slice(0, 500), // Limit message length
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: chatMessage });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
