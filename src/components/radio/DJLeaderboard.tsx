'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface DJStats {
  id: string;
  wallet_address: string;
  farcaster_username: string | null;
  avatar_url: string | null;
  station_count: number;
  total_listeners: number;
  total_tips: number;
  total_broadcasts: number;
  genre: string | null;
  rank: number;
  rank_change: number; // positive = up, negative = down, 0 = same
}

interface DJLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const GENRES = [
  { id: 'all', label: 'All', icon: '🎵' },
  { id: 'electronic', label: 'Electronic', icon: '🎧' },
  { id: 'hiphop', label: 'Hip-Hop', icon: '🎤' },
  { id: 'rock', label: 'Rock', icon: '🎸' },
  { id: 'jazz', label: 'Jazz', icon: '🎷' },
  { id: 'chill', label: 'Chill', icon: '🌊' },
  { id: 'lofi', label: 'Lo-Fi', icon: '🎧' },
];

const TIME_PERIODS = [
  { id: 'daily', label: 'Today' },
  { id: 'weekly', label: 'This Week' },
  { id: 'monthly', label: 'This Month' },
  { id: 'alltime', label: 'All Time' },
];

export function DJLeaderboard({ isOpen, onClose }: DJLeaderboardProps) {
  const [djs, setDJs] = useState<DJStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [selectedDJ, setSelectedDJ] = useState<DJStats | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen, selectedGenre, selectedPeriod]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedGenre !== 'all' && { genre: selectedGenre }),
        limit: '20',
      });
      
      const res = await fetch(`/api/leaderboard/djs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setDJs(data.djs || []);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
    setLoading(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankChangeIndicator = (change: number) => {
    if (change > 0) return <span className="text-green-400 text-xs">▲{change}</span>;
    if (change < 0) return <span className="text-red-400 text-xs">▼{Math.abs(change)}</span>;
    return <span className="text-dial-cream/40 text-xs">—</span>;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-brass rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brass/30">
          <div>
            <h3 className="nixie-tube text-lg">🏆 DJ LEADERBOARD</h3>
            <p className="text-dial-cream/50 text-xs">Top DJs on Web3 Radio</p>
          </div>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">
            ×
          </button>
        </div>

        {/* Filters */}
        <div className="p-3 border-b border-brass/20 space-y-2">
          {/* Genre Filter */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {GENRES.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedGenre === genre.id
                    ? 'bg-brass text-cabinet-dark'
                    : 'bg-black/30 text-dial-cream/70 hover:bg-black/50'
                }`}
              >
                <span className="mr-1">{genre.icon}</span>
                <span className="hidden sm:inline">{genre.label}</span>
              </button>
            ))}
          </div>
          
          {/* Time Period Filter */}
          <div className="grid grid-cols-4 gap-1">
            {TIME_PERIODS.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`px-1 py-1 rounded text-[10px] sm:text-xs transition-all text-center ${
                  selectedPeriod === period.id
                    ? 'bg-brass/20 text-brass border border-brass/50'
                    : 'bg-black/20 text-dial-cream/60 hover:bg-black/30'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin text-2xl mb-2">🎧</div>
              <p className="text-dial-cream/60 text-sm">Loading rankings...</p>
            </div>
          ) : djs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-dial-cream/60 text-sm">No DJs found for this filter</p>
            </div>
          ) : (
            <div className="space-y-2">
              {djs.map((dj, index) => (
                <div
                  key={dj.id}
                  onClick={() => setSelectedDJ(selectedDJ?.id === dj.id ? null : dj)}
                  className={`bg-black/30 rounded-lg p-3 cursor-pointer transition-all hover:bg-black/40 ${
                    selectedDJ?.id === dj.id ? 'ring-1 ring-brass' : ''
                  } ${index < 3 ? 'border-l-2 border-brass' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div className="w-10 text-center">
                      <span className={`text-lg ${index < 3 ? '' : 'text-dial-cream/60'}`}>
                        {getRankBadge(dj.rank || index + 1)}
                      </span>
                      <div>{getRankChangeIndicator(dj.rank_change)}</div>
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-brass/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {dj.avatar_url ? (
                        <Image
                          src={dj.avatar_url}
                          alt={dj.farcaster_username || 'DJ'}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-brass text-lg">🎧</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-dial-cream font-medium truncate">
                        {dj.farcaster_username ? `@${dj.farcaster_username}` : `${dj.wallet_address.slice(0, 6)}...${dj.wallet_address.slice(-4)}`}
                      </p>
                      <p className="text-dial-cream/50 text-xs">
                        {dj.station_count} station{dj.station_count !== 1 ? 's' : ''} • {dj.genre || 'Various'}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <p className="text-brass font-bold">{formatNumber(dj.total_listeners)}</p>
                      <p className="text-dial-cream/50 text-xs">listeners</p>
                    </div>
                  </div>

                  {/* Expanded Stats */}
                  {selectedDJ?.id === dj.id && (
                    <div className="mt-3 pt-3 border-t border-brass/20 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-brass font-bold">{formatNumber(dj.total_broadcasts)}</p>
                        <p className="text-dial-cream/50 text-xs">Broadcasts</p>
                      </div>
                      <div>
                        <p className="text-brass font-bold">{formatNumber(dj.total_tips)}</p>
                        <p className="text-dial-cream/50 text-xs">Tips Received</p>
                      </div>
                      <div>
                        <p className="text-brass font-bold">{dj.station_count}</p>
                        <p className="text-dial-cream/50 text-xs">Stations</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-brass/20 text-center">
          <p className="text-dial-cream/40 text-xs">
            Rankings update in real-time based on listener engagement
          </p>
        </div>
      </div>
    </div>
  );
}
