import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// GET /api/tips - Get tips for station or DJ
export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const station_id = searchParams.get('station_id');
  const dj_address = searchParams.get('dj_address');
  const limit = parseInt(searchParams.get('limit') || '20');

  let query = supabase
    .from('tips')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (station_id) {
    query = query.eq('station_id', station_id);
  }

  if (dj_address) {
    query = query.eq('dj_address', dj_address);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tips: data });
}

// POST /api/tips - Record a tip (after on-chain tx)
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const body = await request.json();
  const { 
    station_id, 
    tipper_address, 
    dj_address, 
    amount, 
    token_address,
    tx_hash 
  } = body;

  if (!station_id || !tipper_address || !dj_address || !amount || !tx_hash) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('tips')
    .insert({
      station_id,
      tipper_address,
      dj_address,
      amount,
      token_address: token_address || 'RADIO',
      tx_hash,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tip: data }, { status: 201 });
}
