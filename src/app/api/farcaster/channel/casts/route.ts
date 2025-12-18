import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

interface Cast {
  hash: string;
  author: {
    fid: number;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  text: string;
  timestamp: string;
  reactions: {
    likes: number;
    recasts: number;
  };
  replies: number;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station_id');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!stationId) {
      return NextResponse.json({ casts: [], total: 0 });
    }

    // Get recent chat messages as "casts" for now
    const { data: messages } = await supabase
      .from('live_chat')
      .select(`
        id,
        message,
        created_at,
        user_id,
        users (
          wallet_address,
          farcaster_fid,
          farcaster_username,
          avatar_url
        )
      `)
      .eq('station_id', stationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    const casts: Cast[] = (messages || []).map((msg: any) => ({
      hash: msg.id,
      author: {
        fid: msg.users?.farcaster_fid || 0,
        username: msg.users?.farcaster_username || 'anonymous',
        display_name: msg.users?.farcaster_username || null,
        avatar_url: msg.users?.avatar_url || null,
      },
      text: msg.message,
      timestamp: msg.created_at,
      reactions: { likes: 0, recasts: 0 },
      replies: 0,
    }));

    return NextResponse.json({
      casts,
      total: casts.length,
    });
  } catch (error) {
    console.error('Error fetching casts:', error);
    return NextResponse.json({ casts: [], total: 0 });
  }
}
