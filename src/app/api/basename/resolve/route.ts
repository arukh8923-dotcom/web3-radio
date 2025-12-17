import { NextRequest, NextResponse } from 'next/server';

// Base Name Service resolution
// In production: Use Base Name Service contracts or API

const mockNames: Record<string, { name: string; avatar: string | null }> = {
  '0x1234567890abcdef1234567890abcdef12345678': { name: 'djvibes.base', avatar: null },
  '0xabcdef1234567890abcdef1234567890abcdef12': { name: 'chillmaster.base', avatar: null },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address')?.toLowerCase();

    if (!address) {
      return NextResponse.json({ error: 'address required' }, { status: 400 });
    }

    // In production: Call Base Name Service contract
    // const name = await baseNameContract.getName(address);

    const data = mockNames[address] || { name: null, avatar: null };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error resolving Base name:', error);
    return NextResponse.json({ error: 'Failed to resolve' }, { status: 500 });
  }
}
