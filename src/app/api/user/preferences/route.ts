import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// GET /api/user/preferences - Get user preferences
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
    .from('users')
    .select('*')
    .eq('wallet_address', wallet_address)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return default preferences if user not found
  if (!data) {
    return NextResponse.json({
      preferences: {
        equalizer_bass: 50,
        equalizer_mid: 50,
        equalizer_treble: 50,
        volume: 50,
        audio_mode: 'stereo',
      }
    });
  }

  return NextResponse.json({ preferences: data });
}

// POST /api/user/preferences - Create or update user preferences
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const body = await request.json();
  const { 
    wallet_address,
    equalizer_bass,
    equalizer_mid,
    equalizer_treble,
    volume,
    audio_mode,
    farcaster_fid,
    farcaster_username,
  } = body;

  if (!wallet_address) {
    return NextResponse.json(
      { error: 'wallet_address required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        wallet_address,
        equalizer_bass: equalizer_bass ?? 50,
        equalizer_mid: equalizer_mid ?? 50,
        equalizer_treble: equalizer_treble ?? 50,
        volume: volume ?? 50,
        audio_mode: audio_mode ?? 'stereo',
        farcaster_fid,
        farcaster_username,
        last_active: new Date().toISOString(),
      },
      { onConflict: 'wallet_address' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ preferences: data });
}
