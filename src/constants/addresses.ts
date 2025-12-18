import type { Address } from 'viem';

// Base Mainnet Chain ID
export const BASE_CHAIN_ID = Number(process.env.NEXT_PUBLIC_BASE_CHAIN_ID) || 8453;

// Base RPC URL - CDP Integration (no fallback to avoid rate limiting)
export const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || '';

// Treasury Address
export const TREASURY_ADDRESS = '0x702AA27b8498EB3F9Ec0431BC5Fd258Bc19faf36' as Address;

// Contract Addresses - Base Mainnet Deployed
export const CONTRACTS = {
  // Core Tokens (Clanker-deployed on Base Mainnet)
  RADIO_TOKEN: '0xaF0741FB82633a190683c5cFb4b8546123E93B07' as Address,
  VIBES_TOKEN: '0xCD6387AfA893C1Ad070c9870B5e9C4c0B7D56b07' as Address,
  
  // Core Contracts (Deployed)
  RADIO_CORE_REGISTRY: '0x716D07766eE2B6e62337B052B3501e66d12B8563' as Address,
  STATION_NFT: '0x938CeF0CD64928330592ff4C58f2076Cf1d31bc3' as Address,
  STATION_FACTORY: '0xD4Ff45ae4095EeB7b5650C58d6B7C979d679f560' as Address,
  BROADCAST_MANAGER: '0xEfa1ac40697efDf229A67f521255A3CBbBD714eC' as Address,
  SUBSCRIPTION_MANAGER: '0xc39d19eb191714Dde7dc069CA86059Fb5c5C935E' as Address,
  
  // Social/VIBES Feature Contracts (Deployed)
  ZONE_420: '0x6D4aad448235C1f0275aa06F940dC67695BD0496' as Address,
  SESSION_NFT_FACTORY: '0xBDbFf9019678D42791D4bc2CA795B56b3Dc0F542' as Address,
  SMOKE_SIGNALS: '0x20D58d0ef3367C19bbF9D85e4Bd09Ddcfe53BB6f' as Address,
  HOTBOX_ROOM: '0x7EaEC34D63D44bcE860f8a97d8c8c6440ad4F56B' as Address,
  AUX_PASS: '0x1E73B052B3Fd68eE757F70E5a923547445Cb37d5' as Address,
  COMMUNITY_DROPS: '0xa522Def5D4493ccfBf7ce934DE8aA6F9B11C56f2' as Address,
  
  // Governance & Attestations (Deployed)
  RADIO_GOVERNANCE: '0xE429D96A304dfaB96F85EBd618ad527101408ACc' as Address,
  DJ_ATTESTATIONS: '0xd10eD354Cd558a4e59F079070d9E75D5181263D0' as Address,
  
  // Account Abstraction (Deployed)
  RADIO_PAYMASTER: '0x6e3cbf3F9C5E8F7932cBf8CDA389b69Ad246914b' as Address,
  
  // Treasury
  TREASURY: '0x702AA27b8498EB3F9Ec0431BC5Fd258Bc19faf36' as Address,
  
  // External (Base mainnet)
  EAS_CONTRACT: '0x4200000000000000000000000000000000000021' as Address,
} as const;

// Supported payment tokens (RADIO and VIBES only - NO ETH/USDC)
export const PAYMENT_TOKENS = {
  RADIO: CONTRACTS.RADIO_TOKEN,
  VIBES: CONTRACTS.VIBES_TOKEN,
} as const;
