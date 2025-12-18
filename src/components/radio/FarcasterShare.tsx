'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { shareStation, viewProfile, isInMiniApp } from '@/lib/farcaster';
import { useTokenPrice } from '@/hooks/useTokenPrice';

interface FarcasterUser {
  fid: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  follower_count: number;
}

interface FarcasterShareProps {
  stationId?: string;
  stationName: string;
  frequency: number;
  djAddress?: string;
  djFid?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function FarcasterShare({
  stationId,
  stationName,
  frequency,
  djAddress,
  djFid,
  isOpen,
  onClose,
}: FarcasterShareProps) {
  const { address } = useAccount();
  const { radioToUsd, formatRadioAmount } = useTokenPrice();
  const [listeners, setListeners] = useState<FarcasterUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareType, setShareType] = useState<'station' | 'tip' | 'achievement'>('station');
  const [tipAmount, setTipAmount] = useState(0);
  const [tipUsd, setTipUsd] = useState(0);
  const [inMiniApp, setInMiniApp] = useState(false);

  useEffect(() => {
    checkMiniApp();
  }, []);

  useEffect(() => {
    if (isOpen && stationId) {
      loadListeners();
    }
  }, [isOpen, stationId]);

  const checkMiniApp = async () => {
    const result = await isInMiniApp();
    setInMiniApp(result);
  };

  const loadListeners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/farcaster/listeners?station_id=${stationId}`);
      if (res.ok) {
        const data = await res.json();
        setListeners(data.listeners || []);
      }
    } catch (error) {
      console.error('Failed to load listeners:', error);
    }
    setLoading(false);
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      await shareStation(stationName, frequency);
    } catch (error) {
      console.error('Failed to share:', error);
    }
    setSharing(false);
  };

  const handleShareTip = async (amount: number) => {
    setSharing(true);
    const usdValue = radioToUsd(amount);
    try {
      const text = `🎁 Just tipped $${usdValue.toFixed(2)} (${formatRadioAmount(amount)} $RADIO) to the DJ at ${stationName} (${frequency.toFixed(1)} FM)! Support your favorite DJs on Web3 Radio 📻`;
      
      if (inMiniApp) {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        await sdk.actions.composeCast({
          text,
          embeds: [window.location.href],
        });
      } else {
        const encodedText = encodeURIComponent(text);
        const url = encodeURIComponent(window.location.href);
        window.open(`https://warpcast.com/~/compose?text=${encodedText}&embeds[]=${url}`, '_blank');
      }
    } catch (error) {
      console.error('Failed to share tip:', error);
    }
    setSharing(false);
  };

  const handleShareAchievement = async (achievementName: string) => {
    setSharing(true);
    try {
      const text = `🏆 Just unlocked "${achievementName}" on Web3 Radio! 📻✨`;
      
      if (inMiniApp) {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        await sdk.actions.composeCast({
          text,
          embeds: [window.location.href],
        });
      } else {
        const encodedText = encodeURIComponent(text);
        const url = encodeURIComponent(window.location.href);
        window.open(`https://warpcast.com/~/compose?text=${encodedText}&embeds[]=${url}`, '_blank');
      }
    } catch (error) {
      console.error('Failed to share achievement:', error);
    }
    setSharing(false);
  };

  const handleViewProfile = async (fid: number) => {
    await viewProfile(fid);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-purple-500 rounded-xl w-full max-w-md max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-indigo-900/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🟣</span>
            <div>
              <h3 className="text-lg text-purple-400 font-bold">Farcaster</h3>
              <p className="text-dial-cream/50 text-xs">Share & Connect</p>
            </div>
          </div>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">×</button>
        </div>

        {/* Share Options */}
        <div className="p-4 border-b border-purple-500/20">
          <p className="text-dial-cream/60 text-xs mb-3">SHARE TO FARCASTER</p>
          
          {/* Share Station */}
          <button
            onClick={handleShare}
            disabled={sharing}
            className="w-full p-3 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-all mb-2 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📻</span>
              <div className="flex-1">
                <p className="text-dial-cream font-medium">Share Station</p>
                <p className="text-dial-cream/50 text-xs">
                  {stationName} • {frequency.toFixed(1)} FM
                </p>
              </div>
              <span className="text-purple-400">→</span>
            </div>
          </button>

          {/* Share Tip Celebration */}
          <button
            onClick={() => setShareType('tip')}
            className="w-full p-3 bg-zone-420/10 border border-zone-420/30 rounded-lg hover:bg-zone-420/20 transition-all mb-2 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎁</span>
              <div className="flex-1">
                <p className="text-dial-cream font-medium">Celebrate a Tip</p>
                <p className="text-dial-cream/50 text-xs">Share your support for the DJ</p>
              </div>
              <span className="text-zone-420">→</span>
            </div>
          </button>

          {/* Share Achievement */}
          <button
            onClick={() => handleShareAchievement('First Tune In')}
            className="w-full p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div className="flex-1">
                <p className="text-dial-cream font-medium">Share Achievement</p>
                <p className="text-dial-cream/50 text-xs">Brag about your milestones</p>
              </div>
              <span className="text-amber-400">→</span>
            </div>
          </button>
        </div>

        {/* Listeners with Farcaster */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-dial-cream/60 text-xs mb-3">LISTENERS ON FARCASTER</p>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin text-3xl mb-2">🟣</div>
              <p className="text-dial-cream/50">Loading...</p>
            </div>
          ) : listeners.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-dial-cream/50">No Farcaster users tuned in</p>
              <p className="text-dial-cream/40 text-xs mt-1">Be the first to share!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {listeners.map((user) => (
                <button
                  key={user.fid}
                  onClick={() => handleViewProfile(user.fid)}
                  className="w-full flex items-center gap-3 p-3 bg-black/20 rounded-lg hover:bg-purple-600/10 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">👤</span>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-dial-cream font-medium truncate">
                      {user.display_name || user.username}
                    </p>
                    <p className="text-purple-400 text-xs">@{user.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-dial-cream/50 text-xs">{user.follower_count.toLocaleString()}</p>
                    <p className="text-dial-cream/30 text-xs">followers</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DJ Profile Link */}
        {djFid && (
          <div className="p-3 border-t border-purple-500/20 bg-purple-900/10">
            <button
              onClick={() => handleViewProfile(djFid)}
              className="w-full flex items-center justify-center gap-2 text-purple-400 hover:text-purple-300"
            >
              <span>View DJ on Farcaster</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* Mini App Status */}
        <div className="p-2 border-t border-purple-500/10 bg-black/20">
          <p className="text-dial-cream/40 text-xs text-center">
            {inMiniApp ? '✓ Running in Farcaster' : '🌐 Open in Warpcast for full experience'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Compact share button for inline use
export function FarcasterShareButton({ 
  stationName, 
  frequency,
  variant = 'default'
}: { 
  stationName: string; 
  frequency: number;
  variant?: 'default' | 'compact' | 'icon';
}) {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      await shareStation(stationName, frequency);
    } catch (error) {
      console.error('Failed to share:', error);
    }
    setSharing(false);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        disabled={sharing}
        className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center hover:bg-purple-600/30 disabled:opacity-50"
        title="Share on Farcaster"
      >
        {sharing ? '...' : '🟣'}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleShare}
        disabled={sharing}
        className="px-3 py-1.5 bg-purple-600/20 text-purple-400 text-xs rounded-lg hover:bg-purple-600/30 disabled:opacity-50"
      >
        {sharing ? '...' : '🟣 Cast'}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
    >
      <span>🟣</span>
      <span>{sharing ? 'Sharing...' : 'Share on Farcaster'}</span>
    </button>
  );
}
