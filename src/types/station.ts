import { z } from 'zod';
import type { Address } from 'viem';

// Station Categories (Bands)
export enum StationCategory {
  MUSIC = 'music',
  TALK = 'talk',
  NEWS = 'news',
  SPORTS = 'sports',
  CULTURE_420 = '420',
  AMBIENT = 'ambient',
}

// Station Metadata Schema
export const StationMetadataSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  category: z.nativeEnum(StationCategory),
  imageUrl: z.string().url().optional(),
  // FM range 88-108, plus special 420 zone (419-421)
  frequency: z.number().refine(
    (f) => (f >= 88 && f <= 108) || (f >= 419 && f <= 421),
    { message: 'Frequency must be 88-108 FM or 419-421 (420 Zone)' }
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
