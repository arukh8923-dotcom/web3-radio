import { NextRequest, NextResponse } from 'next/server';

// Notification types for DJ broadcasts
type NotificationType = 'broadcast_live' | 'broadcast_scheduled' | 'tip_received' | 'new_follower';

interface NotificationPayload {
  type: NotificationType;
  dj_fid: number;
  station_name: string;
  frequency: number;
  message?: string;
  amount?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationPayload = await request.json();
    const { type, dj_fid, station_name, frequency, message, amount } = body;

    if (!type || !dj_fid || !station_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build notification message based on type
    let notificationText = '';
    switch (type) {
      case 'broadcast_live':
        notificationText = `🔴 LIVE NOW: ${station_name} is broadcasting on ${frequency.toFixed(1)} FM! Tune in now 📻`;
        break;
      case 'broadcast_scheduled':
        notificationText = `📅 Upcoming: ${station_name} will be live on ${frequency.toFixed(1)} FM. ${message || ''}`;
        break;
      case 'tip_received':
        notificationText = `🎁 You received a ${amount} $RADIO tip on ${station_name}! Keep the vibes going 🎵`;
        break;
      case 'new_follower':
        notificationText = `👋 New listener subscribed to ${station_name}!`;
        break;
      default:
        notificationText = message || `Update from ${station_name}`;
    }

    // In production: Use Neynar API to send notification
    // POST to https://api.neynar.com/v2/farcaster/notification
    // This requires the DJ to have added the Mini App

    // For now, log and return success
    console.log('Farcaster notification:', {
      fid: dj_fid,
      text: notificationText,
    });

    return NextResponse.json({
      success: true,
      message: 'Notification queued',
      notification: {
        fid: dj_fid,
        text: notificationText,
        type,
      },
    });
  } catch (error) {
    console.error('Error sending Farcaster notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
