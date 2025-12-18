import { parseAbi } from 'viem';
import { CONTRACTS } from '@/constants/addresses';

// BroadcastManager Contract Address (Base Mainnet)
export const BROADCAST_MANAGER_ADDRESS = CONTRACTS.BROADCAST_MANAGER;

// BroadcastManager ABI
export const BROADCAST_MANAGER_ABI = parseAbi([
  // Read functions
  'function totalBroadcasts() view returns (uint256)',
  'function authorizedStations(address) view returns (bool)',
  'function liveStreams(address) view returns (bytes32)',
  'function getBroadcast(bytes32 contentHash) view returns (tuple(bytes32 contentHash, address station, address dj, uint256 frequency, uint256 timestamp, uint256 duration, uint8 storageType, uint8 contentType, string title, string artist, bool isLive))',
  'function getStationBroadcasts(address station, uint256 limit, uint256 offset) view returns (tuple(bytes32 contentHash, address station, address dj, uint256 frequency, uint256 timestamp, uint256 duration, uint8 storageType, uint8 contentType, string title, string artist, bool isLive)[])',
  'function getDJBroadcasts(address dj, uint256 limit, uint256 offset) view returns (tuple(bytes32 contentHash, address station, address dj, uint256 frequency, uint256 timestamp, uint256 duration, uint8 storageType, uint8 contentType, string title, string artist, bool isLive)[])',
  'function getFrequencyBroadcasts(uint256 frequency, uint256 limit, uint256 offset) view returns (tuple(bytes32 contentHash, address station, address dj, uint256 frequency, uint256 timestamp, uint256 duration, uint8 storageType, uint8 contentType, string title, string artist, bool isLive)[])',
  'function getRecentBroadcasts(uint256 limit) view returns (tuple(bytes32 contentHash, address station, address dj, uint256 frequency, uint256 timestamp, uint256 duration, uint8 storageType, uint8 contentType, string title, string artist, bool isLive)[])',
  'function getLiveStream(address station) view returns (tuple(bytes32 contentHash, address station, address dj, uint256 frequency, uint256 timestamp, uint256 duration, uint8 storageType, uint8 contentType, string title, string artist, bool isLive))',
  'function isLive(address station) view returns (bool)',
  'function getMetadata(bytes32 contentHash) view returns (tuple(string title, string artist, string album, string genre, string imageUrl, uint256 bpm, string[] tags))',
  'function getStationBroadcastCount(address station) view returns (uint256)',
  'function getDJBroadcastCount(address dj) view returns (uint256)',
  
  // Write functions (only for authorized stations)
  'function registerBroadcast(bytes32 contentHash, uint256 frequency, address dj, uint256 duration, uint8 storageType, uint8 contentType, string title, string artist)',
  'function startLiveStream(bytes32 contentHash, uint256 frequency, address dj, string title)',
  'function endLiveStream()',
  'function setMetadata(bytes32 contentHash, tuple(string title, string artist, string album, string genre, string imageUrl, uint256 bpm, string[] tags) metadata)',
  
  // Admin functions
  'function authorizeStation(address station)',
  'function revokeStation(address station)',
  'function authorizeStations(address[] stations)',
  
  // Events
  'event BroadcastRegistered(bytes32 indexed contentHash, address indexed station, address indexed dj, uint256 frequency, uint8 storageType, uint8 contentType, string title)',
  'event LiveStreamStarted(bytes32 indexed contentHash, address indexed station, address indexed dj, uint256 frequency)',
  'event LiveStreamEnded(bytes32 indexed contentHash, address indexed station, uint256 duration)',
  'event MetadataUpdated(bytes32 indexed contentHash, string title, string artist)',
  'event StationAuthorized(address indexed station)',
  'event StationRevoked(address indexed station)',
]);

// Storage types
export enum StorageType {
  IPFS = 0,
  BLOB = 1,
  ARWEAVE = 2,
  CUSTOM = 3,
}

// Content types
export enum ContentType {
  AUDIO = 0,
  VIDEO = 1,
  IMAGE = 2,
  METADATA = 3,
  PLAYLIST = 4,
}

// Broadcast content interface
export interface BroadcastContent {
  contentHash: `0x${string}`;
  station: `0x${string}`;
  dj: `0x${string}`;
  frequency: bigint;
  timestamp: bigint;
  duration: bigint;
  storageType: StorageType;
  contentType: ContentType;
  title: string;
  artist: string;
  isLive: boolean;
}

// Content metadata interface
export interface ContentMetadata {
  title: string;
  artist: string;
  album: string;
  genre: string;
  imageUrl: string;
  bpm: bigint;
  tags: string[];
}

// Helper to format storage type
export function formatStorageType(type: StorageType): string {
  switch (type) {
    case StorageType.IPFS:
      return 'IPFS';
    case StorageType.BLOB:
      return 'Blob (EIP-4844)';
    case StorageType.ARWEAVE:
      return 'Arweave';
    case StorageType.CUSTOM:
      return 'Custom';
    default:
      return 'Unknown';
  }
}

// Helper to format content type
export function formatContentType(type: ContentType): string {
  switch (type) {
    case ContentType.AUDIO:
      return '🎵 Audio';
    case ContentType.VIDEO:
      return '🎬 Video';
    case ContentType.IMAGE:
      return '🖼️ Image';
    case ContentType.METADATA:
      return '📄 Metadata';
    case ContentType.PLAYLIST:
      return '📋 Playlist';
    default:
      return 'Unknown';
  }
}

// Helper to format duration
export function formatDuration(seconds: number): string {
  if (seconds === 0) return 'Unknown';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Helper to create content hash from IPFS CID
export function ipfsCidToHash(cid: string): `0x${string}` {
  // Simple hash - in production, properly decode CID
  const encoder = new TextEncoder();
  const data = encoder.encode(cid);
  let hash = 0n;
  for (let i = 0; i < data.length && i < 32; i++) {
    hash = (hash << 8n) | BigInt(data[i]);
  }
  return `0x${hash.toString(16).padStart(64, '0')}` as `0x${string}`;
}

// Helper to generate content hash
export function generateContentHash(
  title: string,
  artist: string,
  timestamp: number
): `0x${string}` {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${title}:${artist}:${timestamp}`);
  let hash = 0n;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5n) - hash + BigInt(data[i])) & ((1n << 256n) - 1n);
  }
  return `0x${hash.toString(16).padStart(64, '0')}` as `0x${string}`;
}
