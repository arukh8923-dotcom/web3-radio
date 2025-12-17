import type { Address } from 'viem';

// Base Mainnet Chain ID
export const BASE_CHAIN_ID = 8453;

// Contract Addresses (to be updated after deployment)
export const CONTRACTS = {
  // Core Tokens (Clanker-deployed)
  RADIO_TOKEN: '' as Address,
  VIBES_TOKEN: '' as Address,
  
  // Core Contracts
  STATION_NFT: '' as Address,
  RADIO_REGISTRY: '' as Address,
  STATION_FACTORY: '' as Address,
  SUBSCRIPTION_MANAGER: '' as Address,
  
  // 420 Culture Contracts
  SESSION_NFT_FACTORY: '' as Address,
  SMOKE_SIGNALS: '' as Address,
  HOTBOX_MANAGER: '' as Address,
  AUX_PASS_CONTROLLER: '' as Address,
  COMMUNITY_DROPS: '' as Address,
  
  // Advanced Features
  MULTI_SIG_STATION: '' as Address,
  DJ_ATTESTATION_MANAGER: '' as Address,
  REQUEST_LINE: '' as Address,
  
  // External
  CHAINLINK_VRF: '0x...' as Address, // Base mainnet VRF
  EAS_CONTRACT: '0x4200000000000000000000000000000000000021' as Address, // Base EAS
} as const;

// Supabase Configuration
export const SUPABASE = {
  URL: 'https://uqctttvdzrvutrjcmrom.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxY3R0dHZkenJ2dXRyamNtcm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NDQ5ODcsImV4cCI6MjA4MTUyMDk4N30.4gKlecjCDmwPS_Vmkci4a2xmTQEE9ttyYuD1rKCuOng',
} as const;

// Base RPC
export const BASE_RPC_URL = 'https://mainnet.base.org';
