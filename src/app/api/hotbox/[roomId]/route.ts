import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// GET /api/hotbox/[roomId] - Get room details, members, and chat
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const supabase = createServerSupabase();
  const { roomId } = await params;
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('wallet');

  try {
    // Get room info
    const { data: room } = await supabase
      .from('hotbox_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Get members
    const { data: members } = await supabase
      .from('hotbox_members')
      .select('wallet_address, is_creator, joined_at')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });

    // Enrich members with user info
    const enrichedMembers = await Promise.all(
      (members || []).map(async (member) => {
        const { data: user } = await supabase
          .from('users')
          .select('farcaster_username, avatar_url')
          .eq('wallet_address', member.wallet_address)
          .single();

        return {
          ...member,
          display_name: user?.farcaster_username || null,
          avatar_url: user?.avatar_url || null,
        };
      })
    );

    // Get recent chat messages
    const { data: chat } = await supabase
      .from('hotbox_chat')
      .select('id, sender_address, sender_name, message, created_at')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100);

    // Check if user is a member
    let isMember = false;
    if (walletAddress) {
      const member = enrichedMembers.find(
        m => m.wallet_address === walletAddress.toLowerCase()
      );
      isMember = !!member;
    }

    return NextResponse.json({
      room,
      members: enrichedMembers,
      chat: chat || [],
      is_member: isMember,
    });
  } catch (error) {
    console.error('Error fetching room details:', error);
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}
