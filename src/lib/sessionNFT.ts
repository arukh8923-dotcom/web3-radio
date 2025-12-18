import { parseAbi } from 'viem';
import { CONTRACTS } from '@/constants/addresses';

// SessionNFTFactory Contract Address (Base Mainnet)
export const SESSION_NFT_ADDRESS = CONTRACTS.SESSION_NFT_FACTORY;

// SessionNFTFactory ABI
export const SESSION_NFT_ABI = parseAbi([
  // Read functions
  'function sessionCount() view returns (uint256)',
  'function tokenCount() view returns (uint256)',
  'function totalAttendees() view returns (uint256)',
  'function totalNFTsMinted() view returns (uint256)',
  'function authorizedCreators(address) view returns (bool)',
  'function sessions(uint256) view returns (uint256 id, uint256 frequency, address host, string title, string description, uint256 startTime, uint256 endTime, uint256 minAttendanceTime, uint256 attendeeCount, uint256 nftsMinted, bool isActive, bool mintingClosed)',
  'function getSession(uint256 sessionId) view returns (tuple(uint256 id, uint256 frequency, address host, string title, string description, uint256 startTime, uint256 endTime, uint256 minAttendanceTime, uint256 attendeeCount, uint256 nftsMinted, bool isActive, bool mintingClosed))',
  'function getAttendance(uint256 sessionId, address user) view returns (tuple(address attendee, uint256 joinTime, uint256 leaveTime, uint256 totalTime, bool claimed))',
  'function getSessionAttendees(uint256 sessionId) view returns (address[])',
  'function getUserSessionNFTs(address user) view returns (uint256[])',
  'function getActiveSessions(uint256 limit) view returns (tuple(uint256 id, uint256 frequency, address host, string title, string description, uint256 startTime, uint256 endTime, uint256 minAttendanceTime, uint256 attendeeCount, uint256 nftsMinted, bool isActive, bool mintingClosed)[])',
  'function isEligible(uint256 sessionId, address user) view returns (bool)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
  
  // Write functions
  'function createSession(uint256 frequency, string title, string description, uint256 duration, uint256 minAttendanceTime) returns (uint256)',
  'function endSession(uint256 sessionId)',
  'function joinSession(uint256 sessionId)',
  'function leaveSession(uint256 sessionId)',
  'function claimSessionNFT(uint256 sessionId)',
  'function closeMinting(uint256 sessionId)',
  
  // Events
  'event SessionCreated(uint256 indexed sessionId, uint256 frequency, address indexed host, string title)',
  'event SessionEnded(uint256 indexed sessionId, uint256 attendeeCount)',
  'event AttendeeJoined(uint256 indexed sessionId, address indexed attendee)',
  'event AttendeeLeft(uint256 indexed sessionId, address indexed attendee, uint256 totalTime)',
  'event SessionNFTMinted(uint256 indexed sessionId, uint256 indexed tokenId, address indexed attendee)',
  'event MintingClosed(uint256 indexed sessionId, uint256 totalMinted)',
]);

// Session interface
export interface Session {
  id: bigint;
  frequency: bigint;
  host: `0x${string}`;
  title: string;
  description: string;
  startTime: bigint;
  endTime: bigint;
  minAttendanceTime: bigint;
  attendeeCount: bigint;
  nftsMinted: bigint;
  isActive: boolean;
  mintingClosed: boolean;
}

// Attendance interface
export interface Attendance {
  attendee: `0x${string}`;
  joinTime: bigint;
  leaveTime: bigint;
  totalTime: bigint;
  claimed: boolean;
}

// Helper to format session duration
export function formatSessionDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

// Helper to check if session is claimable
export function isSessionClaimable(session: Session, attendance: Attendance): boolean {
  if (session.isActive || session.mintingClosed || attendance.claimed) {
    return false;
  }
  
  const totalTime = attendance.totalTime > 0n 
    ? attendance.totalTime 
    : (attendance.leaveTime === 0n ? session.endTime - attendance.joinTime : 0n);
  
  return totalTime >= session.minAttendanceTime;
}
