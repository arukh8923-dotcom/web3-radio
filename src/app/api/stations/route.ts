import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// GET /api/stations - Get all stations or search
export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  
  const category = searchParams.get('category');
  const frequency = searchParams.get('frequency');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('stations')
    .select('*')
    .order('listener_count', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq('category', category);
  }

  if (frequency) {
    query = query.eq('frequency', parseFloat(frequency));
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stations: data });
}

// POST /api/stations - Create new station
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const body = await request.json();

  const { name, frequency, category, description, owner_address } = body;

  if (!name || !frequency || !category || !owner_address) {
    return NextResponse.json(
      { error: 'Missing required fields: name, frequency, category, owner_address' },
      { status: 400 }
    );
  }

  // Check if frequency is already taken
  const { data: existing } = await supabase
    .from('stations')
    .select('id')
    .eq('frequency', frequency)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'Frequency already taken' },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from('stations')
    .insert({
      name,
      frequency,
      category,
      description,
      owner_address,
      listener_count: 0,
      signal_strength: 100,
      is_live: false,
      is_premium: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ station: data }, { status: 201 });
}
