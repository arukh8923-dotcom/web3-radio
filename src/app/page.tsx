'use client';

import { useState, useEffect } from 'react';
import { RadioCabinet } from '@/components/radio/RadioCabinet';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';
import { TokenBalances } from '@/components/wallet/TokenBalances';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AppMenu } from '@/components/AppMenu';
import { OnboardingModal } from '@/components/OnboardingModal';
import { SettingsPanel } from '@/components/SettingsPanel';
import { DiscoverPanel } from '@/components/DiscoverPanel';
import { ProfilePanel } from '@/components/ProfilePanel';
import { HelpModal } from '@/components/HelpModal';
import { DJLeaderboard } from '@/components/radio/DJLeaderboard';
import { DJStudioPanel } from '@/components/DJStudioPanel';
import { BottomNav } from '@/components/BottomNav';
import { useAccount } from 'wagmi';

export default function Home() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDJStudio, setShowDJStudio] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Show onboarding for first-time users
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-4xl flex flex-col gap-2 mb-4">
        <div className="flex justify-between items-center">
          <h1 className="font-dial text-xl md:text-3xl text-brass tracking-wider">
            WEB3 RADIO
          </h1>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <ConnectWallet />
            <AppMenu
              onOpenDiscover={() => setShowDiscover(true)}
              onOpenProfile={() => setShowProfile(true)}
              onOpenSettings={() => setShowSettings(true)}
              onOpenHelp={() => setShowHelp(true)}
            />
          </div>
        </div>
        {/* Token Balances - show when connected (only after mount to avoid hydration) */}
        {mounted && isConnected && (
          <div className="flex justify-end">
            <TokenBalances />
          </div>
        )}
      </header>

      {/* Main Radio Interface */}
      <RadioCabinet />

      {/* Footer */}
      <footer className="mt-6 text-center text-dial-cream/40 text-xs">
        <p>On-chain radio on Base</p>
      </footer>

      {/* Modals */}
      {mounted && showOnboarding && (
        <OnboardingModal onClose={handleCloseOnboarding} />
      )}
      
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      
      <DiscoverPanel 
        isOpen={showDiscover} 
        onClose={() => setShowDiscover(false)} 
      />
      
      <ProfilePanel 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
      />

      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <DJLeaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      <DJStudioPanel
        isOpen={showDJStudio}
        onClose={() => setShowDJStudio(false)}
      />

      {/* Bottom Navigation */}
      <BottomNav
        onOpenDiscover={() => setShowDiscover(true)}
        onOpenProfile={() => setShowProfile(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenDJStudio={() => setShowDJStudio(true)}
      />
    </main>
  );
}
