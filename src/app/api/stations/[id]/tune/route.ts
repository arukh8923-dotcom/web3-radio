import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// POST /api/stations/[id]/tune - Tune in to station
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabase();
  const { id } = await params;
  const body = await request.json();
  const { wallet_address } = body;

  if (!wallet_address) {
    return NextResponse.json(
      { error: 'wallet_address required' },
      { status: 400 }
    );
  }

  // Check if already tuned in
  const { data: existing } = await supabase
    .from('tune_ins')
    .select('id')
    .eq('station_id', id)
    .eq('wallet_address', wallet_address)
    .is('tuned_out_at', null)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'Already tuned in to this station' },
      { status: 409 }
    );
  }

  // Create tune in record
  const { data, error } = await supabase
    .from('tune_ins')
    .insert({
      station_id: id,
      wallet_address,
      tuned_in_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update listener count
  await supabase.rpc('increment_listener_count', { station_id: id });

  return NextResponse.json({ tune_in: data }, { status: 201 });
}

// DELETE /api/stations/[id]/tune - Tune out from station
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabase();
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const wallet_address = searchParams.get('wallet_address');

  if (!wallet_address) {
    return NextResponse.json(
      { error: 'wallet_address required' },
      { status: 400 }
    );
  }

  // Update tune out time
  const { error } = await supabase
    .from('tune_ins')
    .update({ tuned_out_at: new Date().toISOString() })
    .eq('station_id', id)
    .eq('wallet_address', wallet_address)
    .is('tuned_out_at', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Decrement listener count
  await supabase.rpc('decrement_listener_count', { station_id: id });

  return NextResponse.json({ success: true });
}
