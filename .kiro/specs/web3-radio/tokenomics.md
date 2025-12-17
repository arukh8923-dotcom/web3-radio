# Web3 Radio Tokenomics

## Overview

Web3 Radio menggunakan dual-token system yang di-deploy via **Clanker** di Base mainnet:

1. **$RADIO** - Governance & Utility Token
2. **$VIBES** - Social & Engagement Token

Kedua token memanfaatkan Clanker untuk:
- Native Farcaster integration
- Built-in liquidity pool
- Social discovery via Farcaster graph
- Verified deployment trust signal

---

## $RADIO Token

### Purpose
Token utama untuk governance, tipping, dan subscription dalam ekosistem Web3 Radio.

### Supply Model

| Parameter | Value |
|-----------|-------|
| **Total Supply** | 420,000,000 RADIO |
| **Decimals** | 18 |
| **Type** | Fixed Supply (No Inflation) |
| **Network** | Base Mainnet |

### Initial Distribution

```
┌─────────────────────────────────────────────────────────────────┐
│                    $RADIO DISTRIBUTION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ████████████████████████████████░░░░░░░░░░  Liquidity: 40%    │
│  ████████████████████░░░░░░░░░░░░░░░░░░░░░░  Community: 25%    │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  DJ Rewards: 15%   │
│  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Team: 10%         │
│  ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Treasury: 7%      │
│  ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Advisors: 3%      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| Allocation | Percentage | Amount | Vesting |
|------------|------------|--------|---------|
| **Liquidity Pool** | 40% | 168,000,000 | Immediate (Clanker LP) |
| **Community Rewards** | 25% | 105,000,000 | 3 years linear |
| **DJ Rewards Pool** | 15% | 63,000,000 | 2 years linear |
| **Team** | 10% | 42,000,000 | 1 year cliff, 2 years linear |
| **Treasury** | 7% | 29,400,000 | DAO controlled |
| **Advisors** | 3% | 12,600,000 | 6 month cliff, 1 year linear |

### Utility Functions

```solidity
// 1. Tipping DJs
function tip(address dj, uint256 amount, uint256 stationFrequency) external;
// Fee: 2% platform fee → Treasury

// 2. Premium Subscriptions
function subscribe(uint256 stationFrequency, uint256 duration) external;
// Rates: 100 RADIO/month, 1000 RADIO/year (17% discount)

// 3. Governance Voting
function vote(uint256 proposalId, bool support) external;
// Weight: 1 RADIO = 1 vote

// 4. Station Token Launch
function launchStationToken(uint256 stationId) external;
// Cost: 1000 RADIO (burned)
```

### Fee Structure

| Action | Fee | Destination |
|--------|-----|-------------|
| Tip | 2% | Treasury |
| Subscription | 5% | Treasury |
| Station Token Launch | 1000 RADIO | Burn |
| Governance Proposal | 10,000 RADIO | Locked during voting |

### Burn Mechanisms

1. **Station Token Launch** - 1000 RADIO burned per launch
2. **Premium Features** - Certain features burn RADIO
3. **Governance Spam Prevention** - Failed proposals lose 10% stake

---

## $VIBES Token

### Purpose
Social token untuk engagement, reactions, dan 420 culture features.

### Supply Model

| Parameter | Value |
|-----------|-------|
| **Initial Supply** | 69,420,000 VIBES |
| **Max Supply** | 420,690,000 VIBES |
| **Decimals** | 18 |
| **Type** | Inflationary with Cap |
| **Network** | Base Mainnet |

### Emission Schedule

```
Year 1: 69,420,000 (initial) + 100,000,000 = 169,420,000
Year 2: +80,000,000 = 249,420,000
Year 3: +60,000,000 = 309,420,000
Year 4: +50,000,000 = 359,420,000
Year 5: +40,000,000 = 399,420,000
Year 6+: +21,270,000 (final emission to cap)
```

### Initial Distribution

| Allocation | Percentage | Amount |
|------------|------------|--------|
| **Liquidity Pool** | 30% | 20,826,000 |
| **420 Zone Rewards** | 40% | 27,768,000 |
| **Community Airdrops** | 20% | 13,884,000 |
| **Team** | 10% | 6,942,000 |

### Earning Mechanisms

```
┌─────────────────────────────────────────────────────────────────┐
│                    VIBES EARNING                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📻 Listening Rewards                                           │
│     • 1 VIBES per 10 minutes tuned in                          │
│     • 2x multiplier during 4:20 events                         │
│     • Max 100 VIBES/day from listening                         │
│                                                                 │
│  🎭 Mood Reactions                                              │
│     • 5 VIBES per reaction (max 20/day)                        │
│     • Bonus if reaction matches station mood                   │
│                                                                 │
│  🎉 Special Events                                              │
│     • 420 VIBES for attending 4:20 sessions                    │
│     • 69 VIBES for first tune-in of the day                    │
│     • Random drops via Chainlink VRF                           │
│                                                                 │
│  🏆 Achievements                                                │
│     • 100-1000 VIBES per achievement unlocked                  │
│     • Streak bonuses for consecutive days                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Spending Mechanisms

| Feature | Cost | Effect |
|---------|------|--------|
| **Smoke Signal** | 10-100 VIBES | Send ephemeral message (burned) |
| **Request Line** | 50 VIBES | Stake for song request |
| **Mood Boost** | 25 VIBES | 2x reaction weight |
| **Custom Emoji** | 100 VIBES | Unlock custom reaction |
| **Hotbox Access** | Variable | Token-gated room entry |
| **Aux Pass Priority** | 200 VIBES | Jump queue position |

### Burn vs Spend

```
BURNED (Deflationary):
├── Smoke Signals (100% burned)
├── Custom Emoji unlock (100% burned)
└── Failed Request Line (50% burned)

TRANSFERRED (Circulating):
├── Request Line fulfilled → DJ receives
├── Hotbox Room → Room creator receives
└── Aux Pass Priority → Station treasury
```

---

## Token Interaction Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOKEN FLOW DIAGRAM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      ┌─────────────┐                            │
│                      │   LISTENER  │                            │
│                      └──────┬──────┘                            │
│                             │                                   │
│              ┌──────────────┼──────────────┐                    │
│              │              │              │                    │
│              ▼              ▼              ▼                    │
│       ┌──────────┐   ┌──────────┐   ┌──────────┐               │
│       │  $RADIO  │   │  $VIBES  │   │   ETH    │               │
│       │  (Buy)   │   │  (Earn)  │   │  (Gas)   │               │
│       └────┬─────┘   └────┬─────┘   └──────────┘               │
│            │              │                                     │
│    ┌───────┴───────┐      │                                     │
│    │               │      │                                     │
│    ▼               ▼      ▼                                     │
│ ┌──────┐      ┌────────┐ ┌────────┐                            │
│ │ TIP  │      │SUBSCRIBE│ │FEATURES│                            │
│ │  DJ  │      │PREMIUM │ │& SOCIAL│                            │
│ └──┬───┘      └───┬────┘ └───┬────┘                            │
│    │              │          │                                  │
│    ▼              ▼          ▼                                  │
│ ┌──────┐      ┌────────┐ ┌────────┐                            │
│ │  DJ  │      │STATION │ │ BURN/  │                            │
│ │WALLET│      │TREASURY│ │TRANSFER│                            │
│ └──────┘      └────────┘ └────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Governance

### $RADIO Governance Powers

1. **Protocol Parameters**
   - Platform fee adjustments (1-5% range)
   - Subscription pricing
   - Emission rate changes

2. **Treasury Management**
   - Fund allocation for development
   - Marketing budget
   - Community grants

3. **Feature Proposals**
   - New feature development
   - Partnership approvals
   - Contract upgrades

### Voting Requirements

| Proposal Type | Quorum | Approval | Voting Period |
|---------------|--------|----------|---------------|
| Parameter Change | 5% | 51% | 3 days |
| Treasury < 10k RADIO | 10% | 51% | 5 days |
| Treasury > 10k RADIO | 15% | 66% | 7 days |
| Contract Upgrade | 20% | 75% | 14 days |

---

## Clanker Deployment Parameters

### $RADIO Deployment

```typescript
const radioDeployParams = {
  name: "Web3 Radio",
  symbol: "RADIO",
  totalSupply: "420000000000000000000000000", // 420M with 18 decimals
  // Clanker handles initial LP creation
  // 40% goes to Uniswap V3 pool on Base
};
```

### $VIBES Deployment

```typescript
const vibesDeployParams = {
  name: "Radio Vibes",
  symbol: "VIBES", 
  totalSupply: "69420000000000000000000000", // 69.42M with 18 decimals
  // Additional minting via wrapper contract
};
```

---

## Wrapper Contracts

Karena Clanker deploy standard ERC-20, kita perlu wrapper contracts untuk extended functionality:

### RadioTokenWrapper

```solidity
contract RadioTokenWrapper {
    IERC20 public immutable radioToken; // Clanker-deployed token
    
    // Extended functions
    function tip(address dj, uint256 amount, uint256 freq) external;
    function subscribe(uint256 freq, uint256 duration) external;
    function vote(uint256 proposalId, bool support) external;
    
    // Fee collection
    function collectFees() external; // Treasury only
}
```

### VibesTokenWrapper

```solidity
contract VibesTokenWrapper {
    IERC20 public immutable vibesToken; // Clanker-deployed token
    
    // Minting (capped)
    function mint(address to, uint256 amount) external; // Authorized only
    
    // Extended functions
    function react(uint256 freq, Mood mood) external;
    function sendSignal(uint256 freq, string calldata msg, uint256 duration) external;
    function spendVibes(uint256 amount, string calldata action) external;
}
```

---

## Anti-Abuse Mechanisms

### Rate Limiting

| Action | Limit | Cooldown |
|--------|-------|----------|
| Reactions | 20/day | Reset at 00:00 UTC |
| Smoke Signals | 10/day | 1 hour between signals |
| Request Line | 5/day | 30 min between requests |
| Listening Rewards | 100 VIBES/day | Continuous |

### Sybil Resistance

1. **Farcaster Verification** - Bonus rewards for verified accounts
2. **Minimum Balance** - Some features require minimum token holdings
3. **Activity Score** - Historical engagement affects reward multipliers
4. **Attestations** - EAS attestations for trusted DJs

---

## Summary

| Metric | $RADIO | $VIBES |
|--------|--------|--------|
| **Total/Max Supply** | 420,000,000 | 420,690,000 |
| **Initial Circulating** | 168,000,000 (40%) | 69,420,000 |
| **Inflation** | None (Fixed) | Capped (~6x over 6 years) |
| **Primary Use** | Governance, Tips, Subs | Social, Engagement |
| **Burn Mechanism** | Yes (Station Launch) | Yes (Smoke Signals) |
| **Earning** | Buy only | Earn through activity |

Angka 420 dan 69 dipilih untuk align dengan 420 culture theme dari Web3 Radio. 🌿📻
