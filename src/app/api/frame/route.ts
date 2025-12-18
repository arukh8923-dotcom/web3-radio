import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

// Farcaster Frame metadata generator
// This creates the Frame HTML for embedding in casts

interface FrameData {
  station_id: string;
  station_name: string;
  frequency: number;
  dj_name: string;
  listener_count: number;
  is_live: boolean;
  image_url?: string;
}

// Generate Frame HTML response
function generateFrameHtml(data: FrameData, baseUrl: string): string {
  const frameImage = data.image_url || `${baseUrl}/api/frame/image?station=${data.station_id}`;
  const postUrl = `${baseUrl}/api/frame/action`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${frameImage}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="▶️ Tune In" />
  <meta property="fc:frame:button:1:action" content="post" />
  <meta property="fc:frame:button:2" content="💰 Tip DJ" />
  <meta property="fc:frame:button:2:action" content="post" />
  <meta property="fc:frame:button:3" content="📻 Open App" />
  <meta property="fc:frame:button:3:action" content="link" />
  <meta property="fc:frame:button:3:target" content="${baseUrl}?station=${data.station_id}" />
  <meta property="fc:frame:post_url" content="${postUrl}" />
  <meta property="fc:frame:state" content="${Buffer.from(JSON.stringify({ station_id: data.station_id })).toString('base64')}" />
  <meta property="og:title" content="${data.station_name} - ${data.frequency.toFixed(1)} FM" />
  <meta property="og:description" content="${data.is_live ? '🔴 LIVE' : '📻'} ${data.dj_name} • ${data.listener_count} listeners" />
  <meta property="og:image" content="${frameImage}" />
</head>
<body>
  <h1>${data.station_name}</h1>
  <p>${data.frequency.toFixed(1)} FM • ${data.listener_count} listeners</p>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station') || 'default';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://web3radio.fm';

    // Fetch station data from database
    const { data: station } = await supabase
      .from('stations')
      .select('*, users:owner_address(farcaster_username)')
      .eq('id', stationId)
      .single();

    const stationData: FrameData = station ? {
      station_id: station.id,
      station_name: station.name || 'Web3 Radio',
      frequency: station.frequency || 88.1,
      dj_name: (station.users as any)?.farcaster_username || 'DJ',
      listener_count: station.listener_count || 0,
      is_live: station.is_live || false,
    } : {
      station_id: stationId,
      station_name: 'Web3 Radio',
      frequency: 88.1,
      dj_name: 'DJ',
      listener_count: 0,
      is_live: false,
    };

    const html = generateFrameHtml(stationData, baseUrl);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating frame:', error);
    return NextResponse.json({ error: 'Failed to generate frame' }, { status: 500 });
  }
}
