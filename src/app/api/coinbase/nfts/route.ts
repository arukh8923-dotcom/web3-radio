import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { CONTRACTS } from '@/constants/addresses';

interface NFT {
  token_id: string;
  contract_address: string;
  name: string;
  description: string | null;
  image_url: string | null;
  collection_name: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'address required' }, { status: 400 });
    }

    const nfts: NFT[] = [];

    // Get session NFTs from database
    const { data: sessions } = await supabase
      .from('session_attendances')
      .select('nft_token_id, sessions (title)')
      .eq('wallet_address', address.toLowerCase())
      .eq('nft_claimed', true)
      .not('nft_token_id', 'is', null);

    if (sessions) {
      sessions.forEach((s: any) => {
        if (s.nft_token_id) {
          nfts.push({
            token_id: s.nft_token_id,
            contract_address: CONTRACTS.SESSION_NFT_FACTORY,
            name: s.sessions?.title || 'Session NFT',
            description: 'Web3 Radio Session Attendance NFT',
            image_url: `/api/nft/session/${s.nft_token_id}/image`,
            collection_name: 'Web3 Radio Sessions',
          });
        }
      });
    }

    // Get achievement NFTs
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('nft_token_id, achievement_id, achievements (name, description)')
      .eq('wallet_address', address.toLowerCase())
      .eq('nft_minted', true)
      .not('nft_token_id', 'is', null);

    if (achievements) {
      achievements.forEach((a: any) => {
        if (a.nft_token_id) {
          nfts.push({
            token_id: a.nft_token_id,
            contract_address: CONTRACTS.STATION_NFT,
            name: a.achievements?.name || 'Achievement NFT',
            description: a.achievements?.description || 'Web3 Radio Achievement',
            image_url: `/api/nft/achievement/${a.nft_token_id}/image`,
            collection_name: 'Web3 Radio Achievements',
          });
        }
      });
    }

    return NextResponse.json({ nfts });
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return NextResponse.json({ nfts: [] });
  }
}
