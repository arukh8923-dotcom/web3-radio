import { NextRequest, NextResponse } from 'next/server';

// Mock NFT data - will integrate with Coinbase NFT API or indexer
interface NFT {
  token_id: string;
  contract_address: string;
  name: string;
  description: string | null;
  image_url: string | null;
  collection_name: string;
}

const mockNFTs: NFT[] = [
  {
    token_id: '1',
    contract_address: '0x420420420420420420420420420420420420420',
    name: 'Session #420',
    description: '420 FM Special Session NFT',
    image_url: null,
    collection_name: 'Web3 Radio Sessions',
  },
  {
    token_id: '42',
    contract_address: '0x420420420420420420420420420420420420420',
    name: 'First Tune In',
    description: 'Achievement NFT',
    image_url: null,
    collection_name: 'Web3 Radio Achievements',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'address required' }, { status: 400 });
    }

    // In production: Fetch from Coinbase NFT API or The Graph
    // Filter for Web3 Radio related NFTs

    return NextResponse.json({ nfts: mockNFTs });
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 });
  }
}
