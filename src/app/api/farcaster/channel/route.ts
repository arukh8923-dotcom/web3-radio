import { NextRequest, NextResponse } from 'next/server';

// Mock channel data - will integrate with Neynar API
interface Channel {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  follower_count: number;
  created_at: string;
}

const mockChannels: Record<string, Channel> = {
  'station-420': {
    id: 'web3radio-420',
    name: '420 FM Community',
    description: 'The official channel for 420 FM listeners. Share vibes, discuss tracks, and connect with fellow listeners.',
    image_url: null,
    follower_count: 420,
    created_at: '2024-01-01T00:00:00Z',
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station_id');

    if (!stationId) {
      return NextResponse.json({ error: 'station_id required' }, { status: 400 });
    }

    // In production: Look up channel from database or Neynar
    const channel = mockChannels[stationId] || null;

    return NextResponse.json({ channel });
  } catch (error) {
    console.error('Error fetching channel:', error);
    return NextResponse.json({ error: 'Failed to fetch channel' }, { status: 500 });
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
