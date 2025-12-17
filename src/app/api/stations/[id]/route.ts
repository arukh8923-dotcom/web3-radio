import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// GET /api/stations/[id] - Get single station
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabase();
  const { id } = await params;

  const { data, error } = await supabase
    .from('stations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Station not found' }, { status: 404 });
  }

  return NextResponse.json({ station: data });
}

// PATCH /api/stations/[id] - Update station
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabase();
  const { id } = await params;
  const body = await request.json();

  const { data, error } = await supabase
    .from('stations')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ station: data });
}
