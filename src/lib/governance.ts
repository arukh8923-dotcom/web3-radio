import { parseAbi } from 'viem';
import { CONTRACTS } from '@/constants/addresses';

// RadioGovernance Contract Address (Base Mainnet)
export const GOVERNANCE_ADDRESS = CONTRACTS.RADIO_GOVERNANCE;

// RadioGovernance ABI
export const GOVERNANCE_ABI = parseAbi([
  // Read functions
  'function radioToken() view returns (address)',
  'function proposalCount() view returns (uint256)',
  'function totalProposals() view returns (uint256)',
  'function executedProposals() view returns (uint256)',
  'function timelockDelay() view returns (uint256)',
  'function config() view returns (uint256 votingDelay, uint256 votingPeriod, uint256 proposalThreshold, uint256 quorumPercentage)',
  'function state(uint256 proposalId) view returns (uint8)',
  'function getProposal(uint256 proposalId) view returns (uint256 id, address proposer, string title, string description, uint256 startTime, uint256 endTime, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes, uint8 currentState)',
  'function getVote(uint256 proposalId, address voter) view returns (tuple(bool hasVoted, uint8 voteType, uint256 weight))',
  'function getProposalVoters(uint256 proposalId) view returns (address[])',
  'function getUserProposals(address user) view returns (uint256[])',
  'function getActiveProposals(uint256 limit) view returns (uint256[])',
  'function canPropose(address user) view returns (bool)',
  'function getVotingPower(address user) view returns (uint256)',
  
  // Write functions
  'function propose(string title, string description, address[] targets, bytes[] calldatas) returns (uint256)',
  'function cancel(uint256 proposalId)',
  'function castVote(uint256 proposalId, uint8 voteType)',
  'function queue(uint256 proposalId)',
  'function execute(uint256 proposalId)',
  
  // Events
  'event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, uint256 startTime, uint256 endTime)',
  'event VoteCast(uint256 indexed proposalId, address indexed voter, uint8 voteType, uint256 weight)',
  'event ProposalCanceled(uint256 indexed proposalId)',
  'event ProposalQueued(uint256 indexed proposalId, uint256 executionTime)',
  'event ProposalExecuted(uint256 indexed proposalId)',
]);

// Proposal states
export enum ProposalState {
  Pending = 0,
  Active = 1,
  Canceled = 2,
  Defeated = 3,
  Succeeded = 4,
  Queued = 5,
  Executed = 6,
  Expired = 7,
}

// Vote types
export enum VoteType {
  Against = 0,
  For = 1,
  Abstain = 2,
}

// State labels
export const PROPOSAL_STATE_LABELS: Record<ProposalState, { label: string; color: string }> = {
  [ProposalState.Pending]: { label: 'Pending', color: 'text-gray-400' },
  [ProposalState.Active]: { label: 'Active', color: 'text-green-400' },
  [ProposalState.Canceled]: { label: 'Canceled', color: 'text-red-400' },
  [ProposalState.Defeated]: { label: 'Defeated', color: 'text-red-400' },
  [ProposalState.Succeeded]: { label: 'Succeeded', color: 'text-green-400' },
  [ProposalState.Queued]: { label: 'Queued', color: 'text-yellow-400' },
  [ProposalState.Executed]: { label: 'Executed', color: 'text-blue-400' },
  [ProposalState.Expired]: { label: 'Expired', color: 'text-gray-400' },
};

// Vote type labels
export const VOTE_TYPE_LABELS: Record<VoteType, { label: string; emoji: string }> = {
  [VoteType.Against]: { label: 'Against', emoji: '👎' },
  [VoteType.For]: { label: 'For', emoji: '👍' },
  [VoteType.Abstain]: { label: 'Abstain', emoji: '🤷' },
};

// Helper to format voting power
export function formatVotingPower(power: bigint, decimals: number = 18): string {
  const value = Number(power) / Math.pow(10, decimals);
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}
