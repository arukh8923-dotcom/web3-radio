'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACTS } from '@/constants/addresses';

// Uniswap V3 on Base
const UNISWAP_ROUTER = '0x2626664c2603336E57B271c5C0b26F421741e481' as const;
const UNISWAP_QUOTER = '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a' as const;
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006' as const;

// Pool fee tiers (0.3% = 3000, 1% = 10000)
const POOL_FEE = 10000; // 1% for low liquidity tokens

// Quoter V2 ABI
const QUOTER_ABI = [
  {
    name: 'quoteExactInputSingle',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{
      name: 'params',
      type: 'tuple',
      components: [
        { name: 'tokenIn', type: 'address' },
        { name: 'tokenOut', type: 'address' },
        { name: 'amountIn', type: 'uint256' },
        { name: 'fee', type: 'uint24' },
        { name: 'sqrtPriceLimitX96', type: 'uint160' },
      ],
    }],
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'sqrtPriceX96After', type: 'uint160' },
      { name: 'initializedTicksCrossed', type: 'uint32' },
      { name: 'gasEstimate', type: 'uint256' },
    ],
  },
] as const;

// Swap Router ABI
const SWAP_ROUTER_ABI = [
  {
    name: 'exactInputSingle',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{
      name: 'params',
      type: 'tuple',
      components: [
        { name: 'tokenIn', type: 'address' },
        { name: 'tokenOut', type: 'address' },
        { name: 'fee', type: 'uint24' },
        { name: 'recipient', type: 'address' },
        { name: 'amountIn', type: 'uint256' },
        { name: 'amountOutMinimum', type: 'uint256' },
        { name: 'sqrtPriceLimitX96', type: 'uint160' },
      ],
    }],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
] as const;

// ERC20 ABI
const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export type SwapToken = 'ETH' | 'RADIO' | 'VIBES';

interface SwapParams {
  tokenIn: SwapToken;
  tokenOut: SwapToken;
  amountIn: string;
  slippage?: number;
}

export function useSwap() {
  const { address } = useAccount();
  const [isSwapping, setIsSwapping] = useState(false);
  const [isQuoting, setIsQuoting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
  });

  // Get ETH balance
  const { data: ethBalance } = useBalance({ address });

  // Get RADIO balance
  const { data: radioBalance } = useReadContract({
    address: CONTRACTS.RADIO_TOKEN,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Get VIBES balance
  const { data: vibesBalance } = useReadContract({
    address: CONTRACTS.VIBES_TOKEN,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const getTokenAddress = (token: SwapToken): `0x${string}` => {
    switch (token) {
      case 'ETH': return WETH_ADDRESS;
      case 'RADIO': return CONTRACTS.RADIO_TOKEN;
      case 'VIBES': return CONTRACTS.VIBES_TOKEN;
    }
  };

  const getBalance = (token: SwapToken): string => {
    switch (token) {
      case 'ETH': return ethBalance ? formatUnits(ethBalance.value, 18) : '0';
      case 'RADIO': return radioBalance ? formatUnits(radioBalance as bigint, 18) : '0';
      case 'VIBES': return vibesBalance ? formatUnits(vibesBalance as bigint, 18) : '0';
    }
  };

  // Get quote for swap
  const getQuote = useCallback(async (tokenIn: SwapToken, tokenOut: SwapToken, amountIn: string) => {
    if (!amountIn || parseFloat(amountIn) <= 0) {
      setQuote(null);
      return null;
    }

    setIsQuoting(true);
    setError(null);

    try {
      const tokenInAddress = getTokenAddress(tokenIn);
      const tokenOutAddress = getTokenAddress(tokenOut);
      const amountInWei = parseUnits(amountIn, 18);

      // Call quoter via API to avoid gas estimation issues
      const response = await fetch('/api/swap/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenIn: tokenInAddress,
          tokenOut: tokenOutAddress,
          amountIn: amountInWei.toString(),
          fee: POOL_FEE,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const formattedQuote = formatUnits(BigInt(data.amountOut), 18);
        setQuote(formattedQuote);
        return formattedQuote;
      } else {
        const errData = await response.json();
        setError(errData.error || 'Quote failed');
        setQuote(null);
        return null;
      }
    } catch (err: unknown) {
      console.error('Quote failed:', err);
      setError('Failed to get quote');
      setQuote(null);
      return null;
    } finally {
      setIsQuoting(false);
    }
  }, []);

  const swap = useCallback(async ({ tokenIn, tokenOut, amountIn, slippage = 5 }: SwapParams) => {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }

    if (!amountIn || parseFloat(amountIn) <= 0) {
      setError('Invalid amount');
      return null;
    }

    setIsSwapping(true);
    setError(null);
    setTxHash(null);

    try {
      const tokenInAddress = getTokenAddress(tokenIn);
      const tokenOutAddress = getTokenAddress(tokenOut);
      const amountInWei = parseUnits(amountIn, 18);
      
      // Calculate minimum output with slippage
      let amountOutMinimum = BigInt(0);
      if (quote) {
        const quoteWei = parseUnits(quote, 18);
        amountOutMinimum = quoteWei * BigInt(100 - slippage) / BigInt(100);
      }

      // If swapping from ERC20 (not ETH), need to approve first
      if (tokenIn !== 'ETH') {
        await writeContractAsync({
          address: tokenInAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [UNISWAP_ROUTER, amountInWei],
        });
        
        // Wait for approval
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Execute swap
      const swapParams = {
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        fee: POOL_FEE,
        recipient: address,
        amountIn: amountInWei,
        amountOutMinimum,
        sqrtPriceLimitX96: BigInt(0),
      };

      const hash = await writeContractAsync({
        address: UNISWAP_ROUTER,
        abi: SWAP_ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: [swapParams],
        value: tokenIn === 'ETH' ? amountInWei : BigInt(0),
      });

      setTxHash(hash);
      return hash;
    } catch (err: unknown) {
      console.error('Swap failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Swap failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsSwapping(false);
    }
  }, [address, writeContractAsync, quote]);

  return {
    swap,
    getQuote,
    isSwapping,
    isQuoting,
    isConfirming,
    txHash,
    error,
    quote,
    getBalance,
    ethBalance: ethBalance ? formatUnits(ethBalance.value, 18) : '0',
    radioBalance: radioBalance ? formatUnits(radioBalance as bigint, 18) : '0',
    vibesBalance: vibesBalance ? formatUnits(vibesBalance as bigint, 18) : '0',
  };
}
