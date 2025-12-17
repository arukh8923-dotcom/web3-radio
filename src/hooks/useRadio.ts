'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from '@/lib/api';
import type { Station, Preset, UserPreferences, MoodRing } from '@/lib/api';

interface RadioState {
  // Current state
  frequency: number;
  volume: number;
  bass: number;
  treble: number;
  isOn: boolean;
  isMuted: boolean;
  isTunedIn: boolean;
  
  // Data
  currentStation: Station | null;
  presets: Preset[];
  moodRing: MoodRing | null;
  
  // User
  walletAddress: string | null;
  
  // Actions
  setFrequency: (freq: number) => void;
  setVolume: (vol: number) => void;
  setBass: (bass: number) => void;
  setTreble: (treble: number) => void;
  togglePower: () => void;
  toggleMute: () => void;
  setWalletAddress: (address: string | null) => void;
  
  // API Actions
  loadStationByFrequency: (freq: number) => Promise<void>;
  tuneIn: () => Promise<void>;
  tuneOut: () => Promise<void>;
  loadPresets: () => Promise<void>;
  savePreset: (slot: number) => Promise<void>;
  loadPreset: (slot: number) => Promise<void>;
  savePreferences: () => Promise<void>;
  loadPreferences: () => Promise<void>;
  sendVibes: (mood: 'chill' | 'hype' | 'melancholy' | 'euphoric' | 'zen') => Promise<void>;
  loadMoodRing: () => Promise<void>;
}

export const useRadio = create<RadioState>()(
  persist(
    (set, get) => ({
      // Initial state
      frequency: 88.1,
      volume: 50,
      bass: 50,
      treble: 50,
      isOn: true,
      isMuted: false,
      isTunedIn: false,
      currentStation: null,
      presets: [],
      moodRing: null,
      walletAddress: null,

      // Basic setters
      setFrequency: (freq) => {
        set({ frequency: freq, isTunedIn: false, currentStation: null });
        get().loadStationByFrequency(freq);
      },
      setVolume: (vol) => set({ volume: vol }),
      setBass: (bass) => set({ bass }),
      setTreble: (treble) => set({ treble }),
      togglePower: () => set((s) => ({ isOn: !s.isOn })),
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
      setWalletAddress: (address) => {
        set({ walletAddress: address });
        if (address) {
          get().loadPresets();
          get().loadPreferences();
        }
      },

      // API Actions
      loadStationByFrequency: async (freq) => {
        try {
          const station = await api.getStationByFrequency(freq);
          set({ currentStation: station });
          if (station) {
            get().loadMoodRing();
          }
        } catch (error) {
          console.error('Failed to load station:', error);
        }
      },

      tuneIn: async () => {
        const { currentStation, walletAddress } = get();
        if (!currentStation || !walletAddress) return;
        
        try {
          await api.tuneIn(currentStation.id, walletAddress);
          set({ isTunedIn: true });
        } catch (error) {
          console.error('Failed to tune in:', error);
        }
      },

      tuneOut: async () => {
        const { currentStation, walletAddress } = get();
        if (!currentStation || !walletAddress) return;
        
        try {
          await api.tuneOut(currentStation.id, walletAddress);
          set({ isTunedIn: false });
        } catch (error) {
          console.error('Failed to tune out:', error);
        }
      },

      loadPresets: async () => {
        const { walletAddress } = get();
        if (!walletAddress) return;
        
        try {
          const presets = await api.getPresets(walletAddress);
          set({ presets });
        } catch (error) {
          console.error('Failed to load presets:', error);
        }
      },

      savePreset: async (slot) => {
        const { walletAddress, currentStation, frequency } = get();
        if (!walletAddress) return;
        
        try {
          await api.savePreset(
            walletAddress,
            slot,
            currentStation?.id,
            frequency
          );
          get().loadPresets();
        } catch (error) {
          console.error('Failed to save preset:', error);
        }
      },

      loadPreset: async (slot) => {
        const { presets } = get();
        const preset = presets.find((p) => p.slot === slot);
        if (!preset) return;
        
        if (preset.frequency) {
          set({ frequency: preset.frequency });
          get().loadStationByFrequency(preset.frequency);
        }
      },

      savePreferences: async () => {
        const { walletAddress, volume, bass, treble } = get();
        if (!walletAddress) return;
        
        try {
          await api.saveUserPreferences({
            wallet_address: walletAddress,
            volume,
            equalizer_bass: bass,
            equalizer_treble: treble,
            equalizer_mid: 50,
          });
        } catch (error) {
          console.error('Failed to save preferences:', error);
        }
      },

      loadPreferences: async () => {
        const { walletAddress } = get();
        if (!walletAddress) return;
        
        try {
          const prefs = await api.getUserPreferences(walletAddress);
          set({
            volume: prefs.volume,
            bass: prefs.equalizer_bass,
            treble: prefs.equalizer_treble,
          });
        } catch (error) {
          console.error('Failed to load preferences:', error);
        }
      },

      sendVibes: async (mood) => {
        const { currentStation, walletAddress } = get();
        if (!currentStation || !walletAddress) return;
        
        try {
          await api.sendVibes(currentStation.id, walletAddress, mood);
          get().loadMoodRing();
        } catch (error) {
          console.error('Failed to send vibes:', error);
        }
      },

      loadMoodRing: async () => {
        const { currentStation } = get();
        if (!currentStation) return;
        
        try {
          const moodRing = await api.getMoodRing(currentStation.id);
          set({ moodRing });
        } catch (error) {
          console.error('Failed to load mood ring:', error);
        }
      },
    }),
    {
      name: 'web3-radio-state',
      partialize: (state) => ({
        frequency: state.frequency,
        volume: state.volume,
        bass: state.bass,
        treble: state.treble,
      }),
      skipHydration: true,
    }
  )
);

// Hydrate on client side only
if (typeof window !== 'undefined') {
  useRadio.persist.rehydrate();
}
