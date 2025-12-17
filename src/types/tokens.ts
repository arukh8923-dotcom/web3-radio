import type { Address } from 'viem';

// $RADIO Token
export interface RadioToken {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
}

// $VIBES Token
export interface VibesToken {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
}

// Tip Event
export interface TipEvent {
  id: bigint;
  from: Address;
  to: Address;
  amount: bigint;
  stationFrequency: number;
  timestamp: number;
  txHash: string;
}

// Governance Proposal
export interface GovernanceProposal {
  id: bigint;
  proposer: Address;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  forVotes: bigint;
  againstVotes: bigint;
  executed: boolean;
  canceled: boolean;
}

// Vote
export interface Vote {
  proposalId: bigint;
  voter: Address;
  support: boolean;
  weight: bigint;
  timestamp: number;
}

// Station Token (Clanker-deployed)
export interface StationToken {
  address: Address;
  stationFrequency: number;
  name: string;
  symbol: string;
  totalSupply: bigint;
  holderCount: number;
  price: bigint; // in ETH
}

// Referral
export interface Referral {
  code: string;
  referrer: Address;
  referred: Address[];
  totalRewards: bigint;
}
