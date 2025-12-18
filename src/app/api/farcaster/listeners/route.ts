import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

interface FarcasterListener {
  fid: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  follower_count: number;
  wallet_address: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station_id');

    if (!stationId) {
      return NextResponse.json({ listeners: [], total: 0 });
    }

    // Get current listeners from tune_ins
    const { data: tuneIns } = await supabase
      .from('tune_ins')
      .select('wallet_address, user_id')
      .eq('station_id', stationId)
      .is('tuned_out_at', null);

    if (!tuneIns || tuneIns.length === 0) {
      return NextResponse.json({ listeners: [], total: 0 });
    }

    // Get user profiles with Farcaster data
    const walletAddresses = tuneIns.map(t => t.wallet_address).filter(Boolean);
    const { data: users } = await supabase
      .from('users')
      .select('wallet_address, farcaster_fid, farcaster_username, avatar_url')
      .in('wallet_address', walletAddresses);

    const listeners: FarcasterListener[] = (users || [])
      .filter(u => u.farcaster_fid)
      .map(u => ({
        fid: u.farcaster_fid!,
        username: u.farcaster_username || '',
        display_name: u.farcaster_username,
        avatar_url: u.avatar_url,
        follower_count: 0,
        wallet_address: u.wallet_address,
      }));

    return NextResponse.json({
      listeners,
      total: listeners.length,
    });
  } catch (error) {
    console.error('Error fetching Farcaster listeners:', error);
    return NextResponse.json({ listeners: [], total: 0 });
  }
}
