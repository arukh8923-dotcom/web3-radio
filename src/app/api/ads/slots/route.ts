import { NextRequest, NextResponse } from 'next/server';

const mockSlots = [
  { id: 'slot-1', station_id: 'station-420', position: 'pre-roll', duration: 15, price_per_day: 100, current_sponsor: null, sponsor_name: null, content_url: null, impressions: 5000, clicks: 150, start_date: null, end_date: null },
  { id: 'slot-2', station_id: 'station-420', position: 'mid-roll', duration: 30, price_per_day: 200, current_sponsor: 'cryptoads.base', sponsor_name: 'CryptoAds', content_url: 'ipfs://QmExampleAdContent', impressions: 12000, clicks: 480, start_date: '2024-01-01', end_date: '2024-01-31' },
  { id: 'slot-3', station_id: 'station-420', position: 'banner', duration: 0, price_per_day: 50, current_sponsor: null, sponsor_name: null, content_url: null, impressions: 25000, clicks: 750, start_date: null, end_date: null },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station_id');
    const slots = stationId ? mockSlots.filter(s => s.station_id === stationId || !stationId) : mockSlots;
    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Error fetching ad slots:', error);
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
  }
}
