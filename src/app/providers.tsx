'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { type ReactNode, useEffect, useState } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';

// Check if running inside Farcaster frame
const isFarcasterFrame = typeof window !== 'undefined' && 
  (window.location !== window.parent.location || 
   window.navigator.userAgent.includes('Farcaster'));

// Simple Wagmi config for Base mainnet
const config = createConfig({
  chains: [base],
  connectors: [
    // Injected wallet (MetaMask, etc.) - also handles Farcaster's injected provider
    injected({
      shimDisconnect: true,
    }),
    // Coinbase Wallet with smart wallet preference
    coinbaseWallet({ 
      appName: 'Web3 Radio',
      preference: 'smartWalletOnly',
    }),
    // WalletConnect for other wallets
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'web3radio',
      metadata: {
        name: 'Web3 Radio',
        description: 'Decentralized Radio on Base',
        url: 'https://web3radio.fm',
        icons: ['https://web3radio.fm/icon.png'],
      },
    }),
  ],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
