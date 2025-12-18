import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  
  try {
    const body = await request.json();
    const { drop_id, wallet_address } = body;

    if (!drop_id || !wallet_address) {
      return NextResponse.json(
        { success: false, error: 'drop_id and wallet_address required' },
        { status: 400 }
      );
    }

    // Check if drop exists and is active
    const { data: drop, error: dropError } = await supabase
      .from('community_drops')
      .select('*')
      .eq('id', drop_id)
      .single();

    if (dropError || !drop) {
      return NextResponse.json(
        { success: false, error: 'Drop not found' },
        { status: 404 }
      );
    }

    // Check if drop is still active
    const now = new Date();
    const endTime = new Date(drop.end_time);
    if (endTime < now) {
      return NextResponse.json(
        { success: false, error: 'Drop has ended' },
        { status: 400 }
      );
    }

    // Check if already claimed
    const { data: existingClaim } = await supabase
      .from('drop_claims')
      .select('id')
      .eq('drop_id', drop_id)
      .eq('wallet_address', wallet_address.toLowerCase())
      .single();

    if (existingClaim) {
      return NextResponse.json(
        { success: false, error: 'Already claimed this drop' },
        { status: 400 }
      );
    }

    // Check max claims
    const { count: claimCount } = await supabase
      .from('drop_claims')
      .select('*', { count: 'exact', head: true })
      .eq('drop_id', drop_id);

    if (drop.max_claims && claimCount && claimCount >= drop.max_claims) {
      return NextResponse.json(
        { success: false, error: 'Drop is fully claimed' },
        { status: 400 }
      );
    }

    // Record claim in database
    const { data: claim, error: claimError } = await supabase
      .from('drop_claims')
      .insert({
        drop_id,
        wallet_address: wallet_address.toLowerCase(),
        amount: drop.amount_per_claim || drop.total_amount,
        claimed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (claimError) {
      console.error('Failed to record claim:', claimError);
      return NextResponse.json(
        { success: false, error: 'Failed to record claim' },
        { status: 500 }
      );
    }

    // TODO: On-chain transfer of VIBES tokens
    // For now, claim is recorded off-chain

    return NextResponse.json({
      success: true,
      message: 'Drop claimed successfully!',
      reward: {
        type: drop.token_type || 'vibes',
        amount: drop.amount_per_claim || drop.total_amount,
      },
      claim_id: claim.id,
      // tx_hash will be added when on-chain transfer is implemented
    });
  } catch (error) {
    console.error('Error claiming drop:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to claim drop' },
      { status: 500 }
    );
  }
}
