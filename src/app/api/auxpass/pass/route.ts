import { NextRequest, NextResponse } from 'next/server';

// Shared state (in production, use database)
const auxStates: Record<string, {
  current_holder: {
    wallet_address: string;
    display_name: string | null;
    avatar_url: string | null;
    vibes_balance: number;
  } | null;
  session_start: string | null;
  queue: Array<{
    wallet_address: string;
    display_name: string | null;
    avatar_url: string | null;
    position: number;
    joined_at: string;
    vibes_balance: number;
  }>;
}> = {};

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

    // Initialize state if not exists
    if (!auxStates[station_id]) {
      auxStates[station_id] = {
        current_holder: null,
        session_start: null,
        queue: [],
      };
    }

    const state = auxStates[station_id];

    // Verify caller is current holder
    if (!state.current_holder || 
        state.current_holder.wallet_address.toLowerCase() !== wallet_address.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Only current holder can pass the aux' },
        { status: 403 }
      );
    }

    const previousHolder = state.current_holder;

    // Pass to next in queue
    if (state.queue.length > 0) {
      const nextHolder = state.queue.shift()!;
      state.current_holder = {
        wallet_address: nextHolder.wallet_address,
        display_name: nextHolder.display_name,
        avatar_url: nextHolder.avatar_url,
        vibes_balance: nextHolder.vibes_balance,
      };
      state.session_start = new Date().toISOString();

      // Reorder remaining queue
      state.queue.forEach((member, i) => {
        member.position = i + 1;
      });

      return NextResponse.json({
        success: true,
        message: `Aux passed to ${nextHolder.display_name || nextHolder.wallet_address.slice(0, 8)}...`,
        new_holder: state.current_holder,
        previous_holder: previousHolder,
      });
    } else {
      // No one in queue, aux becomes free
      state.current_holder = null;
      state.session_start = null;

      return NextResponse.json({
        success: true,
        message: 'Aux is now free! Queue is empty.',
        new_holder: null,
        previous_holder: previousHolder,
      });
    }
  } catch (error) {
    console.error('Error passing aux:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to pass aux' },
      { status: 500 }
    );
  }
}
