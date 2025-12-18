'use client';

import { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import Image from 'next/image';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { ListenerAchievements } from '@/components/radio/ListenerAchievements';

interface FarcasterProfile {
  fid: number | null;
  username: string | null;
  pfp: string | null;
}

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { radio, isLoading: balancesLoading } = useTokenBalances();
  const [profile, setProfile] = useState<FarcasterProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ achievements: 0 });
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    if (isOpen && address) {
      loadProfile();
      loadStats();
    }
  }, [isOpen, address]);

  const loadProfile = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/farcaster?address=${address}`);
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    if (!address) return;
    try {
      // Load achievements count
      const achRes = await fetch(`/api/achievements?wallet=${address}`);
      if (achRes.ok) {
        const achData = await achRes.json();
        setStats(prev => ({ ...prev, achievements: achData.unlocked_count || 0 }));
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
    // TODO: Fetch real stats from database
    // Reactions and messages stats will be available in Phase 2 with $VIBES
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-brass rounded-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brass/30">
          <h2 className="text-lg font-dial text-brass">👤 Profile</h2>
          <button
            onClick={onClose}
            className="text-dial-cream/60 hover:text-dial-cream text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!isConnected ? (
            <div className="text-center py-8">
              <p className="text-dial-cream/60 mb-4">Connect wallet to view profile</p>
              <button
                onClick={onClose}
                className="preset-button"
              >
                Close
              </button>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <div className="loading-spinner" />
            </div>
          ) : (
            <>
              {/* Avatar & Name */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-brass/30 flex items-center justify-center overflow-hidden">
                  {profile?.pfp ? (
                    <Image
                      src={profile.pfp}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-brass">?</span>
                  )}
                </div>
                <div>
                  {profile?.username ? (
                    <>
                      <p className="text-dial-cream font-dial text-lg">@{profile.username}</p>
                      <p className="text-dial-cream/50 text-xs">ID: {profile.fid}</p>
                    </>
                  ) : (
                    <p className="text-dial-cream/60 text-sm">No profile linked</p>
                  )}
                </div>
              </div>

              {/* Wallet */}
              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <p className="text-dial-cream/50 text-xs mb-1">Wallet Address</p>
                <p className="text-dial-cream text-xs font-mono break-all">{address}</p>
              </div>

              {/* Token Balances */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <p className="text-dial-cream/50 text-xs">$RADIO</p>
                  <p className="text-brass font-dial text-lg">
                    {balancesLoading ? '...' : parseFloat(radio).toFixed(2)}
                  </p>
                </div>
                {/* $VIBES - Social Token */}
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <p className="text-dial-cream/50 text-xs">$VIBES</p>
                  <p className="text-purple-400 font-dial text-lg">
                    0
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {/* Reactions */}
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <p className="text-dial-cream/50 text-xs">Reactions</p>
                  <p className="text-purple-400 font-dial">0 🎵</p>
                </div>
                {/* Messages */}
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <p className="text-dial-cream/50 text-xs">Messages</p>
                  <p className="text-brass font-dial">0 💬</p>
                </div>
                <div 
                  className="bg-black/30 rounded-lg p-3 text-center cursor-pointer hover:bg-black/40 transition-colors"
                  onClick={() => setShowAchievements(true)}
                >
                  <p className="text-dial-cream/50 text-xs">Achievements</p>
                  <p className="text-brass font-dial">{stats.achievements} 🏅</p>
                </div>
              </div>

              {/* Achievements Button */}
              <button
                onClick={() => setShowAchievements(true)}
                className="w-full preset-button mb-4 flex items-center justify-center gap-2"
              >
                🏅 View All Achievements
              </button>

              {/* Disconnect */}
              <button
                onClick={handleDisconnect}
                className="w-full py-3 text-tuning-red hover:bg-tuning-red/10 rounded-lg transition-colors text-sm"
              >
                Disconnect Wallet
              </button>
            </>
          )}
        </div>
      </div>

      {/* Achievements Modal */}
      <ListenerAchievements
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
      />
    </div>
  );
}
