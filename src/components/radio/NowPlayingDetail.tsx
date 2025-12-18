'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import type { Station } from '@/lib/api';

interface NowPlayingDetailProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NowPlayingDetail({ station, isOpen, onClose }: NowPlayingDetailProps) {
  const { address } = useAccount();
  const [liked, setLiked] = useState(false);

  if (!isOpen || !station) return null;

  const handleLike = () => {
    setLiked(!liked);
    // TODO: Record like on-chain with Vibes token
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-brass rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brass/30">
          <h3 className="nixie-tube text-lg">📻 NOW PLAYING</h3>
          <button
            onClick={onClose}
            className="text-dial-cream/60 hover:text-dial-cream text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Station Info */}
          <div className="text-center">
            <p className="text-brass text-2xl font-dial">{station.frequency.toFixed(1)} FM</p>
            <h4 className="text-dial-cream text-xl mt-2">{station.name}</h4>
            {station.description && (
              <p className="text-dial-cream/60 text-sm mt-1">{station.description}</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-brass text-lg">{station.listener_count}</p>
              <p className="text-dial-cream/50 text-xs">Listeners</p>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-brass text-lg">{station.signal_strength}%</p>
              <p className="text-dial-cream/50 text-xs">Signal</p>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-brass text-lg">{station.is_live ? '🔴' : '⚫'}</p>
              <p className="text-dial-cream/50 text-xs">{station.is_live ? 'LIVE' : 'Offline'}</p>
            </div>
          </div>

          {/* Category Badge */}
          <div className="flex justify-center">
            <span className="px-3 py-1 rounded-full text-sm bg-brass/20 text-brass">
              {station.category.toUpperCase()}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleLike}
              disabled={!address}
              className={`preset-button px-6 ${liked ? 'bg-tuning-red' : ''}`}
            >
              {liked ? '❤️ LIKED' : '🤍 LIKE'}
            </button>
          </div>

          {/* DJ Info */}
          <div className="border-t border-brass/30 pt-4">
            <p className="text-dial-cream/50 text-xs mb-1">Station Owner</p>
            <p className="text-dial-cream/80 text-sm font-mono truncate">
              {station.owner_address}
            </p>
          </div>

          {/* Premium Badge */}
          {station.is_premium && (
            <div className="bg-brass/10 border border-brass/30 rounded-lg p-3 text-center">
              <p className="text-brass text-sm">⭐ Premium Station</p>
              <p className="text-dial-cream/50 text-xs">Subscribe with $RADIO for exclusive content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
