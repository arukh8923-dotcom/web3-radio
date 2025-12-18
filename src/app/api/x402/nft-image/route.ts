import { NextRequest, NextResponse } from 'next/server';
import { requirePayment } from '@/lib/x402-middleware';
import { X402_PRICING, TREASURY_ADDRESS } from '@/lib/x402';

/**
 * GET /api/x402/nft-image?type=frequency&token_id=1
 * 
 * Generate high-resolution NFT image with x402 payment
 * $0.01 per generation
 */
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type');
  const tokenId = req.nextUrl.searchParams.get('token_id');
  const highRes = req.nextUrl.searchParams.get('high_res') === 'true';

  if (!type || !tokenId) {
    return NextResponse.json(
      { error: 'type and token_id required' },
      { status: 400 }
    );
  }

  // Only require payment for high-res images
  if (highRes) {
    const { paid, response } = await requirePayment(
      req,
      X402_PRICING.nft_image_generate.usd,
      X402_PRICING.nft_image_generate.token,
      TREASURY_ADDRESS,
      'free'
    );

    if (!paid && response) {
      return response;
    }
  }

  // Redirect to actual NFT image endpoint
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resolution = highRes ? 'high' : 'standard';
  
  return NextResponse.json({
    success: true,
    image_url: `${baseUrl}/api/nft/${type}/${tokenId}/image?res=${resolution}`,
    resolution,
    payment_required: highRes,
  });
}
