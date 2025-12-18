'use client';

import { useEffect, useState } from 'react';
import { usePaymaster } from '@/hooks/usePaymaster';
import { formatGasCost } from '@/lib/paymaster';

interface SponsoredTxIndicatorProps {
  isSponsored: boolean;
  gasSaved?: bigint;
  className?: string;
}

/**
 * Visual indicator for sponsored transactions
 * Shows whether gas is being paid by the platform or user
 */
export function SponsoredTxIndicator({ 
  isSponsored, 
  gasSaved,
  className = '' 
}: SponsoredTxIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isSponsored ? (
        <>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Gas Sponsored</span>
          </div>
          {gasSaved && gasSaved > 0n && (
            <span className="text-xs text-green-300/70">
              Saved {formatGasCost(gasSaved)}
            </span>
          )}
        </>
      ) : (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
          <span className="w-2 h-2 bg-amber-400 rounded-full" />
          <span className="text-xs text-amber-400 font-medium">User Paid Gas</span>
        </div>
      )}
    </div>
  );
}

/**
 * Sponsorship status panel showing user's limits
 */
export function SponsorshipStatusPanel() {
  const { getUserLimits, getStats } = usePaymaster();
  const [limits, setLimits] = useState<{
    dailyRemaining: bigint;
    monthlyRemaining: bigint;
    totalSponsored: bigint;
    txCount: bigint;
    isPremium: boolean;
  } | null>(null);
  const [stats, setStats] = useState<{
    totalGasSponsored: bigint;
    totalTxSponsored: bigint;
    fundBalance: bigint;
    isPaused: boolean;
    isEnabled: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [userLimits, paymasterStats] = await Promise.all([
        getUserLimits(),
        getStats(),
      ]);
      setLimits(userLimits);
      setStats(paymasterStats);
    };
    fetchData();
  }, [getUserLimits, getStats]);

  if (!limits) return null;

  return (
    <div className="bg-black/40 border border-amber-900/30 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-amber-200 font-medium">Gas Sponsorship</h3>
        {limits.isPremium && (
          <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300">
            Premium 3x
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-amber-200/60 text-xs">Daily Remaining</p>
          <p className="text-amber-100">{formatGasCost(limits.dailyRemaining)}</p>
        </div>
        <div>
          <p className="text-amber-200/60 text-xs">Monthly Remaining</p>
          <p className="text-amber-100">{formatGasCost(limits.monthlyRemaining)}</p>
        </div>
        <div>
          <p className="text-amber-200/60 text-xs">Total Sponsored</p>
          <p className="text-amber-100">{formatGasCost(limits.totalSponsored)}</p>
        </div>
        <div>
          <p className="text-amber-200/60 text-xs">Transactions</p>
          <p className="text-amber-100">{limits.txCount.toString()}</p>
        </div>
      </div>

      {stats && (
        <div className="pt-2 border-t border-amber-900/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-amber-200/60">Platform Fund</span>
            <span className="text-amber-100">{formatGasCost(stats.fundBalance)}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-amber-200/60">Status</span>
            <span className={stats.isEnabled && !stats.isPaused ? 'text-green-400' : 'text-red-400'}>
              {stats.isEnabled && !stats.isPaused ? 'Active' : 'Paused'}
            </span>
          </div>
        </div>
      )}

      {!limits.isPremium && (
        <p className="text-xs text-amber-200/50 pt-2 border-t border-amber-900/20">
          Hold 1,000+ RADIO for 3x sponsorship limits
        </p>
      )}
    </div>
  );
}

/**
 * Transaction confirmation with sponsorship info
 */
export function TxConfirmationWithSponsorship({
  isSponsored,
  estimatedGas,
  onConfirm,
  onCancel,
  isLoading,
}: {
  isSponsored: boolean;
  estimatedGas: bigint;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="bg-black/60 border border-amber-900/30 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-amber-200 font-medium">Confirm Transaction</h3>
        <SponsoredTxIndicator isSponsored={isSponsored} />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-amber-200/60">Estimated Gas</span>
          <span className="text-amber-100">{estimatedGas.toString()} units</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-200/60">Gas Cost</span>
          <span className={isSponsored ? 'text-green-400 line-through' : 'text-amber-100'}>
            {formatGasCost(estimatedGas * 1000000000n)} {/* ~1 gwei */}
          </span>
        </div>
        {isSponsored && (
          <div className="flex justify-between">
            <span className="text-amber-200/60">You Pay</span>
            <span className="text-green-400 font-medium">FREE</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-700/30 rounded text-amber-200 text-sm transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}
