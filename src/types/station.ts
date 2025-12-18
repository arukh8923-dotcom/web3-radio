import { z } from 'zod';
import type { Address } from 'viem';

// Station Categories (Bands)
export enum StationCategory {
  MUSIC = 'music',
  TALK = 'talk',
  NEWS = 'news',
  SPORTS = 'sports',
  LOFI = 'lofi',
  AMBIENT = 'ambient',
}

// Station Metadata Schema
export const StationMetadataSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  category: z.nativeEnum(StationCategory),
  imageUrl: z.string().url().optional(),
  // FM range 88-110 (standard FM dial)
  frequency: z.number().refine(
    (f) => f >= 88 && f <= 110,
    { message: 'Frequency must be 88-110 FM' }
  ),
  owner: z.string(), // Address
  djs: z.array(z.string()), // Array of addresses
  isPremium: z.boolean(),
  subscriptionFee: z.bigint().optional(),
  createdAt: z.number(),
});

export type StationMetadata = z.infer<typeof StationMetadataSchema>;

// Station State
export interface StationState {
  frequency: number;
  metadata: StationMetadata;
  listenerCount: number;
  signalStrength: number;
  isLive: boolean;
  currentBroadcastHash: string | null;
  streamUrl?: string; // Audio stream URL
}

// Signal Strength calculation factors
export interface SignalStrengthFactors {
  listenerCount: number;
  tipVolume: bigint;
  engagementScore: number;
  uptime: number;
}

// Station NFT (Frequency Ownership)
export interface FrequencyNFT {
  tokenId: bigint;
  frequency: number;
  owner: Address;
  mintedAt: number;
  metadata: StationMetadata;
}
