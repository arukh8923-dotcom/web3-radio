/**
 * x402 Middleware for Next.js API Routes
 * 
 * Usage:
 * import { withX402 } from '@/lib/x402-middleware';
 * 
 * export const GET = withX402({
 *   priceKey: 'api_stations',
 *   getRecipient: (req) => '0x...', // DJ address
 *   getTier: (req) => 'free',
 * }, async (req) => {
 *   // Your handler - only runs if paid
 *   return NextResponse.json({ data: '...' });
 * });
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  X402_PRICING,
  X402PaymentRequest,
  PaymentToken,
  DJTier,
  TREASURY_ADDRESS,
  create402Response,
  createPaymentRequest,
  getPaymentProof,
  verifyPayment,
  calculateRevenueSplit,
} from './x402';

// Cache for token prices
let tokenPriceCache: { radio: number; vibes: number; timestamp: number } | null = null;
const PRICE_CACHE_TTL = 60 * 1000; // 1 minute

async function getTokenPrices(): Promise<{ radio: number; vibes: number }> {
  if (tokenPriceCache && Date.now() - tokenPriceCache.timestamp < PRICE_CACHE_TTL) {
    return { radio: tokenPriceCache.radio, vibes: tokenPriceCache.vibes };
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/token/price`);
    const data = await res.json();
    
    if (data.success && data.data) {
      tokenPriceCache = {
        radio: data.data.radio_usd,
        vibes: data.data.vibes_usd,
        timestamp: Date.now(),
      };
      return { radio: data.data.radio_usd, vibes: data.data.vibes_usd };
    }
  } catch (error) {
    console.error('Failed to fetch token prices:', error);
  }

  // Fallback prices
  return { radio: 0.0000003, vibes: 0.0000003 };
}

export interface X402Options {
  // Price key from X402_PRICING or custom USD amount
  priceKey?: keyof typeof X402_PRICING;
  priceUsd?: number;
  token?: PaymentToken;
  
  // Get recipient (DJ) address - if not provided, goes to treasury
  getRecipient?: (req: NextRequest) => string | Promise<string>;
  
  // Get DJ tier for revenue split
  getTier?: (req: NextRequest) => DJTier | Promise<DJTier>;
  
  // Resource ID generator
  getResourceId?: (req: NextRequest) => string;
  
  // Description for payment
  description?: string;
  
  // Skip payment check (for testing or free tier)
  skipPayment?: (req: NextRequest) => boolean | Promise<boolean>;
  
  // Payment expiry in seconds
  expiresIn?: number;
}

type RouteHandler = (req: NextRequest, context?: unknown) => Promise<Response>;

/**
 * Wrap an API route with x402 payment requirement
 */
export function withX402(
  options: X402Options,
  handler: RouteHandler
): RouteHandler {
  return async (req: NextRequest, context?: unknown) => {
    // Check if payment should be skipped
    if (options.skipPayment) {
      const skip = await options.skipPayment(req);
      if (skip) {
        return handler(req, context);
      }
    }

    // Get pricing
    let priceUsd: number;
    let token: PaymentToken;

    if (options.priceKey) {
      const pricing = X402_PRICING[options.priceKey];
      priceUsd = pricing.usd;
      token = pricing.token;
    } else if (options.priceUsd !== undefined) {
      priceUsd = options.priceUsd;
      token = options.token || 'RADIO';
    } else {
      // No price configured, pass through
      return handler(req, context);
    }

    // Get token prices
    const prices = await getTokenPrices();
    const tokenPrice = token === 'RADIO' ? prices.radio : prices.vibes;

    // Get recipient and tier
    const recipient = options.getRecipient 
      ? await options.getRecipient(req) 
      : TREASURY_ADDRESS;
    const tier = options.getTier 
      ? await options.getTier(req) 
      : 'free';

    // Generate resource ID
    const resourceId = options.getResourceId 
      ? options.getResourceId(req) 
      : `${req.method}:${req.nextUrl.pathname}`;

    // Check for payment proof
    const proof = getPaymentProof(req);

    if (!proof) {
      // No payment - return 402
      const paymentRequest = createPaymentRequest(
        priceUsd,
        tokenPrice,
        token,
        recipient,
        tier,
        resourceId,
        options.description || `Access to ${resourceId}`,
        options.expiresIn || 300
      );

      return create402Response(
        paymentRequest,
        `Payment of $${priceUsd.toFixed(4)} in ${token} required`
      );
    }

    // Verify payment
    const expectedAmount = Math.ceil(priceUsd / tokenPrice).toString();
    const verification = await verifyPayment(proof, expectedAmount, token);

    if (!verification.valid) {
      return NextResponse.json(
        { error: 'Invalid payment', details: verification.error },
        { status: 402 }
      );
    }

    // Payment valid - add payment info to request headers for handler
    const headers = new Headers(req.headers);
    headers.set('X-Payment-Verified', 'true');
    headers.set('X-Payment-TxHash', proof.txHash);
    headers.set('X-Payment-Payer', proof.payer);

    // Execute handler
    return handler(req, context);
  };
}

/**
 * Simple payment check without middleware wrapper
 */
export async function requirePayment(
  req: NextRequest,
  priceUsd: number,
  token: PaymentToken = 'RADIO',
  recipient: string = TREASURY_ADDRESS,
  tier: DJTier = 'free'
): Promise<{ paid: boolean; response?: Response; proof?: ReturnType<typeof getPaymentProof> }> {
  const prices = await getTokenPrices();
  const tokenPrice = token === 'RADIO' ? prices.radio : prices.vibes;
  
  const proof = getPaymentProof(req);

  if (!proof) {
    const paymentRequest = createPaymentRequest(
      priceUsd,
      tokenPrice,
      token,
      recipient,
      tier,
      `${req.method}:${req.nextUrl.pathname}`,
      `Payment required`,
      300
    );

    return {
      paid: false,
      response: create402Response(paymentRequest),
    };
  }

  const expectedAmount = Math.ceil(priceUsd / tokenPrice).toString();
  const verification = await verifyPayment(proof, expectedAmount, token);

  if (!verification.valid) {
    return {
      paid: false,
      response: NextResponse.json(
        { error: 'Invalid payment', details: verification.error },
        { status: 402 }
      ),
    };
  }

  return { paid: true, proof };
}

/**
 * Helper to check if request is from a subscriber (bypass payment)
 */
export async function isSubscriber(
  walletAddress: string,
  stationId?: string
): Promise<boolean> {
  // TODO: Check subscription status from database/contract
  // For now, return false (require payment)
  return false;
}

/**
 * Helper to get DJ tier from database
 */
export async function getDJTier(djAddress: string): Promise<DJTier> {
  // TODO: Check DJ verification status from database/contract
  // For now, return 'free'
  return 'free';
}
