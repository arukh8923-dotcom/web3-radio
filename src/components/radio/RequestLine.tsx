'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { VIBES_TOKEN_ADDRESS, ERC20_ABI } from '@/lib/contracts';
import { TREASURY_ADDRESS } from '@/constants/addresses';

// Request expiry time (2 hours)
const REQUEST_EXPIRY_MS = 2 * 60 * 60 * 1000;

interface Request {
  id: string;
  walletAddress: string;
  songTitle: string;
  artist?: string;
  vibesStaked: number;
  timestamp: number;
  status: 'pending' | 'fulfilled' | 'expired' | 'refunded';
  txHash?: string;
  fulfilledBy?: string;
  refundTxHash?: string;
}

interface RequestLineProps {
  stationId?: string;
  disabled?: boolean;
}

export function RequestLine({ stationId, disabled }: RequestLineProps) {
  const { address } = useAccount();
  const { vibes, vibesRaw, refetch } = useTokenBalances();
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [newRequest, setNewRequest] = useState({ songTitle: '', artist: '', vibesStake: 10 });
  const [pendingRequest, setPendingRequest] = useState<typeof newRequest | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  const stakeAmountWei = parseUnits(newRequest.vibesStake.toString(), 18);
  const hasEnoughVibes = vibesRaw >= stakeAmountWei;

  // Load requests from API
  useEffect(() => {
    if (!stationId || !isOpen) return;

    async function loadRequests() {
      try {
        const res = await fetch(`/api/requests?station_id=${stationId}`);
        if (res.ok) {
          const data = await res.json();
          setRequests(data.requests || []);
        }
      } catch (error) {
        console.error('Failed to load requests:', error);
      }
    }
    loadRequests();
  }, [stationId, isOpen]);

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && hash && pendingRequest) {
      // Record request in database
      fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_id: stationId,
          wallet_address: address,
          song_title: pendingRequest.songTitle,
          artist: pendingRequest.artist || null,
          vibes_staked: pendingRequest.vibesStake,
          tx_hash: hash,
        }),
      }).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setRequests((prev) => [data.request, ...prev]);
          setNewRequest({ songTitle: '', artist: '', vibesStake: 10 });
          setPendingRequest(null);
          refetch();
        }
      });
    }
  }, [isSuccess, hash, pendingRequest, stationId, address, refetch]);

  const handleSubmit = async () => {
    if (!newRequest.songTitle || !address || !stationId) return;

    if (!hasEnoughVibes) {
      alert(`Insufficient VIBES. You need ${newRequest.vibesStake} VIBES but have ${parseFloat(vibes).toFixed(2)}`);
      return;
    }

    setPendingRequest(newRequest);

    try {
      // Stake VIBES tokens
      writeContract({
        address: VIBES_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [TREASURY_ADDRESS, stakeAmountWei],
      });
    } catch (error) {
      console.error('Failed to stake VIBES:', error);
      setPendingRequest(null);
    }
  };

  // Check for expired requests and auto-refund
  useEffect(() => {
    const checkExpired = async () => {
      const now = Date.now();
      const expiredRequests = requests.filter(
        (r) => r.status === 'pending' && now - r.timestamp > REQUEST_EXPIRY_MS
      );
      
      for (const req of expiredRequests) {
        // Mark as expired in API (triggers refund)
        try {
          await fetch(`/api/requests/${req.id}/expire`, { method: 'POST' });
        } catch (e) {
          console.error('Failed to expire request:', e);
        }
      }
      
      if (expiredRequests.length > 0) {
        // Reload requests
        const res = await fetch(`/api/requests?station_id=${stationId}`);
        if (res.ok) {
          const data = await res.json();
          setRequests(data.requests || []);
        }
      }
    };
    
    if (isOpen && stationId) {
      checkExpired();
      const interval = setInterval(checkExpired, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [isOpen, stationId, requests]);

  // Fulfill request (DJ only)
  const handleFulfill = useCallback(async (requestId: string) => {
    if (!address) return;
    
    try {
      const res = await fetch(`/api/requests/${requestId}/fulfill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfilled_by: address }),
      });
      
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: 'fulfilled' as const, fulfilledBy: address } : r))
        );
      }
    } catch (error) {
      console.error('Failed to fulfill request:', error);
    }
  }, [address]);

  // Request refund (requester only, for expired requests)
  const handleRefund = useCallback(async (requestId: string) => {
    if (!address) return;
    
    try {
      const res = await fetch(`/api/requests/${requestId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: 'refunded' as const, refundTxHash: data.refund_tx_hash } : r))
        );
        refetch();
      }
    } catch (error) {
      console.error('Failed to refund request:', error);
    }
  }, [address, refetch]);

  const sortedRequests = [...requests]
    .filter((r) => r.status === 'pending')
    .sort((a, b) => b.vibesStaked - a.vibesStaked);

  const expiredRequests = requests.filter((r) => r.status === 'expired' && r.walletAddress.toLowerCase() === address?.toLowerCase());

  const formatTime = (timestamp: number) => {
    const mins = Math.floor((Date.now() - timestamp) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const getTimeRemaining = (timestamp: number) => {
    const remaining = REQUEST_EXPIRY_MS - (Date.now() - timestamp);
    if (remaining <= 0) return 'Expired';
    const mins = Math.floor(remaining / 60000);
    if (mins < 60) return `${mins}m left`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m left`;
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isDJ = false; // TODO: Check if current user is DJ of this station

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
          <div className="absolute left-0 bottom-full mb-2 bg-cabinet-dark border border-brass rounded-lg shadow-xl z-50 w-80">
            <div className="p-3 border-b border-brass/30">
              <h3 className="text-brass font-dial text-sm">🎵 Request Line</h3>
              <p className="text-dial-cream/50 text-xs mt-1">Stake VIBES to request songs</p>
            </div>

            {/* Request Form */}
            {address ? (
              <div className="p-3 border-b border-brass/30 space-y-2">
                {/* Balance Display */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-dial-cream/50">Your VIBES:</span>
                  <span className="text-purple-400 font-bold">{parseFloat(vibes).toFixed(0)}</span>
                </div>

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
                    max={10000}
                    value={newRequest.vibesStake}
                    onChange={(e) => setNewRequest({ ...newRequest, vibesStake: parseInt(e.target.value) || 10 })}
                    className="w-20 px-2 py-1 bg-black/30 border border-brass/30 rounded text-dial-cream text-sm"
                  />
                  <span className={`text-xs ${hasEnoughVibes ? 'text-purple-400' : 'text-red-400'}`}>VIBES</span>
                </div>
                {!hasEnoughVibes && (
                  <p className="text-red-400 text-xs">Insufficient VIBES balance</p>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!newRequest.songTitle || isPending || !hasEnoughVibes}
                  className="w-full preset-button text-xs disabled:opacity-50"
                >
                  {isPending ? 'CONFIRM IN WALLET...' : 'SUBMIT REQUEST'}
                </button>
              </div>
            ) : (
              <p className="p-3 text-dial-cream/50 text-xs text-center border-b border-brass/30">
                Connect wallet to make requests
              </p>
            )}

            {/* Expired Requests (Refundable) */}
            {expiredRequests.length > 0 && (
              <div className="p-2 bg-red-500/10 border-b border-red-500/30">
                <p className="text-red-400 text-xs font-medium mb-2">⏰ Expired Requests (Refundable)</p>
                {expiredRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between py-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-dial-cream text-xs truncate">{request.songTitle}</p>
                      <p className="text-purple-400 text-xs">{request.vibesStaked} VIBES</p>
                    </div>
                    <button
                      onClick={() => handleRefund(request.id)}
                      className="px-2 py-1 bg-green-500/20 border border-green-500/50 rounded text-green-400 text-xs hover:bg-green-500/30"
                    >
                      Refund
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Request Queue */}
            <div className="max-h-48 overflow-y-auto">
              {sortedRequests.length === 0 ? (
                <p className="p-4 text-dial-cream/40 text-xs text-center">No pending requests</p>
              ) : (
                sortedRequests.map((request, index) => (
                  <div key={request.id} className={`p-2 border-b border-brass/10 ${index === 0 ? 'bg-brass/10' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-dial-cream text-sm truncate">
                          {index === 0 && <span className="text-brass mr-1">▶</span>}
                          {request.songTitle}
                        </p>
                        {request.artist && <p className="text-dial-cream/50 text-xs truncate">{request.artist}</p>}
                        <p className="text-dial-cream/30 text-xs mt-0.5">
                          {truncateAddress(request.walletAddress)} • {formatTime(request.timestamp)}
                        </p>
                        <p className="text-amber-400/60 text-[10px]">{getTimeRemaining(request.timestamp)}</p>
                      </div>
                      <div className="text-right ml-2">
                        <span className="text-purple-400 text-sm font-dial">{request.vibesStaked}</span>
                        <p className="text-dial-cream/40 text-[10px]">VIBES</p>
                        {isDJ && (
                          <button
                            onClick={() => handleFulfill(request.id)}
                            className="mt-1 px-2 py-0.5 bg-green-500/20 border border-green-500/50 rounded text-green-400 text-[10px] hover:bg-green-500/30"
                          >
                            ✓ Play
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="p-2 text-dial-cream/30 text-[10px] text-center">Higher stakes = higher priority • Expires in 2h • On-chain</p>
          </div>
        </>
      )}
    </div>
  );
}
