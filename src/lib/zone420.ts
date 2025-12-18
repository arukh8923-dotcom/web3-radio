import { parseAbi } from 'viem';
import { CONTRACTS } from '@/constants/addresses';

// Zone420 Contract Address (Base Mainnet)
export const ZONE420_ADDRESS = CONTRACTS.ZONE_420;

// Zone420 ABI
export const ZONE420_ABI = parseAbi([
  // Read functions
  'function vibesToken() view returns (address)',
  'function treasury() view returns (address)',
  'function FREQUENCY_420() view returns (uint256)',
  'function vibesPerMinute() view returns (uint256)',
  'function eventMultiplier() view returns (uint256)',
  'function communityMood() view returns (uint8)',
  'function is420Active() view returns (bool)',
  'function last420Event() view returns (uint256)',
  'function currentSessionId() view returns (uint256)',
  'function totalParticipants() view returns (uint256)',
  'function totalVibesDistributed() view returns (uint256)',
  'function total420Events() view returns (uint256)',
  'function participants(address) view returns (address user, uint256 joinTime, uint256 lastVibesEarned, uint256 totalVibesEarned, uint8 currentMood, uint256 sessionCount)',
  'function getParticipant(address user) view returns (tuple(address user, uint256 joinTime, uint256 lastVibesEarned, uint256 totalVibesEarned, uint8 currentMood, uint256 sessionCount))',
  'function getActiveParticipantCount() view returns (uint256)',
  'function getActiveParticipants(uint256 limit, uint256 offset) view returns (address[])',
  'function getPendingVibes(address user) view returns (uint256)',
  'function getSession(uint256 sessionId) view returns (tuple(uint256 id, uint256 startTime, uint256 endTime, uint256 participantCount, uint256 totalVibesDistributed, bool isActive))',
  'function getMoodDistribution() view returns (uint256[5])',
  'function isInZone(address user) view returns (bool)',
  'function is420Time() view returns (bool)',
  
  // Write functions
  'function joinZone()',
  'function leaveZone()',
  'function claimVibes()',
  'function setMood(uint8 newMood)',
  'function trigger420Event()',
  'function end420Event()',
  
  // Events
  'event JoinedZone420(address indexed user, uint256 timestamp)',
  'event LeftZone420(address indexed user, uint256 vibesEarned, uint256 duration)',
  'event VibesEarned(address indexed user, uint256 amount, bool is420Bonus)',
  'event MoodChanged(address indexed user, uint8 newMood)',
  'event CommunityMoodUpdated(uint8 newMood, uint256 totalVotes)',
  'event Event420Started(uint256 indexed sessionId, uint256 timestamp)',
  'event Event420Ended(uint256 indexed sessionId, uint256 totalVibes, uint256 participants)',
]);

// Mood types
export enum Mood {
  CHILL = 0,
  VIBING = 1,
  HYPED = 2,
  MELLOW = 3,
  BLAZED = 4,
}

// Mood labels and emojis
export const MOOD_INFO: Record<Mood, { label: string; emoji: string; color: string }> = {
  [Mood.CHILL]: { label: 'Chill', emoji: '😌', color: 'text-blue-400' },
  [Mood.VIBING]: { label: 'Vibing', emoji: '🎵', color: 'text-purple-400' },
  [Mood.HYPED]: { label: 'Hyped', emoji: '🔥', color: 'text-orange-400' },
  [Mood.MELLOW]: { label: 'Mellow', emoji: '🌙', color: 'text-indigo-400' },
  [Mood.BLAZED]: { label: 'Blazed', emoji: '🌿', color: 'text-green-400' },
};

// Helper to format mood
export function formatMood(mood: Mood): string {
  const info = MOOD_INFO[mood];
  return `${info.emoji} ${info.label}`;
}

// Helper to check if it's 4:20 time (local)
export function is420TimeLocal(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // 4:20 AM or 4:20 PM (16:20)
  return (hours === 4 || hours === 16) && minutes >= 20 && minutes < 25;
}

// Helper to get time until next 4:20
export function getTimeUntilNext420(): number {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  
  let targetHour: number;
  
  if (hours < 4 || (hours === 4 && minutes < 20)) {
    targetHour = 4;
  } else if (hours < 16 || (hours === 16 && minutes < 20)) {
    targetHour = 16;
  } else {
    // Next day 4:20 AM
    targetHour = 4 + 24;
  }
  
  const currentSeconds = hours * 3600 + minutes * 60 + seconds;
  const targetSeconds = targetHour * 3600 + 20 * 60;
  
  return targetSeconds - currentSeconds;
}
