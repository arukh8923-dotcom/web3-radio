// Contract Integration Layer
// On-chain integration with deployed contracts on Base Mainnet

import { createPublicClient, http, parseAbi, type Address } from 'viem';
import { base } from 'viem/chains';
import { CONTRACTS, TREASURY_ADDRESS } from '@/constants/addresses';

// Re-export from centralized addresses
export const RADIO_TOKEN_ADDRESS = CONTRACTS.RADIO_TOKEN;
export const VIBES_TOKEN_ADDRESS = CONTRACTS.VIBES_TOKEN;

// Contract Addresses - use centralized config
export const CONTRACT_ADDRESSES = {
  RADIO_TOKEN: CONTRACTS.RADIO_TOKEN,
  VIBES_TOKEN: CONTRACTS.VIBES_TOKEN,
  STATION_NFT: CONTRACTS.STATION_NFT,
  RADIO_REGISTRY: CONTRACTS.RADIO_CORE_REGISTRY,
  STATION_FACTORY: CONTRACTS.STATION_FACTORY,
  BROADCAST_MANAGER: CONTRACTS.BROADCAST_MANAGER,
  SUBSCRIPTION_MANAGER: CONTRACTS.SUBSCRIPTION_MANAGER,
  ZONE_420: CONTRACTS.ZONE_420,
  SESSION_NFT_FACTORY: CONTRACTS.SESSION_NFT_FACTORY,
  SMOKE_SIGNALS: CONTRACTS.SMOKE_SIGNALS,
  HOTBOX_ROOM: CONTRACTS.HOTBOX_ROOM,
  AUX_PASS: CONTRACTS.AUX_PASS,
  COMMUNITY_DROPS: CONTRACTS.COMMUNITY_DROPS,
  RADIO_GOVERNANCE: CONTRACTS.RADIO_GOVERNANCE,
  DJ_ATTESTATIONS: CONTRACTS.DJ_ATTESTATIONS,
  RADIO_PAYMASTER: CONTRACTS.RADIO_PAYMASTER,
  TREASURY: TREASURY_ADDRESS,
} as const;

// Tokens are deployed via Clanker - always ready
export const isContractsDeployed = () => true;

// Public client for reading contract state
// Use CDP RPC to avoid rate limiting from public endpoints
export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
});

// ERC-20 ABI (minimal for reading)
export const ERC20_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
]);

// RadioToken extended ABI (for tipping, etc.)
export const RADIO_TOKEN_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function tip(address dj, uint256 amount) external',
  'function subscribe(uint256 frequency, uint256 duration) external',
  'event Tipped(address indexed from, address indexed to, uint256 amount)',
  'event Subscribed(address indexed listener, uint256 indexed frequency, uint256 expiry)',
]);

// VibesToken ABI (for reactions) - Phase 2
// Note: $VIBES will be deployed via Clanker with 100B fixed supply
// These functions will be in VibesWrapper contract, not the base token
export const VIBES_TOKEN_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  // Phase 2 wrapper functions (Coming Soon)
  // 'function react(uint256 frequency, uint8 mood) external',
  // 'function getMoodRing(uint256 frequency) view returns (uint8)',
  // 'function spendVibes(uint256 amount, string action) external',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
]);

// StationNFT ABI
export const STATION_NFT_ABI = parseAbi([
  'function mintFrequency(uint256 frequency, string metadata) external returns (uint256)',
  'function getFrequencyOwner(uint256 frequency) view returns (address)',
  'function transferFrequency(uint256 frequency, address to) external',
  'function setStationMetadata(uint256 frequency, string metadata) external',
  'event FrequencyMinted(uint256 indexed frequency, address indexed owner)',
  'event FrequencyTransferred(uint256 indexed frequency, address indexed from, address indexed to)',
]);

// RadioRegistry ABI
export const RADIO_REGISTRY_ABI = parseAbi([
  'function registerStation(address station, uint256 frequency) external',
  'function getStationByFrequency(uint256 frequency) view returns (address)',
  'function tuneIn(uint256 frequency) external',
  'function tuneOut(uint256 frequency) external',
  'function getListenerCount(uint256 frequency) view returns (uint256)',
  'function calculateSignalStrength(uint256 frequency) view returns (uint256)',
  'event StationRegistered(address indexed station, uint256 indexed frequency)',
  'event TunedIn(address indexed listener, uint256 indexed frequency)',
  'event TunedOut(address indexed listener, uint256 indexed frequency)',
]);

// Helper functions
export async function getRadioBalance(address: `0x${string}`): Promise<bigint> {
  if (!CONTRACT_ADDRESSES.RADIO_TOKEN) return BigInt(0);
  
  try {
    const balance = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.RADIO_TOKEN as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    });
    return balance as bigint;
  } catch {
    return BigInt(0);
  }
}

export async function getVibesBalance(address: `0x${string}`): Promise<bigint> {
  if (!CONTRACT_ADDRESSES.VIBES_TOKEN) return BigInt(0);
  
  try {
    const balance = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.VIBES_TOKEN as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    });
    return balance as bigint;
  } catch {
    return BigInt(0);
  }
}

export async function getOnChainListenerCount(frequency: number): Promise<number> {
  if (!CONTRACT_ADDRESSES.RADIO_REGISTRY) return 0;
  
  try {
    const count = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.RADIO_REGISTRY as `0x${string}`,
      abi: RADIO_REGISTRY_ABI,
      functionName: 'getListenerCount',
      args: [BigInt(Math.round(frequency * 10))], // Convert to integer (88.1 -> 881)
    });
    return Number(count);
  } catch {
    return 0;
  }
}

export async function getFrequencyOwner(frequency: number): Promise<string | null> {
  if (!CONTRACT_ADDRESSES.STATION_NFT) return null;
  
  try {
    const owner = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.STATION_NFT as `0x${string}`,
      abi: STATION_NFT_ABI,
      functionName: 'getFrequencyOwner',
      args: [BigInt(Math.round(frequency * 10))],
    });
    return owner as string;
  } catch {
    return null;
  }
}
