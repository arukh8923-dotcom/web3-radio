'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';
import { farcasterFrame } from '@farcaster/miniapp-wagmi-connector';
import { type ReactNode, useEffect, useState } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { initializeMiniApp, isInMiniApp } from '@/lib/farcaster';

// Create wagmi config with Farcaster connector
function createWagmiConfig() {
  return createConfig({
    chains: [base],
    connectors: [
      // Farcaster Mini App connector - auto-connects in Farcaster
      farcasterFrame(),
      // Injected wallet - handles MetaMask, etc.
      injected({
        shimDisconnect: true,
      }),
      // Coinbase Wallet - primary wallet for Base ecosystem
      coinbaseWallet({
        appName: 'Web3 Radio',
        preference: 'all',
      }),
    ],
    transports: {
      [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    },
  });
}

const config = createWagmiConfig();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Component to initialize Farcaster Mini App
function FarcasterInitializer({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      const inMiniApp = await isInMiniApp();
      if (inMiniApp) {
        await initializeMiniApp();
      }
      setInitialized(true);
    }
    init();
  }, []);

  // Show nothing until initialized to prevent flash
  if (!initialized) {
    return null;
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <FarcasterInitializer>
            {children}
          </FarcasterInitializer>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
