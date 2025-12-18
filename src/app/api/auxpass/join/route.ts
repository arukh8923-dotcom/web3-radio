import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  
  try {
    const body = await request.json();
    const { station_id, wallet_address } = body;

    if (!station_id || !wallet_address) {
      return NextResponse.json(
        { success: false, error: 'station_id and wallet_address required' },
        { status: 400 }
      );
    }

    // Check if already in queue
    const { data: existing } = await supabase
      .from('aux_queue')
      .select('id')
      .eq('station_id', station_id)
      .eq('wallet_address', wallet_address.toLowerCase())
      .eq('status', 'waiting')
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Already in queue' },
        { status: 400 }
      );
    }

    // Get user info
    const { data: user } = await supabase
      .from('users')
      .select('farcaster_username, avatar_url, vibes_balance')
      .eq('wallet_address', wallet_address.toLowerCase())
      .single();

    // Check VIBES balance (minimum 100 VIBES to join)
    const minRequired = 100;
    const userVibes = user?.vibes_balance || 0;

    if (userVibes < minRequired) {
      return NextResponse.json(
        { success: false, error: `Need at least ${minRequired} VIBES to join queue` },
        { status: 400 }
      );
    }

    // Get current queue position
    const { count } = await supabase
      .from('aux_queue')
      .select('*', { count: 'exact', head: true })
      .eq('station_id', station_id)
      .eq('status', 'waiting');

    const position = (count || 0) + 1;

    // Add to queue
    const { data: queueEntry, error } = await supabase
      .from('aux_queue')
      .insert({
        station_id,
        wallet_address: wallet_address.toLowerCase(),
        display_name: user?.farcaster_username || null,
        avatar_url: user?.avatar_url || null,
        position,
        status: 'waiting',
        vibes_balance: userVibes,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to join queue:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to join queue' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      position,
      message: `Joined queue at position #${position}`,
      queue_id: queueEntry.id,
    });
  } catch (error) {
    console.error('Error joining aux queue:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to join queue' },
      { status: 500 }
    );
  }
}
