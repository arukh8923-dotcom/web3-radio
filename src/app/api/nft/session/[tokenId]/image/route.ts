import { NextRequest, NextResponse } from 'next/server';
import { getUserByFid } from '@/lib/neynar';
import { createServerSupabase } from '@/lib/supabase';

// Get session NFT data from database
async function getSessionNFTData(tokenId: string, supabase: ReturnType<typeof createServerSupabase>) {
  // Parse token ID to get session info
  const parts = tokenId.split('-');
  const sessionId = parts[1] || tokenId;
  
  const { data: session } = await supabase
    .from('sessions')
    .select('*, stations:station_id(name, frequency, owner_address, users:owner_address(farcaster_fid, farcaster_username))')
    .eq('id', sessionId)
    .single();

  if (session) {
    const { count: attendeeCount } = await supabase
      .from('session_attendances')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    return {
      tokenId,
      sessionName: session.title || 'Web3 Radio Session',
      frequency: (session.stations as any)?.frequency || 88.1,
      djName: (session.stations as any)?.users?.farcaster_username || 'DJ',
      djFid: (session.stations as any)?.users?.farcaster_fid || 0,
      attendeeFid: 0, // Will be set from token metadata
      startTime: session.start_time || new Date().toISOString(),
      duration: session.duration_minutes || 60,
      attendeeCount: attendeeCount || 0,
    };
  }

  return {
    tokenId,
    sessionName: 'Web3 Radio Session',
    frequency: 88.1,
    djName: 'DJ',
    djFid: 0,
    attendeeFid: 0,
    startTime: new Date().toISOString(),
    duration: 60,
    attendeeCount: 0,
  };
}

function generateTicketStubSVG(data: {
  tokenId: string;
  sessionName: string;
  frequency: number;
  djUsername: string;
  attendeeUsername: string;
  attendeeFid: number;
  startTime: string;
  duration: number;
  attendeeCount: number;
  creatorUsername: string;
}) {
  const eventDate = new Date(data.startTime);
  const dateStr = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200">
  <defs>
    <filter id="worn">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3"/>
      <feDisplacementMap in="SourceGraphic" scale="1"/>
    </filter>
    <pattern id="stripes" patternUnits="userSpaceOnUse" width="4" height="4">
      <rect width="2" height="4" fill="#ff6b35"/>
      <rect x="2" width="2" height="4" fill="#1a1a1a"/>
    </pattern>
    <!-- Perforated edge -->
    <clipPath id="perfLeft">
      <path d="M30,0 L30,200 ${Array.from({length: 20}, (_, i) => `M25,${i*10+5} a3,3 0 1,0 0,0.1`).join(' ')}"/>
    </clipPath>
  </defs>
  
  <!-- Main ticket body -->
  <rect x="30" y="10" width="340" height="180" fill="#1a1a1a" rx="5"/>
  
  <!-- Stub section (left) -->
  <rect x="30" y="10" width="80" height="180" fill="#2a2a2a" rx="5"/>
  
  <!-- Perforated line -->
  <line x1="110" y1="10" x2="110" y2="190" stroke="#444" stroke-width="2" stroke-dasharray="5,5"/>
  
  <!-- Stub content -->
  <text x="70" y="50" text-anchor="middle" font-family="'Courier New', monospace" font-size="8" fill="#ff6b35" transform="rotate(-90, 70, 100)">
    ADMIT ONE
  </text>
  <text x="70" y="140" text-anchor="middle" font-family="'Courier New', monospace" font-size="20" fill="#ff6b35" font-weight="bold">
    #${data.tokenId.padStart(3, '0')}
  </text>
  
  <!-- Main ticket content -->
  <!-- Header stripe -->
  <rect x="120" y="15" width="240" height="25" fill="url(#stripes)"/>
  <text x="240" y="33" text-anchor="middle" font-family="Impact, sans-serif" font-size="14" fill="#fff" letter-spacing="2">
    WEB3 RADIO SESSION
  </text>
  
  <!-- Event name -->
  <text x="240" y="65" text-anchor="middle" font-family="Impact, sans-serif" font-size="18" fill="#ff6b35">
    ${data.sessionName.toUpperCase()}
  </text>
  
  <!-- Frequency badge -->
  <rect x="200" y="72" width="80" height="20" fill="#ff6b35" rx="10"/>
  <text x="240" y="86" text-anchor="middle" font-family="'Courier New', monospace" font-size="11" fill="#1a1a1a" font-weight="bold">
    ${data.frequency.toFixed(1)} FM
  </text>
  
  <!-- Event details -->
  <text x="130" y="115" font-family="'Courier New', monospace" font-size="9" fill="#888">DATE</text>
  <text x="130" y="128" font-family="'Courier New', monospace" font-size="12" fill="#fff">${dateStr}</text>
  
  <text x="220" y="115" font-family="'Courier New', monospace" font-size="9" fill="#888">TIME</text>
  <text x="220" y="128" font-family="'Courier New', monospace" font-size="12" fill="#fff">${timeStr}</text>
  
  <text x="300" y="115" font-family="'Courier New', monospace" font-size="9" fill="#888">DURATION</text>
  <text x="300" y="128" font-family="'Courier New', monospace" font-size="12" fill="#fff">${data.duration}min</text>
  
  <!-- DJ info -->
  <text x="130" y="150" font-family="'Courier New', monospace" font-size="9" fill="#888">HOSTED BY</text>
  <text x="130" y="163" font-family="'Courier New', monospace" font-size="11" fill="#ff6b35">@${data.djUsername}</text>
  
  <!-- Attendee info -->
  <text x="250" y="150" font-family="'Courier New', monospace" font-size="9" fill="#888">ATTENDEE</text>
  <text x="250" y="163" font-family="'Courier New', monospace" font-size="11" fill="#fff">@${data.attendeeUsername}</text>
  <text x="250" y="175" font-family="'Courier New', monospace" font-size="8" fill="#666">FID #${data.attendeeFid}</text>
  
  <!-- Footer -->
  <line x1="120" y1="182" x2="360" y2="182" stroke="#333" stroke-width="1"/>
  <text x="240" y="193" text-anchor="middle" font-family="'Courier New', monospace" font-size="7" fill="#555">
    ${data.attendeeCount} ATTENDEES • CREATED BY @${data.creatorUsername} • x402 PROTOCOL
  </text>
  
  <!-- Barcode decoration -->
  <g transform="translate(320, 45)">
    ${Array.from({length: 15}, (_, i) => `<rect x="${i*2.5}" y="0" width="${i % 2 === 0 ? 2 : 1}" height="20" fill="#fff"/>`).join('')}
  </g>
</svg>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const supabase = createServerSupabase();
  const { tokenId } = await params;
  
  try {
    const nftData = await getSessionNFTData(tokenId, supabase);
    
    // Get attendee's Farcaster profile
    let attendeeUsername = 'unknown';
    let attendeeFid = 0;
    
    if (nftData.attendeeFid) {
      const profile = await getUserByFid(nftData.attendeeFid);
      if (profile) {
        attendeeUsername = profile.username;
        attendeeFid = profile.fid;
      }
    }
    
    // Get DJ's Farcaster profile
    let djUsername = nftData.djName;
    if (nftData.djFid) {
      const djProfile = await getUserByFid(nftData.djFid);
      if (djProfile) {
        djUsername = djProfile.username;
      }
    }
    
    const creatorUsername = process.env.NEXT_PUBLIC_CREATOR_USERNAME || 'ukhy89';
    
    const svg = generateTicketStubSVG({
      tokenId,
      sessionName: nftData.sessionName,
      frequency: nftData.frequency,
      djUsername,
      attendeeUsername,
      attendeeFid,
      startTime: nftData.startTime,
      duration: nftData.duration,
      attendeeCount: nftData.attendeeCount,
      creatorUsername,
    });
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('Error generating Session NFT image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
