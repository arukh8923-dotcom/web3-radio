import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, encodeFunctionData } from 'viem';
import { base } from 'viem/chains';

const UNISWAP_QUOTER = '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a' as const;

const QUOTER_ABI = [
  {
    name: 'quoteExactInputSingle',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{
      name: 'params',
      type: 'tuple',
      components: [
        { name: 'tokenIn', type: 'address' },
        { name: 'tokenOut', type: 'address' },
        { name: 'amountIn', type: 'uint256' },
        { name: 'fee', type: 'uint24' },
        { name: 'sqrtPriceLimitX96', type: 'uint160' },
      ],
    }],
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'sqrtPriceX96After', type: 'uint160' },
      { name: 'initializedTicksCrossed', type: 'uint32' },
      { name: 'gasEstimate', type: 'uint256' },
    ],
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const { tokenIn, tokenOut, amountIn, fee } = await request.json();

    if (!tokenIn || !tokenOut || !amountIn) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';
    
    const client = createPublicClient({
      chain: base,
      transport: http(rpcUrl),
    });

    // Use eth_call to simulate the quote (quoter is non-view but can be called via eth_call)
    const result = await client.simulateContract({
      address: UNISWAP_QUOTER,
      abi: QUOTER_ABI,
      functionName: 'quoteExactInputSingle',
      args: [{
        tokenIn: tokenIn as `0x${string}`,
        tokenOut: tokenOut as `0x${string}`,
        amountIn: BigInt(amountIn),
        fee: fee || 10000,
        sqrtPriceLimitX96: BigInt(0),
      }],
    });

    const [amountOut] = result.result as [bigint, bigint, number, bigint];

    return NextResponse.json({
      amountOut: amountOut.toString(),
      success: true,
    });
  } catch (error: unknown) {
    console.error('Quote error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Quote failed';
    
    // Check if it's a pool not found error
    if (errorMessage.includes('execution reverted') || errorMessage.includes('Pool not found')) {
      return NextResponse.json({ 
        error: 'No liquidity pool found for this pair',
        details: errorMessage 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to get quote',
      details: errorMessage 
    }, { status: 500 });
  }
}
