import { parseAbi } from 'viem';
import { CONTRACTS } from '@/constants/addresses';

// DJAttestations Contract Address (Base Mainnet)
export const DJ_ATTESTATIONS_ADDRESS = CONTRACTS.DJ_ATTESTATIONS;

// EAS Contract on Base
export const EAS_ADDRESS = CONTRACTS.EAS_CONTRACT;

// DJAttestations ABI
export const DJ_ATTESTATIONS_ABI = parseAbi([
  // Read functions
  'function schemaUID() view returns (bytes32)',
  'function totalVerified() view returns (uint256)',
  'function totalRequests() view returns (uint256)',
  'function totalRevoked() view returns (uint256)',
  'function attesters(address) view returns (bool)',
  'function getProfile(address dj) view returns (tuple(address djAddress, string name, string bio, string imageUrl, string[] genres, uint256 totalBroadcasts, uint256 totalListeners, uint256 totalTips, uint8 status, bytes32 easAttestation, uint256 verifiedAt, uint256 requestedAt))',
  'function getRequest(address dj) view returns (tuple(address dj, string name, string socialProof, string portfolioUrl, uint256 requestedAt, bool processed, bool approved, string rejectionReason))',
  'function isVerified(address dj) view returns (bool)',
  'function getVerifiedDJs(uint256 limit, uint256 offset) view returns (address[])',
  'function getPendingRequests() view returns (address[])',
  'function getVerifiedDJsByGenre(string genre, uint256 limit) view returns (address[])',
  
  // Write functions
  'function createProfile(string name, string bio, string imageUrl, string[] genres)',
  'function updateStats(address dj, uint256 broadcasts, uint256 listeners, uint256 tips)',
  'function requestVerification(string socialProof, string portfolioUrl)',
  'function approveVerification(address dj, bytes32 attestationUID)',
  'function rejectVerification(address dj, string reason)',
  'function revokeVerification(address dj, string reason)',
  
  // Events
  'event ProfileCreated(address indexed dj, string name)',
  'event ProfileUpdated(address indexed dj)',
  'event VerificationRequested(address indexed dj, string name, string socialProof)',
  'event VerificationApproved(address indexed dj, bytes32 attestationUID)',
  'event VerificationRejected(address indexed dj, string reason)',
  'event VerificationRevoked(address indexed dj, string reason)',
]);

// Verification status
export enum VerificationStatus {
  None = 0,
  Pending = 1,
  Verified = 2,
  Revoked = 3,
}

// Status labels
export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, { label: string; color: string; badge: string }> = {
  [VerificationStatus.None]: { label: 'Not Verified', color: 'text-gray-400', badge: '' },
  [VerificationStatus.Pending]: { label: 'Pending', color: 'text-yellow-400', badge: '⏳' },
  [VerificationStatus.Verified]: { label: 'Verified', color: 'text-blue-400', badge: '✓' },
  [VerificationStatus.Revoked]: { label: 'Revoked', color: 'text-red-400', badge: '✗' },
};

// DJ Profile interface
export interface DJProfile {
  djAddress: `0x${string}`;
  name: string;
  bio: string;
  imageUrl: string;
  genres: string[];
  totalBroadcasts: bigint;
  totalListeners: bigint;
  totalTips: bigint;
  status: VerificationStatus;
  easAttestation: `0x${string}`;
  verifiedAt: bigint;
  requestedAt: bigint;
}

// Genre options
export const DJ_GENRES = [
  'Electronic', 'House', 'Techno', 'Trance', 'Drum & Bass',
  'Hip-Hop', 'R&B', 'Pop', 'Rock', 'Jazz',
  'Ambient', 'Lo-Fi', 'Reggae', 'Latin', '420 Vibes',
] as const;

// Helper to format verification badge
export function getVerificationBadge(status: VerificationStatus): string {
  return VERIFICATION_STATUS_LABELS[status].badge;
}
