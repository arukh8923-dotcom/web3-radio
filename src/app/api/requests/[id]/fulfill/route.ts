import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// POST - Mark request as fulfilled (DJ only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabase();
    const { id } = await params;
    const body = await request.json();
    const { fulfilled_by } = body;

    if (!fulfilled_by) {
      return NextResponse.json({ error: 'Missing fulfilled_by' }, { status: 400 });
    }

    // Update request status
    const { data, error } = await supabase
      .from('song_requests')
      .update({
        status: 'fulfilled',
        fulfilled_by: fulfilled_by.toLowerCase(),
        fulfilled_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('status', 'pending')
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Request not found or already processed' }, { status: 404 });
    }

    // Note: In production, the staked VIBES would be transferred to the DJ
    // This requires a backend wallet or smart contract to hold and distribute stakes

    return NextResponse.json({ success: true, request: data });
  } catch (error) {
    console.error('Error in POST /api/requests/[id]/fulfill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
