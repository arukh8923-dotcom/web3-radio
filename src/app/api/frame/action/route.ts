import { NextRequest, NextResponse } from 'next/server';

// Handle Frame button actions
interface FrameActionPayload {
  untrustedData: {
    fid: number;
    url: string;
    messageHash: string;
    timestamp: number;
    network: number;
    buttonIndex: number;
    inputText?: string;
    state?: string;
    castId: {
      fid: number;
      hash: string;
    };
  };
  trustedData: {
    messageBytes: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: FrameActionPayload = await request.json();
    const { untrustedData } = body;
    const { buttonIndex, fid, state } = untrustedData;

    // Decode state
    let stationId = 'default';
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString());
        stationId = decoded.station_id || 'default';
      } catch {
        // Use default
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://web3radio.fm';

    // Handle button actions
    switch (buttonIndex) {
      case 1: // Tune In
        return generateTuneInFrame(stationId, fid, baseUrl);
      
      case 2: // Tip DJ
        return generateTipFrame(stationId, fid, baseUrl);
      
      default:
        return generateDefaultFrame(stationId, baseUrl);
    }
  } catch (error) {
    console.error('Error handling frame action:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}

function generateTuneInFrame(stationId: string, fid: number, baseUrl: string): NextResponse {
  // In production: Record tune-in on-chain or database
  console.log(`User ${fid} tuned in to station ${stationId}`);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/api/frame/image?station=${stationId}&action=tuned" />
  <meta property="fc:frame:button:1" content="🎧 Now Playing" />
  <meta property="fc:frame:button:1:action" content="post" />
  <meta property="fc:frame:button:2" content="💰 Tip DJ" />
  <meta property="fc:frame:button:2:action" content="post" />
  <meta property="fc:frame:button:3" content="📻 Full App" />
  <meta property="fc:frame:button:3:action" content="link" />
  <meta property="fc:frame:button:3:target" content="${baseUrl}?station=${stationId}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/frame/action" />
  <meta property="fc:frame:state" content="${Buffer.from(JSON.stringify({ station_id: stationId, tuned: true })).toString('base64')}" />
</head>
<body>
  <p>Tuned in!</p>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

function generateTipFrame(stationId: string, fid: number, baseUrl: string): NextResponse {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/api/frame/image?station=${stationId}&action=tip" />
  <meta property="fc:frame:button:1" content="🎁 10 $RADIO" />
  <meta property="fc:frame:button:1:action" content="tx" />
  <meta property="fc:frame:button:1:target" content="${baseUrl}/api/frame/tx?amount=10&station=${stationId}" />
  <meta property="fc:frame:button:2" content="🎁 50 $RADIO" />
  <meta property="fc:frame:button:2:action" content="tx" />
  <meta property="fc:frame:button:2:target" content="${baseUrl}/api/frame/tx?amount=50&station=${stationId}" />
  <meta property="fc:frame:button:3" content="🎁 100 $RADIO" />
  <meta property="fc:frame:button:3:action" content="tx" />
  <meta property="fc:frame:button:3:target" content="${baseUrl}/api/frame/tx?amount=100&station=${stationId}" />
  <meta property="fc:frame:button:4" content="← Back" />
  <meta property="fc:frame:button:4:action" content="post" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/frame/action" />
  <meta property="fc:frame:state" content="${Buffer.from(JSON.stringify({ station_id: stationId })).toString('base64')}" />
</head>
<body>
  <p>Select tip amount</p>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

function generateDefaultFrame(stationId: string, baseUrl: string): NextResponse {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/api/frame/image?station=${stationId}" />
  <meta property="fc:frame:button:1" content="▶️ Tune In" />
  <meta property="fc:frame:button:1:action" content="post" />
  <meta property="fc:frame:button:2" content="💰 Tip DJ" />
  <meta property="fc:frame:button:2:action" content="post" />
  <meta property="fc:frame:button:3" content="📻 Open App" />
  <meta property="fc:frame:button:3:action" content="link" />
  <meta property="fc:frame:button:3:target" content="${baseUrl}?station=${stationId}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/frame/action" />
  <meta property="fc:frame:state" content="${Buffer.from(JSON.stringify({ station_id: stationId })).toString('base64')}" />
</head>
<body>
  <p>Web3 Radio</p>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
