import { z } from 'zod';
import type { Address } from 'viem';

// Mood Types for Vibes Token - Music/Beat Theme
export enum Mood {
  CHILL = 'chill',       // Relaxed, peaceful vibes
  HYPE = 'hype',         // Excited, energetic
  MELANCHOLY = 'melancholy', // Thoughtful, emotional
  EUPHORIC = 'euphoric', // Happy, transcendent
  ZEN = 'zen',           // Meditative, balanced
}

// Mood Ring State - Collective station mood
export interface MoodRing {
  stationFrequency: number;
  currentMood: Mood;
  moodCounts: Record<Mood, number>;
  lastUpdated: number;
}

// Vibes Reaction - User mood expression
export interface VibesReaction {
  id: bigint;
  reactor: Address;
  stationFrequency: number;
  mood: Mood;
  vibesEarned: bigint;
  timestamp: number;
}

// Session NFT - Proof of attendance
export interface SessionNFT {
  tokenId: bigint;
  sessionId: bigint;
  attendee: Address;
  stationFrequency: number;
  djAddress: Address;
  startTime: number;
  endTime: number;
  attendeeCount: number;
  metadata: SessionMetadata;
}

export interface SessionMetadata {
  name: string;
  description: string;
  imageUrl: string;
  attributes: SessionAttribute[];
}

export interface SessionAttribute {
  trait_type: string;
  value: string | number;
}

// Smoke Signal (Ephemeral Message) - Temporary broadcast messages
export interface SmokeSignal {
  id: bigint;
  sender: Address;
  stationFrequency: number;
  message: string;
  timestamp: number;
  expiryTime: number;
  vibesCost: bigint;
  isExpired: boolean;
}

// Backstage Room (Token-gated VIP room)
export interface BackstageRoom {
  id: bigint;
  stationFrequency: number;
  creator: Address;
  tokenGate: Address; // Token required for access
  minBalance: bigint;
  members: Address[];
  isActive: boolean;
  createdAt: number;
}

// Aux Pass Queue - Guest DJ control
export interface AuxPassQueue {
  stationFrequency: number;
  queue: Address[];
  currentHolder: Address | null;
  currentIndex: number;
  sessionDuration: number; // seconds
  sessionStart: number;
  minTokenBalance: bigint;
}

// Community Drop - Random reward distribution
export interface CommunityDrop {
  id: bigint;
  stationFrequency: number;
  timestamp: number;
  recipients: Address[];
  rewardAmount: bigint;
  rewardType: 'token' | 'nft';
  vrfRequestId: bigint;
  executed: boolean;
}

// Golden Hour State - Special event zone
export interface GoldenHourState {
  isActive: boolean;
  currentTime: string; // "HH:MM"
  isGoldenHour: boolean;
  moodRing: MoodRing;
  activeDrops: CommunityDrop[];
  activeSessions: bigint[];
}

// Request Line - Song/content requests
export interface SongRequest {
  id: bigint;
  requester: Address;
  stationFrequency: number;
  requestText: string;
  vibesStake: bigint;
  timestamp: number;
  fulfilled: boolean;
  fulfilledAt: number | null;
  expired: boolean;
}

// BPM Reward Tier
export interface BPMRewardTier {
  min: number;
  max: number;
  multiplier: number;
  name: string;
}

// Genre Zone Info
export interface GenreZone {
  name: string;
  minFreq: number;
  maxFreq: number;
  bpmRange: string;
  vibesMultiplier: number;
}
