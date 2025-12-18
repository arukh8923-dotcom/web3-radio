import { NextRequest, NextResponse } from 'next/server';
import { withX402 } from '@/lib/x402-middleware';
import { X402_PRICING } from '@/lib/x402';

/**
 * GET /api/x402/stream?station_id=xxx
 * 
 * Premium streaming endpoint with x402 payment
 * Listener pays per minute of streaming
 */
export const GET = withX402(
  {
    priceKey: 'stream_per_minute',
    description: 'Premium station streaming (per minute)',
    
    // Get station owner as recipient
    getRecipient: async (req) => {
      const stationId = req.nextUrl.searchParams.get('station_id');
      if (!stationId) return process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '';
      
      // TODO: Fetch station owner from database
      // For now, return treasury
      return process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '';
    },
    
    // Get DJ tier for revenue split
    getTier: async (req) => {
      const stationId = req.nextUrl.searchParams.get('station_id');
      // TODO: Fetch DJ tier from database
      return 'free' as const;
    },
    
    // Generate unique resource ID
    getResourceId: (req) => {
      const stationId = req.nextUrl.searchParams.get('station_id') || 'unknown';
      const timestamp = Math.floor(Date.now() / 60000); // Per minute
      return `stream:${stationId}:${timestamp}`;
    },
    
    // Skip payment for free tier stations
    skipPayment: async (req) => {
      const premium = req.nextUrl.searchParams.get('premium');
      return premium !== 'true';
    },
  },
  async (req) => {
    const stationId = req.nextUrl.searchParams.get('station_id');
    
    if (!stationId) {
      return NextResponse.json(
        { error: 'station_id required' },
        { status: 400 }
      );
    }

    // Payment verified - return stream access token
    const accessToken = generateStreamToken(stationId);
    
    return NextResponse.json({
      success: true,
      station_id: stationId,
      access_token: accessToken,
      expires_in: 60, // 1 minute
      stream_url: `/api/stream/${stationId}?token=${accessToken}`,
      payment_verified: req.headers.get('X-Payment-Verified') === 'true',
    });
  }
);

/**
 * Generate temporary stream access token
 */
function generateStreamToken(stationId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  // In production, use proper JWT or signed token
  return Buffer.from(`${stationId}:${timestamp}:${random}`).toString('base64');
}
