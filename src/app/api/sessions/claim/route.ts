import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/sessions/claim - Claim Session NFT
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, wallet_address } = body;

    if (!session_id || !wallet_address) {
      return NextResponse.json(
        { error: 'session_id and wallet_address required' },
        { status: 400 }
      );
    }

    const normalizedAddress = wallet_address.toLowerCase();

    // Get session info
    const { data: session } = await supabase
      .from('sessions')
      .select('id, is_active, title')
      .eq('id', session_id)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.is_active) {
      return NextResponse.json(
        { error: 'Session is still active. Wait until it ends to claim.' },
        { status: 400 }
      );
    }

    // Get attendance record
    const { data: attendance } = await supabase
      .from('session_attendances')
      .select('*')
      .eq('session_id', session_id)
      .eq('wallet_address', normalizedAddress)
      .single();

    if (!attendance) {
      return NextResponse.json(
        { error: 'You did not attend this session' },
        { status: 400 }
      );
    }

    if (!attendance.eligible_for_nft) {
      return NextResponse.json(
        { error: 'You need to attend for at least 10 minutes to claim NFT' },
        { status: 400 }
      );
    }

    if (attendance.nft_claimed) {
      return NextResponse.json(
        { error: 'NFT already claimed', token_id: attendance.nft_token_id },
        { status: 400 }
      );
    }

    // Generate placeholder token ID (on-chain minting pending)
    const tokenId = `SESSION-${session_id}-${Date.now()}`;

    // Update attendance record
    const { error: updateError } = await supabase
      .from('session_attendances')
      .update({
        nft_claimed: true,
        nft_token_id: tokenId,
        claimed_at: new Date().toISOString(),
      })
      .eq('id', attendance.id);

    if (updateError) {
      console.error('Error updating attendance:', updateError);
      return NextResponse.json({ error: 'Failed to claim NFT' }, { status: 500 });
    }

    // TODO: Mint actual NFT on-chain
    // For now, just record in database

    // Award VIBES (placeholder)
    // TODO: Transfer VIBES tokens on-chain

    return NextResponse.json({
      success: true,
      token_id: tokenId,
      message: 'Session NFT claimed! On-chain minting coming soon.',
    });
  } catch (error) {
    console.error('Error in claim NFT:', error);
    return NextResponse.json({ error: 'Failed to claim NFT' }, { status: 500 });
  }
}
