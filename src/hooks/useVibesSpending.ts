'use client';

import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { useTokenBalances } from './useTokenBalances';
import { VIBES_TOKEN_ADDRESS, ERC20_ABI } from '@/lib/contracts';
import { TREASURY_ADDRESS } from '@/constants/addresses';

// Feature costs in VIBES (these should be dynamic based on USD price in production)
export const VIBES_COSTS = {
  smokeSignal: 5, // Per minute
  requestPriority: 10, // Boost request
  moodReaction: 1, // React to mood ring
  hotboxEntry: 50, // Enter hotbox room
  auxQueueJump: 25, // Jump aux queue
  customEmoji: 20, // Use custom emoji in chat
  highlightMessage: 5, // Highlight chat message
};

type VibesFeature = keyof typeof VIBES_COSTS;

interface SpendResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export function useVibesSpending() {
  const { address } = useAccount();
  const { vibesRaw, refetch } = useTokenBalances();
  const [isSpending, setIsSpending] = useState(false);
  const [pendingFeature, setPendingFeature] = useState<VibesFeature | null>(null);

  const { writeContractAsync } = useWriteContract();

  // Check if user can afford a feature
  const canAfford = useCallback(
    (feature: VibesFeature, multiplier: number = 1) => {
      const cost = VIBES_COSTS[feature] * multiplier;
      const costWei = parseUnits(cost.toString(), 18);
      return vibesRaw >= costWei;
    },
    [vibesRaw]
  );

  // Get cost for a feature
  const getCost = useCallback((feature: VibesFeature, multiplier: number = 1) => {
    return VIBES_COSTS[feature] * multiplier;
  }, []);

  // Spend VIBES for a feature
  const spendVibes = useCallback(
    async (feature: VibesFeature, multiplier: number = 1, metadata?: Record<string, unknown>): Promise<SpendResult> => {
      if (!address) {
        return { success: false, error: 'Wallet not connected' };
      }

      const cost = VIBES_COSTS[feature] * multiplier;
      const costWei = parseUnits(cost.toString(), 18);

      if (vibesRaw < costWei) {
        return { success: false, error: `Insufficient VIBES. Need ${cost} VIBES.` };
      }

      setIsSpending(true);
      setPendingFeature(feature);

      try {
        // Transfer VIBES to treasury (burn address or actual treasury)
        const hash = await writeContractAsync({
          address: VIBES_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [TREASURY_ADDRESS, costWei],
        });

        // Record spending in database
        await fetch('/api/vibes/spend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet_address: address,
            feature,
            amount: cost,
            tx_hash: hash,
            metadata,
          }),
        });

        refetch();
        return { success: true, txHash: hash };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
        return { success: false, error: errorMessage };
      } finally {
        setIsSpending(false);
        setPendingFeature(null);
      }
    },
    [address, vibesRaw, writeContractAsync, refetch]
  );

  // Convenience methods for specific features
  const sendSmokeSignal = useCallback(
    (durationMinutes: number, message: string) =>
      spendVibes('smokeSignal', durationMinutes, { message, duration: durationMinutes }),
    [spendVibes]
  );

  const boostRequest = useCallback(
    (requestId: string) => spendVibes('requestPriority', 1, { requestId }),
    [spendVibes]
  );

  const reactToMood = useCallback(
    (mood: string) => spendVibes('moodReaction', 1, { mood }),
    [spendVibes]
  );

  const enterHotbox = useCallback(
    (roomId: string) => spendVibes('hotboxEntry', 1, { roomId }),
    [spendVibes]
  );

  const jumpAuxQueue = useCallback(
    (stationId: string) => spendVibes('auxQueueJump', 1, { stationId }),
    [spendVibes]
  );

  const highlightChatMessage = useCallback(
    (messageId: string) => spendVibes('highlightMessage', 1, { messageId }),
    [spendVibes]
  );

  return {
    isSpending,
    pendingFeature,
    canAfford,
    getCost,
    spendVibes,
    // Convenience methods
    sendSmokeSignal,
    boostRequest,
    reactToMood,
    enterHotbox,
    jumpAuxQueue,
    highlightChatMessage,
    // Constants
    VIBES_COSTS,
  };
}
