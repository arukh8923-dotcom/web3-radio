'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Drop {
  id: string;
  station_id: string;
  station_name: string;
  frequency: number;
  timestamp: string;
  reward_amount: number;
  reward_type: 'vibes' | 'nft';
  total_recipients: number;
  is_eligible: boolean;
  is_claimed: boolean;
  claim_deadline: string | null;
}

interface DropHistory {
  id: string;
  timestamp: string;
  reward_amount: number;
  reward_type: 'vibes' | 'nft';
  claimed: boolean;
  station_name: string;
}

interface CommunityDropsProps {
  stationId?: string;
  frequency?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CommunityDrops({ stationId, frequency, isOpen, onClose }: CommunityDropsProps) {
  const { address } = useAccount();
  const [activeDrop, setActiveDrop] = useState<Drop | null>(null);
  const [dropHistory, setDropHistory] = useState<DropHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [is420Time, setIs420Time] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDrops();
    }
  }, [isOpen, stationId, address]);

  // 4:20 countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      // Check if it's 4:20 (AM or PM)
      const is420 = (hours === 4 || hours === 16) && minutes === 20;
      setIs420Time(is420);

      // Calculate next 4:20
      let targetHour = hours < 4 ? 4 : hours < 16 ? 16 : 4;
      let targetDate = new Date(now);
      
      if (hours >= 16 || (hours === 16 && minutes >= 20)) {
        // Next 4:20 is tomorrow at 4:20 AM
        targetDate.setDate(targetDate.getDate() + 1);
        targetHour = 4;
      }
      
      targetDate.setHours(targetHour, 20, 0, 0);
      
      const diff = targetDate.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ hours: h, minutes: m, seconds: s });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDrops = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (stationId) params.set('station_id', stationId);
      if (address) params.set('wallet', address);

      const res = await fetch(`/api/drops?${params}`);
      if (res.ok) {
        const data = await res.json();
        setActiveDrop(data.active_drop);
        setDropHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load drops:', error);
    }
    setLoading(false);
  };

  const claimDrop = async (dropId: string) => {
    if (!address) return;
    setClaiming(true);
    try {
      const res = await fetch('/api/drops/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drop_id: dropId, wallet_address: address }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await loadDrops();
        } else {
          alert(data.error || 'Failed to claim drop');
        }
      }
    } catch (error) {
      console.error('Failed to claim drop:', error);
    }
    setClaiming(false);
  };

  const formatCountdown = () => {
    const { hours, minutes, seconds } = countdown;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cabinet-dark border-2 border-zone-420 rounded-xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zone-420/30 bg-gradient-to-r from-zone-420/30 to-purple-900/30">
          <div>
            <h3 className="nixie-tube text-lg text-zone-420">🎁 COMMUNITY DROPS</h3>
            <p className="text-dial-cream/50 text-xs">Random rewards at 4:20</p>
          </div>
          <button onClick={onClose} className="text-dial-cream/60 hover:text-dial-cream text-2xl">×</button>
        </div>

        {/* 4:20 Countdown */}
        <div className={`p-4 border-b border-zone-420/20 ${is420Time ? 'bg-zone-420/30 animate-pulse' : 'bg-black/30'}`}>
          <div className="text-center">
            {is420Time ? (
              <>
                <p className="text-zone-420 text-xl font-bold animate-bounce">🔥 IT'S 4:20! 🔥</p>
                <p className="text-dial-cream/70 text-sm mt-1">Drops are happening NOW!</p>
              </>
            ) : (
              <>
                <p className="text-dial-cream/60 text-xs mb-1">NEXT DROP IN</p>
                <p className="text-zone-420 text-3xl font-mono font-bold">{formatCountdown()}</p>
                <p className="text-dial-cream/40 text-xs mt-1">until 4:20</p>
              </>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zone-420/20">
          <button
            onClick={() => setShowHistory(false)}
            className={`flex-1 py-2 text-sm ${!showHistory ? 'text-zone-420 border-b-2 border-zone-420' : 'text-dial-cream/50'}`}
          >
            Active Drop
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className={`flex-1 py-2 text-sm ${showHistory ? 'text-zone-420 border-b-2 border-zone-420' : 'text-dial-cream/50'}`}
          >
            History ({dropHistory.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin text-4xl mb-2">🎁</div>
                <p className="text-dial-cream/50">Loading...</p>
              </div>
            </div>
          ) : showHistory ? (
            <DropHistoryList history={dropHistory} />
          ) : (
            <ActiveDropView 
              drop={activeDrop} 
              onClaim={claimDrop} 
              claiming={claiming}
              isConnected={!!address}
            />
          )}
        </div>

        {/* Eligibility Info */}
        {!showHistory && (
          <div className="p-3 border-t border-zone-420/10 bg-zone-420/5">
            <p className="text-dial-cream/50 text-xs text-center">
              💡 Stay tuned in at 4:20 to be eligible for drops!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActiveDropView({ 
  drop, 
  onClaim, 
  claiming, 
  isConnected 
}: { 
  drop: Drop | null; 
  onClaim: (id: string) => void; 
  claiming: boolean;
  isConnected: boolean;
}) {
  if (!drop) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🎁</div>
        <p className="text-dial-cream/60 text-lg">No Active Drop</p>
        <p className="text-dial-cream/40 text-sm mt-2">
          Check back at 4:20 for the next community drop!
        </p>
        <div className="mt-6 p-4 bg-zone-420/10 rounded-lg">
          <p className="text-zone-420 text-sm font-medium">How to be eligible:</p>
          <ul className="text-dial-cream/50 text-xs mt-2 space-y-1 text-left">
            <li>• Be tuned in to a station at 4:20</li>
            <li>• Have VIBES in your wallet</li>
            <li>• Be active in the community</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Drop Card */}
      <div className={`rounded-xl p-4 border-2 ${
        drop.is_eligible 
          ? 'bg-gradient-to-br from-zone-420/20 to-purple-600/20 border-zone-420' 
          : 'bg-black/20 border-brass/30'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-zone-420 to-purple-600 flex items-center justify-center text-2xl">
            {drop.reward_type === 'nft' ? '🖼️' : '✨'}
          </div>
          <div className="flex-1">
            <p className="text-dial-cream font-bold">{drop.station_name}</p>
            <p className="text-dial-cream/50 text-xs">{drop.frequency.toFixed(1)} FM</p>
          </div>
          <div className="text-right">
            <p className="text-zone-420 font-bold text-lg">
              {drop.reward_amount.toLocaleString()}
            </p>
            <p className="text-dial-cream/50 text-xs uppercase">{drop.reward_type}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs mb-4">
          <span className="text-dial-cream/50">
            👥 {drop.total_recipients} recipients
          </span>
          <span className="text-dial-cream/50">
            {new Date(drop.timestamp).toLocaleString()}
          </span>
        </div>

        {/* Status & Action */}
        {drop.is_claimed ? (
          <div className="text-center py-3 bg-green-500/20 rounded-lg">
            <p className="text-green-400 font-medium">✓ Claimed!</p>
          </div>
        ) : drop.is_eligible ? (
          <button
            onClick={() => onClaim(drop.id)}
            disabled={claiming || !isConnected}
            className="w-full py-3 bg-zone-420 text-white rounded-lg hover:bg-zone-420-light disabled:opacity-50 font-bold text-lg"
          >
            {claiming ? 'Claiming...' : '🎁 CLAIM DROP'}
          </button>
        ) : (
          <div className="text-center py-3 bg-red-500/10 rounded-lg">
            <p className="text-red-400 text-sm">Not eligible for this drop</p>
            <p className="text-dial-cream/40 text-xs mt-1">
              You weren't tuned in at drop time
            </p>
          </div>
        )}

        {drop.claim_deadline && !drop.is_claimed && drop.is_eligible && (
          <p className="text-dial-cream/40 text-xs text-center mt-2">
            Claim before {new Date(drop.claim_deadline).toLocaleString()}
          </p>
        )}
      </div>

      {/* Reward Info */}
      <div className="p-3 bg-black/20 rounded-lg">
        <p className="text-dial-cream/60 text-xs">
          {drop.reward_type === 'nft' 
            ? '🖼️ This drop includes a commemorative NFT!'
            : '✨ VIBES will be added to your balance automatically'}
        </p>
      </div>
    </div>
  );
}

function DropHistoryList({ history }: { history: DropHistory[] }) {
  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-dial-cream/50">No drop history yet</p>
        <p className="text-dial-cream/40 text-xs mt-1">
          Your claimed drops will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((drop) => (
        <div 
          key={drop.id}
          className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-zone-420/10"
        >
          <div className="w-10 h-10 rounded-full bg-zone-420/20 flex items-center justify-center">
            {drop.reward_type === 'nft' ? '🖼️' : '✨'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-dial-cream text-sm truncate">{drop.station_name}</p>
            <p className="text-dial-cream/40 text-xs">
              {new Date(drop.timestamp).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className={`font-bold ${drop.claimed ? 'text-zone-420' : 'text-dial-cream/50'}`}>
              +{drop.reward_amount.toLocaleString()}
            </p>
            <p className="text-dial-cream/40 text-xs uppercase">{drop.reward_type}</p>
          </div>
          {drop.claimed && (
            <span className="text-green-400 text-xs">✓</span>
          )}
        </div>
      ))}
    </div>
  );
}
