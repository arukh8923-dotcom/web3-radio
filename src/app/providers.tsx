'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';
import { type ReactNode } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';

// Wagmi config for Base mainnet
// Supports: Injected wallets (MetaMask, Farcaster, etc.) and Coinbase Wallet
const config = createConfig({
  chains: [base],
  connectors: [
    // Injected wallet - handles MetaMask, Farcaster's injected provider, etc.
    injected({
      shimDisconnect: true,
    }),
    // Coinbase Wallet - primary wallet for Base ecosystem
    coinbaseWallet({
      appName: 'Web3 Radio',
      // Use 'all' to support both regular and smart wallet
      preference: 'all',
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
