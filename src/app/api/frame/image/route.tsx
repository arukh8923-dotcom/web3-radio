import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('station') || 'default';
    const action = searchParams.get('action');

    // Mock station data - in production, fetch from database
    const stationName = '420 FM - Chill Vibes';
    const frequency = 420.0;
    const djName = 'DJ Vibes';
    const listenerCount = 42;
    const isLive = true;

    // Different images based on action
    let title = stationName;
    let subtitle = `${frequency.toFixed(1)} FM • ${listenerCount} listeners`;
    let emoji = '📻';
    let bgGradient = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';

    if (action === 'tuned') {
      title = '🎧 Tuned In!';
      subtitle = `Now listening to ${stationName}`;
      emoji = '🎵';
      bgGradient = 'linear-gradient(135deg, #0f3460 0%, #16213e 50%, #1a1a2e 100%)';
    } else if (action === 'tip') {
      title = '💰 Tip the DJ';
      subtitle = `Support ${djName} on ${stationName}`;
      emoji = '🎁';
      bgGradient = 'linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 50%, #16213e 100%)';
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: bgGradient,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Radio Icon */}
          <div
            style={{
              fontSize: 80,
              marginBottom: 20,
            }}
          >
            {emoji}
          </div>

          {/* Station Name */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: '#f5f5dc',
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 24,
              color: '#b8860b',
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            {subtitle}
          </div>

          {/* Live Badge */}
          {isLive && !action && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: 'rgba(255, 0, 0, 0.2)',
                borderRadius: 20,
                border: '1px solid rgba(255, 0, 0, 0.5)',
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#ff0000',
                }}
              />
              <span style={{ color: '#ff6b6b', fontSize: 18 }}>LIVE</span>
            </div>
          )}

          {/* DJ Info */}
          {!action && (
            <div
              style={{
                position: 'absolute',
                bottom: 40,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: '#888',
                fontSize: 18,
              }}
            >
              <span>🎧 {djName}</span>
              <span>•</span>
              <span>Web3 Radio</span>
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating frame image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
