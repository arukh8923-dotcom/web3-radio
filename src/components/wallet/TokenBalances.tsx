'use client';

import { useTokenBalances } from '@/hooks/useTokenBalances';

export function TokenBalances() {
  const { radio, vibes, isLoading, isContractsReady } = useTokenBalances();

  if (!isContractsReady) {
    return (
      <div className="flex items-center gap-3 text-xs text-dial-cream/50">
        <span>Tokens: Coming Soon</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-xs text-dial-cream/50 animate-pulse">
        <span>Loading...</span>
      </div>
    );
  }

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.01) return '<0.01';
    if (num < 1000) return num.toFixed(2);
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded">
        <span className="text-brass">📻</span>
        <span className="text-dial-cream">{formatBalance(radio)}</span>
        <span className="text-dial-cream/50">$RADIO</span>
      </div>
      <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded">
        <span className="text-zone-420">💜</span>
        <span className="text-dial-cream">{formatBalance(vibes)}</span>
        <span className="text-dial-cream/50">$VIBES</span>
      </div>
    </div>
  );
}
