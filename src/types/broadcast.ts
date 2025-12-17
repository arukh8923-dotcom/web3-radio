import { z } from 'zod';
import type { Address, Hash } from 'viem';

// Content Types
export enum ContentType {
  AUDIO = 'audio',
  VISUAL = 'visual',
  GENERATIVE = 'generative',
}

// Generative Art Parameters
export const GenerativeParamsSchema = z.object({
  seed: z.number(),
  colorPalette: z.array(z.string()),
  waveformType: z.enum(['sine', 'square', 'sawtooth', 'triangle', 'noise']),
  bpm: z.number().min(60).max(200),
  intensity: z.number().min(0).max(100),
});

export type GenerativeParams = z.infer<typeof GenerativeParamsSchema>;

// Broadcast Content Schema
export const BroadcastContentSchema = z.object({
  contentHash: z.string(),
  contentType: z.nativeEnum(ContentType),
  title: z.string().min(1).max(200),
  duration: z.number().min(0), // in seconds
  djAddress: z.string(),
  timestamp: z.number(),
  blobCommitment: z.string().optional(), // EIP-4844
  ipfsHash: z.string().optional(), // Fallback
  visualParams: GenerativeParamsSchema.optional(),
});

export type BroadcastContent = z.infer<typeof BroadcastContentSchema>;

// Broadcast State
export interface Broadcast {
  id: bigint;
  stationFrequency: number;
  content: BroadcastContent;
  unlockTime: number; // 0 = immediate, >0 = scheduled
  isLocked: boolean;
  listenerCount: number;
}

// Now Playing Info (RDS equivalent)
export interface NowPlaying {
  broadcast: Broadcast;
  trackTitle: string;
  artistName: string;
  djName: string;
  startedAt: number;
  progress: number; // 0-100
}

// Recording (DVR)
export interface Recording {
  id: bigint;
  broadcast: Broadcast;
  recordedBy: Address;
  recordedAt: number;
  nftTokenId: bigint | null;
}
