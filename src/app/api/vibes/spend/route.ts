import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// POST - Record VIBES spending
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const body = await request.json();
    const { wallet_address, feature, amount, tx_hash, metadata } = body;

    if (!wallet_address || !feature || !amount || !tx_hash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('vibes_spending')
      .insert({
        wallet_address: wallet_address.toLowerCase(),
        feature,
        amount,
        tx_hash,
        metadata: metadata || {},
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording VIBES spending:', error);
      return NextResponse.json({ error: 'Failed to record spending' }, { status: 500 });
    }

    return NextResponse.json({ success: true, spending: data });
  } catch (error) {
    console.error('Error in POST /api/vibes/spend:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get spending history
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const feature = searchParams.get('feature');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!address) {
      return NextResponse.json({ error: 'Missing address' }, { status: 400 });
    }

    let query = supabase
      .from('vibes_spending')
      .select('*')
      .eq('wallet_address', address.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (feature) {
      query = query.eq('feature', feature);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching spending history:', error);
      return NextResponse.json({ spending: [] });
    }

    // Calculate totals
    const totalSpent = data?.reduce((sum, s) => sum + s.amount, 0) || 0;
    const byFeature: Record<string, number> = {};
    data?.forEach((s) => {
      byFeature[s.feature] = (byFeature[s.feature] || 0) + s.amount;
    });

    return NextResponse.json({
      spending: data || [],
      totalSpent,
      byFeature,
    });
  } catch (error) {
    console.error('Error in GET /api/vibes/spend:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
