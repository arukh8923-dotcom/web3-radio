import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// POST /api/achievements/mint - Mint achievement as NFT
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const body = await request.json();
  const { wallet_address, achievement_id } = body;

  if (!wallet_address || !achievement_id) {
    return NextResponse.json(
      { error: 'wallet_address and achievement_id required' },
      { status: 400 }
    );
  }

  const walletLower = wallet_address.toLowerCase();

  try {
    // Check if achievement is unlocked
    const { data: achievement } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('wallet_address', walletLower)
      .eq('achievement_id', achievement_id)
      .single();

    if (!achievement) {
      return NextResponse.json(
        { error: 'Achievement not unlocked' },
        { status: 400 }
      );
    }

    if (achievement.nft_minted) {
      return NextResponse.json(
        { error: 'NFT already minted' },
        { status: 400 }
      );
    }

    // TODO: Actual NFT minting on Base
    // For now, just mark as minted (placeholder)
    const { data, error } = await supabase
      .from('user_achievements')
      .update({
        nft_minted: true,
        nft_tx_hash: `pending-${Date.now()}`, // Placeholder
        minted_at: new Date().toISOString(),
      })
      .eq('id', achievement.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      achievement: data,
      message: 'Achievement NFT minting initiated (on-chain minting coming soon)',
    });
  } catch (error) {
    console.error('Mint error:', error);
    return NextResponse.json(
      { error: 'Failed to mint NFT' },
      { status: 500 }
    );
  }
}
