import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// Request expiry time (2 hours)
const REQUEST_EXPIRY_MS = 2 * 60 * 60 * 1000;

// POST - Mark request as expired
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerSupabase();
    const { id } = await params;

    // Get request
    const { data: req } = await supabase
      .from('song_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (!req) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check if actually expired
    const createdAt = new Date(req.created_at).getTime();
    if (Date.now() - createdAt < REQUEST_EXPIRY_MS) {
      return NextResponse.json({ error: 'Request not yet expired' }, { status: 400 });
    }

    // Update status to expired
    const { data, error } = await supabase
      .from('song_requests')
      .update({
        status: 'expired',
        expired_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to expire request' }, { status: 500 });
    }

    return NextResponse.json({ success: true, request: data });
  } catch (error) {
    console.error('Error in POST /api/requests/[id]/expire:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
