import { parseAbi } from 'viem';
import { CONTRACTS } from '@/constants/addresses';

// RadioPaymaster Contract Address (Base Mainnet)
export const PAYMASTER_CONTRACT_ADDRESS = CONTRACTS.RADIO_PAYMASTER;

// RadioPaymaster ABI
export const PAYMASTER_ABI = parseAbi([
  // Read functions
  'function radioToken() view returns (address)',
  'function treasury() view returns (address)',
  'function policy() view returns (bool enabled, uint256 maxGasPerTx, uint256 dailyLimit, uint256 monthlyLimit)',
  'function premiumThreshold() view returns (uint256)',
  'function premiumMultiplier() view returns (uint256)',
  'function totalGasSponsored() view returns (uint256)',
  'function totalTxSponsored() view returns (uint256)',
  'function sponsorshipFund() view returns (uint256)',
  'function paused() view returns (bool)',
  'function whitelistedContracts(address) view returns (bool)',
  
  // Check sponsorship
  'function canSponsor(address user, address target, bytes4 selector, uint256 estimatedGas) view returns (bool sponsorable, string reason)',
  'function getUserLimits(address user) view returns (uint256 dailyRemaining, uint256 monthlyRemaining, uint256 totalSponsored, uint256 txCount, bool isPremium)',
  'function getStats() view returns (uint256 totalGas, uint256 totalTx, uint256 fundBalance, bool isPaused, bool isEnabled)',
  
  // Events
  'event GasSponsored(address indexed user, address indexed target, uint256 gasUsed, uint256 gasCost)',
  'event ContractWhitelisted(address indexed target, bool status)',
  'event FundDeposited(address indexed from, uint256 amount)',
]);

// Sponsorship status
export interface SponsorshipStatus {
  canSponsor: boolean;
  reason: string;
  dailyRemaining: bigint;
  monthlyRemaining: bigint;
  isPremium: boolean;
}

// User limits
export interface UserLimits {
  dailyRemaining: bigint;
  monthlyRemaining: bigint;
  totalSponsored: bigint;
  txCount: bigint;
  isPremium: boolean;
}

// Paymaster stats
export interface PaymasterStats {
  totalGasSponsored: bigint;
  totalTxSponsored: bigint;
  fundBalance: bigint;
  isPaused: boolean;
  isEnabled: boolean;
}

// Format gas cost
export function formatGasCost(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  if (eth >= 0.01) return `${eth.toFixed(4)} ETH`;
  if (eth >= 0.0001) return `${(eth * 1000).toFixed(4)} mETH`;
  return `${(eth * 1e6).toFixed(2)} μETH`;
}

// Format remaining limit
export function formatRemainingLimit(wei: bigint, total: bigint): string {
  const remaining = Number(wei) / 1e18;
  const totalEth = Number(total) / 1e18;
  const percentage = totalEth > 0 ? (remaining / totalEth) * 100 : 0;
  return `${remaining.toFixed(4)} ETH (${percentage.toFixed(0)}%)`;
}
