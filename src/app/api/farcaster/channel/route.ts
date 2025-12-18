import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

interface Channel {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  follower_count: number;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station_id');

    if (!stationId) {
      return NextResponse.json({ error: 'station_id required' }, { status: 400 });
    }

    // Get station info to build channel data
    const { data: station } = await supabase
      .from('stations')
      .select('id, name, description, image_url, listener_count, created_at')
      .eq('id', stationId)
      .single();

    if (!station) {
      return NextResponse.json({ channel: null });
    }

    const channel: Channel = {
      id: `web3radio-${station.id}`,
      name: `${station.name} Community`,
      description: station.description || `The official channel for ${station.name} listeners.`,
      image_url: station.image_url,
      follower_count: station.listener_count || 0,
      created_at: station.created_at,
    };

    return NextResponse.json({ channel });
  } catch (error) {
    console.error('Error fetching channel:', error);
    return NextResponse.json({ channel: null });
  }
}

// Create a new channel for a station
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { station_id, name, description, wallet_address } = body;

    if (!station_id || !name || !wallet_address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production: 
    // 1. Verify wallet owns the station
    // 2. Create channel via Neynar API
    // 3. Store channel-station mapping

    const channelId = `web3radio-${station_id}`;

    return NextResponse.json({
      success: true,
      channel: {
        id: channelId,
        name,
        description,
        image_url: null,
        follower_count: 0,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating channel:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create channel' },
      { status: 500 }
    );
  }
}
