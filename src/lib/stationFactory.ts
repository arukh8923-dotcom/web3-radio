import { parseAbi } from 'viem';
import { CONTRACTS } from '@/constants/addresses';

// StationFactory Contract Address (Base Mainnet)
export const STATION_FACTORY_ADDRESS = CONTRACTS.STATION_FACTORY;

// StationFactory ABI
export const STATION_FACTORY_ABI = parseAbi([
  // Read functions
  'function radioToken() view returns (address)',
  'function stationNFT() view returns (address)',
  'function treasury() view returns (address)',
  'function creationFeeRadio() view returns (uint256)',
  'function premiumCreationFeeRadio() view returns (uint256)',
  'function stationCount() view returns (uint256)',
  'function frequencyToStation(uint256 frequency) view returns (address)',
  'function getStation(uint256 frequency) view returns (address)',
  'function getOwnerStations(address owner) view returns (address[])',
  'function getStations(uint256 offset, uint256 limit) view returns (address[])',
  'function stationExists(uint256 frequency) view returns (bool)',
  'function getCreationFees() view returns (uint256 standard, uint256 premium)',
  
  // Write functions
  'function createStation(uint256 frequency, string name, string description, string category, bool isPremium) returns (address)',
  'function createPremiumStation(uint256 frequency, string name, string description, string category, uint256 subscriptionFee) returns (address)',
  
  // Events
  'event StationCreated(address indexed station, address indexed owner, uint256 indexed frequency, string name, bool isPremium)',
]);

// Station Contract ABI (for individual stations)
export const STATION_ABI = parseAbi([
  // Read functions
  'function frequency() view returns (uint256)',
  'function owner() view returns (address)',
  'function treasury() view returns (address)',
  'function djTier() view returns (uint8)',
  'function authorizedDJs(address) view returns (bool)',
  'function getDJs() view returns (address[])',
  'function getBroadcastCount() view returns (uint256)',
  'function getLatestBroadcast() view returns (tuple(bytes32 contentHash, uint256 timestamp, address dj, uint256 unlockTime, uint8 broadcastType))',
  'function getBroadcastHistory(uint256 limit) view returns (tuple(bytes32 contentHash, uint256 timestamp, address dj, uint256 unlockTime, uint8 broadcastType)[])',
  'function getMetadata() view returns (tuple(string name, string description, string category, string imageUrl, bool isPremium, uint256 subscriptionFee))',
  'function isPremiumStation() view returns (bool)',
  'function isSubscribed(address account) view returns (bool)',
  'function subscriberExpiry(address) view returns (uint256)',
  'function subscriptionFeeRadio() view returns (uint256)',
  'function getRevenueSplit() view returns (uint256 djPercent, uint256 treasuryPercent)',
  'function getStationInfo() view returns (uint256 _frequency, address _owner, string _name, string _category, bool _isPremium, uint256 _subscriptionFee, uint256 _djCount, uint256 _broadcastCount, uint8 _tier)',
  'function isDJ(address account) view returns (bool)',
  
  // Write functions
  'function broadcast(bytes32 contentHash, uint8 bType)',
  'function scheduleBroadcast(bytes32 contentHash, uint256 unlockTime, uint8 bType)',
  'function addDJ(address dj)',
  'function removeDJ(address dj)',
  'function setPremium(bool isPremium, uint256 subscriptionFee)',
  'function subscribe(uint256 months)',
  'function tipDJ(address dj, uint256 amount)',
  'function updateMetadata(string name, string description, string imageUrl)',
  'function setCategory(string category)',
  'function setDJTier(uint8 newTier)',
  
  // Events
  'event NewBroadcast(bytes32 indexed contentHash, address indexed dj, uint256 timestamp)',
  'event ScheduledBroadcast(bytes32 indexed contentHash, uint256 unlockTime)',
  'event DJAdded(address indexed dj)',
  'event DJRemoved(address indexed dj)',
  'event SubscriptionPurchased(address indexed subscriber, uint256 expiry, uint256 amount)',
  'event TipReceived(address indexed tipper, address indexed dj, uint256 amount)',
  'event RevenueDistributed(address indexed dj, uint256 djAmount, uint256 treasuryAmount)',
]);

// Broadcast types
export enum BroadcastType {
  AUDIO = 0,
  VISUAL = 1,
  GENERATIVE = 2,
}

// DJ Tiers
export enum DJTier {
  FREE = 0,
  VERIFIED = 1,
  PREMIUM = 2,
}

// Revenue split by tier
export const REVENUE_SPLIT = {
  [DJTier.FREE]: { dj: 60, treasury: 40 },
  [DJTier.VERIFIED]: { dj: 70, treasury: 30 },
  [DJTier.PREMIUM]: { dj: 80, treasury: 20 },
};

// Station categories (same as StationNFT)
export const STATION_CATEGORIES = [
  { id: 'music', label: '🎵 Music', value: 'music' },
  { id: 'talk', label: '🎙️ Talk', value: 'talk' },
  { id: 'news', label: '📰 News', value: 'news' },
  { id: 'sports', label: '⚽ Sports', value: 'sports' },
  { id: '420', label: '🌿 420 Culture', value: '420' },
  { id: 'ambient', label: '🌊 Ambient', value: 'ambient' },
  { id: 'electronic', label: '🎧 Electronic', value: 'electronic' },
  { id: 'rock', label: '🎸 Rock', value: 'rock' },
  { id: 'hiphop', label: '🎤 Hip-Hop', value: 'hiphop' },
  { id: 'jazz', label: '🎷 Jazz', value: 'jazz' },
] as const;

// Helper to format tier name
export function formatDJTier(tier: DJTier): string {
  switch (tier) {
    case DJTier.FREE:
      return 'Free';
    case DJTier.VERIFIED:
      return 'Verified ✓';
    case DJTier.PREMIUM:
      return 'Premium ⭐';
    default:
      return 'Unknown';
  }
}

// Helper to get tier color
export function getDJTierColor(tier: DJTier): string {
  switch (tier) {
    case DJTier.FREE:
      return 'text-dial-cream';
    case DJTier.VERIFIED:
      return 'text-blue-400';
    case DJTier.PREMIUM:
      return 'text-amber-400';
    default:
      return 'text-dial-cream';
  }
}
