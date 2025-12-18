import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { CONTRACTS, PAYMENT_TOKENS } from '@/constants/addresses';

// Valid payment tokens (RADIO and VIBES only - NO ETH/USDC)
const VALID_TOKEN_ADDRESSES = [
  CONTRACTS.RADIO_TOKEN.toLowerCase(),
  CONTRACTS.VIBES_TOKEN.toLowerCase(),
];

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

// POST /api/tips - Record a tip (off-chain for MVP, on-chain later)
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const body = await request.json();
  const { 
    station_id,
    station_name,
    tipper_address, 
    dj_address, 
    amount, 
    token_address,
    tx_hash,
    message,
  } = body;

  // Validate required fields
  if (!tipper_address || !amount || !token_address) {
    return NextResponse.json(
      { error: 'tipper_address, amount, and token_address required' },
      { status: 400 }
    );
  }

  // Enforce RADIO/VIBES only - NO ETH or USDC
  if (!VALID_TOKEN_ADDRESSES.includes(token_address.toLowerCase())) {
    return NextResponse.json(
      { error: 'Invalid token. Only $RADIO and $VIBES are accepted for tips.' },
      { status: 400 }
    );
  }

  // Get or create user
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('wallet_address', tipper_address.toLowerCase())
    .single();

  let userId = user?.id;
  if (!userId) {
    const { data: newUser } = await supabase
      .from('users')
      .insert({ wallet_address: tipper_address.toLowerCase() })
      .select('id')
      .single();
    userId = newUser?.id;
  }

  const { data, error } = await supabase
    .from('tips')
    .insert({
      station_id: station_id || null,
      tipper_address: tipper_address.toLowerCase(),
      dj_address: dj_address?.toLowerCase() || null,
      amount,
      token_address: token_address.toLowerCase(), // Must be RADIO or VIBES
      tx_hash: tx_hash || `pending-${Date.now()}`,
      message: message || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tip: data, message: 'Tip recorded (off-chain MVP)' }, { status: 201 });
}
