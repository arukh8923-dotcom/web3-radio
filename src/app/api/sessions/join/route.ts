import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// POST /api/sessions/join - Join a session
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const body = await request.json();
    const { session_id, wallet_address } = body;

    if (!session_id || !wallet_address) {
      return NextResponse.json(
        { error: 'session_id and wallet_address required' },
        { status: 400 }
      );
    }

    const normalizedAddress = wallet_address.toLowerCase();

    // Check if session exists and is active
    const { data: session } = await supabase
      .from('sessions')
      .select('id, is_active, max_attendees, attendee_count')
      .eq('id', session_id)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.is_active) {
      return NextResponse.json({ error: 'Session has ended' }, { status: 400 });
    }

    if (session.max_attendees && session.attendee_count >= session.max_attendees) {
      return NextResponse.json({ error: 'Session is full' }, { status: 400 });
    }

    // Check if already joined
    const { data: existing } = await supabase
      .from('session_attendances')
      .select('id')
      .eq('session_id', session_id)
      .eq('wallet_address', normalizedAddress)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already joined' });
    }

    // Create attendance record
    const { error: attendanceError } = await supabase
      .from('session_attendances')
      .insert({
        session_id,
        wallet_address: normalizedAddress,
        joined_at: new Date().toISOString(),
        attendance_minutes: 0,
        eligible_for_nft: false,
        nft_claimed: false,
      });

    if (attendanceError) {
      console.error('Error creating attendance:', attendanceError);
      return NextResponse.json({ error: 'Failed to join session' }, { status: 500 });
    }

    // Increment attendee count
    await supabase
      .from('sessions')
      .update({ attendee_count: session.attendee_count + 1 })
      .eq('id', session_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in join session:', error);
    return NextResponse.json({ error: 'Failed to join session' }, { status: 500 });
  }
}
