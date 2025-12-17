import { NextRequest, NextResponse } from 'next/server';

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
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station') || 'default';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://web3radio.fm';

    // Mock station data - in production, fetch from database
    const stationData: FrameData = {
      station_id: stationId,
      station_name: '420 FM - Chill Vibes',
      frequency: 420.0,
      dj_name: 'DJ Vibes',
      listener_count: 42,
      is_live: true,
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
