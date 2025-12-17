import { NextRequest, NextResponse } from 'next/server';

// Placeholder data - will be replaced with Supabase/on-chain + Chainlink VRF
interface Drop {
  id: string;
  station_id: string;
  station_name: string;
  frequency: number;
  timestamp: string;
  reward_amount: number;
  reward_type: 'vibes' | 'nft';
  total_recipients: number;
  eligible_wallets: string[];
  claimed_wallets: string[];
  claim_deadline: string | null;
  vrf_request_id: string | null;
  executed: boolean;
}

const mockDrops: Drop[] = [
  {
    id: 'drop-001',
    station_id: 'station-420',
    station_name: '420 FM - Chill Vibes',
    frequency: 420.0,
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    reward_amount: 420,
    reward_type: 'vibes',
    total_recipients: 42,
    eligible_wallets: [
      '0x1234567890abcdef1234567890abcdef12345678',
      '0xabcdef1234567890abcdef1234567890abcdef12',
    ],
    claimed_wallets: [],
    claim_deadline: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
    vrf_request_id: 'vrf-123456',
    executed: true,
  },
];

const mockHistory = [
  {
    id: 'drop-hist-001',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    reward_amount: 100,
    reward_type: 'vibes' as const,
    claimed: true,
    station_name: '420 FM',
  },
  {
    id: 'drop-hist-002',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    reward_amount: 1,
    reward_type: 'nft' as const,
    claimed: true,
    station_name: 'Chill Zone',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station_id');
    const wallet = searchParams.get('wallet');

    // Find active drop (most recent unclaimed)
    let activeDrop = mockDrops.find(d => d.executed && !d.claimed_wallets.includes(wallet || ''));

    // Check eligibility
    let dropResponse = null;
    if (activeDrop) {
      const isEligible = wallet 
        ? activeDrop.eligible_wallets.some(w => w.toLowerCase() === wallet.toLowerCase())
        : false;
      const isClaimed = wallet
        ? activeDrop.claimed_wallets.some(w => w.toLowerCase() === wallet.toLowerCase())
        : false;

      dropResponse = {
        id: activeDrop.id,
        station_id: activeDrop.station_id,
        station_name: activeDrop.station_name,
        frequency: activeDrop.frequency,
        timestamp: activeDrop.timestamp,
        reward_amount: activeDrop.reward_amount,
        reward_type: activeDrop.reward_type,
        total_recipients: activeDrop.total_recipients,
        is_eligible: isEligible,
        is_claimed: isClaimed,
        claim_deadline: activeDrop.claim_deadline,
      };
    }

    return NextResponse.json({
      active_drop: dropResponse,
      history: wallet ? mockHistory : [],
      next_drop_time: getNext420Time(),
    });
  } catch (error) {
    console.error('Error fetching drops:', error);
    return NextResponse.json({ error: 'Failed to fetch drops' }, { status: 500 });
  }
}

function getNext420Time(): string {
  const now = new Date();
  const hours = now.getHours();
  
  let targetDate = new Date(now);
  
  if (hours < 4) {
    targetDate.setHours(4, 20, 0, 0);
  } else if (hours < 16) {
    targetDate.setHours(16, 20, 0, 0);
  } else {
    targetDate.setDate(targetDate.getDate() + 1);
    targetDate.setHours(4, 20, 0, 0);
  }
  
  return targetDate.toISOString();
}
