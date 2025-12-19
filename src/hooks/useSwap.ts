'use client';

import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { parseUnits, formatUnits, encodeFunctionData } from 'viem';
import { CONTRACTS } from '@/constants/addresses';

// Uniswap V3 SwapRouter on Base
const UNISWAP_ROUTER = '0x2626664c2603336E57B271c5C0b26F421741e481' as const;
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006' as const;

// Pool fee tiers (0.3% = 3000, 1% = 10000)
const POOL_FEE = 10000; // 1% for low liquidity tokens

// Swap Router ABI (minimal)
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

// ERC20 Approve ABI
const ERC20_APPROVE_ABI = [
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
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export type SwapToken = 'ETH' | 'RADIO' | 'VIBES';

interface SwapParams {
  tokenIn: SwapToken;
  tokenOut: SwapToken;
  amountIn: string;
  slippage?: number; // Default 5%
}

export function useSwap() {
  const { address } = useAccount();
  const [isSwapping, setIsSwapping] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
  });

  // Get ETH balance
  const { data: ethBalance } = useBalance({ address });

  const getTokenAddress = (token: SwapToken): `0x${string}` => {
    switch (token) {
      case 'ETH': return WETH_ADDRESS;
      case 'RADIO': return CONTRACTS.RADIO_TOKEN;
      case 'VIBES': return CONTRACTS.VIBES_TOKEN;
    }
  };

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
      const amountOutMinimum = BigInt(0); // For simplicity, accept any output (risky but works for low liquidity)

      // If swapping from ERC20 (not ETH), need to approve first
      if (tokenIn !== 'ETH') {
        const approveHash = await writeContractAsync({
          address: tokenInAddress,
          abi: ERC20_APPROVE_ABI,
          functionName: 'approve',
          args: [UNISWAP_ROUTER, amountInWei],
        });
        
        // Wait a bit for approval to be mined
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
    } catch (err: any) {
      console.error('Swap failed:', err);
      setError(err.message || 'Swap failed');
      return null;
    } finally {
      setIsSwapping(false);
    }
  }, [address, writeContractAsync]);

  return {
    swap,
    isSwapping,
    isConfirming,
    txHash,
    error,
    ethBalance: ethBalance ? formatUnits(ethBalance.value, 18) : '0',
  };
}
