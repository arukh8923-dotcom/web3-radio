import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// GET /api/broadcasts - Get broadcasts
export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const station_id = searchParams.get('station_id');
  const current = searchParams.get('current') === 'true';
  const limit = parseInt(searchParams.get('limit') || '20');

  let query = supabase
    .from('broadcasts')
    .select('*, stations(name, frequency)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (station_id) {
    query = query.eq('station_id', station_id);
  }

  if (current) {
    // Get only currently playing (not locked or unlock time passed)
    query = query.or('is_locked.eq.false,unlock_time.lte.now()');
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ broadcasts: data });
}

// POST /api/broadcasts - Create new broadcast
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const body = await request.json();
  const {
    station_id,
    title,
    content_hash,
    content_type,
    duration,
    dj_address,
    ipfs_hash,
    unlock_time,
  } = body;

  if (!station_id || !title || !content_hash || !dj_address) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('broadcasts')
    .insert({
      station_id,
      title,
      content_hash,
      content_type: content_type || 'audio',
      duration: duration || 0,
      dj_address,
      ipfs_hash,
      unlock_time,
      is_locked: !!unlock_time,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ broadcast: data }, { status: 201 });
}
