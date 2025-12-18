'use client';

import { useTokenBalances } from '@/hooks/useTokenBalances';
import { RADIO_TOKEN_ADDRESS, VIBES_TOKEN_ADDRESS } from '@/lib/contracts';

export function TokenBalances() {
  const { radio, vibes, isLoading } = useTokenBalances();

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-xs text-dial-cream/50 animate-pulse">
        <span>Loading balances...</span>
      </div>
    );
  }

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.01) return '<0.01';
    if (num < 1000) return num.toFixed(2);
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
    return `${(num / 1000000000).toFixed(1)}B`;
  };

  const openDexScreener = (token: 'radio' | 'vibes') => {
    const address = token === 'radio' ? RADIO_TOKEN_ADDRESS : VIBES_TOKEN_ADDRESS;
    window.open(`https://dexscreener.com/base/${address}`, '_blank');
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* $RADIO Token */}
      <button
        onClick={() => openDexScreener('radio')}
        className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded hover:bg-black/50 transition-colors"
        title="View $RADIO on DexScreener"
      >
        <span className="text-brass">📻</span>
        <span className="text-dial-cream">{formatBalance(radio)}</span>
        <span className="text-dial-cream/50">RADIO</span>
      </button>
      {/* $VIBES Token */}
      <button
        onClick={() => openDexScreener('vibes')}
        className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded hover:bg-black/50 transition-colors"
        title="View $VIBES on DexScreener"
      >
        <span className="text-purple-400">🎵</span>
        <span className="text-dial-cream">{formatBalance(vibes)}</span>
        <span className="text-dial-cream/50">VIBES</span>
      </button>
    </div>
  );
}
