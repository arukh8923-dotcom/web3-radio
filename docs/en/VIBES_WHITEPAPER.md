# $VIBES Token Whitepaper

## Web3 Radio Social & Engagement Token

**Version 1.0 | December 2025**

---

## Executive Summary

$VIBES is the social and engagement token for the Web3 Radio ecosystem. Unlike $RADIO which focuses on governance and utility, $VIBES is designed to drive engagement, social interaction, and 420 culture community. This token can be earned through activities and spent on social features.

---

## 1. Introduction

### 1.1 Vision

$VIBES creates a social economy where engagement is rewarded and communities can interact in fun and meaningful ways. Inspired by 420 culture, $VIBES brings elements of community, chill vibes, and social bonding to Web3 Radio.

### 1.2 Why $VIBES?

Web3 Radio needs a dual-token system because:

| Aspect | $RADIO | $VIBES |
|--------|--------|--------|
| **Purpose** | Governance & Value | Social & Engagement |
| **How to Get** | Buy on DEX | Distributed from Creator Vault |
| **Supply** | Fixed 100B | Fixed 100B |
| **Target Users** | Investors, DJs | Active Listeners |
| **Spending** | Subscriptions, Tips | Social Features |

### 1.3 420 Culture Integration

$VIBES integrates 420 culture with:
- Special events at 4:20 AM/PM
- 420.0 FM frequency zone
- Community-based vibes
- Chill and inclusive atmosphere

---

## 2. Token Overview

### 2.1 Basic Information

| Parameter | Value |
|-----------|-------|
| **Token Name** | Radio Vibes |
| **Symbol** | VIBES |
| **Network** | Base Mainnet |
| **Token Standard** | ERC-20 |
| **Decimals** | 18 |
| **Total Supply** | 100,000,000,000 VIBES (100B) |
| **Supply Type** | Fixed (Non-mintable, Burnable) |

### 2.2 Deployment via Clanker

$VIBES will be deployed using **Clanker** (clanker.world), Farcaster's native token deployer on Base.

**What is Clanker?**
Clanker is a token deployment platform that creates ERC-20 tokens with built-in liquidity on Uniswap V4. All Clanker tokens have a fixed supply of 100 billion tokens that cannot be changed or minted after deployment.

**Clanker Token Characteristics:**
- **Fixed Supply:** 100,000,000,000 tokens (immutable)
- **Non-mintable:** No new tokens can be created after deployment
- **Burnable:** Tokens can be burned via `burn()` function
- **Liquidity Locked:** LP NFTs are locked forever in Clanker LP Locker (no withdraw function)

**Clanker Configuration:**

| Feature | Configuration |
|---------|---------------|
| **Network** | Base Mainnet |
| **Pool Type** | Recommended (10 ETH starting mcap) |
| **Fee** | Recommended (Dynamic) |
| **Quote Token** | WETH |
| **Reward Type** | Both (WETH + VIBES) |
| **Creator Rewards** | 100% of LP fees |

**Creator Vault Configuration:**

| Parameter | Value |
|-----------|-------|
| **Vault Percentage** | 30% (30B tokens) |
| **Lockup Period** | 7 days (minimum) |
| **Vesting Period** | 180 days (linear) |

**Token Distribution at TGE:**

| Allocation | Amount | Holder | Status |
|------------|--------|--------|--------|
| **Liquidity Pool** | 70B (70%) | Uniswap V4 Pool | Locked forever for trading |
| **Creator Vault** | 30B (30%) | Clanker Vault Contract → Team | Claimable after vesting |

**Important Notes:**
- The 70B in Liquidity Pool is **not owned by anyone** - it provides market liquidity and is locked forever
- The 30B in Creator Vault is **owned by the project team** but locked in Clanker's vault contract until vesting completes
- Team must **claim** tokens from vault (not automatically sent to wallet)
- Creator earns **100% of LP trading fees** as passive income

**420 Culture Integration:**

While Clanker's fixed 100B supply cannot be customized, the 420 culture is deeply integrated into $VIBES through:

| Element | 420 Integration |
|---------|-----------------|
| **4:20 Events** | 420 VIBES bonus at 4:20 AM/PM daily |
| **Achievement Rewards** | 420, 4,200, 42,000 VIBES milestones |
| **Weekly Drops** | 69-420 VIBES community airdrops |
| **Burn Amounts** | Multiples of 420 for social features |
| **Special Events** | 420,000 VIBES for major celebrations |
| **Mood Ring** | 420 frequency zone (420.0 FM) |

*"100 Billion VIBES for infinite good vibes - with 420 culture in every interaction"*

### 2.3 Contract Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   $VIBES ECOSYSTEM                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐      ┌─────────────────┐           │
│  │  Clanker Token  │      │  VibesWrapper   │           │
│  │  (Base ERC-20)  │◄────►│  (Non-mintable) │           │
│  └─────────────────┘      └────────┬────────┘           │
│                                    │                     │
│      ┌─────────────────────────────┼─────────────────┐  │
│      │              │              │              │   │  │
│      ▼              ▼              ▼              ▼   │  │
│  ┌────────┐   ┌──────────┐   ┌──────────┐   ┌───────┐│  │
│  │Rewards │   │ Spending │   │  Mood    │   │ Burn  ││  │
│  │  Pool  │   │  Module  │   │  Ring    │   │Module ││  │
│  └────────┘   └──────────┘   └──────────┘   └───────┘│  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Tokenomics

### 3.1 Total Supply Distribution

```
Total Supply: 100,000,000,000 VIBES (100 Billion)

██████████████████████████████████████████  Liquidity Pool: 70% (70B)
████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░  Creator Vault: 30% (30B)
```

**Clanker Automatic Split:**
| Allocation | Percentage | Amount | Status |
|------------|------------|--------|--------|
| **Liquidity Pool** | 70% | 70,000,000,000 | Locked forever in Uniswap V4 |
| **Creator Vault** | 30% | 30,000,000,000 | For project use |

### 3.2 Creator Vault Allocation (30B)

The 30B Creator Vault tokens will be distributed by the team:

| Sub-Allocation | % of Vault | Amount | Purpose |
|----------------|------------|--------|---------|
| **420 Zone Rewards** | 50% | 15,000,000,000 | Listening rewards, 4:20 events |
| **Community Rewards** | 30% | 9,000,000,000 | Airdrops, achievements, referrals |
| **Team** | 10% | 3,000,000,000 | Core team compensation |
| **Treasury** | 10% | 3,000,000,000 | Development fund |

### 3.3 Vesting Schedule

| Allocation | Lockup | Vesting | Release |
|------------|--------|---------|---------|
| Liquidity Pool (70B) | Forever | N/A | Locked in Uniswap V4 |
| Creator Vault (30B) | 7 days min | 180 days | Linear after lockup |

### 3.4 Token Release Schedule

```
TGE (Day 0):      70,000,000,000 (70%) - Liquidity Pool live
Day 1-7:          0 VIBES              - Creator Vault locked (minimum)
Day 8-187:        ~166,666,667/day     - Creator Vault vesting (180 days)
Day 187:          100,000,000,000 (100%) - Fully unlocked (~6 months)
```

**Note:** Liquidity Pool tokens are locked forever. Creator earns 100% of LP trading fees as passive income.

---

## 4. Earning Mechanisms

### 4.1 Listening Rewards

Earn VIBES just by listening to Web3 Radio.

| Activity | Reward | Limit |
|----------|--------|-------|
| Per 10 minutes tune in | 1 VIBES | 100/day |
| First tune-in today | 69 VIBES | 1/day |
| 1 hour continuous listening | 10 VIBES bonus | 5/day |

**4:20 Multiplier:** 2x rewards during 4:20 AM/PM events

### 4.2 Mood Reactions

Express your mood and earn VIBES.

```
Available Moods:
🧘 CHILL     - Relaxed, peaceful
🔥 HYPE      - Excited, energetic  
💜 MELANCHOLY - Thoughtful, emotional
✨ EUPHORIC  - Happy, transcendent
🍃 ZEN       - Meditative, balanced
```

| Activity | Reward | Limit |
|----------|--------|-------|
| Send reaction | 5 VIBES | 20/day |
| Match station mood | +3 VIBES bonus | - |
| Mood streak (5 consecutive) | +10 VIBES | - |

### 4.3 Special Events

Participate in special events for bonus VIBES.

| Event | Reward | Frequency |
|-------|--------|-----------|
| 4:20 session attendance | 420 VIBES | 2x daily |
| Weekly community drop | 69-420 VIBES | Weekly |
| Special broadcast attendance | 100-1000 VIBES | Variable |
| Holiday events | Variable | Seasonal |

### 4.4 Achievements

Unlock achievements for one-time VIBES rewards.

| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| First Tune | First station tune-in | 100 VIBES |
| Regular Listener | 7-day streak | 420 VIBES |
| Loyal Fan | 30-day streak | 1,000 VIBES |
| Mood Master | Use all 5 moods | 250 VIBES |
| Social Butterfly | 100 chat messages | 500 VIBES |
| Tipper | First tip sent | 200 VIBES |
| Collector | Own 5 Session NFTs | 1,000 VIBES |

### 4.5 Referrals

Invite friends and earn VIBES.

| Milestone | Reward |
|-----------|--------|
| Friend joins | 50 VIBES |
| Friend's first active week | 100 VIBES |
| Friend subscribes | 200 VIBES |
| 10 successful referrals | 1,000 VIBES bonus |

---

## 5. Spending Mechanisms

### 5.1 Smoke Signals

Send temporary messages that disappear after a set time.

| Duration | Cost | Visibility |
|----------|------|------------|
| 5 minutes | 10 VIBES | Entire station |
| 15 minutes | 25 VIBES | Entire station |
| 1 hour | 50 VIBES | Entire station |
| 4 hours 20 minutes | 100 VIBES | Entire station |

**Mechanism:** 100% burned (deflationary)

### 5.2 Request Line

Request songs or content from DJs.

| Action | Cost | Mechanism |
|--------|------|-----------|
| Send request | 50 VIBES stake | Refundable |
| Boost priority | +25 VIBES | Burned |
| Request fulfilled | Stake returned | - |
| Request expires | 50% burned, 50% returned | - |

### 5.3 Mood Boost

Amplify the impact of your reactions.

| Boost Level | Cost | Effect |
|-------------|------|--------|
| 2x weight | 25 VIBES | Double mood impact |
| 5x weight | 50 VIBES | 5x mood impact |
| 10x weight | 100 VIBES | 10x mood impact |

### 5.4 Custom Features

Unlock personalization options.

| Feature | Cost | Duration |
|---------|------|----------|
| Custom emoji reaction | 100 VIBES | Permanent |
| Chat badge | 200 VIBES | 30 days |
| Profile frame | 150 VIBES | 30 days |
| Username color | 100 VIBES | 30 days |

### 5.5 Hotbox Room Access

Enter private token-gated rooms.

| Room Type | Minimum Balance | Spending |
|-----------|-----------------|----------|
| Public Hotbox | 100 VIBES | None (hold) |
| Premium Hotbox | 500 VIBES | None (hold) |
| VIP Hotbox | 1,000 VIBES | None (hold) |
| Exclusive Event | Variable | Entry fee |

### 5.6 Aux Pass Priority

Skip the queue for DJ control.

| Action | Cost |
|--------|------|
| Join queue | Free |
| Skip 1 position | 50 VIBES |
| Skip to front | 200 VIBES |
| Extend session +5 min | 100 VIBES |

---

## 6. Burn vs Transfer Economics

### 6.1 Burned (Deflationary)

These actions permanently remove VIBES from circulation:

| Action | Burn Rate |
|--------|-----------|
| Smoke Signal | 100% |
| Custom emoji unlock | 100% |
| Failed request (partial) | 50% |
| Priority boost | 100% |

### 6.2 Transferred (Circulating)

These actions move VIBES between users:

| Action | Recipient |
|--------|-----------|
| Fulfilled request | DJ |
| Hotbox entry fee | Room creator |
| Aux Pass priority | Station treasury |
| Event tickets | Event organizer |

### 6.3 Supply Dynamics

```
TGE:              70B (70%) - Liquidity Pool (locked forever)
Month 1:          70B (70%) - Creator Vault still locked
Month 3:          85B (85%) - Vault 50% vested
Month 6:          100B (100%) - Fully unlocked

Deflationary Pressure: Burns via burn() reduce total supply over time
```

### 6.4 Creator Revenue

Token creator earns passive income from trading:
- **100% of LP fees** from Uniswap V4 pool (via clanker.world deployment)
- **Clanker platform fee:** 20% of LP fees (separate from creator rewards)
- Claimable at: `clanker.world/clanker/TOKEN_ADDRESS/admin`

**Note:** The 20% Clanker fee is charged separately at the pool level, not deducted from creator rewards.

---

## 7. Mood Ring System

### 7.1 Overview

Mood Ring is a collective mood indicator for each station, determined by listener reactions.

### 7.2 Mood Calculation

```
Station Mood = Weighted Average of Recent Reactions

Weight Factors:
- Recency (newer = higher weight)
- Boost level (paid boosts increase weight)
- User reputation (active users = higher weight)
```

### 7.3 Mood Effects

| Mood | Visual Effect | Audio Effect |
|------|---------------|--------------|
| CHILL | Cool blue glow | Ambient undertones |
| HYPE | Pulsing red/orange | Beat emphasis |
| MELANCHOLY | Purple haze | Reverb enhancement |
| EUPHORIC | Rainbow shimmer | Brightness boost |
| ZEN | Soft green aura | Noise reduction |

### 7.4 Mood Rewards

Matching station mood gives bonus VIBES:

- Mood match: +3 VIBES per reaction
- Mood shift contributor: +10 VIBES (if your reaction shifts mood)
- Mood streak: +5 VIBES per consecutive match

---

## 8. Anti-Abuse Mechanisms

### 8.1 Rate Limiting

| Action | Limit | Cooldown |
|--------|-------|----------|
| Reactions | 20/day | Reset 00:00 UTC |
| Smoke Signals | 10/day | 1 hour between signals |
| Request Line | 5/day | 30 min between requests |
| Listening rewards | 100 VIBES/day | Continuous |

### 8.2 Sybil Resistance

1. **Farcaster Verification** - Verified accounts get 1.5x rewards
2. **Minimum Balance** - Some features require VIBES holdings
3. **Activity Score** - Historical engagement affects multiplier
4. **Attestations** - EAS attestations for trusted users

### 8.3 Cooldown Periods

- New accounts: 24-hour cooldown before earning
- Large withdrawals: 1-hour delay
- Suspicious activity: Temporary earning pause

---

## 9. Technical Implementation

### 9.1 Smart Contract

**VibesTokenWrapper.sol**
```solidity
contract VibesTokenWrapper {
    IERC20 public immutable vibesToken;
    uint256 public constant MAX_SUPPLY = 420_690_000 * 1e18;
    
    // Minting (limited)
    function mint(address to, uint256 amount) external onlyAuthorized;
    
    // Core functions
    function react(uint256 freq, Mood mood) external;
    function sendSignal(uint256 freq, string calldata msg, uint256 duration) external;
    function spendVibes(uint256 amount, string calldata action) external;
    
    // View functions
    function getMoodRing(uint256 freq) external view returns (Mood);
}
```

### 9.2 Mood Enum

```solidity
enum Mood {
    CHILL,      // 0
    HYPE,       // 1
    MELANCHOLY, // 2
    EUPHORIC,   // 3
    ZEN         // 4
}
```

### 9.3 Events

```solidity
event Reaction(address indexed listener, uint256 indexed frequency, Mood mood);
event MoodRingUpdated(uint256 indexed frequency, Mood newMood);
event VibesSpent(address indexed user, uint256 amount, string action);
event VibesBurned(address indexed user, uint256 amount, string reason);
event SignalSent(uint256 indexed signalId, address indexed sender, uint256 expiryTime);
```

---

## 10. Roadmap (2026)

### Q1 2026: Launch
- [ ] Deploy $VIBES via Clanker on Base
- [ ] Configure Creator Vault & Airdrop vesting
- [ ] Launch VibesWrapper contract
- [ ] Enable basic earning (listening, reactions)
- [ ] Mood Ring v1

### Q2 2026: Social Features
- [ ] Smoke Signals
- [ ] Request Line
- [ ] Hotbox Rooms
- [ ] Achievement system

### Q3 2026: Advanced Features
- [ ] Aux Pass system
- [ ] Custom features marketplace
- [ ] Cross-station mood events
- [ ] Community drops via Chainlink VRF

### Q4 2026: Ecosystem
- [ ] Third-party integrations
- [ ] VIBES staking for boosted rewards
- [ ] Governance participation (advisory)
- [ ] Mobile-first features

---

## 11. Comparison: $RADIO vs $VIBES

| Aspect | $RADIO | $VIBES |
|--------|--------|--------|
| **Primary Use** | Governance, Value | Social, Engagement |
| **How to Get** | Buy on DEX | Distributed from Creator Vault |
| **Total Supply** | 100B (Clanker fixed) | 100B (Clanker fixed) |
| **Creator Vault** | 30B (30%) | 30B (30%) |
| **Burn Mechanism** | Station launches | Social features |
| **Governance** | Full voting rights | Advisory only |
| **Target Audience** | Investors, DJs | Active listeners |
| **Value Proposition** | Store of value | Utility token |

---

## 12. Conclusion

$VIBES creates a fun and engaging social economy within Web3 Radio. By rewarding active participation and enabling social features, $VIBES ensures that the most engaged community members are recognized and rewarded. The limited inflation model provides sustainable rewards while burn mechanisms create long-term deflationary pressure.

Together with $RADIO, the dual-token system creates a balanced ecosystem where both value investors and active participants can thrive.

---

## Legal Disclaimer

This whitepaper is for informational purposes only and does not constitute financial advice, investment recommendation, or solicitation to purchase tokens. $VIBES tokens are utility tokens designed for use within the Web3 Radio platform and should not be considered securities. Cryptocurrency investments carry significant risks. Please do your own research before participating.

---

**Contact:**
- Website: [web3radio.fm]
- Farcaster: [@web3radio]
- GitHub: [github.com/web3radio]

**Last Updated:** December 2025
