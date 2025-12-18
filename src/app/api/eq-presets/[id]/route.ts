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

// DELETE - Delete preset (owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getSupabase();
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { id } = await params;
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json({ error: 'Missing address' }, { status: 400 });
    }

    const { data: preset } = await db
      .from('eq_presets')
      .select('creator_address')
      .eq('id', id)
      .single();

    if (!preset) {
      return NextResponse.json({ error: 'Preset not found' }, { status: 404 });
    }

    if (preset.creator_address.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { error } = await db
      .from('eq_presets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting preset:', error);
      return NextResponse.json({ error: 'Failed to delete preset' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/eq-presets/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get single preset by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getSupabase();
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { id } = await params;

    const { data, error } = await db
      .from('eq_presets')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Preset not found' }, { status: 404 });
    }

    return NextResponse.json({ preset: data });
  } catch (error) {
    console.error('Error in GET /api/eq-presets/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
