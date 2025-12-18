import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

// Lazy initialization to avoid build errors when env vars are missing
let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (!supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabase;
}

// GET - Fetch presets (community or user's own)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'community';
    const address = searchParams.get('address');

    let query = supabase.from('eq_presets').select('*');

    if (type === 'community') {
      // Public presets, sorted by popularity
      query = query.eq('is_public', true).order('uses_count', { ascending: false }).limit(50);
    } else if (type === 'my' && address) {
      // User's own presets
      query = query.eq('creator_address', address.toLowerCase()).order('created_at', { ascending: false });
    } else {
      return NextResponse.json({ presets: [] });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching presets:', error);
      return NextResponse.json({ presets: [] });
    }

    return NextResponse.json({ presets: data || [] });
  } catch (error) {
    console.error('Error in GET /api/eq-presets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new preset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, bass, mid, treble, creator_address, is_public } = body;

    if (!name || bass === undefined || mid === undefined || treble === undefined || !creator_address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate values
    if (bass < 0 || bass > 100 || mid < 0 || mid > 100 || treble < 0 || treble > 100) {
      return NextResponse.json({ error: 'EQ values must be between 0-100' }, { status: 400 });
    }

    // Generate share code
    const shareCode = nanoid(8);

    // Get creator name from users table
    const { data: userData } = await supabase
      .from('users')
      .select('base_name, farcaster_username')
      .eq('wallet_address', creator_address.toLowerCase())
      .single();

    const creatorName = userData?.base_name || userData?.farcaster_username || null;

    const { data, error } = await supabase
      .from('eq_presets')
      .insert({
        id: shareCode,
        name: name.slice(0, 50),
        bass: Math.round(bass),
        mid: Math.round(mid),
        treble: Math.round(treble),
        creator_address: creator_address.toLowerCase(),
        creator_name: creatorName,
        is_public: is_public ?? true,
        uses_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating preset:', error);
      return NextResponse.json({ error: 'Failed to create preset' }, { status: 500 });
    }

    return NextResponse.json({ preset: data, share_code: shareCode });
  } catch (error) {
    console.error('Error in POST /api/eq-presets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
