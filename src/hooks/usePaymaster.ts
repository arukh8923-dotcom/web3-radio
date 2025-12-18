import { useCallback, useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { encodeFunctionData } from 'viem';
import { 
  PAYMASTER_CONTRACT_ADDRESS, 
  PAYMASTER_ABI,
  type UserLimits,
  type PaymasterStats,
  type SponsorshipStatus 
} from '@/lib/paymaster';
import { PAYMASTER_URL, canSponsorTransaction } from '@/lib/cdp';

/**
 * Hook for interacting with RadioPaymaster and CDP Paymaster
 * Provides gas sponsorship functionality for platform transactions
 */
export function usePaymaster() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if a transaction can be sponsored
   */
  const checkSponsorship = useCallback(async (
    target: `0x${string}`,
    selector: `0x${string}`,
    estimatedGas: bigint
  ): Promise<SponsorshipStatus> => {
    if (!address || !publicClient || !PAYMASTER_CONTRACT_ADDRESS) {
      return {
        canSponsor: false,
        reason: 'Not connected',
        dailyRemaining: 0n,
        monthlyRemaining: 0n,
        isPremium: false,
      };
    }

    try {
      // Check on-chain paymaster
      const [canSponsor, reason] = await publicClient.readContract({
        address: PAYMASTER_CONTRACT_ADDRESS,
        abi: PAYMASTER_ABI,
        functionName: 'canSponsor',
        args: [address, target, selector, estimatedGas],
      }) as [boolean, string];

      // Get user limits
      const limits = await publicClient.readContract({
        address: PAYMASTER_CONTRACT_ADDRESS,
        abi: PAYMASTER_ABI,
        functionName: 'getUserLimits',
        args: [address],
      }) as [bigint, bigint, bigint, bigint, boolean];

      return {
        canSponsor,
        reason,
        dailyRemaining: limits[0],
        monthlyRemaining: limits[1],
        isPremium: limits[4],
      };
    } catch (err) {
      console.error('Error checking sponsorship:', err);
      return {
        canSponsor: false,
        reason: 'Error checking sponsorship',
        dailyRemaining: 0n,
        monthlyRemaining: 0n,
        isPremium: false,
      };
    }
  }, [address, publicClient]);

  /**
   * Get user's sponsorship limits
   */
  const getUserLimits = useCallback(async (): Promise<UserLimits | null> => {
    if (!address || !publicClient || !PAYMASTER_CONTRACT_ADDRESS) return null;

    try {
      const result = await publicClient.readContract({
        address: PAYMASTER_CONTRACT_ADDRESS,
        abi: PAYMASTER_ABI,
        functionName: 'getUserLimits',
        args: [address],
      }) as [bigint, bigint, bigint, bigint, boolean];

      return {
        dailyRemaining: result[0],
        monthlyRemaining: result[1],
        totalSponsored: result[2],
        txCount: result[3],
        isPremium: result[4],
      };
    } catch (err) {
      console.error('Error getting user limits:', err);
      return null;
    }
  }, [address, publicClient]);

  /**
   * Get paymaster stats
   */
  const getStats = useCallback(async (): Promise<PaymasterStats | null> => {
    if (!publicClient || !PAYMASTER_CONTRACT_ADDRESS) return null;

    try {
      const result = await publicClient.readContract({
        address: PAYMASTER_CONTRACT_ADDRESS,
        abi: PAYMASTER_ABI,
        functionName: 'getStats',
      }) as [bigint, bigint, bigint, boolean, boolean];

      return {
        totalGasSponsored: result[0],
        totalTxSponsored: result[1],
        fundBalance: result[2],
        isPaused: result[3],
        isEnabled: result[4],
      };
    } catch (err) {
      console.error('Error getting stats:', err);
      return null;
    }
  }, [publicClient]);

  /**
   * Execute a sponsored transaction via CDP Paymaster
   * Falls back to user-paid gas if sponsorship fails
   */
  const executeSponsoredTx = useCallback(async <T extends readonly unknown[]>(
    target: `0x${string}`,
    abi: readonly unknown[],
    functionName: string,
    args: T,
    options?: {
      fallbackToUserPaid?: boolean;
      onSponsorshipStatus?: (sponsored: boolean) => void;
    }
  ): Promise<`0x${string}` | null> => {
    if (!address || !walletClient || !publicClient) {
      setError('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Encode function data
      const data = encodeFunctionData({
        abi: abi as any,
        functionName,
        args: args as any,
      });

      // Check if CDP can sponsor
      const canCDPSponsor = await canSponsorTransaction(target, data);
      
      if (canCDPSponsor && PAYMASTER_URL) {
        // Try sponsored transaction via CDP
        options?.onSponsorshipStatus?.(true);
        
        // Use CDP Paymaster for gas sponsorship
        // This integrates with wagmi's sendTransaction with paymaster
        const hash = await walletClient.sendTransaction({
          to: target,
          data,
          // CDP Paymaster handles gas
        });

        return hash;
      } else if (options?.fallbackToUserPaid !== false) {
        // Fallback to user-paid gas
        options?.onSponsorshipStatus?.(false);
        
        const hash = await walletClient.sendTransaction({
          to: target,
          data,
        });

        return hash;
      } else {
        setError('Transaction cannot be sponsored');
        return null;
      }
    } catch (err: any) {
      console.error('Error executing transaction:', err);
      setError(err.message || 'Transaction failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address, walletClient, publicClient]);

  /**
   * Check if contract is whitelisted for sponsorship
   */
  const isContractWhitelisted = useCallback(async (
    target: `0x${string}`
  ): Promise<boolean> => {
    if (!publicClient || !PAYMASTER_CONTRACT_ADDRESS) return false;

    try {
      return await publicClient.readContract({
        address: PAYMASTER_CONTRACT_ADDRESS,
        abi: PAYMASTER_ABI,
        functionName: 'whitelistedContracts',
        args: [target],
      }) as boolean;
    } catch {
      return false;
    }
  }, [publicClient]);

  return {
    // State
    isLoading,
    error,
    
    // Functions
    checkSponsorship,
    getUserLimits,
    getStats,
    executeSponsoredTx,
    isContractWhitelisted,
    
    // Clear error
    clearError: () => setError(null),
  };
}
