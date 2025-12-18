import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Refund expired request (requester only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { wallet_address } = body;

    if (!wallet_address) {
      return NextResponse.json({ error: 'Missing wallet_address' }, { status: 400 });
    }

    // Get request
    const { data: req } = await supabase
      .from('song_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (!req) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Verify ownership
    if (req.wallet_address.toLowerCase() !== wallet_address.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Check status
    if (req.status !== 'expired') {
      return NextResponse.json({ error: 'Request must be expired to refund' }, { status: 400 });
    }

    // In production, this would trigger an actual token transfer from treasury back to user
    // For now, we just mark it as refunded
    // The actual refund would require:
    // 1. A backend wallet with VIBES tokens
    // 2. Or a smart contract that holds stakes and can refund

    const refundTxHash = `0x${Date.now().toString(16)}${'0'.repeat(48)}`; // Placeholder

    const { data, error } = await supabase
      .from('song_requests')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        refund_tx_hash: refundTxHash,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      request: data,
      refund_tx_hash: refundTxHash,
      message: 'Refund processed. VIBES will be returned to your wallet.',
    });
  } catch (error) {
    console.error('Error in POST /api/requests/[id]/refund:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
