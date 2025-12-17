'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'listening' | 'social' | 'collector' | 'explorer' | 'special';
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlocked_at: string | null;
  nft_minted: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface AchievementStats {
  total_listening_hours: number;
  stations_visited: number;
  tips_sent: number;
  messages_sent: number;
  broadcasts_recorded: number;
  requests_made: number;
  consecutive_days: number;
  unique_genres: number;
}

interface FriendComparison {
  wallet_address: string;
  display_name: string;
  avatar_url: string | null;
  unlocked_count: number;
  total_listening_hours: number;
  rarest_achievement: string | null;
}

interface ListenerAchievementsProps {
  isOpen: boolean;
  onClose: () => void;
}

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'progress' | 'unlocked' | 'unlocked_at' | 'nft_minted'>[] = [
  // Listening achievements
  { id: 'first_tune', name: 'First Tune', description: 'Tune into your first station', icon: '📻', category: 'listening', requirement: 1, rarity: 'common' },
  { id: 'hour_listener', name: 'Hour Listener', description: 'Listen for 1 hour total', icon: '⏰', category: 'listening', requirement: 1, rarity: 'common' },
  { id: 'day_listener', name: 'Day Listener', description: 'Listen for 24 hours total', icon: '🌅', category: 'listening', requirement: 24, rarity: 'uncommon' },
  { id: 'week_listener', name: 'Week Listener', description: 'Listen for 168 hours total', icon: '📅', category: 'listening', requirement: 168, rarity: 'rare' },
  { id: 'radio_addict', name: 'Radio Addict', description: 'Listen for 1000 hours total', icon: '🎧', category: 'listening', requirement: 1000, rarity: 'legendary' },
  
  // Explorer achievements
  { id: 'explorer', name: 'Explorer', description: 'Visit 5 different stations', icon: '🔍', category: 'explorer', requirement: 5, rarity: 'common' },
  { id: 'wanderer', name: 'Wanderer', description: 'Visit 25 different stations', icon: '🗺️', category: 'explorer', requirement: 25, rarity: 'uncommon' },
  { id: 'globe_trotter', name: 'Globe Trotter', description: 'Visit 100 different stations', icon: '🌍', category: 'explorer', requirement: 100, rarity: 'epic' },
  { id: 'genre_master', name: 'Genre Master', description: 'Listen to all genres', icon: '🎵', category: 'explorer', requirement: 6, rarity: 'rare' },
  
  // Social achievements
  { id: 'first_chat', name: 'First Words', description: 'Send your first chat message', icon: '💬', category: 'social', requirement: 1, rarity: 'common' },
  { id: 'chatterbox', name: 'Chatterbox', description: 'Send 100 chat messages', icon: '🗣️', category: 'social', requirement: 100, rarity: 'uncommon' },
  { id: 'first_tip', name: 'Generous Soul', description: 'Send your first tip', icon: '💰', category: 'social', requirement: 1, rarity: 'common' },
  { id: 'big_tipper', name: 'Big Tipper', description: 'Send 50 tips', icon: '💎', category: 'social', requirement: 50, rarity: 'rare' },
  { id: 'whale', name: 'Whale', description: 'Send 500 tips', icon: '🐋', category: 'social', requirement: 500, rarity: 'legendary' },
  
  // Collector achievements
  { id: 'first_recording', name: 'Archivist', description: 'Record your first broadcast', icon: '📼', category: 'collector', requirement: 1, rarity: 'common' },
  { id: 'collector', name: 'Collector', description: 'Record 10 broadcasts', icon: '📚', category: 'collector', requirement: 10, rarity: 'uncommon' },
  { id: 'hoarder', name: 'Hoarder', description: 'Record 100 broadcasts', icon: '🏛️', category: 'collector', requirement: 100, rarity: 'epic' },
  
  // Special achievements
  { id: 'early_bird', name: 'Early Bird', description: 'Listen at 6 AM', icon: '🐦', category: 'special', requirement: 1, rarity: 'uncommon' },
  { id: 'night_owl', name: 'Night Owl', description: 'Listen at 3 AM', icon: '🦉', category: 'special', requirement: 1, rarity: 'uncommon' },
  { id: 'zone_420', name: '420 Enthusiast', description: 'Tune into 420 zone 10 times', icon: '🌿', category: 'special', requirement: 10, rarity: 'rare' },
  { id: 'streak_7', name: 'Week Streak', description: 'Listen 7 days in a row', icon: '🔥', category: 'special', requirement: 7, rarity: 'rare' },
  { id: 'streak_30', name: 'Month Streak', description: 'Listen 30 days in a row', icon: '⚡', category: 'special', requirement: 30, rarity: 'epic' },
  { id: 'og_listener', name: 'OG Listener', description: 'Be among the first 1000 users', icon: '👑', category: 'special', requirement: 1, rarity: 'legendary' },
];

const RARITY_COLORS = {
  common: 'text-gray-400 border-gray-400/30 bg-gray-400/10',
  uncommon: 'text-green-400 border-green-400/30 bg-green-400/10',
  rare: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  epic: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  legendary: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
};

const CATEGORY_LABELS = {
  listening: { label: 'Listening', icon: '🎧' },
  social: { label: 'Social', icon: '💬' },
  collector: { label: 'Collector', icon: '📼' },
  explorer: { label: 'Explorer', icon: '🔍' },
  special: { label: 'Special', icon: '⭐' },
};

export function ListenerAchievements({ isOpen, onClose }: ListenerAchievementsProps) {
  const { address } = useAccount();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [friends, setFriends] = useState<FriendComparison[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [friendAddress, setFriendAddress] = useState('');

  useEffect(() => {
    if (isOpen && address) {
      loadAchievements();
      loadFriends();
    }
  }, [isOpen, address]);

  const loadAchievements = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/achievements?wallet=${address}`);
      if (res.ok) {
        const data = await res.json();
        setAchievements(data.achievements || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
      // Use default achievements with 0 progress
      setAchievements(ACHIEVEMENT_DEFINITIONS.map(a => ({
        ...a,
        progress: 0,
        unlocked: false,
        unlocked_at: null,
        nft_minted: false,
      })));
    }
    setLoading(false);
  };

  const loadFriends = async () => {
    if (!address) return;
    setLoadingFriends(true);
    try {
      const res = await fetch(`/api/achievements/friends?wallet=${address}`);
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Failed to load friends:', error);
      // Mock data for placeholder
      setFriends([]);
    }
    setLoadingFriends(false);
  };

  const addFriend = async () => {
    if (!address || !friendAddress.trim()) return;
    try {
      const res = await fetch('/api/achievements/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
          friend_address: friendAddress.trim(),
        }),
      });
      if (res.ok) {
        setFriendAddress('');
        await loadFriends();
      }
    } catch (error) {
      console.error('Failed to add friend:', error);
    }
  };

  const removeFriend = async (friendWallet: string) => {
    if (!address) return;
    try {
      await fetch(`/api/achievements/friends?wallet=${address}&friend=${friendWallet}`, {
        method: 'DELETE',
      });
      await loadFriends();
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  const handleMintNFT = async (achievementId: string) => {
    if (!address) return;
    setMintingId(achievementId);
    try {
      const res = await fetch('/api/achievements/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
          achievement_id: achievementId,
        }),
      });

      if (res.ok) {
        alert('🎉 Achievement NFT minting initiated!\n\nNote: On-chain minting coming soon!');
        await loadAchievements();
      }
    } catch (error) {
      console.error('Failed to mint NFT:', error);
    }
    setMintingId(null);
  };

  const filteredAchievements = achievements.filter(a => {
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    if (showUnlockedOnly && !a.unlocked) return false;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-brass rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brass/30">
          <div>
            <h3 className="nixie-tube text-lg">🏅 ACHIEVEMENTS</h3>
            <p className="text-dial-cream/50 text-xs">
              {unlockedCount}/{totalCount} unlocked
            </p>
          </div>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">
            ×
          </button>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="p-3 border-b border-brass/20 grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-brass font-bold text-sm">{stats.total_listening_hours.toFixed(1)}h</p>
              <p className="text-dial-cream/40 text-xs">Listened</p>
            </div>
            <div>
              <p className="text-brass font-bold text-sm">{stats.stations_visited}</p>
              <p className="text-dial-cream/40 text-xs">Stations</p>
            </div>
            <div>
              <p className="text-brass font-bold text-sm">{stats.tips_sent}</p>
              <p className="text-dial-cream/40 text-xs">Tips</p>
            </div>
            <div>
              <p className="text-brass font-bold text-sm">{stats.consecutive_days}</p>
              <p className="text-dial-cream/40 text-xs">Day Streak</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="p-3 border-b border-brass/20 space-y-2">
          {/* Category Filter */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-brass text-cabinet-dark'
                  : 'bg-black/30 text-dial-cream/70 hover:bg-black/50'
              }`}
            >
              All
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, { label, icon }]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-all ${
                  selectedCategory === key
                    ? 'bg-brass text-cabinet-dark'
                    : 'bg-black/30 text-dial-cream/70 hover:bg-black/50'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
          
          {/* Toggle */}
          <label className="flex items-center gap-2 text-xs text-dial-cream/60 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnlockedOnly}
              onChange={(e) => setShowUnlockedOnly(e.target.checked)}
              className="rounded border-brass/30"
            />
            Show unlocked only
          </label>
        </div>

        {/* Achievements List */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin text-2xl mb-2">🏅</div>
              <p className="text-dial-cream/60 text-sm">Loading achievements...</p>
            </div>
          ) : !address ? (
            <div className="text-center py-8">
              <p className="text-dial-cream/60 text-sm">Connect wallet to view achievements</p>
            </div>
          ) : filteredAchievements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-dial-cream/60 text-sm">No achievements found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onMint={handleMintNFT}
                  minting={mintingId === achievement.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer with Compare Toggle */}
        <div className="p-3 border-t border-brass/20">
          <div className="flex items-center justify-between">
            <p className="text-dial-cream/40 text-xs">
              💡 Mint unlocked achievements as NFTs on Base
            </p>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`px-2 py-1 text-xs rounded transition-all ${
                showComparison
                  ? 'bg-brass text-cabinet-dark'
                  : 'bg-black/30 text-dial-cream/70 hover:bg-black/50'
              }`}
            >
              👥 Compare
            </button>
          </div>
        </div>
      </div>

      {/* Friend Comparison Panel */}
      {showComparison && (
        <FriendComparisonPanel
          friends={friends}
          loading={loadingFriends}
          myStats={{ unlocked: unlockedCount, hours: stats?.total_listening_hours || 0 }}
          friendAddress={friendAddress}
          onFriendAddressChange={setFriendAddress}
          onAddFriend={addFriend}
          onRemoveFriend={removeFriend}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}

function FriendComparisonPanel({
  friends,
  loading,
  myStats,
  friendAddress,
  onFriendAddressChange,
  onAddFriend,
  onRemoveFriend,
  onClose,
}: {
  friends: FriendComparison[];
  loading: boolean;
  myStats: { unlocked: number; hours: number };
  friendAddress: string;
  onFriendAddressChange: (v: string) => void;
  onAddFriend: () => void;
  onRemoveFriend: (wallet: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
      <div className="bg-cabinet-dark border-2 border-brass rounded-xl w-full max-w-md max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brass/30">
          <h3 className="nixie-tube text-lg">👥 COMPARE WITH FRIENDS</h3>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">
            ×
          </button>
        </div>

        {/* My Stats */}
        <div className="p-3 border-b border-brass/20 bg-brass/10">
          <p className="text-brass text-xs mb-1">YOUR STATS</p>
          <div className="flex gap-4">
            <div>
              <span className="text-dial-cream font-bold">{myStats.unlocked}</span>
              <span className="text-dial-cream/50 text-xs ml-1">achievements</span>
            </div>
            <div>
              <span className="text-dial-cream font-bold">{myStats.hours.toFixed(1)}h</span>
              <span className="text-dial-cream/50 text-xs ml-1">listened</span>
            </div>
          </div>
        </div>

        {/* Add Friend */}
        <div className="p-3 border-b border-brass/20">
          <p className="text-dial-cream/60 text-xs mb-2">Add friend by wallet address</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={friendAddress}
              onChange={(e) => onFriendAddressChange(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-2 py-1.5 bg-black/30 border border-brass/30 rounded text-dial-cream text-sm placeholder:text-dial-cream/30"
            />
            <button
              onClick={onAddFriend}
              disabled={!friendAddress.trim()}
              className="px-3 py-1.5 bg-brass text-cabinet-dark text-sm rounded disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="text-center py-4">
              <p className="text-dial-cream/60 text-sm">Loading friends...</p>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-dial-cream/50 text-sm">No friends added yet</p>
              <p className="text-dial-cream/30 text-xs mt-1">
                Add friends to compare achievements
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <div
                  key={friend.wallet_address}
                  className="flex items-center gap-3 p-2 bg-black/20 rounded-lg"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-brass/30 flex items-center justify-center text-lg overflow-hidden">
                    {friend.avatar_url ? (
                      <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      '👤'
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-dial-cream text-sm truncate">
                      {friend.display_name || `${friend.wallet_address.slice(0, 6)}...${friend.wallet_address.slice(-4)}`}
                    </p>
                    <div className="flex gap-3 text-xs text-dial-cream/50">
                      <span className={friend.unlocked_count > myStats.unlocked ? 'text-green-400' : ''}>
                        {friend.unlocked_count} achievements
                      </span>
                      <span className={friend.total_listening_hours > myStats.hours ? 'text-green-400' : ''}>
                        {friend.total_listening_hours.toFixed(1)}h
                      </span>
                    </div>
                    {friend.rarest_achievement && (
                      <p className="text-amber-400/70 text-xs mt-0.5">
                        🏆 {friend.rarest_achievement}
                      </p>
                    )}
                  </div>

                  {/* Comparison Indicator */}
                  <div className="text-center">
                    {friend.unlocked_count > myStats.unlocked ? (
                      <span className="text-red-400 text-xs">Behind</span>
                    ) : friend.unlocked_count < myStats.unlocked ? (
                      <span className="text-green-400 text-xs">Ahead</span>
                    ) : (
                      <span className="text-dial-cream/50 text-xs">Tied</span>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => onRemoveFriend(friend.wallet_address)}
                    className="text-dial-cream/30 hover:text-tuning-red text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-brass/20 text-center">
          <p className="text-dial-cream/40 text-xs">
            🔗 Friend data stored locally (on-chain coming soon)
          </p>
        </div>
      </div>
    </div>
  );
}

function AchievementCard({ 
  achievement, 
  onMint, 
  minting 
}: { 
  achievement: Achievement; 
  onMint: (id: string) => void;
  minting: boolean;
}) {
  const progressPercent = Math.min((achievement.progress / achievement.requirement) * 100, 100);
  const rarityClass = RARITY_COLORS[achievement.rarity];

  return (
    <div
      className={`rounded-lg p-3 border transition-all ${
        achievement.unlocked
          ? `${rarityClass}`
          : 'bg-black/20 border-brass/10 opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale'}`}>
          {achievement.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`font-medium text-sm ${achievement.unlocked ? 'text-dial-cream' : 'text-dial-cream/50'}`}>
              {achievement.name}
            </p>
            <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${rarityClass}`}>
              {achievement.rarity}
            </span>
          </div>
          <p className="text-dial-cream/50 text-xs mt-0.5">{achievement.description}</p>
          
          {/* Progress Bar */}
          {!achievement.unlocked && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-dial-cream/40 mb-1">
                <span>Progress</span>
                <span>{achievement.progress}/{achievement.requirement}</span>
              </div>
              <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brass transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Unlocked Info */}
          {achievement.unlocked && achievement.unlocked_at && (
            <p className="text-dial-cream/40 text-xs mt-1">
              Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Mint Button */}
        {achievement.unlocked && !achievement.nft_minted && (
          <button
            onClick={() => onMint(achievement.id)}
            disabled={minting}
            className="px-2 py-1 bg-brass/20 text-brass text-xs rounded hover:bg-brass/30 disabled:opacity-50"
          >
            {minting ? '...' : 'MINT'}
          </button>
        )}
        {achievement.nft_minted && (
          <span className="text-green-400 text-xs">✓ NFT</span>
        )}
      </div>
    </div>
  );
}
