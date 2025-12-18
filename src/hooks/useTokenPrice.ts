'use client';

import { useState, useEffect, useCallback } from 'react';

interface TokenPrices {
  radio_usd: number;
  vibes_usd: number;
  eth_usd: number;
  source: string;
  timestamp: number;
}

interface UseTokenPriceReturn {
  prices: TokenPrices | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  // Helper functions
  usdToRadio: (usd: number) => number;
  usdToVibes: (usd: number) => number;
  radioToUsd: (radio: number) => number;
  vibesToUsd: (vibes: number) => number;
  formatRadioAmount: (amount: number) => string;
  formatVibesAmount: (amount: number) => string;
}

// Default fallback prices
const FALLBACK_PRICES: TokenPrices = {
  radio_usd: 0.0000003,
  vibes_usd: 0.0000003,
  eth_usd: 3500,
  source: 'fallback',
  timestamp: Date.now(),
};

export function useTokenPrice(): UseTokenPriceReturn {
  const [prices, setPrices] = useState<TokenPrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/token/price');
      const data = await res.json();
      
      if (data.success) {
        setPrices(data.data);
      } else {
        setPrices(data.data || FALLBACK_PRICES);
        setError(data.error || 'Failed to fetch prices');
      }
    } catch (err) {
      console.error('Error fetching token prices:', err);
      setPrices(FALLBACK_PRICES);
      setError('Network error fetching prices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    
    // Refresh prices every 60 seconds
    const interval = setInterval(fetchPrices, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  // Convert USD to RADIO tokens
  const usdToRadio = useCallback((usd: number): number => {
    if (!prices || prices.radio_usd === 0) return 0;
    return Math.ceil(usd / prices.radio_usd);
  }, [prices]);

  // Convert USD to VIBES tokens
  const usdToVibes = useCallback((usd: number): number => {
    if (!prices || prices.vibes_usd === 0) return 0;
    return Math.ceil(usd / prices.vibes_usd);
  }, [prices]);

  // Convert RADIO to USD
  const radioToUsd = useCallback((radio: number): number => {
    if (!prices) return 0;
    return radio * prices.radio_usd;
  }, [prices]);

  // Convert VIBES to USD
  const vibesToUsd = useCallback((vibes: number): number => {
    if (!prices) return 0;
    return vibes * prices.vibes_usd;
  }, [prices]);

  // Format large token amounts
  const formatRadioAmount = useCallback((amount: number): string => {
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)}B`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
    return amount.toLocaleString();
  }, []);

  const formatVibesAmount = useCallback((amount: number): string => {
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)}B`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
    return amount.toLocaleString();
  }, []);

  return {
    prices,
    loading,
    error,
    refetch: fetchPrices,
    usdToRadio,
    usdToVibes,
    radioToUsd,
    vibesToUsd,
    formatRadioAmount,
    formatVibesAmount,
  };
}

/**
 * USD-based pricing configuration
 * All prices are in USD, converted to tokens dynamically
 */
export const USD_PRICING = {
  // NFT Prices (USD)
  nft: {
    frequency_mint: 10, // $10 to mint frequency NFT
    frequency_premium: 50, // $50 for premium frequencies
    recording_mint: 5, // $5 to mint recording NFT
    session_mint: 0, // Free (attendance reward)
    achievement_mint: 0, // Free (earned)
  },
  
  // Subscription Prices (USD per month)
  subscription: {
    basic: 1, // $1/month
    premium: 5, // $5/month
    vip: 20, // $20/month
  },
  
  // Tip Presets (USD)
  tips: {
    small: 0.10, // $0.10
    medium: 1, // $1
    large: 5, // $5
    mega: 10, // $10
  },
  
  // Station Creation (USD)
  station: {
    create_basic: 5, // $5
    create_premium: 20, // $20
  },
  
  // VIBES Features (USD equivalent)
  vibes: {
    smoke_signal_5min: 0.05, // $0.05
    smoke_signal_10min: 0.10, // $0.10
    request_line_stake: 0.20, // $0.20
    hotbox_min_balance: 5, // $5 worth of VIBES
    aux_pass_join: 0.50, // $0.50
  },
  
  // x402 Micropayments (USDC)
  x402: {
    premium_stream_per_min: 0.001, // $0.001/min
    nft_highres: 0.01, // $0.01
    recording_download: 0.05, // $0.05
  },
} as const;
