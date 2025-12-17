'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import type { SmokeSignal } from '@/lib/supabase';

interface SmokeSignalsProps {
  stationId: string;
}

export function SmokeSignals({ stationId }: SmokeSignalsProps) {
  const { address } = useAccount();
  const [signals, setSignals] = useState<SmokeSignal[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(5);
  const [sending, setSending] = useState(false);

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

  const sendSignal = async () => {
    if (!address || !message.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/smoke-signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_id: stationId,
          sender_address: address,
          message: message.trim(),
          duration_minutes: duration,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSignals((prev) => [data.signal, ...prev]);
        setMessage('');
        setShowCompose(false);
      }
    } catch (error) {
      console.error('Failed to send smoke signal:', error);
    }
    setSending(false);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const remaining = new Date(expiresAt).getTime() - Date.now();
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
              <span className="text-zone-420 text-xs">{duration} $VIBES</span>
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
                disabled={sending || !message.trim()}
                className="preset-button text-xs px-3 py-1 disabled:opacity-50"
              >
                {sending ? '...' : 'SEND'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Signals */}
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {signals.map((signal) => (
          <div
            key={signal.id}
            className="bg-zone-420/10 border border-zone-420/30 rounded-lg p-2 animate-pulse-slow"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-dial-cream/90 text-sm flex-1">{signal.message}</p>
              <span className="text-zone-420 text-xs whitespace-nowrap">
                ⏱ {getTimeRemaining(signal.expires_at)}
              </span>
            </div>
            <p className="text-dial-cream/40 text-xs mt-1">
              {signal.sender_address.slice(0, 6)}...{signal.sender_address.slice(-4)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
