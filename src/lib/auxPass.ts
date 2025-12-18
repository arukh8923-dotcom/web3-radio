import { parseAbi } from 'viem';
import { CONTRACTS } from '@/constants/addresses';

// AuxPass Contract Address (Base Mainnet)
export const AUX_PASS_ADDRESS = CONTRACTS.AUX_PASS;

// AuxPass ABI
export const AUX_PASS_ABI = parseAbi([
  // Read functions
  'function radioToken() view returns (address)',
  'function treasury() view returns (address)',
  'function inactivityTimeout() view returns (uint256)',
  'function totalSessions() view returns (uint256)',
  'function totalStaked() view returns (uint256)',
  'function stationAux(address) view returns (uint256 frequency, address station, tuple(address currentHolder, uint256 startTime, uint256 endTime, uint256 maxDuration, bool isActive) currentSession, uint256 queueLength, uint256 defaultDuration, uint256 minStake, bool isEnabled)',
  'function getStationAux(address station) view returns (tuple(uint256 frequency, address station, tuple(address currentHolder, uint256 startTime, uint256 endTime, uint256 maxDuration, bool isActive) currentSession, uint256 queueLength, uint256 defaultDuration, uint256 minStake, bool isEnabled))',
  'function getCurrentHolder(address station) view returns (address)',
  'function getSessionTimeRemaining(address station) view returns (uint256)',
  'function getQueuePosition(address station, address user) view returns (uint256)',
  'function getQueueEntry(address station, address user) view returns (tuple(address holder, uint256 tokenStake, uint256 joinTime, uint256 position, bool isActive))',
  'function getQueue(address station, uint256 limit) view returns (tuple(address holder, uint256 tokenStake, uint256 joinTime, uint256 position, bool isActive)[])',
  'function isInQueue(address station, address user) view returns (bool)',
  'function isCurrentHolder(address station, address user) view returns (bool)',
  
  // Write functions
  'function enableAux(address station, uint256 frequency, uint256 defaultDuration, uint256 minStake)',
  'function disableAux(address station)',
  'function joinQueue(address station, uint256 stake)',
  'function leaveQueue(address station)',
  'function passAux(address station)',
  'function recordActivity(address station)',
  'function skipInactive(address station)',
  
  // Events
  'event AuxEnabled(address indexed station, uint256 frequency, uint256 defaultDuration, uint256 minStake)',
  'event AuxDisabled(address indexed station)',
  'event JoinedQueue(address indexed station, address indexed user, uint256 position, uint256 stake)',
  'event LeftQueue(address indexed station, address indexed user)',
  'event AuxPassed(address indexed station, address indexed from, address indexed to)',
  'event SessionStarted(address indexed station, address indexed holder, uint256 duration)',
  'event SessionEnded(address indexed station, address indexed holder, uint256 duration)',
  'event HolderSkipped(address indexed station, address indexed holder, string reason)',
  'event ActivityRecorded(address indexed station, address indexed holder)',
]);

// Queue entry interface
export interface QueueEntry {
  holder: `0x${string}`;
  tokenStake: bigint;
  joinTime: bigint;
  position: bigint;
  isActive: boolean;
}

// Aux session interface
export interface AuxSession {
  currentHolder: `0x${string}`;
  startTime: bigint;
  endTime: bigint;
  maxDuration: bigint;
  isActive: boolean;
}

// Station aux config interface
export interface StationAux {
  frequency: bigint;
  station: `0x${string}`;
  currentSession: AuxSession;
  queueLength: bigint;
  defaultDuration: bigint;
  minStake: bigint;
  isEnabled: boolean;
}

// Duration presets for aux sessions
export const AUX_DURATIONS = [
  { label: '1 min', value: 60 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
  { label: '30 min', value: 1800 },
] as const;

// Stake presets in USD (converted to RADIO dynamically via useTokenPrice hook)
// These are USD values, not hardcoded token amounts
export const STAKE_PRESETS_USD = [
  { label: '$0.50', usd: 0.5 },
  { label: '$1', usd: 1 },
  { label: '$5', usd: 5 },
  { label: '$10', usd: 10 },
  { label: '$25', usd: 25 },
] as const;

// Helper to format time remaining
export function formatAuxTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Ended';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Helper to format stake amount
export function formatStake(stake: bigint, decimals: number = 18): string {
  const value = Number(stake) / Math.pow(10, decimals);
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}
