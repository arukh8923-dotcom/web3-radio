import { z } from 'zod';
import type { Address } from 'viem';

// Equalizer Parameters
export const EqualizerParamsSchema = z.object({
  bass: z.number().min(0).max(100),
  mid: z.number().min(0).max(100),
  treble: z.number().min(0).max(100),
  volume: z.number().min(0).max(100),
});

export type EqualizerParams = z.infer<typeof EqualizerParamsSchema>;

// Audio Mode
export enum AudioMode {
  STEREO = 'stereo',
  MONO = 'mono',
}

// User Preferences Schema
export const UserPreferencesSchema = z.object({
  wallet: z.string(),
  equalizerSettings: EqualizerParamsSchema,
  subscribedStations: z.array(z.number()), // frequencies
  presetFavorites: z.array(z.number()), // up to 6 presets
  audioMode: z.nativeEnum(AudioMode),
  language: z.string().default('en'),
  lastActive: z.number(),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

// Subscription Status
export interface Subscription {
  stationFrequency: number;
  subscriber: Address;
  startTime: number;
  endTime: number;
  isActive: boolean;
  fee: bigint;
}

// Listener State
export interface ListenerState {
  address: Address;
  tunedInStations: number[];
  preferences: UserPreferences;
  vibesBalance: bigint;
  radioBalance: bigint;
  achievements: Achievement[];
  referralCode: string | null;
  referredBy: Address | null;
}

// Achievement
export interface Achievement {
  id: string;
  name: string;
  description: string;
  earnedAt: number;
  nftTokenId: bigint | null;
}

// Alarm Settings
export interface AlarmSettings {
  id: bigint;
  owner: Address;
  targetFrequency: number;
  alarmTime: number; // Unix timestamp
  isEnabled: boolean;
  repeatDays: number[]; // 0-6 for Sun-Sat
}

// Sleep Timer
export interface SleepTimer {
  endTime: number;
  fadeOutDuration: number; // seconds
  isActive: boolean;
}
