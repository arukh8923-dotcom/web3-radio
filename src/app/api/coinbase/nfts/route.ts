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

    // Get session NFTs from database (case-insensitive match)
    const { data: sessions } = await supabase
      .from('session_attendances')
      .select('nft_token_id, sessions (title, name)')
      .ilike('wallet_address', address)
      .eq('nft_claimed', true)
      .not('nft_token_id', 'is', null);

    if (sessions) {
      sessions.forEach((s: any) => {
        if (s.nft_token_id) {
          nfts.push({
            token_id: s.nft_token_id,
            contract_address: CONTRACTS.SESSION_NFT_FACTORY,
            name: s.sessions?.title || s.sessions?.name || 'Session NFT',
            description: 'Web3 Radio Session Attendance NFT',
            image_url: `/api/nft/session/${s.nft_token_id}/image`,
            collection_name: 'Web3 Radio Sessions',
          });
        }
      });
    }

    // Get user ID first for achievement lookup
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .ilike('wallet_address', address)
      .single();

    if (user) {
      // Get achievement NFTs via user_id
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('nft_token_id, achievements (name, description, code)')
        .eq('user_id', user.id)
        .not('nft_token_id', 'is', null);

      if (achievements) {
        achievements.forEach((a: any) => {
          if (a.nft_token_id) {
            nfts.push({
              token_id: a.nft_token_id,
              contract_address: CONTRACTS.STATION_NFT,
              name: a.achievements?.name || 'Achievement NFT',
              description: a.achievements?.description || 'Web3 Radio Achievement',
              image_url: `/api/nft/achievement/${a.achievements?.code || a.nft_token_id}/image`,
              collection_name: 'Web3 Radio Achievements',
            });
          }
        });
      }
    }

    // Get station NFTs owned by this address
    const { data: stations } = await supabase
      .from('stations')
      .select('id, name, frequency')
      .ilike('owner_address', address);

    if (stations) {
      stations.forEach((station: any) => {
        nfts.push({
          token_id: station.id,
          contract_address: CONTRACTS.STATION_NFT,
          name: `${station.name} (${station.frequency} FM)`,
          description: 'Web3 Radio Station Ownership NFT',
          image_url: `/api/nft/station/${station.id}/image`,
          collection_name: 'Web3 Radio Stations',
        });
      });
    }

    return NextResponse.json({ nfts });
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return NextResponse.json({ nfts: [] });
  }
}
