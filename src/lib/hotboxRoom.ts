import { parseAbi } from 'viem';
import { CONTRACTS } from '@/constants/addresses';

// HotboxRoom Contract Address (Base Mainnet)
export const HOTBOX_ROOM_ADDRESS = CONTRACTS.HOTBOX_ROOM;

// HotboxRoom ABI
export const HOTBOX_ROOM_ABI = parseAbi([
  // Read functions
  'function radioToken() view returns (address)',
  'function vibesToken() view returns (address)',
  'function roomCount() view returns (uint256)',
  'function roomCreationFee() view returns (uint256)',
  'function treasury() view returns (address)',
  'function totalMembers() view returns (uint256)',
  'function activeRooms() view returns (uint256)',
  'function rooms(uint256) view returns (uint256 id, address host, string name, string description, uint256 frequency, uint8 gateToken, uint256 minBalance, uint256 maxMembers, uint256 memberCount, uint256 createdAt, bool isActive, bool isPrivate)',
  'function getRoom(uint256 roomId) view returns (tuple(uint256 id, address host, string name, string description, uint256 frequency, uint8 gateToken, uint256 minBalance, uint256 maxMembers, uint256 memberCount, uint256 createdAt, bool isActive, bool isPrivate))',
  'function getMember(uint256 roomId, address user) view returns (tuple(address user, uint256 joinTime, uint256 lastVerified, bool isActive))',
  'function getRoomMembers(uint256 roomId) view returns (address[])',
  'function getUserRooms(address user) view returns (uint256[])',
  'function isMember(uint256 roomId, address user) view returns (bool)',
  'function canJoin(uint256 roomId, address user) view returns (bool, string)',
  'function getActiveRooms(uint256 limit, uint256 offset) view returns (tuple(uint256 id, address host, string name, string description, uint256 frequency, uint8 gateToken, uint256 minBalance, uint256 maxMembers, uint256 memberCount, uint256 createdAt, bool isActive, bool isPrivate)[])',
  'function getRoomsByFrequency(uint256 frequency) view returns (tuple(uint256 id, address host, string name, string description, uint256 frequency, uint8 gateToken, uint256 minBalance, uint256 maxMembers, uint256 memberCount, uint256 createdAt, bool isActive, bool isPrivate)[])',
  
  // Write functions
  'function createRoom(string name, string description, uint256 frequency, uint8 gateToken, uint256 minBalance, uint256 maxMembers, bool isPrivate) returns (uint256)',
  'function closeRoom(uint256 roomId)',
  'function updateRoom(uint256 roomId, uint256 newMinBalance, uint256 newMaxMembers)',
  'function joinRoom(uint256 roomId)',
  'function leaveRoom(uint256 roomId)',
  'function verifyMember(uint256 roomId, address user) returns (bool)',
  'function verifyMembers(uint256 roomId, address[] users) returns (uint256 revoked)',
  'function inviteMember(uint256 roomId, address user)',
  'function kickMember(uint256 roomId, address user)',
  
  // Events
  'event RoomCreated(uint256 indexed roomId, address indexed host, string name, uint8 gateToken, uint256 minBalance)',
  'event RoomClosed(uint256 indexed roomId)',
  'event MemberJoined(uint256 indexed roomId, address indexed member)',
  'event MemberLeft(uint256 indexed roomId, address indexed member)',
  'event MemberRevoked(uint256 indexed roomId, address indexed member, string reason)',
  'event RoomUpdated(uint256 indexed roomId, uint256 newMinBalance)',
]);

// Gate token types
export enum GateToken {
  RADIO = 0,
  VIBES = 1,
}

// Room interface
export interface Room {
  id: bigint;
  host: `0x${string}`;
  name: string;
  description: string;
  frequency: bigint;
  gateToken: GateToken;
  minBalance: bigint;
  maxMembers: bigint;
  memberCount: bigint;
  createdAt: bigint;
  isActive: boolean;
  isPrivate: boolean;
}

// Member interface
export interface Member {
  user: `0x${string}`;
  joinTime: bigint;
  lastVerified: bigint;
  isActive: boolean;
}

// Helper to format gate token
export function formatGateToken(token: GateToken): string {
  return token === GateToken.RADIO ? '$RADIO' : '$VIBES';
}

// Helper to format min balance
export function formatMinBalance(balance: bigint, decimals: number = 18): string {
  const value = Number(balance) / Math.pow(10, decimals);
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

// Room presets for quick creation
export const ROOM_PRESETS = [
  { name: 'Chill Zone', minBalance: 100, token: GateToken.VIBES, maxMembers: 50 },
  { name: 'VIP Lounge', minBalance: 10000, token: GateToken.RADIO, maxMembers: 20 },
  { name: 'Whale Room', minBalance: 100000, token: GateToken.RADIO, maxMembers: 10 },
  { name: 'Vibes Only', minBalance: 1000, token: GateToken.VIBES, maxMembers: 100 },
] as const;
