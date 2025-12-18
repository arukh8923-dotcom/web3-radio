import { parseAbi } from 'viem';
import { CONTRACTS } from '@/constants/addresses';

// StationNFT Contract Address (Base Mainnet)
export const STATION_NFT_ADDRESS = CONTRACTS.STATION_NFT;

// StationNFT ABI
export const STATION_NFT_ABI = parseAbi([
  // Read functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function mintFeeRadio() view returns (uint256)',
  'function premiumMintFeeRadio() view returns (uint256)',
  'function radioToken() view returns (address)',
  'function treasury() view returns (address)',
  'function totalMinted() view returns (uint256)',
  'function isFrequencyAvailable(uint256 frequency) view returns (bool)',
  'function getFrequencyOwner(uint256 frequency) view returns (address)',
  'function getMintFee(uint256 frequency) view returns (uint256)',
  'function getOwnedFrequencies(address owner) view returns (uint256[])',
  'function frequencyToTokenId(uint256 frequency) view returns (uint256)',
  'function tokenIdToFrequency(uint256 tokenId) view returns (uint256)',
  
  // Write functions
  'function mintFrequency(uint256 frequency, string name, string description, string category, uint256 creatorFid) returns (uint256)',
  'function updateMetadata(uint256 tokenId, string name, string description)',
  'function approve(address to, uint256 tokenId)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  
  // Events
  'event FrequencyMinted(uint256 indexed tokenId, uint256 indexed frequency, address indexed owner, string name, uint256 creatorFid, uint256 radioFee)',
  'event FrequencyMetadataUpdated(uint256 indexed tokenId, string name, string description)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
]);

// Frequency constants
export const MIN_FREQUENCY = 87500; // 87.5 FM
export const MAX_FREQUENCY = 108000; // 108.0 FM
export const FREQUENCY_420 = 420000; // 420.0 FM (special)

// Convert frequency display (88.1) to contract format (88100)
export function frequencyToContract(freq: number): number {
  return Math.round(freq * 1000);
}

// Convert contract format (88100) to display (88.1)
export function frequencyFromContract(freq: number): number {
  return freq / 1000;
}

// Format frequency for display
export function formatFrequency(freq: number): string {
  const display = freq >= 1000 ? frequencyFromContract(freq) : freq;
  return `${display.toFixed(1)} FM`;
}

// Check if frequency is valid
export function isValidFrequency(freq: number): boolean {
  const contractFreq = freq >= 1000 ? freq : frequencyToContract(freq);
  return (contractFreq >= MIN_FREQUENCY && contractFreq <= MAX_FREQUENCY) || 
         contractFreq === FREQUENCY_420;
}

// Check if frequency is premium (420.0)
export function isPremiumFrequency(freq: number): boolean {
  const contractFreq = freq >= 1000 ? freq : frequencyToContract(freq);
  return contractFreq === FREQUENCY_420;
}

// Station categories
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
