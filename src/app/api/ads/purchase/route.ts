import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slot_id, sponsor_address, days, content_url } = body;

    if (!slot_id || !sponsor_address || !days || !content_url) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // In production: Transfer $RADIO tokens and record on-chain
    console.log('Ad slot purchase:', { slot_id, sponsor_address, days, content_url });

    return NextResponse.json({
      success: true,
      message: 'Ad slot purchased',
      tx_hash: '0x' + Math.random().toString(16).slice(2, 66),
    });
  } catch (error) {
    console.error('Error purchasing ad slot:', error);
    return NextResponse.json({ success: false, error: 'Failed to purchase' }, { status: 500 });
  }
}
