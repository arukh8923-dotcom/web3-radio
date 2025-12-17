'use client';

import { useState, useRef, useEffect } from 'react';

interface AppMenuProps {
  onOpenDiscover: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

export function AppMenu({ onOpenDiscover, onOpenProfile, onOpenSettings, onOpenHelp }: AppMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { icon: '🔍', label: 'Discover Stations', action: onOpenDiscover },
    { icon: '👤', label: 'Profile', action: onOpenProfile },
    { icon: '⚙️', label: 'Settings', action: onOpenSettings },
    { icon: '❓', label: 'Help', action: onOpenHelp },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="preset-button text-xs w-10 h-10 flex items-center justify-center"
        aria-label="Menu"
      >
        ☰
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-cabinet-dark border border-brass rounded-lg shadow-xl z-50 min-w-[180px] overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.action();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-dial-cream hover:bg-black/30 transition-colors flex items-center gap-3 min-h-[48px]"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
