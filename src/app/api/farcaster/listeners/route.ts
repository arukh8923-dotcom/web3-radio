import { NextRequest, NextResponse } from 'next/server';

// Mock Farcaster listeners data - will integrate with Neynar API
interface FarcasterListener {
  fid: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  follower_count: number;
  wallet_address: string;
}

const mockListeners: FarcasterListener[] = [
  {
    fid: 1234,
    username: 'vibesmaster',
    display_name: 'Vibes Master 🎵',
    avatar_url: null,
    follower_count: 2500,
    wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
  },
  {
    fid: 5678,
    username: 'djchill',
    display_name: 'DJ Chill',
    avatar_url: null,
    follower_count: 8900,
    wallet_address: '0xabcdef1234567890abcdef1234567890abcdef12',
  },
  {
    fid: 9012,
    username: 'radiohead420',
    display_name: 'RadioHead 📻',
    avatar_url: null,
    follower_count: 1200,
    wallet_address: '0x9876543210fedcba9876543210fedcba98765432',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station_id');

    // In production: 
    // 1. Get current listeners from station
    // 2. Look up their Farcaster profiles via Neynar API
    // 3. Return merged data

    // For now, return mock data
    return NextResponse.json({
      listeners: mockListeners,
      total: mockListeners.length,
    });
  } catch (error) {
    console.error('Error fetching Farcaster listeners:', error);
    return NextResponse.json({ error: 'Failed to fetch listeners' }, { status: 500 });
  }
}
