'use client';

import { useAccount } from 'wagmi';
import { useRadio } from '@/hooks/useRadio';
import type { MoodRing } from '@/lib/api';

interface MoodRingDisplayProps {
  moodRing: MoodRing;
  stationId: string;
}

const MOODS = [
  { key: 'chill', emoji: '😌', color: 'bg-blue-500' },
  { key: 'hype', emoji: '🔥', color: 'bg-orange-500' },
  { key: 'melancholy', emoji: '💜', color: 'bg-purple-500' },
  { key: 'euphoric', emoji: '✨', color: 'bg-yellow-500' },
  { key: 'zen', emoji: '🧘', color: 'bg-green-500' },
] as const;

export function MoodRingDisplay({ moodRing, stationId }: MoodRingDisplayProps) {
  const { address } = useAccount();
  const { sendVibes } = useRadio();

  const totalVotes = 
    moodRing.chill_count + 
    moodRing.hype_count + 
    moodRing.melancholy_count + 
    moodRing.euphoric_count + 
    moodRing.zen_count;

  const getPercentage = (count: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((count / totalVotes) * 100);
  };

  const handleVote = async (mood: typeof MOODS[number]['key']) => {
    if (!address) return;
    await sendVibes(mood);
  };

  return (
    <div className="mt-4 pt-4 border-t border-dial-cream/20">
      <div className="flex items-center justify-between mb-2">
        <span className="text-dial-cream/70 text-sm font-dial">VIBES</span>
        <span className="text-dial-cream/50 text-xs">
          {totalVotes} reactions
        </span>
      </div>

      {/* Mood Buttons */}
      <div className="flex gap-2">
        {MOODS.map((mood) => {
          const count = moodRing[`${mood.key}_count` as keyof MoodRing] as number;
          const percentage = getPercentage(count);
          const isActive = moodRing.current_mood === mood.key;

          return (
            <button
              key={mood.key}
              onClick={() => handleVote(mood.key)}
              disabled={!address}
              className={`
                flex-1 flex flex-col items-center gap-1 p-2 rounded-lg
                transition-all duration-200
                ${isActive ? mood.color + ' text-white' : 'bg-black/30 hover:bg-black/50'}
                ${!address ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={`${mood.key} (${percentage}%)`}
            >
              <span className="text-xl">{mood.emoji}</span>
              <span className="text-xs">{percentage}%</span>
            </button>
          );
        })}
      </div>

      {!address && (
        <p className="text-dial-cream/40 text-xs text-center mt-2">
          Connect wallet to send vibes
        </p>
      )}
    </div>
  );
}
