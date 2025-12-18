'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { VIBES_TOKEN_ADDRESS, ERC20_ABI } from '@/lib/contracts';

// Platform treasury for VIBES stakes (can be refunded if request fulfilled)
const TREASURY_ADDRESS = '0x000000000000000000000000000000000000dEaD' as const;

interface Request {
  id: string;
  walletAddress: string;
  songTitle: string;
  artist?: string;
  vibesStaked: number;
  timestamp: number;
  status: 'pending' | 'fulfilled' | 'expired';
  txHash?: string;
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

  const sortedRequests = [...requests]
    .filter((r) => r.status === 'pending')
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
                      </div>
                      <div className="text-right ml-2">
                        <span className="text-purple-400 text-sm font-dial">{request.vibesStaked}</span>
                        <p className="text-dial-cream/40 text-[10px]">VIBES</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="p-2 text-dial-cream/30 text-[10px] text-center">Higher stakes = higher priority • On-chain</p>
          </div>
        </>
      )}
    </div>
  );
}
