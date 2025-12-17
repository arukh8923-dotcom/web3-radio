'use client';

import { RadioCabinet } from '@/components/radio/RadioCabinet';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="font-dial text-2xl md:text-3xl text-brass tracking-wider">
          WEB3 RADIO
        </h1>
        <ConnectWallet />
      </header>

      {/* Main Radio Interface */}
      <RadioCabinet />

      {/* Footer */}
      <footer className="mt-8 text-center text-dial-cream/50 text-sm">
        <p>Full on-chain radio on Base • Powered by $RADIO & $VIBES</p>
      </footer>
    </main>
  );
}
