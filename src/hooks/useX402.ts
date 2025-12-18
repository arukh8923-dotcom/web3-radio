'use client';

import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { ERC20_ABI, RADIO_TOKEN_ADDRESS, VIBES_TOKEN_ADDRESS } from '@/lib/contracts';

interface X402PaymentInfo {
  token: 'RADIO' | 'VIBES';
  tokenAddress: string;
  amount: string;
  recipient: string;
  treasury: string;
  split: { dj: number; treasury: number };
  description: string;
  expiresAt: number;
  network: string;
  chainId: number;
}

interface X402Response {
  error: string;
  message: string;
  payment: X402PaymentInfo;
  instructions: {
    step1: string;
    step2: string;
    step3: string;
  };
}

interface UseX402Return {
  // State
  isPaying: boolean;
  isConfirming: boolean;
  error: string | null;
  txHash: string | null;
  
  // Actions
  handlePayment: (paymentInfo: X402PaymentInfo) => Promise<string | null>;
  fetchWithPayment: <T>(url: string, options?: RequestInit) => Promise<T>;
  reset: () => void;
}

/**
 * Hook for handling x402 payments
 * 
 * Usage:
 * const { fetchWithPayment, isPaying } = useX402();
 * 
 * const data = await fetchWithPayment('/api/x402/stream?station_id=123');
 */
export function useX402(): UseX402Return {
  const { address } = useAccount();
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<X402PaymentInfo | null>(null);

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
  });

  const reset = useCallback(() => {
    setIsPaying(false);
    setError(null);
    setTxHash(null);
    setPendingPayment(null);
  }, []);

  /**
   * Execute payment for x402 request
   */
  const handlePayment = useCallback(async (paymentInfo: X402PaymentInfo): Promise<string | null> => {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }

    setIsPaying(true);
    setError(null);
    setPendingPayment(paymentInfo);

    try {
      const tokenAddress = paymentInfo.token === 'RADIO' 
        ? RADIO_TOKEN_ADDRESS 
        : VIBES_TOKEN_ADDRESS;

      // Calculate amounts for DJ and treasury
      const totalAmount = BigInt(paymentInfo.amount);
      const djAmount = (totalAmount * BigInt(paymentInfo.split.dj)) / BigInt(100);
      const treasuryAmount = totalAmount - djAmount;

      // Transfer to DJ (if not treasury)
      if (paymentInfo.recipient !== paymentInfo.treasury && djAmount > 0n) {
        const djTxHash = await writeContractAsync({
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [paymentInfo.recipient as `0x${string}`, djAmount],
        });
        console.log('DJ payment tx:', djTxHash);
      }

      // Transfer to treasury
      if (treasuryAmount > 0n) {
        const treasuryTxHash = await writeContractAsync({
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [paymentInfo.treasury as `0x${string}`, treasuryAmount],
        });
        setTxHash(treasuryTxHash);
        return treasuryTxHash;
      }

      return txHash;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsPaying(false);
    }
  }, [address, writeContractAsync, txHash]);

  /**
   * Fetch with automatic x402 payment handling
   */
  const fetchWithPayment = useCallback(async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    // First request - might get 402
    const response = await fetch(url, options);

    if (response.status === 402) {
      // Payment required
      const data: X402Response = await response.json();
      
      if (!address) {
        throw new Error('Wallet not connected - payment required');
      }

      // Execute payment
      const paymentTxHash = await handlePayment(data.payment);
      
      if (!paymentTxHash) {
        throw new Error(error || 'Payment failed');
      }

      // Retry with payment proof
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'X-Payment-Proof': paymentTxHash,
          'X-Payment-Payer': address,
          'X-Payment-Amount': data.payment.amount,
          'X-Payment-Token': data.payment.token,
        },
      });

      if (!retryResponse.ok) {
        throw new Error('Request failed after payment');
      }

      return retryResponse.json();
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  }, [address, handlePayment, error]);

  return {
    isPaying,
    isConfirming,
    error,
    txHash,
    handlePayment,
    fetchWithPayment,
    reset,
  };
}

/**
 * Parse x402 error response
 */
export function parseX402Error(response: Response): Promise<X402Response | null> {
  if (response.status !== 402) {
    return Promise.resolve(null);
  }
  return response.json();
}

/**
 * Format payment amount for display
 */
export function formatPaymentAmount(amount: string, token: 'RADIO' | 'VIBES'): string {
  const value = Number(amount);
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B ${token}`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M ${token}`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K ${token}`;
  return `${value.toLocaleString()} ${token}`;
}

export default useX402;
