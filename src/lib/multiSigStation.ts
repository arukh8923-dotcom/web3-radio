import { parseAbi } from 'viem';

// MultiSigStation ABI (deployed per-station)
export const MULTI_SIG_STATION_ABI = parseAbi([
  // Read functions
  'function radioToken() view returns (address)',
  'function treasury() view returns (address)',
  'function threshold() view returns (uint256)',
  'function proposalCount() view returns (uint256)',
  'function totalBroadcasts() view returns (uint256)',
  'function totalProposals() view returns (uint256)',
  'function proposalExpiry() view returns (uint256)',
  'function isCollaborator(address) view returns (bool)',
  'function getProposal(uint256 proposalId) view returns (tuple(uint256 id, uint8 proposalType, address proposer, bytes data, uint256 approvals, uint256 rejections, uint256 createdAt, uint256 expiresAt, uint8 status, bool executed))',
  'function getCollaborators() view returns (address[])',
  'function getCollaboratorCount() view returns (uint256)',
  'function getBroadcasts(uint256 limit) view returns (tuple(bytes32 contentHash, uint256 timestamp, address proposer, uint256 proposalId)[])',
  'function getPendingProposals() view returns (uint256[])',
  'function getMetadata() view returns (tuple(string name, string description, string category, string imageUrl, uint256 frequency))',
  'function hasCollaboratorVoted(uint256 proposalId, address collaborator) view returns (bool voted, bool approved)',
  
  // Write functions
  'function proposeBroadcast(bytes32 contentHash) returns (uint256)',
  'function proposeAddCollaborator(address newCollaborator) returns (uint256)',
  'function proposeRemoveCollaborator(address collaborator) returns (uint256)',
  'function proposeUpdateThreshold(uint256 newThreshold) returns (uint256)',
  'function proposeUpdateMetadata(string name, string description, string imageUrl) returns (uint256)',
  'function approve(uint256 proposalId)',
  'function reject(uint256 proposalId)',
  
  // Events
  'event CollaboratorAdded(address indexed collaborator)',
  'event CollaboratorRemoved(address indexed collaborator)',
  'event ThresholdUpdated(uint256 newThreshold)',
  'event ProposalCreated(uint256 indexed proposalId, uint8 proposalType, address indexed proposer)',
  'event ProposalApproved(uint256 indexed proposalId, address indexed approver)',
  'event ProposalRejected(uint256 indexed proposalId, address indexed rejector)',
  'event ProposalExecuted(uint256 indexed proposalId)',
  'event BroadcastPublished(bytes32 indexed contentHash, uint256 indexed proposalId)',
  'event MetadataUpdated(string name, string description)',
]);

// Proposal types
export enum MultiSigProposalType {
  Broadcast = 0,
  AddCollaborator = 1,
  RemoveCollaborator = 2,
  UpdateThreshold = 3,
  UpdateMetadata = 4,
}

// Proposal status
export enum MultiSigProposalStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Executed = 3,
  Expired = 4,
}

// Proposal type labels
export const PROPOSAL_TYPE_LABELS: Record<MultiSigProposalType, { label: string; emoji: string }> = {
  [MultiSigProposalType.Broadcast]: { label: 'Broadcast', emoji: '📻' },
  [MultiSigProposalType.AddCollaborator]: { label: 'Add Collaborator', emoji: '➕' },
  [MultiSigProposalType.RemoveCollaborator]: { label: 'Remove Collaborator', emoji: '➖' },
  [MultiSigProposalType.UpdateThreshold]: { label: 'Update Threshold', emoji: '🔢' },
  [MultiSigProposalType.UpdateMetadata]: { label: 'Update Metadata', emoji: '📝' },
};

// Status labels
export const MULTI_SIG_STATUS_LABELS: Record<MultiSigProposalStatus, { label: string; color: string }> = {
  [MultiSigProposalStatus.Pending]: { label: 'Pending', color: 'text-yellow-400' },
  [MultiSigProposalStatus.Approved]: { label: 'Approved', color: 'text-green-400' },
  [MultiSigProposalStatus.Rejected]: { label: 'Rejected', color: 'text-red-400' },
  [MultiSigProposalStatus.Executed]: { label: 'Executed', color: 'text-blue-400' },
  [MultiSigProposalStatus.Expired]: { label: 'Expired', color: 'text-gray-400' },
};

// Helper to decode proposal data
export function decodeProposalData(proposalType: MultiSigProposalType, data: `0x${string}`): unknown {
  // Simplified - in production use viem's decodeAbiParameters
  return data;
}
