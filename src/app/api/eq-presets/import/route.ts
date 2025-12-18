import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

// GET - Import preset by code
export async function GET(request: NextRequest) {
  try {
    const db = getSupabase();
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
    }

    const { data, error } = await db
      .from('eq_presets')
      .select('*')
      .eq('id', code)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Preset not found' }, { status: 404 });
    }

    // Increment uses count
    await db
      .from('eq_presets')
      .update({ uses_count: (data.uses_count || 0) + 1 })
      .eq('id', code);

    return NextResponse.json({ preset: data });
  } catch (error) {
    console.error('Error in GET /api/eq-presets/import:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
