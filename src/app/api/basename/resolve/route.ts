import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address')?.toLowerCase();

    if (!address) {
      return NextResponse.json({ error: 'address required' }, { status: 400 });
    }

    // Check database first for cached base_name
    const { data: user } = await supabase
      .from('users')
      .select('base_name, avatar_url')
      .eq('wallet_address', address)
      .single();

    if (user?.base_name) {
      return NextResponse.json({ 
        name: user.base_name, 
        avatar: user.avatar_url 
      });
    }

    // If not in DB, try to resolve via Base Name Service API
    try {
      const response = await fetch(
        `https://api.basename.app/v1/addresses/${address}/name`,
        { next: { revalidate: 3600 } }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.name) {
          // Cache in database
          await supabase
            .from('users')
            .upsert({ 
              wallet_address: address, 
              base_name: data.name 
            }, { onConflict: 'wallet_address' });
          
          return NextResponse.json({ 
            name: data.name, 
            avatar: data.avatar || null 
          });
        }
      }
    } catch {
      // API call failed, return null
    }

    return NextResponse.json({ name: null, avatar: null });
  } catch (error) {
    console.error('Error resolving Base name:', error);
    return NextResponse.json({ name: null, avatar: null });
  }
}
