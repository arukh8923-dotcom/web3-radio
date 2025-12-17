import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// GET /api/vibes - Get vibes reactions for station
export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const station_id = searchParams.get('station_id');

  if (!station_id) {
    return NextResponse.json(
      { error: 'station_id required' },
      { status: 400 }
    );
  }

  // Get mood ring data
  const { data: moodRing, error } = await supabase
    .from('mood_ring')
    .select('*')
    .eq('station_id', station_id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return default if not found
  if (!moodRing) {
    return NextResponse.json({
      mood_ring: {
        current_mood: 'chill',
        chill_count: 0,
        hype_count: 0,
        melancholy_count: 0,
        euphoric_count: 0,
        zen_count: 0,
      }
    });
  }

  return NextResponse.json({ mood_ring: moodRing });
}

// POST /api/vibes - React with vibes
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const body = await request.json();
  const { station_id, wallet_address, mood } = body;

  const validMoods = ['chill', 'hype', 'melancholy', 'euphoric', 'zen'];

  if (!station_id || !wallet_address || !mood) {
    return NextResponse.json(
      { error: 'station_id, wallet_address, and mood required' },
      { status: 400 }
    );
  }

  if (!validMoods.includes(mood)) {
    return NextResponse.json(
      { error: `mood must be one of: ${validMoods.join(', ')}` },
      { status: 400 }
    );
  }

  // Record reaction
  const { error: reactionError } = await supabase
    .from('vibes_reactions')
    .insert({
      station_id,
      wallet_address,
      mood,
    });

  if (reactionError) {
    return NextResponse.json({ error: reactionError.message }, { status: 500 });
  }

  // Update mood ring count
  const moodColumn = `${mood}_count`;
  const { data, error } = await supabase.rpc('increment_mood_count', {
    p_station_id: station_id,
    p_mood: mood,
  });

  if (error) {
    // Fallback: upsert mood ring
    await supabase
      .from('mood_ring')
      .upsert(
        {
          station_id,
          current_mood: mood,
          [`${mood}_count`]: 1,
        },
        { onConflict: 'station_id' }
      );
  }

  return NextResponse.json({ success: true, mood });
}
