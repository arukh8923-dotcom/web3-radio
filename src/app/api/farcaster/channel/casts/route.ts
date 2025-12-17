import { NextRequest, NextResponse } from 'next/server';

// Mock casts data - will integrate with Neynar API
interface Cast {
  hash: string;
  author: {
    fid: number;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  text: string;
  timestamp: string;
  reactions: {
    likes: number;
    recasts: number;
  };
  replies: number;
}

const mockCasts: Cast[] = [
  {
    hash: '0xabc123',
    author: {
      fid: 1234,
      username: 'vibesmaster',
      display_name: 'Vibes Master 🎵',
      avatar_url: null,
    },
    text: '🔥 This set is incredible! Love the vibes on 420 FM right now',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    reactions: { likes: 12, recasts: 3 },
    replies: 2,
  },
  {
    hash: '0xdef456',
    author: {
      fid: 5678,
      username: 'djchill',
      display_name: 'DJ Chill',
      avatar_url: null,
    },
    text: 'Going live in 10 minutes! Tune in to 420 FM for some chill beats 📻',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    reactions: { likes: 45, recasts: 8 },
    replies: 5,
  },
  {
    hash: '0xghi789',
    author: {
      fid: 9012,
      username: 'radiohead420',
      display_name: 'RadioHead 📻',
      avatar_url: null,
    },
    text: 'Just discovered Web3 Radio and I\'m hooked! The 420 zone is something else 🌿',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    reactions: { likes: 23, recasts: 5 },
    replies: 3,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station_id');
    const limit = parseInt(searchParams.get('limit') || '20');

    // In production: Fetch casts from Neynar API
    // GET https://api.neynar.com/v2/farcaster/channel/casts?channel_id=xxx

    return NextResponse.json({
      casts: mockCasts.slice(0, limit),
      total: mockCasts.length,
    });
  } catch (error) {
    console.error('Error fetching casts:', error);
    return NextResponse.json({ error: 'Failed to fetch casts' }, { status: 500 });
  }
}
