import { NextRequest, NextResponse } from 'next/server';
import { getUserByFid } from '@/lib/neynar';
import { createServerSupabase } from '@/lib/supabase';

// Get frequency NFT data from database
async function getFrequencyNFTData(tokenId: string, supabase: ReturnType<typeof createServerSupabase>) {
  // Try to get station by token ID or frequency
  const frequency = parseFloat(tokenId) / 10; // Token ID is frequency * 10
  
  const { data: station } = await supabase
    .from('stations')
    .select('*, users:owner_address(farcaster_fid, farcaster_username)')
    .eq('frequency', frequency)
    .single();

  if (station) {
    return {
      tokenId,
      frequency: station.frequency,
      stationName: station.name || 'Web3 Radio Station',
      genre: station.category || 'Music',
      ownerAddress: station.owner_address,
      ownerFid: (station.users as any)?.farcaster_fid || 0,
      mintedAt: station.created_at || new Date().toISOString(),
      totalSupply: 1,
    };
  }

  // Return default data if station not found
  return {
    tokenId,
    frequency: frequency || 88.1,
    stationName: 'Web3 Radio Station',
    genre: 'Music',
    ownerAddress: null,
    ownerFid: 0,
    mintedAt: new Date().toISOString(),
    totalSupply: 1,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const supabase = createServerSupabase();
  const { tokenId } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://web3-radio-omega.vercel.app';
  
  try {
    // Get NFT data from database
    const nftData = await getFrequencyNFTData(tokenId, supabase);
    
    // Get owner's Farcaster profile
    let ownerUsername = 'unknown';
    let ownerFid = 0;
    let ownerDisplayName = 'Unknown';
    
    if (nftData.ownerFid) {
      const profile = await getUserByFid(nftData.ownerFid);
      if (profile) {
        ownerUsername = profile.username;
        ownerFid = profile.fid;
        ownerDisplayName = profile.display_name || profile.username;
      }
    }
    
    // Creator info
    const creatorUsername = process.env.NEXT_PUBLIC_CREATOR_USERNAME || 'ukhy89';
    const creatorFid = process.env.NEXT_PUBLIC_CREATOR_FID || '250705';
    
    const metadata = {
      name: `${nftData.frequency.toFixed(1)} FM - ${nftData.stationName}`,
      description: `Radio License NFT for frequency ${nftData.frequency.toFixed(1)} FM on Web3 Radio. This certificate grants ownership rights to broadcast on this frequency. Created by @${creatorUsername} on Base Network.`,
      image: `${appUrl}/api/nft/frequency/${tokenId}/image`,
      external_url: `${appUrl}/station/${nftData.frequency}`,
      attributes: [
        {
          trait_type: 'Frequency',
          value: `${nftData.frequency.toFixed(1)} FM`,
        },
        {
          trait_type: 'Station Name',
          value: nftData.stationName,
        },
        {
          trait_type: 'Genre',
          value: nftData.genre,
        },
        {
          trait_type: 'Owner',
          value: `@${ownerUsername}`,
        },
        {
          trait_type: 'Owner FID',
          display_type: 'number',
          value: ownerFid,
        },
        {
          trait_type: 'Token ID',
          display_type: 'number',
          value: parseInt(tokenId),
        },
        {
          trait_type: 'Minted Date',
          display_type: 'date',
          value: Math.floor(new Date(nftData.mintedAt).getTime() / 1000),
        },
        {
          trait_type: 'Creator',
          value: `@${creatorUsername}`,
        },
        {
          trait_type: 'Creator FID',
          display_type: 'number',
          value: parseInt(creatorFid),
        },
        {
          trait_type: 'Network',
          value: 'Base',
        },
        {
          trait_type: 'Protocol',
          value: 'x402',
        },
      ],
    };
    
    return NextResponse.json(metadata, {
      headers: {
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('Error generating NFT metadata:', error);
    return NextResponse.json({ error: 'Failed to generate metadata' }, { status: 500 });
  }
}
