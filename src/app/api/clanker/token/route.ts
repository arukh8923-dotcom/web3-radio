import { NextRequest, NextResponse } from 'next/server';

// Mock token data - will integrate with Clanker API
interface StationToken {
  address: string;
  symbol: string;
  name: string;
  total_supply: string;
  holder_count: number;
  price_usd: number;
  market_cap: number;
  liquidity: number;
  created_at: string;
  clanker_url: string;
}

const mockTokens: Record<string, StationToken> = {
  'station-420': {
    address: '0x420420420420420420420420420420420420420',
    symbol: 'VIBES420',
    name: '420 FM Vibes',
    total_supply: '1000000',
    holder_count: 420,
    price_usd: 0.000042,
    market_cap: 42000,
    liquidity: 10000,
    created_at: '2024-01-01T04:20:00Z',
    clanker_url: 'https://clanker.world/token/0x420',
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station_id');

    if (!stationId) {
      return NextResponse.json({ error: 'station_id required' }, { status: 400 });
    }

    const token = mockTokens[stationId] || null;
    const holders = token ? [
      { wallet_address: '0x1234...', display_name: 'DJ Vibes', balance: '100000', percentage: 10 },
      { wallet_address: '0x5678...', display_name: 'ChillMaster', balance: '50000', percentage: 5 },
    ] : [];

    return NextResponse.json({ token, holders });
  } catch (error) {
    console.error('Error fetching token:', error);
    return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
  }
}
