import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, timestamp } = body;

    // Process sync based on type
    switch (type) {
      case 'listen':
        // Record listening history
        console.log('Syncing listen:', data);
        break;
      case 'reaction':
        // Record reaction
        console.log('Syncing reaction:', data);
        break;
      case 'tip':
        // Queue tip transaction
        console.log('Syncing tip:', data);
        break;
    }

    return NextResponse.json({ success: true, synced_at: new Date().toISOString() });
  } catch (error) {
    console.error('Error syncing:', error);
    return NextResponse.json({ success: false, error: 'Sync failed' }, { status: 500 });
  }
}
