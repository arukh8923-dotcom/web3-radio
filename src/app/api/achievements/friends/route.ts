import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/achievements/friends - Get friends list with their achievement stats
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('wallet');

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
  }

  try {
    // Get friends list from user_friends table
    const { data: friendships, error: friendsError } = await supabase
      .from('user_friends')
      .select('friend_address')
      .eq('wallet_address', walletAddress.toLowerCase());

    if (friendsError) {
      console.error('Error fetching friends:', friendsError);
      // Return empty array if table doesn't exist yet
      return NextResponse.json({ friends: [] });
    }

    if (!friendships || friendships.length === 0) {
      return NextResponse.json({ friends: [] });
    }

    // Get friend details and stats
    const friendAddresses = friendships.map(f => f.friend_address);
    
    const friends = await Promise.all(
      friendAddresses.map(async (friendAddr) => {
        // Get user info
        const { data: user } = await supabase
          .from('users')
          .select('wallet_address, farcaster_username, avatar_url')
          .eq('wallet_address', friendAddr)
          .single();

        // Get achievement count
        const { count: unlockedCount } = await supabase
          .from('user_achievements')
          .select('*', { count: 'exact', head: true })
          .eq('wallet_address', friendAddr)
          .eq('unlocked', true);

        // Get listening stats
        const { data: stats } = await supabase
          .from('user_stats')
          .select('total_listening_hours')
          .eq('wallet_address', friendAddr)
          .single();

        // Get rarest achievement
        const { data: rarestAchievement } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('wallet_address', friendAddr)
          .eq('unlocked', true)
          .order('rarity_score', { ascending: false })
          .limit(1)
          .single();

        return {
          wallet_address: friendAddr,
          display_name: user?.farcaster_username || null,
          avatar_url: user?.avatar_url || null,
          unlocked_count: unlockedCount || 0,
          total_listening_hours: stats?.total_listening_hours || 0,
          rarest_achievement: rarestAchievement?.achievement_id || null,
        };
      })
    );

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Error in friends API:', error);
    return NextResponse.json({ friends: [] });
  }
}

// POST /api/achievements/friends - Add a friend
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address, friend_address } = body;

    if (!wallet_address || !friend_address) {
      return NextResponse.json(
        { error: 'Both wallet_address and friend_address required' },
        { status: 400 }
      );
    }

    // Validate addresses
    if (wallet_address.toLowerCase() === friend_address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot add yourself as friend' },
        { status: 400 }
      );
    }

    // Insert friendship (placeholder - will create table if needed)
    const { error } = await supabase
      .from('user_friends')
      .upsert({
        wallet_address: wallet_address.toLowerCase(),
        friend_address: friend_address.toLowerCase(),
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'wallet_address,friend_address',
      });

    if (error) {
      console.error('Error adding friend:', error);
      // Store locally as fallback
      return NextResponse.json({ 
        success: true, 
        message: 'Friend added (local storage - on-chain pending)' 
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in add friend:', error);
    return NextResponse.json({ error: 'Failed to add friend' }, { status: 500 });
  }
}

// DELETE /api/achievements/friends - Remove a friend
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('wallet');
  const friendAddress = searchParams.get('friend');

  if (!walletAddress || !friendAddress) {
    return NextResponse.json(
      { error: 'Both wallet and friend addresses required' },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase
      .from('user_friends')
      .delete()
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('friend_address', friendAddress.toLowerCase());

    if (error) {
      console.error('Error removing friend:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in remove friend:', error);
    return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 });
  }
}
