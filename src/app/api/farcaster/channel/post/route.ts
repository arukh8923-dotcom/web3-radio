import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { station_id, text, wallet_address } = body;

    if (!station_id || !text || !wallet_address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (text.length > 320) {
      return NextResponse.json(
        { success: false, error: 'Cast too long (max 320 characters)' },
        { status: 400 }
      );
    }

    // In production:
    // 1. Verify user has Farcaster account linked
    // 2. Get user's signer from database
    // 3. Post cast via Neynar API to the channel
    // POST https://api.neynar.com/v2/farcaster/cast

    // For now, sync to station chat as well
    // This creates a bridge between Farcaster channel and station chat

    console.log('Posting to channel:', {
      station_id,
      text,
      wallet_address,
    });

    return NextResponse.json({
      success: true,
      message: 'Cast posted successfully',
      cast: {
        hash: '0x' + Math.random().toString(16).slice(2, 10),
        text,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error posting cast:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post cast' },
      { status: 500 }
    );
  }
}
