'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Language, t as translate } from '@/lib/i18n';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      t: (key) => translate(key, get().language),
    }),
    {
      name: 'web3-radio-language',
    }
  )
);
