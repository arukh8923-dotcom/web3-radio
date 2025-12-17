import { NextRequest, NextResponse } from 'next/server';

let activeAlert: { id: string; type: string; title: string; message: string; station_id: string | null; started_at: string; ended_at: string | null; is_active: boolean } | null = null;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station_id');

    // Return alert if it's global or matches station
    if (activeAlert && activeAlert.is_active && (!activeAlert.station_id || activeAlert.station_id === stationId)) {
      return NextResponse.json({ alert: activeAlert });
    }

    return NextResponse.json({ alert: null });
  } catch (error) {
    console.error('Error fetching emergency:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { station_id, type, title, message } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    activeAlert = {
      id: 'alert-' + Date.now(),
      type: type || 'warning',
      title,
      message,
      station_id: station_id || null,
      started_at: new Date().toISOString(),
      ended_at: null,
      is_active: true,
    };

    return NextResponse.json({ success: true, alert: activeAlert });
  } catch (error) {
    console.error('Error triggering emergency:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
