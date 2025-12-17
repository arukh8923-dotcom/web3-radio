'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export function HelpGuide() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) return null;

  const helpItems = [
    { icon: '🎚️', title: t('control.tuning'), desc: t('control.tuning.desc') },
    { icon: '🔘', title: t('control.preset'), desc: t('control.preset.desc') },
    { icon: '📡', title: t('control.tunein'), desc: t('control.tunein.desc') },
    { icon: '💬', title: 'CHAT', desc: language === 'id' ? 'Klik tombol CHAT untuk chat dengan pendengar lain' : 'Click CHAT button to chat with other listeners' },
    { icon: '💜', title: t('control.vibes'), desc: t('control.vibes.desc') },
    { icon: '🌿', title: t('control.420'), desc: t('control.420.desc') },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="preset-button text-xs"
        title={language === 'id' ? 'Bantuan' : 'Help'}
      >
        ? HELP
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-cabinet-dark border border-brass rounded-lg shadow-xl z-50 w-72 max-h-80 overflow-y-auto">
          <div className="p-3 border-b border-brass/30">
            <p className="text-brass font-dial text-sm">{t('help.title')}</p>
          </div>
          <div className="p-2 space-y-2">
            {helpItems.map((item, i) => (
              <div key={i} className="flex gap-2 p-2 rounded hover:bg-black/30">
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-brass text-xs font-dial">{item.title}</p>
                  <p className="text-dial-cream/60 text-xs leading-tight">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
