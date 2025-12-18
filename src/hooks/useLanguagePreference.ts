'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Language, LANGUAGES } from '@/lib/i18n';

interface LanguagePreference {
  language: Language;
  broadcastLanguageFilter: Language | 'all';
  loading: boolean;
}

export function useLanguagePreference() {
  const { address } = useAccount();
  const [preference, setPreference] = useState<LanguagePreference>({
    language: 'en',
    broadcastLanguageFilter: 'all',
    loading: true,
  });

  // Load preference from localStorage and API
  useEffect(() => {
    const loadPreference = async () => {
      // First check localStorage
      const savedLang = localStorage.getItem('web3radio-language') as Language | null;
      const savedFilter = localStorage.getItem('web3radio-broadcast-language') as Language | 'all' | null;

      if (savedLang) {
        setPreference((prev) => ({
          ...prev,
          language: savedLang,
          broadcastLanguageFilter: savedFilter || 'all',
        }));
      }

      // If connected, try to load from API (on-chain preference)
      if (address) {
        try {
          const res = await fetch(`/api/users/${address}/preferences`);
          if (res.ok) {
            const data = await res.json();
            if (data.language) {
              setPreference((prev) => ({
                ...prev,
                language: data.language,
                broadcastLanguageFilter: data.broadcast_language_filter || 'all',
              }));
              // Sync to localStorage
              localStorage.setItem('web3radio-language', data.language);
              if (data.broadcast_language_filter) {
                localStorage.setItem('web3radio-broadcast-language', data.broadcast_language_filter);
              }
            }
          }
        } catch (error) {
          console.error('Failed to load language preference:', error);
        }
      }

      setPreference((prev) => ({ ...prev, loading: false }));
    };

    loadPreference();
  }, [address]);

  // Set language
  const setLanguage = useCallback(
    async (lang: Language) => {
      setPreference((prev) => ({ ...prev, language: lang }));
      localStorage.setItem('web3radio-language', lang);

      // Save to API if connected
      if (address) {
        try {
          await fetch(`/api/users/${address}/preferences`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language: lang }),
          });
        } catch (error) {
          console.error('Failed to save language preference:', error);
        }
      }
    },
    [address]
  );

  // Set broadcast language filter
  const setBroadcastLanguageFilter = useCallback(
    async (filter: Language | 'all') => {
      setPreference((prev) => ({ ...prev, broadcastLanguageFilter: filter }));
      localStorage.setItem('web3radio-broadcast-language', filter);

      // Save to API if connected
      if (address) {
        try {
          await fetch(`/api/users/${address}/preferences`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ broadcast_language_filter: filter }),
          });
        } catch (error) {
          console.error('Failed to save broadcast language filter:', error);
        }
      }
    },
    [address]
  );

  // Get available languages
  const getAvailableLanguages = useCallback(() => LANGUAGES, []);

  // Filter broadcasts by language
  const filterBroadcastsByLanguage = useCallback(
    <T extends { language?: string }>(broadcasts: T[]): T[] => {
      if (preference.broadcastLanguageFilter === 'all') {
        return broadcasts;
      }
      return broadcasts.filter(
        (b) => !b.language || b.language === preference.broadcastLanguageFilter
      );
    },
    [preference.broadcastLanguageFilter]
  );

  return {
    ...preference,
    setLanguage,
    setBroadcastLanguageFilter,
    getAvailableLanguages,
    filterBroadcastsByLanguage,
  };
}
