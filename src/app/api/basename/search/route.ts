import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase();

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Search users with base_name in database
    const { data: users } = await supabase
      .from('users')
      .select('wallet_address, base_name, avatar_url')
      .ilike('base_name', `%${query}%`)
      .limit(10);

    const results = (users || []).map(u => ({
      address: u.wallet_address,
      name: u.base_name,
      avatar: u.avatar_url,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching Base names:', error);
    return NextResponse.json({ results: [] });
  }
}
