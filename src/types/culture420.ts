import { z } from 'zod';
import type { Address } from 'viem';

// Mood Types for Vibes Token
export enum Mood {
  CHILL = 'chill',
  HYPE = 'hype',
  MELANCHOLY = 'melancholy',
  EUPHORIC = 'euphoric',
  ZEN = 'zen',
}

// Mood Ring State
export interface MoodRing {
  stationFrequency: number;
  currentMood: Mood;
  moodCounts: Record<Mood, number>;
  lastUpdated: number;
}

// Vibes Reaction
export interface VibesReaction {
  id: bigint;
  reactor: Address;
  stationFrequency: number;
  mood: Mood;
  vibesEarned: bigint;
  timestamp: number;
}

// Session NFT
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

// Smoke Signal (Ephemeral Message)
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

// Hotbox Room
export interface HotboxRoom {
  id: bigint;
  stationFrequency: number;
  creator: Address;
  tokenGate: Address; // Token required for access
  minBalance: bigint;
  members: Address[];
  isActive: boolean;
  createdAt: number;
}

// Aux Pass Queue
export interface AuxPassQueue {
  stationFrequency: number;
  queue: Address[];
  currentHolder: Address | null;
  currentIndex: number;
  sessionDuration: number; // seconds
  sessionStart: number;
  minTokenBalance: bigint;
}

// Community Drop
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

// 420 Zone State
export interface Zone420State {
  isActive: boolean;
  currentTime: string; // "HH:MM"
  is420Time: boolean;
  moodRing: MoodRing;
  activeDrops: CommunityDrop[];
  activeSessions: bigint[];
}

// Request Line
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
