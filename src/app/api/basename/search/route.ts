import { NextRequest, NextResponse } from 'next/server';

// Mock search results
const mockResults = [
  { address: '0x1234567890abcdef1234567890abcdef12345678', name: 'djvibes.base', avatar: null },
  { address: '0xabcdef1234567890abcdef1234567890abcdef12', name: 'chillmaster.base', avatar: null },
  { address: '0x9876543210fedcba9876543210fedcba98765432', name: 'radiohead.base', avatar: null },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase();

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // In production: Search Base Name Service
    const results = mockResults.filter(r => r.name.includes(query));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching Base names:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
