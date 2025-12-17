import { NextRequest, NextResponse } from 'next/server';

// Shared state with main route (in production, use database + on-chain)
const claimedDrops: Record<string, string[]> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { drop_id, wallet_address } = body;

    if (!drop_id || !wallet_address) {
      return NextResponse.json(
        { success: false, error: 'drop_id and wallet_address required' },
        { status: 400 }
      );
    }

    // Initialize claimed list for this drop
    if (!claimedDrops[drop_id]) {
      claimedDrops[drop_id] = [];
    }

    // Check if already claimed
    if (claimedDrops[drop_id].some(w => w.toLowerCase() === wallet_address.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Already claimed this drop' },
        { status: 400 }
      );
    }

    // Mock eligibility check (in production, verify on-chain)
    const isEligible = true; // Placeholder - would check VRF result

    if (!isEligible) {
      return NextResponse.json(
        { success: false, error: 'Not eligible for this drop' },
        { status: 403 }
      );
    }

    // Record claim
    claimedDrops[drop_id].push(wallet_address);

    // In production: 
    // 1. Verify eligibility via Chainlink VRF result
    // 2. Transfer VIBES tokens or mint NFT
    // 3. Record on-chain

    return NextResponse.json({
      success: true,
      message: 'Drop claimed successfully!',
      reward: {
        type: 'vibes',
        amount: 420,
      },
      tx_hash: '0x' + Math.random().toString(16).slice(2, 66), // Mock tx hash
    });
  } catch (error) {
    console.error('Error claiming drop:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to claim drop' },
      { status: 500 }
    );
  }
}
