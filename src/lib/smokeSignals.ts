import { parseAbi } from 'viem';
import { CONTRACTS } from '@/constants/addresses';

// SmokeSignals Contract Address (Base Mainnet)
export const SMOKE_SIGNALS_ADDRESS = CONTRACTS.SMOKE_SIGNALS;

// SmokeSignals ABI
export const SMOKE_SIGNALS_ABI = parseAbi([
  // Read functions
  'function vibesToken() view returns (address)',
  'function treasury() view returns (address)',
  'function signalCount() view returns (uint256)',
  'function costPerMinute() view returns (uint256)',
  'function MIN_DURATION() view returns (uint256)',
  'function MAX_DURATION() view returns (uint256)',
  'function MAX_MESSAGE_LENGTH() view returns (uint256)',
  'function totalVibesBurned() view returns (uint256)',
  'function activeSignalCount() view returns (uint256)',
  'function signals(uint256) view returns (uint256 id, address sender, uint256 frequency, string message, uint256 createdAt, uint256 expiresAt, uint256 vibesBurned, bool isExpired)',
  'function getSignal(uint256 signalId) view returns (tuple(uint256 id, address sender, uint256 frequency, string message, uint256 createdAt, uint256 expiresAt, uint256 vibesBurned, bool isExpired))',
  'function getActiveSignals(uint256 frequency, uint256 limit) view returns (tuple(uint256 id, address sender, uint256 frequency, string message, uint256 createdAt, uint256 expiresAt, uint256 vibesBurned, bool isExpired)[])',
  'function getAllActiveSignals(uint256 limit, uint256 offset) view returns (tuple(uint256 id, address sender, uint256 frequency, string message, uint256 createdAt, uint256 expiresAt, uint256 vibesBurned, bool isExpired)[])',
  'function getUserSignals(address user, uint256 limit) view returns (tuple(uint256 id, address sender, uint256 frequency, string message, uint256 createdAt, uint256 expiresAt, uint256 vibesBurned, bool isExpired)[])',
  'function isActive(uint256 signalId) view returns (bool)',
  'function calculateCost(uint256 duration) view returns (uint256)',
  'function getTimeRemaining(uint256 signalId) view returns (uint256)',
  
  // Write functions
  'function sendSignal(uint256 frequency, string message, uint256 duration) returns (uint256)',
  'function markExpired(uint256[] signalIds)',
  'function cleanupExpired(uint256 maxCleanup) returns (uint256)',
  
  // Events
  'event SignalSent(uint256 indexed signalId, address indexed sender, uint256 indexed frequency, string message, uint256 expiresAt, uint256 vibesBurned)',
  'event SignalExpired(uint256 indexed signalId)',
  'event SignalsCleanedUp(uint256 count)',
]);

// Signal interface
export interface Signal {
  id: bigint;
  sender: `0x${string}`;
  frequency: bigint;
  message: string;
  createdAt: bigint;
  expiresAt: bigint;
  vibesBurned: bigint;
  isExpired: boolean;
}

// Duration presets (in seconds)
export const SIGNAL_DURATIONS = [
  { label: '1 min', value: 60, vibes: 5 },
  { label: '5 min', value: 300, vibes: 25 },
  { label: '15 min', value: 900, vibes: 75 },
  { label: '1 hour', value: 3600, vibes: 300 },
  { label: '4h 20m', value: 15600, vibes: 1300 },
  { label: '24 hours', value: 86400, vibes: 7200 },
] as const;

// Helper to format time remaining
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

// Helper to calculate cost
export function calculateSignalCost(durationSeconds: number, costPerMinute: bigint): bigint {
  const minutes = BigInt(Math.ceil(durationSeconds / 60));
  return minutes * costPerMinute;
}
