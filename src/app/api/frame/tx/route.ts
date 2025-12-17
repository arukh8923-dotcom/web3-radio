import { NextRequest, NextResponse } from 'next/server';

// Generate transaction data for Frame tip flow
// This returns EIP-712 transaction data for the Frame to execute

const RADIO_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'; // Placeholder
const RADIO_DECIMALS = 18;

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const amount = parseInt(searchParams.get('amount') || '10');
    const stationId = searchParams.get('station') || 'default';

    // In production: Look up DJ wallet from station
    const djWallet = '0x1234567890abcdef1234567890abcdef12345678'; // Placeholder

    // Calculate amount in wei
    const amountWei = BigInt(amount) * BigInt(10 ** RADIO_DECIMALS);

    // ERC-20 transfer function signature
    const transferData = encodeTransferData(djWallet, amountWei);

    // Return transaction data for Frame
    return NextResponse.json({
      chainId: 'eip155:8453', // Base mainnet
      method: 'eth_sendTransaction',
      params: {
        abi: [
          {
            type: 'function',
            name: 'transfer',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
          },
        ],
        to: RADIO_TOKEN_ADDRESS,
        data: transferData,
        value: '0x0',
      },
      attribution: false,
    });
  } catch (error) {
    console.error('Error generating tx data:', error);
    return NextResponse.json({ error: 'Failed to generate transaction' }, { status: 500 });
  }
}

function encodeTransferData(to: string, amount: bigint): string {
  // ERC-20 transfer(address,uint256) selector: 0xa9059cbb
  const selector = 'a9059cbb';
  
  // Pad address to 32 bytes
  const paddedAddress = to.slice(2).toLowerCase().padStart(64, '0');
  
  // Pad amount to 32 bytes
  const paddedAmount = amount.toString(16).padStart(64, '0');
  
  return `0x${selector}${paddedAddress}${paddedAmount}`;
}
