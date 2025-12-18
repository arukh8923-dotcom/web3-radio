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

// POST - Track preset usage
export async function POST(request: NextRequest) {
  try {
    const db = getSupabase();
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { preset_id } = body;

    if (!preset_id) {
      return NextResponse.json({ error: 'Missing preset_id' }, { status: 400 });
    }

    // Increment uses count
    const { error } = await db.rpc('increment_eq_preset_uses', { preset_id_param: preset_id });

    if (error) {
      // Fallback: manual increment
      const { data: preset } = await db
        .from('eq_presets')
        .select('uses_count')
        .eq('id', preset_id)
        .single();

      if (preset) {
        await db
          .from('eq_presets')
          .update({ uses_count: (preset.uses_count || 0) + 1 })
          .eq('id', preset_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/eq-presets/use:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
