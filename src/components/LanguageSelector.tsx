'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { LANGUAGES, type Language } from '@/lib/i18n';

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === language);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button className="flex items-center gap-2 px-3 py-2 bg-black/30 rounded-lg" disabled>
        <span className="text-lg">🌐</span>
        <span className="text-dial-cream/50 text-xs">▼</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-black/30 rounded-lg hover:bg-black/50 transition-colors"
        title={t('ui.language')}
      >
        <span className="text-lg">{currentLang?.flag}</span>
        <span className="text-dial-cream/70 text-sm hidden sm:inline">
          {currentLang?.name}
        </span>
        <span className="text-dial-cream/50 text-xs">▼</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 bg-cabinet-dark border border-brass/30 rounded-lg shadow-xl z-50 min-w-[160px] overflow-hidden">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left
                  hover:bg-brass/20 transition-colors
                  ${language === lang.code ? 'bg-brass/10 text-brass' : 'text-dial-cream/80'}
                `}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm">{lang.name}</span>
                {language === lang.code && (
                  <span className="ml-auto text-brass">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
