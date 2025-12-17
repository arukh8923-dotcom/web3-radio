'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

type NavItem = 'radio' | 'discover' | 'djstudio' | 'leaderboard' | 'profile';

interface BottomNavProps {
  onOpenDiscover?: () => void;
  onOpenProfile?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenDJStudio?: () => void;
}

export function BottomNav({ onOpenDiscover, onOpenProfile, onOpenLeaderboard, onOpenDJStudio }: BottomNavProps) {
  const [active, setActive] = useState<NavItem>('radio');
  const { isConnected } = useAccount();

  const handleNavClick = (id: NavItem) => {
    setActive(id);
    
    switch (id) {
      case 'radio':
        // Scroll to top (radio section)
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'discover':
        if (onOpenDiscover) {
          onOpenDiscover();
        }
        break;
      case 'leaderboard':
        if (onOpenLeaderboard) {
          onOpenLeaderboard();
        }
        break;
      case 'profile':
        if (onOpenProfile) {
          onOpenProfile();
        } else if (!isConnected) {
          // Trigger wallet connect
          document.querySelector<HTMLButtonElement>('[aria-label="CONNECT ▼"]')?.click();
        }
        break;
      case 'djstudio':
        if (onOpenDJStudio) {
          onOpenDJStudio();
        }
        break;
    }
  };

  const navItems: { id: NavItem; icon: string; label: string }[] = [
    { id: 'radio', icon: '📻', label: 'Radio' },
    { id: 'discover', icon: '🔍', label: 'Discover' },
    { id: 'djstudio', icon: '🎙️', label: 'DJ Studio' },
    { id: 'leaderboard', icon: '🏆', label: 'Top DJs' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cabinet-dark/95 backdrop-blur-sm border-t border-brass/30 z-40">
      <div className="max-w-4xl mx-auto flex justify-around items-center py-1.5 px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 4px)' }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-lg transition-all ${
              active === item.id
                ? 'text-brass bg-brass/10'
                : 'text-dial-cream/60 hover:text-dial-cream'
            }`}
            aria-label={item.label}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px] font-dial">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
