import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station_id');

    let query = supabase
      .from('ad_slots')
      .select('*')
      .order('position', { ascending: true });

    if (stationId) {
      query = query.eq('station_id', stationId);
    }

    const { data: slots, error } = await query;

    if (error) {
      console.error('Error fetching ad slots:', error);
      return NextResponse.json({ slots: [] });
    }

    return NextResponse.json({ slots: slots || [] });
  } catch (error) {
    console.error('Error fetching ad slots:', error);
    return NextResponse.json({ slots: [] });
  }
}
