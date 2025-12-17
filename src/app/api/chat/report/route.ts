import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// POST /api/chat/report - Report a chat message for moderation
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const body = await request.json();
  const { message_id, reporter_address, station_id, reason } = body;

  if (!message_id || !reporter_address) {
    return NextResponse.json(
      { error: 'message_id and reporter_address required' },
      { status: 400 }
    );
  }

  // Check if already reported by this user
  const { data: existing } = await supabase
    .from('chat_reports')
    .select('id')
    .eq('message_id', message_id)
    .eq('reporter_address', reporter_address.toLowerCase())
    .single();

  if (existing) {
    return NextResponse.json({ message: 'Already reported' }, { status: 200 });
  }

  // Create report
  const { data, error } = await supabase
    .from('chat_reports')
    .insert({
      message_id,
      reporter_address: reporter_address.toLowerCase(),
      station_id: station_id || null,
      reason: reason || 'inappropriate',
    })
    .select()
    .single();

  if (error) {
    // Table might not exist yet, just log and return success
    console.error('Failed to save report:', error);
    return NextResponse.json({ message: 'Report noted' }, { status: 200 });
  }

  // Count total reports for this message
  const { count } = await supabase
    .from('chat_reports')
    .select('*', { count: 'exact', head: true })
    .eq('message_id', message_id);

  // Auto-hide message if it reaches threshold (e.g., 3 reports)
  const REPORT_THRESHOLD = 3;
  if (count && count >= REPORT_THRESHOLD) {
    await supabase
      .from('live_chat')
      .update({ is_hidden: true })
      .eq('id', message_id);
  }

  return NextResponse.json({ 
    report: data, 
    message: 'Report submitted',
    reportCount: count,
  }, { status: 201 });
}

// GET /api/chat/report - Get reports for moderation (admin)
export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const station_id = searchParams.get('station_id');
  const status = searchParams.get('status') || 'pending';

  let query = supabase
    .from('chat_reports')
    .select(`
      *,
      live_chat:message_id (
        id,
        message,
        user_id,
        created_at
      )
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(50);

  if (station_id) {
    query = query.eq('station_id', station_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reports: data });
}
