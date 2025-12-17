'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'listener' | 'social' | 'collector' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

interface AchievementsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Achievements({ isOpen, onClose }: AchievementsProps) {
  const { address } = useAccount();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && address) {
      loadAchievements();
    }
  }, [isOpen, address]);

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/achievements?wallet=${address}`);
      if (res.ok) {
        const data = await res.json();
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const rarityColors = {
    common: 'text-gray-400 border-gray-400',
    rare: 'text-blue-400 border-blue-400',
    epic: 'text-purple-400 border-purple-400',
    legendary: 'text-yellow-400 border-yellow-400',
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-amber-500/50 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-amber-500/30">
          <h3 className="text-amber-400 font-bold">🏆 Achievements</h3>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-8 text-dial-cream/60">Loading...</div>
          ) : achievements.length === 0 ? (
            <div className="text-center py-8 text-dial-cream/60">
              No achievements yet. Keep listening!
            </div>
          ) : (
            achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border ${rarityColors[achievement.rarity]} bg-black/30`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-dial-cream">{achievement.name}</p>
                    <p className="text-sm text-dial-cream/60">{achievement.description}</p>
                    {achievement.progress !== undefined && (
                      <div className="mt-1 h-1 bg-black/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500"
                          style={{ width: `${(achievement.progress / (achievement.maxProgress || 1)) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                  {achievement.unlockedAt && (
                    <span className="text-green-400 text-xl">✓</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
