'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { VIBES_TOKEN_ADDRESS, ERC20_ABI } from '@/lib/contracts';
import type { SmokeSignal } from '@/lib/supabase';

// Platform treasury address for VIBES burns
const TREASURY_ADDRESS = '0x000000000000000000000000000000000000dEaD' as const; // Burn address

interface SmokeSignalsProps {
  stationId: string;
}

// VIBES cost per minute of signal duration
const VIBES_PER_MINUTE = 1;

export function SmokeSignals({ stationId }: SmokeSignalsProps) {
  const { address } = useAccount();
  const { vibes, vibesRaw, refetch } = useTokenBalances();
  const [signals, setSignals] = useState<SmokeSignal[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(5);
  const [sending, setSending] = useState(false);
  const [pendingSignal, setPendingSignal] = useState<{ message: string; duration: number } | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  const vibesCost = duration * VIBES_PER_MINUTE;
  const vibesCostWei = parseUnits(vibesCost.toString(), 18);
  const hasEnoughVibes = vibesRaw >= vibesCostWei;

  // Load signals
  useEffect(() => {
    if (!stationId) return;

    async function loadSignals() {
      const res = await fetch(`/api/smoke-signals?station_id=${stationId}`);
      const data = await res.json();
      if (data.signals) {
        setSignals(data.signals);
      }
    }
    loadSignals();

    // Refresh every 30 seconds
    const interval = setInterval(loadSignals, 30000);
    return () => clearInterval(interval);
  }, [stationId]);

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && hash && pendingSignal) {
      // Record signal in database after on-chain payment
      fetch('/api/smoke-signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_id: stationId,
          sender_address: address,
          message: pendingSignal.message,
          duration_minutes: pendingSignal.duration,
          tx_hash: hash,
          vibes_spent: pendingSignal.duration * VIBES_PER_MINUTE,
        }),
      }).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setSignals((prev) => [data.signal, ...prev]);
          setMessage('');
          setShowCompose(false);
          setPendingSignal(null);
          refetch();
        }
      });
    }
  }, [isSuccess, hash, pendingSignal, stationId, address, refetch]);

  const sendSignal = async () => {
    if (!address || !message.trim() || sending) return;

    if (!hasEnoughVibes) {
      alert(`Insufficient VIBES. You need ${vibesCost} VIBES but have ${parseFloat(vibes).toFixed(2)}`);
      return;
    }

    setSending(true);
    setPendingSignal({ message: message.trim(), duration });

    try {
      // Burn VIBES tokens (send to dead address)
      writeContract({
        address: VIBES_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [TREASURY_ADDRESS, vibesCostWei],
      });
    } catch (error) {
      console.error('Failed to send smoke signal:', error);
      setPendingSignal(null);
    }
    setSending(false);
  };

  const [now, setNow] = useState<number | null>(null);

  // Update time every second for countdown (client-side only)
  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeRemaining = (expiresAt: string) => {
    if (!now) return '--:--';
    const remaining = new Date(expiresAt).getTime() - now;
    if (remaining <= 0) return 'Expired';
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (signals.length === 0 && !showCompose) {
    return (
      <div className="mt-4 pt-4 border-t border-dial-cream/20">
        <div className="flex items-center justify-between">
          <span className="text-dial-cream/70 text-sm font-dial">🌿 SMOKE SIGNALS</span>
          {address && (
            <button
              onClick={() => setShowCompose(true)}
              className="text-brass text-xs hover:underline"
            >
              + Send Signal
            </button>
          )}
        </div>
        <p className="text-dial-cream/40 text-xs mt-2">
          No active signals. Send an ephemeral message!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-dial-cream/20">
      <div className="flex items-center justify-between mb-3">
        <span className="text-dial-cream/70 text-sm font-dial">🌿 SMOKE SIGNALS</span>
        {address && !showCompose && (
          <button
            onClick={() => setShowCompose(true)}
            className="text-brass text-xs hover:underline"
          >
            + Send Signal
          </button>
        )}
      </div>

      {/* Compose Form */}
      {showCompose && (
        <div className="bg-black/30 rounded-lg p-3 mb-3">
          {/* Balance Display */}
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-dial-cream/50">Your VIBES:</span>
            <span className="text-purple-400 font-bold">{parseFloat(vibes).toFixed(0)} VIBES</span>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send an ephemeral message..."
            maxLength={140}
            rows={2}
            className="w-full bg-transparent border border-brass/30 rounded px-2 py-1 text-dial-cream text-sm placeholder:text-dial-cream/40 focus:outline-none focus:border-brass resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-dial-cream/50 text-xs">Duration:</span>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="bg-black/50 border border-brass/30 rounded px-2 py-1 text-dial-cream text-xs"
              >
                <option value={1}>1 min</option>
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={30}>30 min</option>
              </select>
              <span className={`text-xs ${hasEnoughVibes ? 'text-purple-400' : 'text-red-400'}`}>
                {vibesCost} VIBES
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCompose(false)}
                className="text-dial-cream/50 text-xs hover:text-dial-cream"
              >
                Cancel
              </button>
              <button
                onClick={sendSignal}
                disabled={sending || isPending || !message.trim() || !hasEnoughVibes}
                className="preset-button text-xs px-3 py-1 disabled:opacity-50"
              >
                {isPending ? 'CONFIRM...' : sending ? '...' : 'SEND'}
              </button>
            </div>
          </div>
          {!hasEnoughVibes && (
            <p className="text-red-400 text-xs mt-2">
              Need {vibesCost - parseFloat(vibes)} more VIBES
            </p>
          )}
        </div>
      )}

      {/* Active Signals */}
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {signals.map((signal) => (
          <div
            key={signal.id}
            className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-2 animate-pulse-slow"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-dial-cream/90 text-sm flex-1">{signal.message}</p>
              <span className="text-purple-400 text-xs whitespace-nowrap">
                ⏱ {getTimeRemaining(signal.expires_at)}
              </span>
            </div>
            <p className="text-dial-cream/40 text-xs mt-1 truncate">
              {(signal as any).users?.farcaster_username
                ? `@${(signal as any).users.farcaster_username}`
                : `${signal.sender_address.slice(0, 6)}...${signal.sender_address.slice(-4)}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
