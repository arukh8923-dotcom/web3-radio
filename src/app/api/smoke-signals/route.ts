import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// GET /api/smoke-signals - Get active smoke signals for station
export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const station_id = searchParams.get('station_id');

  if (!station_id) {
    return NextResponse.json({ error: 'station_id required' }, { status: 400 });
  }

  // Get only non-expired signals
  const { data, error } = await supabase
    .from('smoke_signals')
    .select('*')
    .eq('station_id', station_id)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch user info for each signal
  const signalsWithUsers = await Promise.all(
    (data || []).map(async (signal) => {
      const { data: user } = await supabase
        .from('users')
        .select('wallet_address, farcaster_username, avatar_url')
        .eq('wallet_address', signal.sender_address.toLowerCase())
        .single();
      return { ...signal, users: user };
    })
  );

  return NextResponse.json({ signals: signalsWithUsers });
}

// POST /api/smoke-signals - Send smoke signal (ephemeral message)
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const body = await request.json();
  const { station_id, sender_address, message, duration_minutes = 5 } = body;

  if (!station_id || !sender_address || !message) {
    return NextResponse.json(
      { error: 'station_id, sender_address, and message required' },
      { status: 400 }
    );
  }

  if (message.length > 140) {
    return NextResponse.json(
      { error: 'Smoke signal too long (max 140 characters)' },
      { status: 400 }
    );
  }

  // Calculate vibes cost (1 VIBES per minute)
  const vibes_cost = duration_minutes.toString();

  // Calculate expiry
  const expires_at = new Date(Date.now() + duration_minutes * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('smoke_signals')
    .insert({
      station_id,
      sender_address,
      message,
      vibes_cost,
      expires_at,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ signal: data }, { status: 201 });
}
