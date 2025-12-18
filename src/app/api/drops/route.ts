import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station_id');
    const wallet = searchParams.get('wallet');

    // Get active drops from CommunityDrops contract via database
    const { data: drops } = await supabase
      .from('community_drops')
      .select(`
        id,
        station_id,
        reward_amount,
        reward_type,
        total_recipients,
        claim_deadline,
        executed,
        created_at,
        stations (name, frequency)
      `)
      .eq('executed', true)
      .gt('claim_deadline', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    let dropResponse = null;
    if (drops && drops.length > 0) {
      const drop = drops[0] as any;
      
      // Check if user already claimed
      let isClaimed = false;
      let isEligible = false;
      
      if (wallet) {
        const { data: claim } = await supabase
          .from('drop_claims')
          .select('id')
          .eq('drop_id', drop.id)
          .eq('wallet_address', wallet.toLowerCase())
          .single();
        
        isClaimed = !!claim;
        
        // Check eligibility (was tuned in during drop)
        const { data: tuneIn } = await supabase
          .from('tune_ins')
          .select('id')
          .eq('station_id', drop.station_id)
          .eq('wallet_address', wallet.toLowerCase())
          .lt('tuned_in_at', drop.created_at)
          .single();
        
        isEligible = !!tuneIn;
      }

      dropResponse = {
        id: drop.id,
        station_id: drop.station_id,
        station_name: drop.stations?.name || 'Unknown',
        frequency: drop.stations?.frequency || 420.0,
        timestamp: drop.created_at,
        reward_amount: drop.reward_amount,
        reward_type: drop.reward_type,
        total_recipients: drop.total_recipients,
        is_eligible: isEligible,
        is_claimed: isClaimed,
        claim_deadline: drop.claim_deadline,
      };
    }

    // Get user's claim history
    let history: any[] = [];
    if (wallet) {
      const { data: claims } = await supabase
        .from('drop_claims')
        .select(`
          id,
          claimed_at,
          amount,
          community_drops (reward_type, stations (name))
        `)
        .eq('wallet_address', wallet.toLowerCase())
        .order('claimed_at', { ascending: false })
        .limit(10);

      history = (claims || []).map((c: any) => ({
        id: c.id,
        timestamp: c.claimed_at,
        reward_amount: c.amount,
        reward_type: c.community_drops?.reward_type || 'vibes',
        claimed: true,
        station_name: c.community_drops?.stations?.name || 'Unknown',
      }));
    }

    return NextResponse.json({
      active_drop: dropResponse,
      history,
      next_drop_time: getNext420Time(),
    });
  } catch (error) {
    console.error('Error fetching drops:', error);
    return NextResponse.json({ 
      active_drop: null, 
      history: [], 
      next_drop_time: getNext420Time() 
    });
  }
}

function getNext420Time(): string {
  const now = new Date();
  const hours = now.getHours();
  
  let targetDate = new Date(now);
  
  if (hours < 4) {
    targetDate.setHours(4, 20, 0, 0);
  } else if (hours < 16) {
    targetDate.setHours(16, 20, 0, 0);
  } else {
    targetDate.setDate(targetDate.getDate() + 1);
    targetDate.setHours(4, 20, 0, 0);
  }
  
  return targetDate.toISOString();
}
