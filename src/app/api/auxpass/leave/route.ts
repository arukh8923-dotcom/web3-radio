import { NextRequest, NextResponse } from 'next/server';

// Shared state (in production, use database)
const auxQueues: Record<string, Array<{
  wallet_address: string;
  display_name: string | null;
  avatar_url: string | null;
  position: number;
  joined_at: string;
  vibes_balance: number;
}>> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { station_id, wallet_address } = body;

    if (!station_id || !wallet_address) {
      return NextResponse.json(
        { success: false, error: 'station_id and wallet_address required' },
        { status: 400 }
      );
    }

    // Initialize queue if not exists
    if (!auxQueues[station_id]) {
      auxQueues[station_id] = [];
    }

    // Find and remove from queue
    const index = auxQueues[station_id].findIndex(
      m => m.wallet_address.toLowerCase() === wallet_address.toLowerCase()
    );

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Not in queue' },
        { status: 400 }
      );
    }

    auxQueues[station_id].splice(index, 1);

    // Reorder positions
    auxQueues[station_id].forEach((member, i) => {
      member.position = i + 1;
    });

    return NextResponse.json({
      success: true,
      message: 'Left the queue',
    });
  } catch (error) {
    console.error('Error leaving aux queue:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to leave queue' },
      { status: 500 }
    );
  }
}
