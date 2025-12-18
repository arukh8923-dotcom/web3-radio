import { NextRequest, NextResponse } from 'next/server';
import { getUserByFid } from '@/lib/neynar';

type AchievementType = 'first_tune' | 'listener_100h' | 'tipper_gold' | 'session_master' | 'frequency_collector' | 'vibes_whale';

const ACHIEVEMENT_CONFIG: Record<AchievementType, { name: string; icon: string; color: string; description: string }> = {
  first_tune: { name: 'FIRST TUNE', icon: '📻', color: '#4ade80', description: 'Tuned in for the first time' },
  listener_100h: { name: '100 HOUR LISTENER', icon: '🎧', color: '#f59e0b', description: 'Listened for 100+ hours' },
  tipper_gold: { name: 'GOLD TIPPER', icon: '💰', color: '#fbbf24', description: 'Tipped over 1000 RADIO' },
  session_master: { name: 'SESSION MASTER', icon: '🎪', color: '#a855f7', description: 'Attended 50+ sessions' },
  frequency_collector: { name: 'FREQUENCY COLLECTOR', icon: '📡', color: '#3b82f6', description: 'Owns 5+ frequencies' },
  vibes_whale: { name: 'VIBES WHALE', icon: '🐋', color: '#06b6d4', description: 'Holds 10000+ VIBES' },
};

async function getAchievementNFTData(tokenId: string) {
  return {
    tokenId,
    achievementType: 'listener_100h' as AchievementType,
    ownerFid: 250705,
    unlockedAt: new Date('2025-12-18T12:00:00').toISOString(),
    milestone: '100 hours',
    rank: 42, // Global rank for this achievement
  };
}

function generateAchievementBadgeSVG(data: {
  tokenId: string;
  achievementType: AchievementType;
  ownerUsername: string;
  ownerFid: number;
  unlockedAt: string;
  milestone: string;
  rank: number;
  creatorUsername: string;
}) {
  const config = ACHIEVEMENT_CONFIG[data.achievementType];
  const unlockDate = new Date(data.unlockedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
  <defs>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${config.color}"/>
      <stop offset="100%" style="stop-color:${config.color}88"/>
    </linearGradient>
    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ffd700"/>
      <stop offset="30%" style="stop-color:#ffec8b"/>
      <stop offset="50%" style="stop-color:#ffd700"/>
      <stop offset="70%" style="stop-color:#daa520"/>
      <stop offset="100%" style="stop-color:#b8860b"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
    <filter id="innerGlow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="300" height="300" fill="#1a1a1a"/>
  
  <!-- Decorative pattern -->
  <g opacity="0.1">
    ${Array.from({length: 10}, (_, i) => `
      <line x1="0" y1="${i*30}" x2="300" y2="${i*30}" stroke="${config.color}" stroke-width="1"/>
      <line x1="${i*30}" y1="0" x2="${i*30}" y2="300" stroke="${config.color}" stroke-width="1"/>
    `).join('')}
  </g>
  
  <!-- Badge ribbon -->
  <path d="M100,280 L150,250 L200,280 L200,300 L100,300 Z" fill="#c41e3a"/>
  <path d="M110,280 L150,255 L190,280 L190,300 L110,300 Z" fill="#8b0000"/>
  
  <!-- Main badge circle -->
  <circle cx="150" cy="130" r="85" fill="url(#metalGrad)" filter="url(#shadow)"/>
  <circle cx="150" cy="130" r="78" fill="#1a1a1a"/>
  <circle cx="150" cy="130" r="72" fill="url(#badgeGrad)" filter="url(#innerGlow)"/>
  
  <!-- Achievement icon -->
  <text x="150" y="115" text-anchor="middle" font-size="50">${config.icon}</text>
  
  <!-- Achievement name (curved would be ideal but keeping simple) -->
  <text x="150" y="165" text-anchor="middle" font-family="Impact, sans-serif" font-size="12" fill="#fff" letter-spacing="1">
    ${config.name}
  </text>
  
  <!-- Stars decoration -->
  <text x="90" y="85" font-size="12" fill="#ffd700">★</text>
  <text x="150" y="70" text-anchor="middle" font-size="14" fill="#ffd700">★</text>
  <text x="210" y="85" font-size="12" fill="#ffd700">★</text>
  
  <!-- Owner info panel -->
  <rect x="40" y="220" width="220" height="55" fill="#2a2a2a" rx="5"/>
  <rect x="42" y="222" width="216" height="51" fill="none" stroke="${config.color}" stroke-width="1" rx="4"/>
  
  <text x="150" y="240" text-anchor="middle" font-family="'Courier New', monospace" font-size="12" fill="#fff" font-weight="bold">
    @${data.ownerUsername}
  </text>
  <text x="150" y="255" text-anchor="middle" font-family="'Courier New', monospace" font-size="9" fill="#888">
    FID #${data.ownerFid} • RANK #${data.rank}
  </text>
  <text x="150" y="268" text-anchor="middle" font-family="'Courier New', monospace" font-size="8" fill="#666">
    Unlocked: ${unlockDate}
  </text>
  
  <!-- Token ID -->
  <text x="280" y="20" text-anchor="end" font-family="'Courier New', monospace" font-size="10" fill="#444">
    #${data.tokenId.padStart(4, '0')}
  </text>
  
  <!-- WEB3 RADIO branding -->
  <text x="150" y="15" text-anchor="middle" font-family="Impact, sans-serif" font-size="10" fill="${config.color}" letter-spacing="2">
    WEB3 RADIO
  </text>
  
  <!-- Footer -->
  <text x="150" y="295" text-anchor="middle" font-family="'Courier New', monospace" font-size="6" fill="#444">
    @${data.creatorUsername} • x402 • BASE
  </text>
</svg>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId } = await params;
  
  try {
    const nftData = await getAchievementNFTData(tokenId);
    
    let ownerUsername = 'unknown';
    let ownerFid = 0;
    if (nftData.ownerFid) {
      const profile = await getUserByFid(nftData.ownerFid);
      if (profile) {
        ownerUsername = profile.username;
        ownerFid = profile.fid;
      }
    }
    
    const creatorUsername = process.env.NEXT_PUBLIC_CREATOR_USERNAME || 'ukhy89';
    
    const svg = generateAchievementBadgeSVG({
      tokenId,
      achievementType: nftData.achievementType,
      ownerUsername,
      ownerFid,
      unlockedAt: nftData.unlockedAt,
      milestone: nftData.milestone,
      rank: nftData.rank,
      creatorUsername,
    });
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('Error generating Achievement NFT image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
