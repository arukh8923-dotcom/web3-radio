import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// GET /api/presets - Get user presets
export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const wallet_address = searchParams.get('wallet_address');

  if (!wallet_address) {
    return NextResponse.json(
      { error: 'wallet_address required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('presets')
    .select('*, stations(*)')
    .eq('wallet_address', wallet_address)
    .order('slot', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ presets: data });
}

// POST /api/presets - Save preset
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const body = await request.json();
  const { wallet_address, slot, station_id, frequency } = body;

  if (!wallet_address || !slot) {
    return NextResponse.json(
      { error: 'wallet_address and slot required' },
      { status: 400 }
    );
  }

  if (slot < 1 || slot > 6) {
    return NextResponse.json(
      { error: 'slot must be between 1 and 6' },
      { status: 400 }
    );
  }

  // Upsert preset
  const { data, error } = await supabase
    .from('presets')
    .upsert(
      {
        wallet_address,
        slot,
        station_id,
        frequency,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'wallet_address,slot' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ preset: data });
}
