import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// GET /api/subscriptions - Get subscription status
export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const subscriber = searchParams.get('subscriber');
  const station = searchParams.get('station');
  const station_id = searchParams.get('station_id');

  if (!subscriber) {
    return NextResponse.json({ error: 'subscriber address required' }, { status: 400 });
  }

  let query = supabase
    .from('subscriptions')
    .select('*')
    .eq('subscriber_address', subscriber.toLowerCase())
    .order('created_at', { ascending: false });

  if (station) {
    query = query.eq('station_name', station);
  }

  if (station_id) {
    query = query.eq('station_id', station_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Find active subscription
  const now = new Date();
  const activeSubscription = data?.find(sub => {
    const expiry = new Date(sub.expiry_date);
    return expiry > now && sub.status !== 'cancelled';
  });

  return NextResponse.json({ 
    subscriptions: data,
    subscription: activeSubscription || null,
    hasActiveSubscription: !!activeSubscription,
  });
}

// POST /api/subscriptions - Create/renew subscription
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  const body = await request.json();
  const {
    station_id,
    station_name,
    station_address,
    tier_id,
    tier_name,
    subscriber_address,
    price,
    duration_days,
    start_date,
    expiry_date,
    auto_renew,
    tx_hash,
  } = body;

  if (!subscriber_address || !tier_id) {
    return NextResponse.json(
      { error: 'subscriber_address and tier_id required' },
      { status: 400 }
    );
  }

  // Get or create user
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('wallet_address', subscriber_address.toLowerCase())
    .single();

  let userId = user?.id;
  if (!userId) {
    const { data: newUser } = await supabase
      .from('users')
      .insert({ wallet_address: subscriber_address.toLowerCase() })
      .select('id')
      .single();
    userId = newUser?.id;
  }

  // Check for existing active subscription to same station
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('subscriber_address', subscriber_address.toLowerCase())
    .eq('station_name', station_name)
    .eq('status', 'active')
    .single();

  if (existing) {
    // Extend existing subscription
    const currentExpiry = new Date(existing.expiry_date);
    const newExpiry = new Date(currentExpiry.getTime() + (duration_days || 30) * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        expiry_date: newExpiry.toISOString(),
        tier_id,
        tier_name,
        auto_renew: auto_renew ?? existing.auto_renew,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      subscription: data, 
      message: 'Subscription renewed',
      renewed: true,
    }, { status: 200 });
  }

  // Create new subscription
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      station_id: station_id || null,
      station_name: station_name || 'Unknown Station',
      station_address: station_address || null,
      tier_id,
      tier_name: tier_name || tier_id,
      subscriber_address: subscriber_address.toLowerCase(),
      price: price || '0',
      start_date: start_date || new Date().toISOString(),
      expiry_date: expiry_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      auto_renew: auto_renew ?? false,
      tx_hash: tx_hash || `pending-${Date.now()}`,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ 
    subscription: data, 
    message: 'Subscription created (off-chain MVP)',
  }, { status: 201 });
}

// DELETE /api/subscriptions - Cancel subscription
export async function DELETE(request: NextRequest) {
  const supabase = createServerSupabase();
  const body = await request.json();
  const { subscription_id, subscriber_address } = body;

  if (!subscription_id || !subscriber_address) {
    return NextResponse.json(
      { error: 'subscription_id and subscriber_address required' },
      { status: 400 }
    );
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', subscription_id)
    .eq('subscriber_address', subscriber_address.toLowerCase())
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }

  // Mark as cancelled (don't delete, keep for history)
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      auto_renew: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ 
    subscription: data, 
    message: 'Subscription cancelled. Access remains until expiry date.',
  });
}
