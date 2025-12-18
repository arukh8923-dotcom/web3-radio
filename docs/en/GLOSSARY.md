# Web3 Radio Glossary

## Complete Guide to Terms, Features & Crypto Concepts

**Version 1.0 | December 2025**

This document explains all terminology used in the Web3 Radio mini app, including crypto concepts, feature names, and their functions for both users and developers.

---

## Table of Contents

1. [Core Concepts](#1-core-concepts)
2. [Tokens](#2-tokens)
3. [Radio Features](#3-radio-features)
4. [Social Features](#4-social-features)
5. [NFT & Collectibles](#5-nft--collectibles)
6. [Technical Terms](#6-technical-terms)
7. [Crypto/Web3 Terms](#7-cryptoweb3-terms)
8. [User Actions](#8-user-actions)
9. [Developer Reference](#9-developer-reference)

---

## 1. Core Concepts

### Station
**User Perspective:** A radio channel at a specific frequency (like 98.1 FM) where a DJ broadcasts music or content.

**Developer Perspective:** A database entity with `frequency`, `owner_address`, `stream_url`, and metadata. Stored in Supabase `stations` table.

**Crypto Context:** Stations are created by burning $RADIO tokens. The station owner (DJ) receives tips and subscription revenue.

---

### Frequency
**User Perspective:** The number on the dial (88.0 - 109.9 FM) that identifies a station's location.

**Developer Perspective:** A float value used as a unique identifier for stations. Stored with 1 decimal precision.

**Crypto Context:** Different frequency ranges represent different genres (Genre Zones), each with unique reward multipliers.

---

### Tune In / Tune Out
**User Perspective:** "Tune In" means you're actively listening and counted as a listener. "Tune Out" means you've stopped listening.

**Developer Perspective:** API calls to `/api/tune-in` and `/api/tune-out` that update `listener_count` and track listening sessions.

**Crypto Context:** Tuning in is FREE (no tokens required). While tuned in, users earn $VIBES rewards over time.

---

### Genre Zones
**User Perspective:** Different sections of the FM dial dedicated to specific music genres.

**Developer Perspective:** Defined in `src/constants/frequencies.ts` as `FREQUENCY_BANDS` object.

**Crypto Context:** Each genre zone has different BPM ranges and reward multipliers.

| Zone | Frequency | Genre | BPM Range |
|------|-----------|-------|-----------|
| 88.0-91.9 | Hip-Hop | 85-115 |
| 92.0-95.9 | Electronic | 120-150 |
| 96.0-99.9 | Rock | 100-140 |
| 100.0-103.9 | Jazz | 60-120 |
| 104.0-105.9 | Lo-Fi | 70-90 |
| 106.0-107.9 | Ambient | 60-80 |
| 108.0-109.9 | World | Variable |

---

### Golden Hour
**User Perspective:** Special event time (6-8 PM daily) when rewards are doubled and exclusive content drops.

**Developer Perspective:** Time-based check in `src/constants/frequencies.ts` via `isGoldenHour()` function.

**Crypto Context:** 2x $VIBES multiplier during Golden Hour. Special community drops and events.

---

## 2. Tokens

### $RADIO
**User Perspective:** The main token for governance and value. Used for tips, subscriptions, and creating stations.

**Developer Perspective:** ERC-20 token on Base. Contract address in `src/constants/addresses.ts`.

**Crypto Context:**
- **Total Supply:** 100B (fixed via Clanker)
- **Use Cases:** Tips, Subscriptions, Station Creation, Governance
- **How to Get:** Buy on DEX (Uniswap V4)
- **Burn Mechanism:** Station creation burns $RADIO

---

### $VIBES
**User Perspective:** Social token earned through activities. Used for social features like Smoke Signals and Request Line.

**Developer Perspective:** ERC-20 token on Base. Wrapper contract handles earning/spending logic.

**Crypto Context:**
- **Total Supply:** 100B (fixed via Clanker)
- **Use Cases:** Smoke Signals, Request Line, Mood Boost, Custom Features
- **How to Get:** Earn through listening, reactions, achievements
- **Burn Mechanism:** Social features burn $VIBES (deflationary)

---

### Creator Vault
**User Perspective:** The project's token reserve used for rewards and development.

**Developer Perspective:** Clanker vault contract that holds 30% of total supply with vesting schedule.

**Crypto Context:**
- **Amount:** 30B tokens (30% of supply)
- **Lockup:** 7 days minimum
- **Vesting:** 180 days linear release
- **Purpose:** Community rewards, DJ rewards, team, treasury

---

### Liquidity Pool (LP)
**User Perspective:** Where you can buy/sell tokens on the DEX.

**Developer Perspective:** Uniswap V4 pool created automatically by Clanker.

**Crypto Context:**
- **Amount:** 70B tokens (70% of supply)
- **Status:** Locked forever (no rug pull possible)
- **Trading:** Paired with WETH for trading

---

## 3. Radio Features

### Preset Buttons (1-6)
**User Perspective:** Save your favorite stations. Tap to load, long-press to save current frequency.

**Developer Perspective:** Stored in Supabase `presets` table, linked to wallet address. Max 6 presets per user.

**Crypto Context:** No token cost. Presets sync across devices when wallet is connected.

---

### Tuning Dial
**User Perspective:** The main control to change frequencies. Drag left/right to find stations.

**Developer Perspective:** React component in `src/components/radio/FrequencyDial.tsx`. Updates `frequency` state in `useRadio` hook.

**Crypto Context:** No token cost to tune. Finding stations is free.

---

### Auto Scan
**User Perspective:** Automatically scans through frequencies to find active stations.

**Developer Perspective:** Component in `src/components/radio/AutoScan.tsx`. Queries API for stations in frequency range.

**Crypto Context:** No token cost. Helps users discover new stations.

---

### Band Selector
**User Perspective:** Filter stations by genre/category.

**Developer Perspective:** Component in `src/components/radio/BandSelector.tsx`. Filters `FREQUENCY_BANDS` constant.

**Crypto Context:** No token cost. Different bands may have different reward multipliers.

---

### VU Meter
**User Perspective:** Visual indicator showing audio levels (L/R channels).

**Developer Perspective:** Component in `src/components/radio/VUMeter.tsx`. Animated based on volume state.

**Crypto Context:** Purely visual, no token interaction.

---

### Nixie Display
**User Perspective:** Retro-style display showing current frequency.

**Developer Perspective:** Component in `src/components/radio/NixieDisplay.tsx`. CSS-styled numeric display.

**Crypto Context:** Purely visual, no token interaction.

---

### Sleep Timer
**User Perspective:** Automatically turns off the radio after a set time.

**Developer Perspective:** Component in `src/components/radio/SleepTimer.tsx`. Uses `setTimeout` to trigger power off.

**Crypto Context:** No token cost. Useful for listening before sleep.

---

### Alarm Clock
**User Perspective:** Wake up to your favorite station at a set time.

**Developer Perspective:** Component in `src/components/radio/AlarmClock.tsx`. Uses browser notifications and audio.

**Crypto Context:** No token cost.

---

## 4. Social Features

### Mood Ring
**User Perspective:** Shows the collective mood/vibe of all listeners at a station. React to contribute to the mood.

**Developer Perspective:** 
- Types in `src/types/vibes.ts` (`MoodRing`, `Mood` enum)
- Component in `src/components/radio/MoodRingDisplay.tsx`
- API endpoint `/api/mood-ring`

**Crypto Context:**
- **Cost:** FREE to view, 5 $VIBES earned per reaction
- **Moods:** CHILL, HYPE, MELANCHOLY, EUPHORIC, ZEN
- **Bonus:** +3 $VIBES for matching station mood

---

### Smoke Signals
**User Perspective:** Send temporary messages that disappear after a set time. Like ephemeral broadcasts to all listeners.

**Developer Perspective:**
- Types in `src/types/vibes.ts` (`SmokeSignal`)
- Component in `src/components/radio/SmokeSignals.tsx`
- Messages stored with `expiryTime` and auto-deleted

**Crypto Context:**
- **Cost:** 10-100 $VIBES depending on duration
- **Burn:** 100% of cost is burned (deflationary)
- **Durations:** 5 min, 15 min, 1 hour, 4 hours

---

### Request Line
**User Perspective:** Request songs or content from the DJ. Stake $VIBES to show you're serious.

**Developer Perspective:**
- Types in `src/types/vibes.ts` (`SongRequest`)
- Component in `src/components/radio/RequestLine.tsx`
- Stake held in escrow until fulfilled or expired

**Crypto Context:**
- **Stake:** 50 $VIBES (refundable if fulfilled)
- **Priority Boost:** +25 $VIBES (burned)
- **Expiry:** 50% burned, 50% returned

---

### Live Chat
**User Perspective:** Real-time chat with other listeners at the same station.

**Developer Perspective:**
- Component in `src/components/radio/LiveChat.tsx`
- Uses Supabase Realtime for live updates
- Messages stored in `chat_messages` table

**Crypto Context:**
- **Cost:** FREE to chat
- **Earning:** 500 $VIBES achievement for 100 messages

---

### Backstage Room (formerly Hotbox)
**User Perspective:** Private, token-gated rooms for VIP listeners. Hold minimum $VIBES to access.

**Developer Perspective:**
- Types in `src/types/vibes.ts` (`BackstageRoom`)
- Component in `src/components/radio/HotboxRoom.tsx`
- Token balance check via contract call

**Crypto Context:**
- **Access:** Hold 100-1000 $VIBES (not spent, just held)
- **Tiers:** Public (100), Premium (500), VIP (1000)
- **Exclusive Events:** May require entry fee

---

### Aux Pass
**User Perspective:** Queue system to become a guest DJ. Take control of the station temporarily.

**Developer Perspective:**
- Types in `src/types/vibes.ts` (`AuxPassQueue`)
- Component in `src/components/radio/AuxPass.tsx`
- Queue managed in database with session timers

**Crypto Context:**
- **Join Queue:** FREE
- **Skip Position:** 50 $VIBES
- **Skip to Front:** 200 $VIBES
- **Extend Session:** 100 $VIBES per 5 minutes

---

### Community Drops
**User Perspective:** Random airdrops of $VIBES to active listeners. Be tuned in to be eligible!

**Developer Perspective:**
- Types in `src/types/vibes.ts` (`CommunityDrop`)
- Component in `src/components/radio/CommunityDrops.tsx`
- Uses Chainlink VRF for random selection

**Crypto Context:**
- **Eligibility:** Must be tuned in
- **Rewards:** 50-200 $VIBES per drop
- **Frequency:** Weekly + special events

---

### Referral System
**User Perspective:** Invite friends with your unique code. Both of you earn $VIBES when they join.

**Developer Perspective:**
- Component in `src/components/radio/ReferralSystem.tsx`
- Codes generated from wallet address
- Tracked in `referrals` table

**Crypto Context:**
- **You Earn:** 50 $VIBES per referral
- **Friend Earns:** 50 $VIBES bonus
- **Milestone:** 1000 $VIBES for 10 referrals

---

## 5. NFT & Collectibles

### Session NFT
**User Perspective:** Proof-of-attendance NFT for special DJ sessions. Collectible that proves you were there.

**Developer Perspective:**
- Types in `src/types/vibes.ts` (`SessionNFT`, `SessionMetadata`)
- Component in `src/components/radio/SessionNFT.tsx`
- ERC-721 contract on Base

**Crypto Context:**
- **Minting:** Automatic for session attendees
- **Metadata:** Station, DJ, time, attendee count
- **Achievement:** 1000 $VIBES for collecting 5 NFTs

---

### Achievements
**User Perspective:** Badges and rewards for completing milestones. One-time $VIBES bonuses.

**Developer Perspective:**
- Component in `src/components/radio/ListenerAchievements.tsx`
- Stored in Supabase `achievements` table
- Checked via API on relevant actions

**Crypto Context:**
| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| First Tune | First tune-in | 88 $VIBES |
| Regular Listener | 7-day streak | 108 $VIBES |
| Loyal Fan | 30-day streak | 1000 $VIBES |
| Mood Master | Use all 5 moods | 250 $VIBES |
| Social Butterfly | 100 chat messages | 500 $VIBES |

---

## 6. Technical Terms

### Supabase
**User Perspective:** (Not visible to users)

**Developer Perspective:** Backend-as-a-Service providing PostgreSQL database, authentication, and realtime subscriptions. Used for all data storage.

**Crypto Context:** Off-chain data storage. On-chain data synced via indexer.

---

### Subgraph
**User Perspective:** (Not visible to users)

**Developer Perspective:** The Graph protocol indexer for blockchain data. Defined in `subgraph/` folder. Indexes station creation, tips, subscriptions.

**Crypto Context:** Enables efficient querying of on-chain events without direct RPC calls.

---

### Wagmi / Viem
**User Perspective:** (Not visible to users)

**Developer Perspective:** React hooks library (Wagmi) and TypeScript Ethereum library (Viem) for wallet connections and contract interactions.

**Crypto Context:** Handles all wallet connections, transaction signing, and contract calls.

---

### Base (Network)
**User Perspective:** The blockchain network where Web3 Radio operates. Low fees, fast transactions.

**Developer Perspective:** Ethereum L2 by Coinbase. Chain ID: 8453. RPC in environment variables.

**Crypto Context:**
- **Gas Fees:** Very low (~$0.001 per transaction)
- **Speed:** ~2 second block times
- **Bridge:** bridge.base.org for ETH deposits

---

## 7. Crypto/Web3 Terms

### Wallet
**User Perspective:** Your digital identity and token storage. Connect to access all features.

**Developer Perspective:** Ethereum address. Supported: Coinbase Wallet, MetaMask, WalletConnect, Farcaster.

**Crypto Context:** Required for tips, subscriptions, earning $VIBES. Not required for basic listening.

---

### Gas Fees
**User Perspective:** Small transaction fees paid to the network. Very cheap on Base.

**Developer Perspective:** Estimated via Viem, paid in ETH. Typically <$0.01 on Base.

**Crypto Context:** User pays gas for: tips, subscriptions, station creation, NFT minting.

---

### DEX (Decentralized Exchange)
**User Perspective:** Where you can buy/sell $RADIO and $VIBES tokens.

**Developer Perspective:** Uniswap V4 on Base. Pool addresses in constants.

**Crypto Context:** No KYC required. Trade directly from wallet.

---

### Clanker
**User Perspective:** The platform that deployed our tokens with built-in liquidity.

**Developer Perspective:** Token factory on Base. Creates ERC-20 with Uniswap V4 pool.

**Crypto Context:**
- **Fixed Supply:** 100B tokens (immutable)
- **LP Locked:** Forever (no rug pull)
- **Creator Vault:** 30% with vesting

---

### Vesting
**User Perspective:** Tokens released gradually over time, not all at once.

**Developer Perspective:** Linear release from Clanker vault contract over 180 days.

**Crypto Context:** Prevents team from dumping tokens. Builds trust.

---

### Burn
**User Perspective:** Tokens permanently destroyed, reducing total supply.

**Developer Perspective:** Call to `burn()` function on token contract.

**Crypto Context:** Deflationary mechanism. Smoke Signals, failed requests burn $VIBES.

---

### Farcaster
**User Perspective:** Decentralized social network. Connect for verified identity and bonus rewards.

**Developer Perspective:** Integration via Farcaster Auth Kit. FID stored in user profile.

**Crypto Context:** Verified Farcaster users get 1.5x $VIBES rewards.

---

## 8. User Actions

### Tip DJ
**Action:** Send $RADIO tokens directly to the DJ as appreciation.

**Cost:** Variable (user chooses amount)

**Token:** $RADIO

**Flow:** User → DJ wallet (100% to DJ)

---

### Subscribe
**Action:** Monthly subscription to a station for premium benefits.

**Cost:** 100-500 $RADIO/month depending on tier

**Token:** $RADIO

**Benefits:** Priority chat, exclusive content, badges

---

### Create Station
**Action:** Launch your own radio station at an available frequency.

**Cost:** 1000 $RADIO (burned)

**Token:** $RADIO

**Result:** You become a DJ, can broadcast, receive tips

---

### Send Reaction
**Action:** Express your mood and contribute to station's Mood Ring.

**Cost:** FREE (earns 5 $VIBES)

**Token:** $VIBES (earned)

**Limit:** 20 reactions per day

---

### Send Smoke Signal
**Action:** Broadcast temporary message to all station listeners.

**Cost:** 10-100 $VIBES (burned)

**Token:** $VIBES

**Duration:** 5 min to 4 hours

---

### Request Song
**Action:** Request content from DJ with staked $VIBES.

**Cost:** 50 $VIBES stake (refundable if fulfilled)

**Token:** $VIBES

**Outcome:** Fulfilled = stake returned, Expired = 50% burned

---

## 9. Developer Reference

### Key Files

| File | Purpose |
|------|---------|
| `src/hooks/useRadio.ts` | Main radio state management (Zustand) |
| `src/constants/frequencies.ts` | Frequency bands, BPM multipliers |
| `src/types/vibes.ts` | TypeScript types for $VIBES features |
| `src/lib/api.ts` | API client functions |
| `src/lib/contracts.ts` | Contract ABIs and addresses |
| `src/constants/addresses.ts` | Contract addresses per network |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/stations` | GET | List all stations |
| `/api/stations/[freq]` | GET | Get station by frequency |
| `/api/tune-in` | POST | Register listener |
| `/api/tune-out` | POST | Unregister listener |
| `/api/presets` | GET/POST | User presets |
| `/api/mood-ring` | GET/POST | Station mood data |
| `/api/achievements` | GET | User achievements |
| `/api/referrals` | GET/POST | Referral system |

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `stations` | Radio station data |
| `presets` | User saved presets |
| `listening_sessions` | Track tune-in/out |
| `chat_messages` | Live chat messages |
| `achievements` | User achievements |
| `subscriptions` | Station subscriptions |
| `referrals` | Referral tracking |

### Smart Contracts

| Contract | Purpose |
|----------|---------|
| `RadioToken` | $RADIO ERC-20 |
| `VibesToken` | $VIBES ERC-20 |
| `RadioCoreRegistry` | Station registry |
| `VibesWrapper` | $VIBES earning/spending logic |

---

## Quick Reference Card

### For Users

| I want to... | Cost | Token |
|--------------|------|-------|
| Listen to radio | FREE | - |
| Save presets | FREE | - |
| Chat with listeners | FREE | - |
| Send mood reaction | FREE (earn 5) | $VIBES |
| Tip a DJ | Variable | $RADIO |
| Subscribe to station | 100-500/mo | $RADIO |
| Send Smoke Signal | 10-100 | $VIBES |
| Request a song | 50 stake | $VIBES |
| Create a station | 1000 (burned) | $RADIO |

### For Developers

| Feature | Hook/Component | API |
|---------|----------------|-----|
| Radio state | `useRadio` | - |
| Token balances | `useTokenBalances` | - |
| Wallet | `useAccount` (wagmi) | - |
| Stations | `RadioCabinet` | `/api/stations` |
| Chat | `LiveChat` | Supabase Realtime |
| Mood Ring | `MoodRingDisplay` | `/api/mood-ring` |

---

**Last Updated:** December 2025
