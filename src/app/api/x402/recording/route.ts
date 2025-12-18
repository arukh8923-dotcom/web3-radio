import { NextRequest, NextResponse } from 'next/server';
import { withX402 } from '@/lib/x402-middleware';

/**
 * GET /api/x402/recording?id=xxx
 * 
 * Download recording with x402 payment
 * $0.05 per download
 */
export const GET = withX402(
  {
    priceKey: 'recording_download',
    description: 'Download broadcast recording',
    
    getRecipient: async (req) => {
      const recordingId = req.nextUrl.searchParams.get('id');
      // TODO: Fetch recording owner from database
      return process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '';
    },
    
    getTier: async () => 'free' as const,
    
    getResourceId: (req) => {
      const recordingId = req.nextUrl.searchParams.get('id') || 'unknown';
      return `recording:${recordingId}`;
    },
  },
  async (req) => {
    const recordingId = req.nextUrl.searchParams.get('id');
    
    if (!recordingId) {
      return NextResponse.json(
        { error: 'Recording ID required' },
        { status: 400 }
      );
    }

    // TODO: Fetch recording from storage
    // For now, return mock data
    return NextResponse.json({
      success: true,
      recording_id: recordingId,
      download_url: `/recordings/${recordingId}.mp3`,
      expires_in: 3600, // 1 hour
      payment_verified: true,
    });
  }
);
