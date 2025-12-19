import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

function generateStationNFTSVG(data: {
  stationId: string;
  name: string;
  frequency: number;
  category: string;
  ownerUsername: string;
  listenerCount: number;
  isLive: boolean;
  isPremium: boolean;
}) {
  const categoryColors: Record<string, string> = {
    music: '#4ade80',
    talk: '#f59e0b',
    news: '#3b82f6',
    sports: '#ef4444',
    '420': '#22c55e',
    ambient: '#8b5cf6',
  };
  
  const color = categoryColors[data.category] || '#4ade80';
  const liveIndicator = data.isLive ? '🔴 LIVE' : '⚫ OFFLINE';
  const premiumBadge = data.isPremium ? '⭐ PREMIUM' : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#16213e"/>
    </linearGradient>
    <linearGradient id="dialGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#d4a574"/>
      <stop offset="50%" style="stop-color:#c9a067"/>
      <stop offset="100%" style="stop-color:#b8956a"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="400" fill="url(#bgGrad)"/>
  
  <!-- Radio cabinet texture -->
  <rect x="20" y="20" width="360" height="360" fill="#2a2a2a" rx="20"/>
  <rect x="25" y="25" width="350" height="350" fill="none" stroke="#d4a574" stroke-width="2" rx="18"/>
  
  <!-- Speaker grille pattern -->
  <g opacity="0.3">
    ${Array.from({length: 8}, (_, i) => `
      <line x1="40" y1="${280 + i*12}" x2="360" y2="${280 + i*12}" stroke="#d4a574" stroke-width="2"/>
    `).join('')}
  </g>
  
  <!-- Frequency dial -->
  <circle cx="200" cy="140" r="80" fill="#1a1a1a" stroke="url(#dialGrad)" stroke-width="4"/>
  <circle cx="200" cy="140" r="70" fill="#0a0a0a"/>
  
  <!-- Frequency display -->
  <text x="200" y="130" text-anchor="middle" font-family="'Courier New', monospace" font-size="36" fill="${color}" filter="url(#glow)">
    ${data.frequency.toFixed(1)}
  </text>
  <text x="200" y="155" text-anchor="middle" font-family="'Courier New', monospace" font-size="16" fill="#d4a574">
    FM
  </text>
  
  <!-- Dial markers -->
  ${Array.from({length: 12}, (_, i) => {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const x1 = 200 + Math.cos(angle) * 60;
    const y1 = 140 + Math.sin(angle) * 60;
    const x2 = 200 + Math.cos(angle) * 68;
    const y2 = 140 + Math.sin(angle) * 68;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#d4a574" stroke-width="2"/>`;
  }).join('')}
  
  <!-- Station name -->
  <text x="200" y="240" text-anchor="middle" font-family="Impact, sans-serif" font-size="20" fill="#fff" letter-spacing="1">
    ${data.name.toUpperCase().slice(0, 20)}
  </text>
  
  <!-- Category badge -->
  <rect x="140" y="250" width="120" height="24" fill="${color}22" rx="12"/>
  <text x="200" y="267" text-anchor="middle" font-family="'Courier New', monospace" font-size="12" fill="${color}">
    ${data.category.toUpperCase()}
  </text>
  
  <!-- Status indicators -->
  <text x="60" y="50" font-family="'Courier New', monospace" font-size="12" fill="${data.isLive ? '#ef4444' : '#666'}">
    ${liveIndicator}
  </text>
  ${data.isPremium ? `<text x="340" y="50" text-anchor="end" font-family="'Courier New', monospace" font-size="12" fill="#fbbf24">${premiumBadge}</text>` : ''}
  
  <!-- Owner info -->
  <text x="200" y="340" text-anchor="middle" font-family="'Courier New', monospace" font-size="11" fill="#888">
    Owner: @${data.ownerUsername}
  </text>
  <text x="200" y="358" text-anchor="middle" font-family="'Courier New', monospace" font-size="10" fill="#666">
    ${data.listenerCount} listeners • WEB3 RADIO
  </text>
  
  <!-- Token ID -->
  <text x="370" y="385" text-anchor="end" font-family="'Courier New', monospace" font-size="8" fill="#444">
    ${data.stationId.slice(0, 8)}
  </text>
</svg>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stationId: string }> }
) {
  const { stationId } = await params;
  
  try {
    const supabase = createServerSupabase();
    
    const { data: station } = await supabase
      .from('stations')
      .select('id, name, frequency, category, owner_address, listener_count, is_live, is_premium')
      .eq('id', stationId)
      .single();

    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    // Get owner username
    let ownerUsername = 'unknown';
    const { data: user } = await supabase
      .from('users')
      .select('farcaster_username')
      .ilike('wallet_address', station.owner_address)
      .single();
    
    if (user?.farcaster_username) {
      ownerUsername = user.farcaster_username;
    }

    const svg = generateStationNFTSVG({
      stationId: station.id,
      name: station.name,
      frequency: parseFloat(station.frequency),
      category: station.category,
      ownerUsername,
      listenerCount: station.listener_count || 0,
      isLive: station.is_live || false,
      isPremium: station.is_premium || false,
    });
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('Error generating Station NFT image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
