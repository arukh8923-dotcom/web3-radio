'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Cast {
  hash: string;
  author: {
    fid: number;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  text: string;
  timestamp: string;
  reactions: {
    likes: number;
    recasts: number;
  };
  replies: number;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  follower_count: number;
  created_at: string;
}

interface FarcasterChannelProps {
  stationId: string;
  stationName: string;
  channelId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FarcasterChannel({
  stationId,
  stationName,
  channelId,
  isOpen,
  onClose,
}: FarcasterChannelProps) {
  const { address } = useAccount();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [newCast, setNewCast] = useState('');
  const [activeTab, setActiveTab] = useState<'feed' | 'about'>('feed');

  useEffect(() => {
    if (isOpen && stationId) {
      loadChannel();
      loadCasts();
    }
  }, [isOpen, stationId, channelId]);

  const loadChannel = async () => {
    try {
      const res = await fetch(`/api/farcaster/channel?station_id=${stationId}`);
      if (res.ok) {
        const data = await res.json();
        setChannel(data.channel);
      }
    } catch (error) {
      console.error('Failed to load channel:', error);
    }
  };

  const loadCasts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/farcaster/channel/casts?station_id=${stationId}`);
      if (res.ok) {
        const data = await res.json();
        setCasts(data.casts || []);
      }
    } catch (error) {
      console.error('Failed to load casts:', error);
    }
    setLoading(false);
  };

  const postToChannel = async () => {
    if (!newCast.trim() || !address) return;
    setPosting(true);
    try {
      const res = await fetch('/api/farcaster/channel/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_id: stationId,
          text: newCast.trim(),
          wallet_address: address,
        }),
      });
      if (res.ok) {
        setNewCast('');
        await loadCasts();
      }
    } catch (error) {
      console.error('Failed to post:', error);
    }
    setPosting(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-purple-500 rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-indigo-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600/30 flex items-center justify-center overflow-hidden">
              {channel?.image_url ? (
                <img src={channel.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">📢</span>
              )}
            </div>
            <div>
              <h3 className="text-purple-400 font-bold">{channel?.name || stationName}</h3>
              <p className="text-dial-cream/50 text-xs">
                {channel?.follower_count?.toLocaleString() || 0} followers
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-purple-500/20">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-2 text-sm ${activeTab === 'feed' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-dial-cream/50'}`}
          >
            Feed
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-2 text-sm ${activeTab === 'about' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-dial-cream/50'}`}
          >
            About
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'feed' ? (
            <div className="p-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin text-3xl mb-2">🟣</div>
                  <p className="text-dial-cream/50">Loading casts...</p>
                </div>
              ) : casts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-dial-cream/50">No casts yet</p>
                  <p className="text-dial-cream/40 text-xs mt-1">Be the first to post!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {casts.map((cast) => (
                    <CastCard key={cast.hash} cast={cast} formatTime={formatTime} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              {channel ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-dial-cream/60 text-xs mb-1">DESCRIPTION</p>
                    <p className="text-dial-cream">{channel.description || 'No description'}</p>
                  </div>
                  <div>
                    <p className="text-dial-cream/60 text-xs mb-1">CREATED</p>
                    <p className="text-dial-cream">{new Date(channel.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-dial-cream/60 text-xs mb-1">FOLLOWERS</p>
                    <p className="text-dial-cream">{channel.follower_count.toLocaleString()}</p>
                  </div>
                  <a
                    href={`https://warpcast.com/~/channel/${channel.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 bg-purple-600/20 text-purple-400 text-center rounded-lg hover:bg-purple-600/30"
                  >
                    View on Warpcast →
                  </a>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-dial-cream/50">No channel linked</p>
                  <p className="text-dial-cream/40 text-xs mt-1">Station owner can create one</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post Input */}
        {activeTab === 'feed' && address && (
          <div className="p-3 border-t border-purple-500/20 bg-black/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCast}
                onChange={(e) => setNewCast(e.target.value)}
                placeholder="Share something..."
                maxLength={320}
                className="flex-1 px-3 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-dial-cream text-sm placeholder:text-dial-cream/30"
              />
              <button
                onClick={postToChannel}
                disabled={!newCast.trim() || posting}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg disabled:opacity-50"
              >
                {posting ? '...' : 'Cast'}
              </button>
            </div>
            <p className="text-dial-cream/30 text-xs mt-1 text-right">{newCast.length}/320</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CastCard({ cast, formatTime }: { cast: Cast; formatTime: (t: string) => string }) {
  return (
    <div className="p-3 bg-black/20 rounded-lg border border-purple-500/10">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center overflow-hidden flex-shrink-0">
          {cast.author.avatar_url ? (
            <img src={cast.author.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span>👤</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-dial-cream font-medium text-sm truncate">
              {cast.author.display_name || cast.author.username}
            </span>
            <span className="text-purple-400 text-xs">@{cast.author.username}</span>
            <span className="text-dial-cream/30 text-xs">• {formatTime(cast.timestamp)}</span>
          </div>
          <p className="text-dial-cream/80 text-sm mt-1 whitespace-pre-wrap">{cast.text}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-dial-cream/40">
            <span>❤️ {cast.reactions.likes}</span>
            <span>🔁 {cast.reactions.recasts}</span>
            <span>💬 {cast.replies}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
