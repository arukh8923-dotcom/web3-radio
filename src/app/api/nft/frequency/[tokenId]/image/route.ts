import { NextRequest, NextResponse } from 'next/server';
import { getUserByFid } from '@/lib/neynar';

// Mock function - replace with actual contract call
async function getFrequencyNFTData(tokenId: string) {
  // TODO: Call StationNFT contract to get real data
  return {
    tokenId,
    frequency: 88.1,
    stationName: 'Rock Station',
    genre: 'Rock',
    ownerAddress: '0x1234567890abcdef1234567890abcdef12345678',
    ownerFid: 250705, // Will be fetched from contract/indexer
    mintedAt: new Date().toISOString(),
    totalSupply: 100,
  };
}

function generateRadioLicenseSVG(data: {
  tokenId: string;
  frequency: number;
  stationName: string;
  genre: string;
  ownerUsername: string;
  ownerFid: number;
  ownerPfp?: string;
  mintedAt: string;
  creatorUsername: string;
  creatorFid: number;
}) {
  const mintDate = new Date(data.mintedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="400" height="560">
  <defs>
    <!-- Vintage paper texture -->
    <filter id="paper" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise"/>
      <feDiffuseLighting in="noise" lighting-color="#f4e4bc" surfaceScale="2">
        <feDistantLight azimuth="45" elevation="60"/>
      </feDiffuseLighting>
    </filter>
    
    <!-- Stamp effect -->
    <filter id="stamp">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3"/>
      <feDisplacementMap in="SourceGraphic" scale="2"/>
    </filter>
    
    <!-- Glow effect -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background - vintage paper -->
  <rect width="400" height="560" fill="#f4e4bc"/>
  <rect width="400" height="560" filter="url(#paper)" opacity="0.3"/>
  
  <!-- Border - ornate frame -->
  <rect x="10" y="10" width="380" height="540" fill="none" stroke="#8b4513" stroke-width="3"/>
  <rect x="15" y="15" width="370" height="530" fill="none" stroke="#8b4513" stroke-width="1"/>
  <rect x="20" y="20" width="360" height="520" fill="none" stroke="#d4a574" stroke-width="1" stroke-dasharray="4,2"/>
  
  <!-- Header -->
  <text x="200" y="55" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#8b4513" letter-spacing="3">
    FEDERAL COMMUNICATIONS
  </text>
  <text x="200" y="75" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#8b4513" letter-spacing="2">
    WEB3 RADIO AUTHORITY
  </text>
  
  <!-- Decorative line -->
  <line x1="50" y1="90" x2="350" y2="90" stroke="#8b4513" stroke-width="1"/>
  <circle cx="200" cy="90" r="4" fill="#8b4513"/>
  
  <!-- Main Title -->
  <text x="200" y="125" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#2c1810" letter-spacing="2">
    RADIO LICENSE
  </text>
  <text x="200" y="145" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="#8b4513">
    FREQUENCY OWNERSHIP CERTIFICATE
  </text>
  
  <!-- Frequency Display - main feature -->
  <rect x="100" y="160" width="200" height="60" fill="#1a1a1a" rx="5"/>
  <rect x="105" y="165" width="190" height="50" fill="#0a0a0a" rx="3"/>
  <text x="200" y="205" text-anchor="middle" font-family="'Courier New', monospace" font-size="36" fill="#ff6b35" filter="url(#glow)">
    ${data.frequency.toFixed(1)} FM
  </text>
  
  <!-- Station Info -->
  <text x="200" y="245" text-anchor="middle" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#2c1810">
    ${data.stationName.toUpperCase()}
  </text>
  <text x="200" y="265" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#8b4513">
    Genre: ${data.genre}
  </text>
  
  <!-- Divider -->
  <line x1="50" y1="285" x2="350" y2="285" stroke="#d4a574" stroke-width="1"/>
  
  <!-- License Holder Section -->
  <text x="40" y="310" font-family="Georgia, serif" font-size="9" fill="#8b4513" letter-spacing="1">
    LICENSE HOLDER
  </text>
  
  <!-- Owner info box -->
  <rect x="40" y="320" width="320" height="70" fill="#fff9e6" stroke="#d4a574" stroke-width="1" rx="3"/>
  
  <!-- PFP placeholder -->
  <rect x="50" y="330" width="50" height="50" fill="#e0d5c0" stroke="#8b4513" stroke-width="1" rx="3"/>
  <text x="75" y="360" text-anchor="middle" font-family="Georgia, serif" font-size="20" fill="#8b4513">👤</text>
  
  <!-- Owner details -->
  <text x="115" y="348" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#2c1810">
    @${data.ownerUsername}
  </text>
  <text x="115" y="365" font-family="'Courier New', monospace" font-size="11" fill="#8b4513">
    FID: #${data.ownerFid}
  </text>
  <text x="115" y="382" font-family="'Courier New', monospace" font-size="8" fill="#a08060">
    FARCASTER VERIFIED
  </text>
  
  <!-- License Details -->
  <text x="40" y="415" font-family="Georgia, serif" font-size="9" fill="#8b4513" letter-spacing="1">
    LICENSE DETAILS
  </text>
  
  <rect x="40" y="425" width="155" height="45" fill="none" stroke="#d4a574" stroke-width="1"/>
  <text x="50" y="442" font-family="Georgia, serif" font-size="8" fill="#8b4513">TOKEN ID</text>
  <text x="50" y="460" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#2c1810">#${data.tokenId.padStart(4, '0')}</text>
  
  <rect x="205" y="425" width="155" height="45" fill="none" stroke="#d4a574" stroke-width="1"/>
  <text x="215" y="442" font-family="Georgia, serif" font-size="8" fill="#8b4513">ISSUED DATE</text>
  <text x="215" y="460" font-family="'Courier New', monospace" font-size="12" fill="#2c1810">${mintDate}</text>
  
  <!-- Official Stamp -->
  <g transform="translate(300, 480) rotate(-15)">
    <circle cx="0" cy="0" r="35" fill="none" stroke="#c41e3a" stroke-width="2" filter="url(#stamp)" opacity="0.8"/>
    <circle cx="0" cy="0" r="28" fill="none" stroke="#c41e3a" stroke-width="1" opacity="0.8"/>
    <text x="0" y="-8" text-anchor="middle" font-family="Georgia, serif" font-size="7" fill="#c41e3a" font-weight="bold">WEB3 RADIO</text>
    <text x="0" y="3" text-anchor="middle" font-family="Georgia, serif" font-size="6" fill="#c41e3a">AUTHORIZED</text>
    <text x="0" y="13" text-anchor="middle" font-family="Georgia, serif" font-size="5" fill="#c41e3a">ON BASE</text>
  </g>
  
  <!-- Footer -->
  <line x1="40" y1="520" x2="360" y2="520" stroke="#d4a574" stroke-width="1"/>
  <text x="200" y="538" text-anchor="middle" font-family="Georgia, serif" font-size="8" fill="#8b4513">
    Created by @${data.creatorUsername} • Powered by x402 Protocol
  </text>
  <text x="200" y="550" text-anchor="middle" font-family="Georgia, serif" font-size="7" fill="#a08060">
    This NFT certifies ownership of the specified radio frequency on Base Network
  </text>
</svg>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId } = await params;
  
  try {
    // Get NFT data from contract
    const nftData = await getFrequencyNFTData(tokenId);
    
    // Get owner's Farcaster profile
    let ownerUsername = 'unknown';
    let ownerFid = 0;
    let ownerPfp: string | undefined;
    
    if (nftData.ownerFid) {
      const profile = await getUserByFid(nftData.ownerFid);
      if (profile) {
        ownerUsername = profile.username;
        ownerFid = profile.fid;
        ownerPfp = profile.pfp_url;
      }
    }
    
    // Creator info from env
    const creatorUsername = process.env.NEXT_PUBLIC_CREATOR_USERNAME || 'ukhy89';
    const creatorFid = parseInt(process.env.NEXT_PUBLIC_CREATOR_FID || '250705');
    
    // Generate SVG
    const svg = generateRadioLicenseSVG({
      tokenId,
      frequency: nftData.frequency,
      stationName: nftData.stationName,
      genre: nftData.genre,
      ownerUsername,
      ownerFid,
      ownerPfp,
      mintedAt: nftData.mintedAt,
      creatorUsername,
      creatorFid,
    });
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60', // Cache 1 minute
      },
    });
  } catch (error) {
    console.error('Error generating NFT image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
