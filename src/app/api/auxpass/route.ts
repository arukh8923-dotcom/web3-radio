import { NextRequest, NextResponse } from 'next/server';

// Placeholder data - will be replaced with Supabase/on-chain
interface AuxHolder {
  wallet_address: string;
  display_name: string | null;
  avatar_url: string | null;
  vibes_balance: number;
}

interface QueueMember extends AuxHolder {
  position: number;
  joined_at: string;
}

interface AuxState {
  station_id: string;
  station_name: string;
  frequency: number;
  current_holder: AuxHolder | null;
  session_start: string | null;
  session_duration: number;
  queue: QueueMember[];
  min_vibes_required: number;
  is_active: boolean;
}

const mockAuxStates: Record<string, AuxState> = {};

// Initialize mock data for demo
function initMockData(stationId: string) {
  if (!mockAuxStates[stationId]) {
    mockAuxStates[stationId] = {
      station_id: stationId,
      station_name: 'Demo Station',
      frequency: 420.0,
      current_holder: {
        wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
        display_name: 'DJ Vibes',
        avatar_url: null,
        vibes_balance: 1500,
      },
      session_start: new Date(Date.now() - 120000).toISOString(), // Started 2 mins ago
      session_duration: 300, // 5 minutes
      queue: [
        {
          wallet_address: '0xabcdef1234567890abcdef1234567890abcdef12',
          display_name: 'ChillMaster',
          avatar_url: null,
          position: 1,
          joined_at: new Date(Date.now() - 60000).toISOString(),
          vibes_balance: 800,
        },
        {
          wallet_address: '0x9876543210fedcba9876543210fedcba98765432',
          display_name: 'BeatDropper',
          avatar_url: null,
          position: 2,
          joined_at: new Date(Date.now() - 30000).toISOString(),
          vibes_balance: 650,
        },
      ],
      min_vibes_required: 100,
      is_active: true,
    };
  }
  return mockAuxStates[stationId];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station_id');
    const wallet = searchParams.get('wallet');

    if (!stationId) {
      return NextResponse.json({ error: 'station_id required' }, { status: 400 });
    }

    // Get or initialize aux state
    const auxState = initMockData(stationId);

    // Calculate time remaining
    let timeRemaining = 0;
    if (auxState.current_holder && auxState.session_start) {
      const sessionStart = new Date(auxState.session_start).getTime();
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      timeRemaining = Math.max(0, auxState.session_duration - elapsed);
    }

    // Mock user vibes balance
    const userVibes = wallet ? 500 : 0;

    return NextResponse.json({
      aux_state: {
        ...auxState,
        time_remaining: timeRemaining,
      },
      user_vibes: userVibes,
    });
  } catch (error) {
    console.error('Error fetching aux state:', error);
    return NextResponse.json({ error: 'Failed to fetch aux state' }, { status: 500 });
  }
}
