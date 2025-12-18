import { NextRequest, NextResponse } from 'next/server';
import { PAYMASTER_URL, isPaymasterAvailable } from '@/lib/cdp';

/**
 * POST /api/cdp/sponsor
 * 
 * Sponsor a user operation via CDP Paymaster
 * This allows gasless transactions for users
 */
export async function POST(request: NextRequest) {
  try {
    if (!isPaymasterAvailable()) {
      return NextResponse.json(
        { error: 'Paymaster not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { userOperation, entryPoint } = body;

    if (!userOperation) {
      return NextResponse.json(
        { error: 'Missing userOperation' },
        { status: 400 }
      );
    }

    // Call CDP Paymaster
    const response = await fetch(PAYMASTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'pm_sponsorUserOperation',
        params: [
          userOperation,
          entryPoint || '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // Default EntryPoint v0.6
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('Paymaster error:', data.error);
      return NextResponse.json(
        { error: data.error.message || 'Sponsorship failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymasterAndData: data.result?.paymasterAndData,
      preVerificationGas: data.result?.preVerificationGas,
      verificationGasLimit: data.result?.verificationGasLimit,
      callGasLimit: data.result?.callGasLimit,
    });
  } catch (error) {
    console.error('Sponsor API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cdp/sponsor
 * 
 * Check if sponsorship is available
 */
export async function GET() {
  return NextResponse.json({
    available: isPaymasterAvailable(),
    paymasterUrl: isPaymasterAvailable() ? 'configured' : 'not configured',
  });
}
