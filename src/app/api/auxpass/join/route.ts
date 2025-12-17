import { NextRequest, NextResponse } from 'next/server';

// Shared state with main route (in production, use database)
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

    // Check if already in queue
    const existingIndex = auxQueues[station_id].findIndex(
      m => m.wallet_address.toLowerCase() === wallet_address.toLowerCase()
    );

    if (existingIndex !== -1) {
      return NextResponse.json(
        { success: false, error: 'Already in queue' },
        { status: 400 }
      );
    }

    // Mock vibes check (in production, check on-chain or database)
    const userVibes = 500; // Placeholder
    const minRequired = 100;

    if (userVibes < minRequired) {
      return NextResponse.json(
        { success: false, error: `Need at least ${minRequired} VIBES to join queue` },
        { status: 400 }
      );
    }

    // Add to queue
    const newMember = {
      wallet_address,
      display_name: null,
      avatar_url: null,
      position: auxQueues[station_id].length + 1,
      joined_at: new Date().toISOString(),
      vibes_balance: userVibes,
    };

    auxQueues[station_id].push(newMember);

    return NextResponse.json({
      success: true,
      position: newMember.position,
      message: `Joined queue at position #${newMember.position}`,
    });
  } catch (error) {
    console.error('Error joining aux queue:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to join queue' },
      { status: 500 }
    );
  }
}
