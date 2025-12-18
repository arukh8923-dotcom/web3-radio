import { parseAbi } from 'viem';
import { CONTRACTS } from '@/constants/addresses';

// CommunityDrops Contract Address (Base Mainnet)
export const COMMUNITY_DROPS_ADDRESS = CONTRACTS.COMMUNITY_DROPS;

// CommunityDrops ABI
export const COMMUNITY_DROPS_ABI = parseAbi([
  // Read functions
  'function radioToken() view returns (address)',
  'function vibesToken() view returns (address)',
  'function treasury() view returns (address)',
  'function dropCount() view returns (uint256)',
  'function lastDropTime() view returns (uint256)',
  'function dropCooldown() view returns (uint256)',
  'function defaultDropAmount() view returns (uint256)',
  'function defaultRecipientCount() view returns (uint256)',
  'function totalDropsCompleted() view returns (uint256)',
  'function totalVibesDropped() view returns (uint256)',
  'function totalRadioDropped() view returns (uint256)',
  'function isEligible(address) view returns (bool)',
  'function userWeight(address) view returns (uint256)',
  'function authorizedTriggers(address) view returns (bool)',
  'function drops(uint256) view returns (uint256 id, uint256 timestamp, uint8 rewardType, uint256 totalAmount, uint256 recipientCount, uint256 amountPerRecipient, bool isCompleted)',
  'function getDrop(uint256 dropId) view returns (tuple(uint256 id, uint256 timestamp, uint8 rewardType, uint256 totalAmount, uint256 recipientCount, uint256 amountPerRecipient, bool isCompleted))',
  'function getDropRecipients(uint256 dropId) view returns (tuple(address recipient, uint256 amount, bool claimed)[])',
  'function getUserDrops(address user) view returns (uint256[])',
  'function getEligibleUserCount() view returns (uint256)',
  'function canTriggerDrop() view returns (bool)',
  'function getTimeUntilNextDrop() view returns (uint256)',
  'function getUserPendingClaims(address user) view returns (uint256[] dropIds, uint256[] amounts)',
  
  // Write functions
  'function registerForDrops()',
  'function updateWeight(address user)',
  'function batchUpdateWeights(address[] users)',
  'function triggerDrop(uint8 rewardType, uint256 totalAmount, uint256 recipientCount) returns (uint256)',
  'function trigger420Drop() returns (uint256)',
  'function claimDrop(uint256 dropId, uint256 recipientIndex)',
  
  // Events
  'event DropTriggered(uint256 indexed dropId, uint8 rewardType, uint256 totalAmount, uint256 recipientCount)',
  'event DropCompleted(uint256 indexed dropId, uint256 actualRecipients)',
  'event RewardClaimed(uint256 indexed dropId, address indexed recipient, uint256 amount)',
  'event UserRegistered(address indexed user, uint256 weight)',
  'event UserRemoved(address indexed user)',
  'event EligibilityUpdated(address indexed user, uint256 newWeight)',
]);

// Reward types
export enum RewardType {
  VIBES = 0,
  RADIO = 1,
  NFT = 2,
}

// Drop interface
export interface Drop {
  id: bigint;
  timestamp: bigint;
  rewardType: RewardType;
  totalAmount: bigint;
  recipientCount: bigint;
  amountPerRecipient: bigint;
  isCompleted: boolean;
}

// Drop recipient interface
export interface DropRecipient {
  recipient: `0x${string}`;
  amount: bigint;
  claimed: boolean;
}

// Helper to format reward type
export function formatRewardType(type: RewardType): string {
  switch (type) {
    case RewardType.VIBES:
      return '🌿 VIBES';
    case RewardType.RADIO:
      return '📻 RADIO';
    case RewardType.NFT:
      return '🎨 NFT';
    default:
      return 'Unknown';
  }
}

// Helper to format drop amount
export function formatDropAmount(amount: bigint, decimals: number = 18): string {
  const value = Number(amount) / Math.pow(10, decimals);
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

// Helper to format time until next drop
export function formatTimeUntilDrop(seconds: number): string {
  if (seconds <= 0) return 'Ready!';
  
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

// Check if it's 4:20 time (for triggering drops)
export function is420DropTime(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // 4:20 AM or 4:20 PM
  return (hours === 4 || hours === 16) && minutes === 20;
}
