/**
 * x402 Payment Protocol Implementation
 * 
 * HTTP 402 Payment Required for micropayments
 * Uses RADIO/VIBES tokens on Base L2
 * 
 * Revenue Split:
 * - Free DJ: 60% DJ / 40% Treasury
 * - Verified DJ: 70% DJ / 30% Treasury
 * - Premium DJ: 80% DJ / 20% Treasury
 */

import { createPublicClient, http, parseUnits, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { CONTRACTS, TREASURY_ADDRESS as TREASURY } from '@/constants/addresses';

// Treasury address (platform revenue)
export const TREASURY_ADDRESS = TREASURY;

// Token addresses - use centralized config
export const RADIO_TOKEN = CONTRACTS.RADIO_TOKEN;
export const VIBES_TOKEN = CONTRACTS.VIBES_TOKEN;

// DJ Tiers for revenue split
export type DJTier = 'free' | 'verified' | 'premium';

export const REVENUE_SPLIT: Record<DJTier, { dj: number; treasury: number }> = {
  free: { dj: 60, treasury: 40 },
  verified: { dj: 70, treasury: 30 },
  premium: { dj: 80, treasury: 20 },
};

// x402 Payment types
export type PaymentToken = 'RADIO' | 'VIBES';

export interface X402PaymentRequest {
  amount: string; // Amount in token units
  token: PaymentToken;
  recipient: string; // DJ wallet address
  recipientTier: DJTier;
  description: string;
  resourceId: string; // What they're paying for
  expiresAt: number; // Unix timestamp
}

export interface X402PaymentProof {
  txHash: string;
  payer: string;
  amount: string;
  token: PaymentToken;
  timestamp: number;
}

export interface X402Config {
  enabled: boolean;
  token: PaymentToken;
  priceUsd: number;
  description: string;
}

// Pricing configuration (in USD, converted to tokens)
export const X402_PRICING = {
  // Streaming
  stream_per_minute: { usd: 0.001, token: 'RADIO' as PaymentToken },
  stream_premium_per_minute: { usd: 0.005, token: 'RADIO' as PaymentToken },
  
  // API Access
  api_stations: { usd: 0.0001, token: 'RADIO' as PaymentToken },
  api_broadcasts: { usd: 0.0001, token: 'RADIO' as PaymentToken },
  api_analytics: { usd: 0.001, token: 'RADIO' as PaymentToken },
  
  // NFT Generation
  nft_image_generate: { usd: 0.01, token: 'RADIO' as PaymentToken },
  nft_metadata: { usd: 0.001, token: 'RADIO' as PaymentToken },
  
  // Premium Features
  recording_download: { usd: 0.05, token: 'RADIO' as PaymentToken },
  request_line: { usd: 0.02, token: 'VIBES' as PaymentToken },
  chat_highlight: { usd: 0.01, token: 'VIBES' as PaymentToken },
  
  // 420 Zone
  hotbox_access: { usd: 0.10, token: 'VIBES' as PaymentToken },
  smoke_signal: { usd: 0.05, token: 'VIBES' as PaymentToken },
  
  // DJ Tools
  broadcast_slot_prime: { usd: 1.00, token: 'RADIO' as PaymentToken },
  analytics_detailed: { usd: 0.50, token: 'RADIO' as PaymentToken },
  simulcast: { usd: 0.25, token: 'RADIO' as PaymentToken },
} as const;

/**
 * Create x402 payment request header
 */
export function createPaymentRequest(
  priceUsd: number,
  tokenPriceUsd: number,
  token: PaymentToken,
  recipient: string,
  recipientTier: DJTier,
  resourceId: string,
  description: string,
  expiresInSeconds: number = 300
): X402PaymentRequest {
  // Convert USD to token amount
  const tokenAmount = Math.ceil(priceUsd / tokenPriceUsd);
  
  return {
    amount: tokenAmount.toString(),
    token,
    recipient,
    recipientTier,
    description,
    resourceId,
    expiresAt: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
}

/**
 * Calculate revenue split
 */
export function calculateRevenueSplit(
  totalAmount: bigint,
  tier: DJTier
): { djAmount: bigint; treasuryAmount: bigint } {
  const split = REVENUE_SPLIT[tier];
  const djAmount = (totalAmount * BigInt(split.dj)) / BigInt(100);
  const treasuryAmount = totalAmount - djAmount;
  
  return { djAmount, treasuryAmount };
}

/**
 * Generate 402 Payment Required response
 */
export function create402Response(
  paymentRequest: X402PaymentRequest,
  message: string = 'Payment Required'
): Response {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('X-Payment-Required', 'true');
  headers.set('X-Payment-Token', paymentRequest.token);
  headers.set('X-Payment-Amount', paymentRequest.amount);
  headers.set('X-Payment-Recipient', paymentRequest.recipient);
  headers.set('X-Payment-Expires', paymentRequest.expiresAt.toString());
  headers.set('X-Payment-Resource', paymentRequest.resourceId);
  
  return new Response(
    JSON.stringify({
      error: 'Payment Required',
      message,
      payment: {
        token: paymentRequest.token,
        tokenAddress: paymentRequest.token === 'RADIO' ? RADIO_TOKEN : VIBES_TOKEN,
        amount: paymentRequest.amount,
        recipient: paymentRequest.recipient,
        treasury: TREASURY_ADDRESS,
        split: REVENUE_SPLIT[paymentRequest.recipientTier],
        description: paymentRequest.description,
        expiresAt: paymentRequest.expiresAt,
        network: 'base',
        chainId: 8453,
      },
      instructions: {
        step1: `Approve ${paymentRequest.amount} ${paymentRequest.token} to the payment contract`,
        step2: 'Call the pay function with the resource ID',
        step3: 'Include the transaction hash in X-Payment-Proof header',
      },
    }),
    {
      status: 402,
      headers,
    }
  );
}

/**
 * Verify payment proof
 */
export async function verifyPayment(
  proof: X402PaymentProof,
  expectedAmount: string,
  expectedToken: PaymentToken
): Promise<{ valid: boolean; error?: string }> {
  try {
    const client = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    });

    // Get transaction receipt
    const receipt = await client.getTransactionReceipt({
      hash: proof.txHash as `0x${string}`,
    });

    if (!receipt) {
      return { valid: false, error: 'Transaction not found' };
    }

    if (receipt.status !== 'success') {
      return { valid: false, error: 'Transaction failed' };
    }

    // Verify amount from logs (simplified - in production, decode Transfer event)
    // For now, trust the proof if tx succeeded
    if (BigInt(proof.amount) < BigInt(expectedAmount)) {
      return { valid: false, error: 'Insufficient payment amount' };
    }

    if (proof.token !== expectedToken) {
      return { valid: false, error: 'Wrong payment token' };
    }

    return { valid: true };
  } catch (error) {
    console.error('Payment verification error:', error);
    return { valid: false, error: 'Verification failed' };
  }
}

/**
 * Check if request has valid payment proof
 */
export function getPaymentProof(request: Request): X402PaymentProof | null {
  const proofHeader = request.headers.get('X-Payment-Proof');
  
  if (!proofHeader) {
    return null;
  }

  try {
    return JSON.parse(proofHeader) as X402PaymentProof;
  } catch {
    // Try as simple tx hash
    const txHash = proofHeader;
    if (txHash.startsWith('0x') && txHash.length === 66) {
      return {
        txHash,
        payer: request.headers.get('X-Payment-Payer') || '',
        amount: request.headers.get('X-Payment-Amount') || '0',
        token: (request.headers.get('X-Payment-Token') as PaymentToken) || 'RADIO',
        timestamp: Date.now(),
      };
    }
    return null;
  }
}

/**
 * Store payment record (for tracking)
 */
export interface PaymentRecord {
  id: string;
  txHash: string;
  payer: string;
  recipient: string;
  djAmount: string;
  treasuryAmount: string;
  token: PaymentToken;
  resourceType: string;
  resourceId: string;
  timestamp: number;
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: string | bigint, decimals: number = 18): string {
  const value = typeof amount === 'string' ? BigInt(amount) : amount;
  const formatted = Number(formatUnits(value, decimals));
  
  if (formatted >= 1_000_000_000) return `${(formatted / 1_000_000_000).toFixed(2)}B`;
  if (formatted >= 1_000_000) return `${(formatted / 1_000_000).toFixed(2)}M`;
  if (formatted >= 1_000) return `${(formatted / 1_000).toFixed(1)}K`;
  return formatted.toLocaleString();
}
