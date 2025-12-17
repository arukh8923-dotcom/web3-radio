'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface Request {
  id: string;
  walletAddress: string;
  songTitle: string;
  artist?: string;
  vibesStaked: number;
  timestamp: number;
  status: 'pending' | 'fulfilled' | 'expired';
}

interface RequestLineProps {
  stationId?: string;
  disabled?: boolean;
}

export function RequestLine({ stationId, disabled }: RequestLineProps) {
  const { address } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState<Request[]>([
    // Mock data
    { id: '1', walletAddress: '0x123...abc', songTitle: 'Chill Beats', artist: 'Lo-Fi Producer', vibesStaked: 50, timestamp: Date.now() - 300000, status: 'pending' },
    { id: '2', walletAddress: '0x456...def', songTitle: 'Summer Vibes', vibesStaked: 30, timestamp: Date.now() - 600000, status: 'pending' },
  ]);
  const [newRequest, setNewRequest] = useState({ songTitle: '', artist: '', vibesStake: 10 });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newRequest.songTitle || !address || !stationId) return;
    
    setSubmitting(true);
    
    // TODO: Implement actual Vibes staking via smart contract
    const request: Request = {
      id: Date.now().toString(),
      walletAddress: address,
      songTitle: newRequest.songTitle,
      artist: newRequest.artist || undefined,
      vibesStaked: newRequest.vibesStake,
      timestamp: Date.now(),
      status: 'pending',
    };
    
    setRequests([request, ...requests]);
    setNewRequest({ songTitle: '', artist: '', vibesStake: 10 });
    setSubmitting(false);
  };

  const sortedRequests = [...requests]
    .filter(r => r.status === 'pending')
    .sort((a, b) => b.vibesStaked - a.vibesStaked);

  const formatTime = (timestamp: number) => {
    const mins = Math.floor((Date.now() - timestamp) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || !stationId}
        className="preset-button text-xs disabled:opacity-50"
        title="Request Line"
      >
        🎵 REQUEST
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 bottom-full mb-2 bg-cabinet-dark border border-brass rounded-lg shadow-xl z-50 w-72">
            <div className="p-3 border-b border-brass/30">
              <h3 className="text-brass font-dial text-sm">🎵 Request Line</h3>
              <p className="text-dial-cream/50 text-xs mt-1">
                Stake VIBES to request songs
              </p>
            </div>

            {/* Request Form */}
            {address ? (
              <div className="p-3 border-b border-brass/30 space-y-2">
                <input
                  type="text"
                  placeholder="Song title *"
                  value={newRequest.songTitle}
                  onChange={(e) => setNewRequest({ ...newRequest, songTitle: e.target.value })}
                  className="w-full px-2 py-1.5 bg-black/30 border border-brass/30 rounded text-dial-cream text-sm placeholder:text-dial-cream/30"
                />
                <input
                  type="text"
                  placeholder="Artist (optional)"
                  value={newRequest.artist}
                  onChange={(e) => setNewRequest({ ...newRequest, artist: e.target.value })}
                  className="w-full px-2 py-1.5 bg-black/30 border border-brass/30 rounded text-dial-cream text-sm placeholder:text-dial-cream/30"
                />
                <div className="flex items-center gap-2">
                  <label className="text-dial-cream/60 text-xs">Stake:</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={newRequest.vibesStake}
                    onChange={(e) => setNewRequest({ ...newRequest, vibesStake: parseInt(e.target.value) || 10 })}
                    className="w-20 px-2 py-1 bg-black/30 border border-brass/30 rounded text-dial-cream text-sm"
                  />
                  <span className="text-brass text-xs">VIBES</span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!newRequest.songTitle || submitting}
                  className="w-full preset-button text-xs disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'SUBMIT REQUEST'}
                </button>
              </div>
            ) : (
              <p className="p-3 text-dial-cream/50 text-xs text-center border-b border-brass/30">
                Connect wallet to make requests
              </p>
            )}

            {/* Request Queue */}
            <div className="max-h-48 overflow-y-auto">
              {sortedRequests.length === 0 ? (
                <p className="p-4 text-dial-cream/40 text-xs text-center">
                  No pending requests
                </p>
              ) : (
                sortedRequests.map((request, index) => (
                  <div
                    key={request.id}
                    className={`p-2 border-b border-brass/10 ${index === 0 ? 'bg-brass/10' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-dial-cream text-sm truncate">
                          {index === 0 && <span className="text-brass mr-1">▶</span>}
                          {request.songTitle}
                        </p>
                        {request.artist && (
                          <p className="text-dial-cream/50 text-xs truncate">{request.artist}</p>
                        )}
                        <p className="text-dial-cream/30 text-xs mt-0.5">
                          {truncateAddress(request.walletAddress)} • {formatTime(request.timestamp)}
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <span className="text-brass text-sm font-dial">{request.vibesStaked}</span>
                        <p className="text-dial-cream/40 text-[10px]">VIBES</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="p-2 text-dial-cream/30 text-[10px] text-center">
              Higher stakes = higher priority
            </p>
          </div>
        </>
      )}
    </div>
  );
}
