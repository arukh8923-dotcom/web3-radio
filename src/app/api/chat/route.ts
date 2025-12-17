import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// GET /api/chat - Get chat messages for station
export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const station_id = searchParams.get('station_id');
  const limit = parseInt(searchParams.get('limit') || '50');

  if (!station_id) {
    return NextResponse.json({ error: 'station_id required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('live_chat')
    .select('*, users(wallet_address, farcaster_username, avatar_url)')
    .eq('station_id', station_id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Reverse to show oldest first
  return NextResponse.json({ messages: data?.reverse() || [] });
}

// POST /api/chat - Send chat message
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const body = await request.json();
  const { station_id, wallet_address, message } = body;

  if (!station_id || !wallet_address || !message) {
    return NextResponse.json(
      { error: 'station_id, wallet_address, and message required' },
      { status: 400 }
    );
  }

  if (message.length > 280) {
    return NextResponse.json(
      { error: 'Message too long (max 280 characters)' },
      { status: 400 }
    );
  }

  // Get or create user
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('wallet_address', wallet_address)
    .single();

  let userId = user?.id;
  if (!userId) {
    const { data: newUser } = await supabase
      .from('users')
      .insert({ wallet_address })
      .select('id')
      .single();
    userId = newUser?.id;
  }

  const { data, error } = await supabase
    .from('live_chat')
    .insert({
      station_id,
      user_id: userId,
      message,
    })
    .select('*, users(wallet_address, farcaster_username, avatar_url)')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: data }, { status: 201 });
}
