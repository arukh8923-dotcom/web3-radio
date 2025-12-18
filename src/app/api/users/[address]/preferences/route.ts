import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// GET - Get user preferences
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const supabase = createServerSupabase();
    const { address } = await params;

    const { data, error } = await supabase
      .from('users')
      .select('language, broadcast_language_filter, equalizer_bass, equalizer_mid, equalizer_treble, volume, audio_mode')
      .eq('wallet_address', address.toLowerCase())
      .single();

    if (error || !data) {
      return NextResponse.json({
        language: 'en',
        broadcast_language_filter: 'all',
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/users/[address]/preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update user preferences
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const supabase = createServerSupabase();
    const { address } = await params;
    const body = await request.json();

    const allowedFields = [
      'language',
      'broadcast_language_filter',
      'equalizer_bass',
      'equalizer_mid',
      'equalizer_treble',
      'volume',
      'audio_mode',
    ];

    // Filter to only allowed fields
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Upsert user record
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          wallet_address: address.toLowerCase(),
          ...updates,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'wallet_address' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating preferences:', error);
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }

    return NextResponse.json({ success: true, preferences: data });
  } catch (error) {
    console.error('Error in PATCH /api/users/[address]/preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
