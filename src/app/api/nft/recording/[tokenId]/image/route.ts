import { NextRequest, NextResponse } from 'next/server';
import { getUserByFid } from '@/lib/neynar';
import { createServerSupabase } from '@/lib/supabase';

// Get recording NFT data from database
async function getRecordingNFTData(tokenId: string, supabase: ReturnType<typeof createServerSupabase>) {
  const { data: recording } = await supabase
    .from('recordings')
    .select('*, stations:station_id(name, frequency, owner_address, users:owner_address(farcaster_fid, farcaster_username)), users:owner_address(farcaster_fid, farcaster_username)')
    .eq('id', tokenId)
    .single();

  if (recording) {
    return {
      tokenId,
      trackTitle: recording.title || 'Web3 Radio Recording',
      frequency: (recording.stations as any)?.frequency || 88.1,
      stationName: (recording.stations as any)?.name || 'Web3 Radio',
      djFid: (recording.stations as any)?.users?.farcaster_fid || 0,
      ownerFid: (recording.users as any)?.farcaster_fid || 0,
      recordedAt: recording.recorded_at || recording.created_at || new Date().toISOString(),
      duration: recording.duration_seconds || 3600,
    };
  }

  return {
    tokenId,
    trackTitle: 'Web3 Radio Recording',
    frequency: 88.1,
    stationName: 'Web3 Radio',
    djFid: 0,
    ownerFid: 0,
    recordedAt: new Date().toISOString(),
    duration: 3600,
  };
}

function generateCassetteLabelSVG(data: {
  tokenId: string;
  trackTitle: string;
  frequency: number;
  stationName: string;
  djUsername: string;
  ownerUsername: string;
  ownerFid: number;
  recordedAt: string;
  duration: number;
  creatorUsername: string;
}) {
  const recordDate = new Date(data.recordedAt).toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric' 
  });
  const durationMin = Math.floor(data.duration / 60);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="400" height="250">
  <defs>
    <linearGradient id="cassetteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#3a3a3a"/>
      <stop offset="50%" style="stop-color:#2a2a2a"/>
      <stop offset="100%" style="stop-color:#1a1a1a"/>
    </linearGradient>
    <linearGradient id="labelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#f5e6d3"/>
      <stop offset="100%" style="stop-color:#e8d5b7"/>
    </linearGradient>
    <filter id="emboss">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
      <feOffset in="blur" dx="1" dy="1" result="offset"/>
      <feMerge>
        <feMergeNode in="offset"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Cassette body -->
  <rect x="10" y="10" width="380" height="230" fill="url(#cassetteGrad)" rx="10"/>
  <rect x="15" y="15" width="370" height="220" fill="none" stroke="#444" stroke-width="1" rx="8"/>
  
  <!-- Label area -->
  <rect x="30" y="25" width="340" height="140" fill="url(#labelGrad)" rx="5"/>
  <rect x="35" y="30" width="330" height="130" fill="none" stroke="#c4a77d" stroke-width="1" rx="3"/>
  
  <!-- Label header -->
  <rect x="35" y="30" width="330" height="25" fill="#8b4513" rx="3"/>
  <text x="200" y="48" text-anchor="middle" font-family="Impact, sans-serif" font-size="14" fill="#f5e6d3" letter-spacing="2">
    WEB3 RADIO RECORDING
  </text>
  
  <!-- Track title -->
  <text x="200" y="80" text-anchor="middle" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#2c1810">
    ${data.trackTitle.substring(0, 30).toUpperCase()}
  </text>
  
  <!-- Station info -->
  <text x="50" y="100" font-family="'Courier New', monospace" font-size="10" fill="#5a4a3a">
    📻 ${data.frequency.toFixed(1)} FM - ${data.stationName}
  </text>
  
  <!-- DJ info -->
  <text x="50" y="118" font-family="'Courier New', monospace" font-size="10" fill="#5a4a3a">
    🎧 DJ: @${data.djUsername}
  </text>
  
  <!-- Recording info -->
  <text x="250" y="100" font-family="'Courier New', monospace" font-size="10" fill="#5a4a3a">
    📅 ${recordDate}
  </text>
  <text x="250" y="118" font-family="'Courier New', monospace" font-size="10" fill="#5a4a3a">
    ⏱️ ${durationMin} min
  </text>
  
  <!-- Owner section -->
  <line x1="50" y1="130" x2="350" y2="130" stroke="#c4a77d" stroke-width="1"/>
  <text x="50" y="148" font-family="'Courier New', monospace" font-size="9" fill="#8b4513">
    RECORDED BY: @${data.ownerUsername} (FID #${data.ownerFid})
  </text>
  
  <!-- Token ID -->
  <text x="350" y="148" text-anchor="end" font-family="'Courier New', monospace" font-size="9" fill="#8b4513">
    #${data.tokenId.padStart(4, '0')}
  </text>
  
  <!-- Cassette window (tape reels) -->
  <rect x="100" y="175" width="200" height="50" fill="#0a0a0a" rx="5"/>
  
  <!-- Left reel -->
  <circle cx="150" cy="200" r="20" fill="#1a1a1a" stroke="#333" stroke-width="2"/>
  <circle cx="150" cy="200" r="8" fill="#2a2a2a"/>
  <circle cx="150" cy="200" r="3" fill="#444"/>
  <!-- Tape on left reel -->
  <circle cx="150" cy="200" r="15" fill="none" stroke="#4a3a2a" stroke-width="4"/>
  
  <!-- Right reel -->
  <circle cx="250" cy="200" r="20" fill="#1a1a1a" stroke="#333" stroke-width="2"/>
  <circle cx="250" cy="200" r="8" fill="#2a2a2a"/>
  <circle cx="250" cy="200" r="3" fill="#444"/>
  <!-- Less tape on right reel -->
  <circle cx="250" cy="200" r="12" fill="none" stroke="#4a3a2a" stroke-width="2"/>
  
  <!-- Tape path -->
  <path d="M165,200 L235,200" stroke="#4a3a2a" stroke-width="2" fill="none"/>
  
  <!-- Guide rollers -->
  <circle cx="185" cy="195" r="3" fill="#333"/>
  <circle cx="215" cy="195" r="3" fill="#333"/>
  
  <!-- Screw holes -->
  <circle cx="50" cy="200" r="5" fill="#0a0a0a"/>
  <circle cx="350" cy="200" r="5" fill="#0a0a0a"/>
  
  <!-- Footer text -->
  <text x="200" y="238" text-anchor="middle" font-family="'Courier New', monospace" font-size="7" fill="#555">
    CREATED BY @${data.creatorUsername} • x402 PROTOCOL • BASE NETWORK
  </text>
</svg>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const supabase = createServerSupabase();
  const { tokenId } = await params;
  
  try {
    const nftData = await getRecordingNFTData(tokenId, supabase);
    
    let ownerUsername = 'unknown';
    let ownerFid = 0;
    if (nftData.ownerFid) {
      const profile = await getUserByFid(nftData.ownerFid);
      if (profile) {
        ownerUsername = profile.username;
        ownerFid = profile.fid;
      }
    }
    
    let djUsername = 'unknown';
    if (nftData.djFid) {
      const djProfile = await getUserByFid(nftData.djFid);
      if (djProfile) {
        djUsername = djProfile.username;
      }
    }
    
    const creatorUsername = process.env.NEXT_PUBLIC_CREATOR_USERNAME || 'ukhy89';
    
    const svg = generateCassetteLabelSVG({
      tokenId,
      trackTitle: nftData.trackTitle,
      frequency: nftData.frequency,
      stationName: nftData.stationName,
      djUsername,
      ownerUsername,
      ownerFid,
      recordedAt: nftData.recordedAt,
      duration: nftData.duration,
      creatorUsername,
    });
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('Error generating Recording NFT image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
