/**
 * Web3 Radio Pricing Configuration
 * 
 * Token Supply: 100,000,000,000 (100B) - Fixed by Clanker
 * Target Market Cap: $10M = 1 RADIO = $0.0001
 * 
 * All prices are in token amounts, with USD equivalents calculated dynamically
 */

// Token decimals
export const RADIO_DECIMALS = 18;
export const VIBES_DECIMALS = 18;

// Estimated token prices (update from oracle/DEX in production)
export const ESTIMATED_RADIO_USD = 0.0001; // $0.0001 per RADIO
export const ESTIMATED_VIBES_USD = 0.00005; // $0.00005 per VIBES

/**
 * NFT Pricing (in RADIO tokens)
 */
export const NFT_PRICES = {
  // Frequency NFT - ownership of radio frequency
  frequency: {
    mint: 100_000, // 100K RADIO (~$10 USD)
    premium: 500_000, // 500K RADIO (~$50 USD) for premium frequencies
    transfer_fee: 10_000, // 10K RADIO (~$1 USD) transfer fee
  },
  
  // Session NFT - attendance proof (FREE - earned by attending)
  session: {
    mint: 0, // Free for attendees
    claim_window: 24 * 60 * 60, // 24 hours to claim
  },
  
  // Recording NFT - DVR recording ownership
  recording: {
    mint: 50_000, // 50K RADIO (~$5 USD)
    premium_quality: 100_000, // 100K RADIO (~$10 USD) for high quality
  },
  
  // Achievement NFT - earned through milestones (FREE)
  achievement: {
    mint: 0, // Free - earned through activity
  },
} as const;

/**
 * Subscription Pricing (in RADIO tokens, per 30 days)
 */
export const SUBSCRIPTION_TIERS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 10_000, // 10K RADIO (~$1 USD/month)
    duration: 30, // days
    benefits: ['Ad-free listening', 'Basic chat access'],
    icon: '📻',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 50_000, // 50K RADIO (~$5 USD/month)
    duration: 30,
    benefits: ['Ad-free listening', 'Premium chat badge', 'Request priority', 'Exclusive content'],
    icon: '⭐',
  },
  vip: {
    id: 'vip',
    name: 'VIP',
    price: 200_000, // 200K RADIO (~$20 USD/month)
    duration: 30,
    benefits: ['All Premium benefits', 'Direct DJ access', 'VIP room access', 'NFT airdrops', 'Governance voting'],
    icon: '👑',
  },
} as const;

/**
 * Tipping Presets (in RADIO tokens)
 */
export const TIP_PRESETS = {
  small: 1_000, // 1K RADIO (~$0.10 USD)
  medium: 10_000, // 10K RADIO (~$1 USD)
  large: 50_000, // 50K RADIO (~$5 USD)
  mega: 100_000, // 100K RADIO (~$10 USD)
} as const;

/**
 * VIBES Token Costs (for social features)
 */
export const VIBES_COSTS = {
  // Smoke Signals (ephemeral messages)
  smoke_signal: {
    duration_5min: 500, // 500 VIBES
    duration_10min: 1_000, // 1K VIBES
    duration_30min: 2_500, // 2.5K VIBES
    duration_1hr: 5_000, // 5K VIBES
  },
  
  // Request Line
  request_line: {
    min_stake: 2_000, // 2K VIBES minimum
    priority_boost: 10_000, // 10K VIBES for priority
  },
  
  // Hotbox Room (token-gated)
  hotbox: {
    min_balance: 50_000, // 50K VIBES to enter
    premium_room: 200_000, // 200K VIBES for premium rooms
  },
  
  // Aux Pass Queue
  aux_pass: {
    join_queue: 5_000, // 5K VIBES to join
    skip_queue: 50_000, // 50K VIBES to skip ahead
  },
  
  // Mood/Reactions (earn VIBES)
  mood_reaction: {
    cost: 0, // Free to react
    earn: 100, // Earn 100 VIBES per reaction
  },
} as const;

/**
 * VIBES Rewards (earned by users)
 */
export const VIBES_REWARDS = {
  tune_in_bonus: 1_000, // 1K VIBES for tuning in
  listening_per_10min: 500, // 500 VIBES per 10 min
  golden_hour_bonus: 5_000, // 5K VIBES at 4:20
  achievement_unlock: 10_000, // 10K VIBES per achievement
  referral_bonus: 50_000, // 50K VIBES per referral
  session_attendance: 2_000, // 2K VIBES for attending session
} as const;

/**
 * Station Creation Costs (in RADIO)
 */
export const STATION_COSTS = {
  create_basic: 50_000, // 50K RADIO (~$5 USD)
  create_premium: 200_000, // 200K RADIO (~$20 USD)
  upgrade_to_premium: 150_000, // 150K RADIO (~$15 USD)
} as const;

/**
 * x402 Micropayment Pricing (in USDC)
 */
export const X402_PRICES = {
  // Premium content access
  premium_stream_per_minute: 0.001, // $0.001/min
  ad_free_per_hour: 0.01, // $0.01/hour
  
  // NFT high-res images
  nft_highres_image: 0.01, // $0.01 per high-res download
  
  // Recording downloads
  recording_download: 0.05, // $0.05 per recording
  
  // DJ tips via x402
  tip_minimum: 0.10, // $0.10 minimum tip
} as const;

/**
 * Platform Fees
 */
export const PLATFORM_FEES = {
  tip_fee_percent: 5, // 5% on tips
  subscription_fee_percent: 10, // 10% on subscriptions
  nft_sale_fee_percent: 2.5, // 2.5% on NFT sales
  x402_fee_percent: 5, // 5% on x402 payments
} as const;

/**
 * Helper: Convert token amount to USD estimate
 */
export function radioToUsd(amount: number): number {
  return amount * ESTIMATED_RADIO_USD;
}

export function vibesToUsd(amount: number): number {
  return amount * ESTIMATED_VIBES_USD;
}

export function formatUsd(amount: number): string {
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  if (amount < 1) return `$${amount.toFixed(2)}`;
  return `$${amount.toFixed(2)}`;
}

export function formatTokenAmount(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toString();
}
