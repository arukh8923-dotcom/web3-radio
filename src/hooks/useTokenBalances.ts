'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  getRadioBalance, 
  getVibesBalance, 
  isContractsDeployed 
} from '@/lib/contracts';
import { formatUnits } from 'viem';

interface TokenBalances {
  radio: string;
  vibes: string;
  radioRaw: bigint;
  vibesRaw: bigint;
  isLoading: boolean;
  isContractsReady: boolean;
  refetch: () => Promise<void>;
}

export function useTokenBalances(): TokenBalances {
  const { address } = useAccount();
  const [radioRaw, setRadioRaw] = useState<bigint>(BigInt(0));
  const [vibesRaw, setVibesRaw] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [isContractsReady, setIsContractsReady] = useState(false);

  const fetchBalances = async () => {
    if (!address) {
      setRadioRaw(BigInt(0));
      setVibesRaw(BigInt(0));
      return;
    }

    setIsLoading(true);
    try {
      const [radio, vibes] = await Promise.all([
        getRadioBalance(address as `0x${string}`),
        getVibesBalance(address as `0x${string}`),
      ]);
      setRadioRaw(radio);
      setVibesRaw(vibes);
    } catch (error) {
      console.error('Failed to fetch token balances:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setIsContractsReady(isContractsDeployed());
  }, []);

  useEffect(() => {
    if (isContractsReady && address) {
      fetchBalances();
      // Refresh every 30 seconds
      const interval = setInterval(fetchBalances, 30000);
      return () => clearInterval(interval);
    }
  }, [address, isContractsReady]);

  return {
    radio: formatUnits(radioRaw, 18),
    vibes: formatUnits(vibesRaw, 18),
    radioRaw,
    vibesRaw,
    isLoading,
    isContractsReady,
    refetch: fetchBalances,
  };
}
