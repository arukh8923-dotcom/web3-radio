import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In production: Update database to end active alert
    return NextResponse.json({ success: true, message: 'Emergency ended' });
  } catch (error) {
    console.error('Error ending emergency:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
