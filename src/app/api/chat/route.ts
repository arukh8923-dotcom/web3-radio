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

// Fetch Farcaster profile by wallet address
async function fetchFarcasterProfile(walletAddress: string) {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${walletAddress}`,
      {
        headers: { accept: 'application/json', api_key: apiKey },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );
    
    if (!res.ok) return null;
    
    const data = await res.json();
    const users = data[walletAddress.toLowerCase()];
    if (users && users.length > 0) {
      const user = users[0];
      return {
        farcaster_username: user.username,
        farcaster_fid: user.fid,
        avatar_url: user.pfp_url,
      };
    }
  } catch (error) {
    console.error('Failed to fetch Farcaster profile:', error);
  }
  return null;
}

// POST /api/chat - Send chat message
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const body = await request.json();
  const { station_id, message } = body;
  // Normalize wallet address to lowercase to prevent duplicates
  const wallet_address = body.wallet_address?.toLowerCase();

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
    .select('id, farcaster_username, avatar_url')
    .eq('wallet_address', wallet_address)
    .single();

  let userId = user?.id;
  
  // If user exists but missing Farcaster data, try to fetch it
  if (userId && !user?.farcaster_username) {
    const fcProfile = await fetchFarcasterProfile(wallet_address);
    if (fcProfile) {
      await supabase
        .from('users')
        .update(fcProfile)
        .eq('id', userId);
    }
  }
  
  // Create new user if doesn't exist
  if (!userId) {
    // Try to get Farcaster profile for new user
    const fcProfile = await fetchFarcasterProfile(wallet_address);
    
    const { data: newUser } = await supabase
      .from('users')
      .insert({ 
        wallet_address,
        ...fcProfile,
      })
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
