import type { Address } from 'viem';

// Base Mainnet Chain ID
export const BASE_CHAIN_ID = Number(process.env.NEXT_PUBLIC_BASE_CHAIN_ID) || 8453;

// Base RPC URL
export const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';

// Contract Addresses (loaded from env vars)
export const CONTRACTS = {
  // Core Tokens (Clanker-deployed)
  RADIO_TOKEN: (process.env.NEXT_PUBLIC_RADIO_TOKEN_ADDRESS || '') as Address,
  VIBES_TOKEN: (process.env.NEXT_PUBLIC_VIBES_TOKEN_ADDRESS || '') as Address,
  
  // Core Contracts
  STATION_NFT: (process.env.NEXT_PUBLIC_STATION_NFT_ADDRESS || '') as Address,
  RADIO_REGISTRY: (process.env.NEXT_PUBLIC_RADIO_REGISTRY_ADDRESS || '') as Address,
  STATION_FACTORY: '' as Address,
  SUBSCRIPTION_MANAGER: '' as Address,
  
  // Social/VIBES Feature Contracts
  SESSION_NFT_FACTORY: '' as Address,
  SMOKE_SIGNALS: '' as Address,
  BACKSTAGE_MANAGER: '' as Address, // Formerly Hotbox
  AUX_PASS_CONTROLLER: '' as Address,
  COMMUNITY_DROPS: '' as Address,
  
  // Advanced Features
  MULTI_SIG_STATION: '' as Address,
  DJ_ATTESTATION_MANAGER: '' as Address,
  REQUEST_LINE: '' as Address,
  
  // External (Base mainnet)
  // Chainlink VRF Coordinator on Base - Phase 2
  CHAINLINK_VRF: '' as Address, // Will be configured when Community Drops feature is ready
  EAS_CONTRACT: '0x4200000000000000000000000000000000000021' as Address,
} as const;
