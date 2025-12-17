# $RADIO Token Whitepaper

## Web3 Radio Governance & Utility Token

**Version 1.0 | December 2025**

---

## Executive Summary

$RADIO is the primary governance and utility token for the Web3 Radio ecosystem, the first fully decentralized radio platform running entirely on-chain on Base mainnet. This token provides governance rights, premium access, and tipping mechanisms to support the creator economy within the Web3 radio ecosystem.

---

## 1. Introduction

### 1.1 Vision

Web3 Radio transforms the traditional radio industry into the Web3 era, where every station is a smart contract, every broadcast is an on-chain event, and every interaction is a blockchain transaction. The $RADIO token serves as the economic backbone of this ecosystem.

### 1.2 Problem Statement

Traditional radio faces several challenges:
- **Centralization** - Content controlled by large corporations
- **Unfair monetization** - DJs and creators receive a small share of revenue
- **Lack of ownership** - Listeners have no stake in the platform
- **No governance** - Community cannot influence platform direction

### 1.3 Solution

$RADIO token addresses these issues through:
- **Decentralized governance** - Holders determine platform direction
- **Direct monetization** - Tips go directly to DJs without intermediaries
- **Community ownership** - Token holders are platform stakeholders
- **Transparent economics** - All transactions are on-chain and verifiable

---

## 2. Token Overview

### 2.1 Basic Information

| Parameter | Value |
|-----------|-------|
| **Token Name** | Web3 Radio |
| **Symbol** | RADIO |
| **Network** | Base Mainnet |
| **Token Standard** | ERC-20 |
| **Decimals** | 18 |
| **Total Supply** | 100,000,000,000 RADIO (100B) |
| **Supply Type** | Fixed (Non-mintable, Burnable) |

### 2.2 Deployment via Clanker

$RADIO will be deployed using **Clanker** (clanker.world), Farcaster's native token deployer on Base.

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
| **Reward Type** | Both (WETH + RADIO) |
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

**Benefits:**
- Native Farcaster integration & social discovery
- Built-in Uniswap V4 liquidity (locked forever)
- 100% LP fees as creator passive income
- On-chain lockup & vesting via Creator Vault
- No need to buy tokens - 30% allocated to creator

### 2.3 Contract Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   $RADIO ECOSYSTEM                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐      ┌─────────────────┐           │
│  │  Clanker Token  │      │  RadioWrapper   │           │
│  │  (Base ERC-20)  │◄────►│  (Extended)     │           │
│  └─────────────────┘      └────────┬────────┘           │
│                                    │                     │
│           ┌────────────────────────┼────────────────┐   │
│           │                        │                │   │
│           ▼                        ▼                ▼   │
│  ┌─────────────┐         ┌─────────────┐   ┌───────────┐│
│  │   Tipping   │         │Subscription │   │Governance ││
│  │   System    │         │  Manager    │   │  Module   ││
│  └─────────────┘         └─────────────┘   └───────────┘│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Tokenomics

### 3.1 Total Supply Distribution

```
Total Supply: 100,000,000,000 RADIO (100 Billion)

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
| **Community Rewards** | 50% | 15,000,000,000 | Listener rewards, airdrops, campaigns |
| **DJ Rewards Pool** | 30% | 9,000,000,000 | Creator incentives, broadcast rewards |
| **Team** | 10% | 3,000,000,000 | Core team compensation |
| **Treasury** | 10% | 3,000,000,000 | DAO-controlled development fund |

### 3.3 Vesting Schedule

| Allocation | Lockup | Vesting | Release |
|------------|--------|---------|---------|
| Liquidity Pool (70B) | Forever | N/A | Locked in Uniswap V4 |
| Creator Vault (30B) | 7 days min | 180 days | Linear after lockup |

### 3.4 Token Release Schedule

```
TGE (Day 0):      70,000,000,000 (70%) - Liquidity Pool live
Day 1-7:          0 RADIO              - Creator Vault locked (minimum)
Day 8-187:        ~166,666,667/day     - Creator Vault vesting (180 days)
Day 187:          100,000,000,000 (100%) - Fully unlocked (~6 months)
```

**Note:** Liquidity Pool tokens are locked forever. Creator earns 100% of LP trading fees as passive income.

---

## 4. Utility & Use Cases

### 4.1 Tipping System

DJs and creators can receive tips directly from listeners.

```solidity
function tip(address dj, uint256 amount, uint256 stationFrequency) external;
```

**Fee Structure:**
- Platform fee: 2%
- DJ receives: 98%

**Example:**
- Listener tips 100 RADIO
- DJ receives 98 RADIO
- Treasury receives 2 RADIO

### 4.2 Premium Subscriptions

Listeners can subscribe to premium stations for exclusive access.

| Tier | Price (RADIO/month) | Benefits |
|------|---------------------|----------|
| Basic | 100 | Exclusive chat rooms, custom emoji |
| Premium | 300 | + Priority song requests, subscriber badge |
| VIP | 1,000 | + Direct DJ access, NFT drops, governance boost |

**Annual Discount:** 17% (10 months price for 12 months)

### 4.3 Station Token Launch

DJs can launch their own station tokens.

- **Cost:** 1,000 RADIO (burned)
- **Benefit:** Custom token for station-specific economy
- **Mechanism:** Deflationary pressure on supply

### 4.4 Governance Voting

Token holders can participate in governance.

```solidity
function vote(uint256 proposalId, bool support) external;
// Weight: 1 RADIO = 1 vote
```

---

## 5. Governance

### 5.1 Governance Powers

$RADIO holders can vote on:

1. **Protocol Parameters**
   - Platform fee adjustments (1-5% range)
   - Subscription pricing tiers
   - Reward emission rates

2. **Treasury Management**
   - Development fund allocation
   - Marketing budget
   - Community grants

3. **Feature Proposals**
   - New feature development
   - Partnership approvals
   - Contract upgrades

### 5.2 Voting Requirements

| Proposal Type | Quorum | Approval | Voting Period |
|---------------|--------|----------|---------------|
| Parameter Change | 5% | 51% | 3 days |
| Treasury < 10k RADIO | 10% | 51% | 5 days |
| Treasury > 10k RADIO | 15% | 66% | 7 days |
| Contract Upgrade | 20% | 75% | 14 days |

### 5.3 Proposal Process

1. **Discussion** - Forum discussion (min 3 days)
2. **Snapshot** - Off-chain signal voting
3. **On-chain Voting** - Formal governance vote
4. **Timelock** - 48-hour delay before execution
5. **Execution** - Automatic or manual execution

---

## 6. Economic Model

### 6.1 Value Accrual

$RADIO accrues value through:

1. **Fee Revenue** - 2% of all tips go to treasury
2. **Subscription Revenue** - 5% platform fee
3. **Token Burns** - Station launches burn RADIO
4. **Governance Utility** - Voting rights create demand

### 6.2 Burn Mechanisms

| Action | Burn Amount | Frequency |
|--------|-------------|-----------|
| Station Token Launch | 1,000 RADIO | Per launch |
| Premium Feature Unlock | Variable | Per unlock |
| Failed Governance Proposal | 10% of stake | Per failed proposal |

### 6.3 Demand Drivers

- **Tipping** - Active listeners need RADIO to tip
- **Subscriptions** - Premium access requires RADIO
- **Governance** - Voting requires RADIO holdings
- **Station Launches** - DJs need RADIO to launch tokens
- **Speculation** - Trading activity on DEX

### 6.4 Supply Dynamics

```
TGE:              70B (70%) - Liquidity Pool (locked forever)
Month 1:          70B (70%) - Creator Vault still locked
Month 3:          85B (85%) - Vault 50% vested
Month 6:          100B (100%) - Fully unlocked

Deflationary Pressure: Burns via burn() reduce total supply over time
```

### 6.5 Creator Revenue

Token creator earns passive income from trading:
- **100% of LP fees** from Uniswap V4 pool (via clanker.world deployment)
- **Clanker platform fee:** 20% of LP fees (separate from creator rewards)
- Claimable at: `clanker.world/clanker/TOKEN_ADDRESS/admin`

**Note:** The 20% Clanker fee is charged separately at the pool level, not deducted from creator rewards.

---

## 7. Technical Implementation

### 7.1 Smart Contract

**RadioTokenWrapper.sol**
```solidity
contract RadioTokenWrapper {
    IERC20 public immutable radioToken; // Clanker deploy
    
    // Core functions
    function tip(address dj, uint256 amount, uint256 freq) external;
    function subscribe(uint256 freq, uint256 duration) external;
    function vote(uint256 proposalId, bool support) external;
    
    // Admin functions
    function setFeeRate(uint256 newRate) external onlyGovernance;
    function collectFees() external onlyTreasury;
}
```

### 7.2 Security Measures

- **Audits** - Smart contract audits before mainnet
- **Timelock** - 48-hour delay on governance actions
- **Multi-sig** - Treasury controlled by 3/5 multi-sig
- **Rate Limiting** - Anti-spam measures on tipping

### 7.3 Upgradability

- Core token: Non-upgradeable (Clanker standard)
- Wrapper contracts: Upgradeable via governance
- Governance: Time-locked upgrades only

---

## 8. Roadmap (2026)

### Q1 2026: Launch
- [ ] Deploy $RADIO via Clanker on Base
- [ ] Configure Creator Vault & Airdrop vesting
- [ ] Launch RadioTokenWrapper contract
- [ ] Enable tipping functionality
- [ ] Initial liquidity provision

### Q2 2026: Growth
- [ ] Launch subscription system
- [ ] Enable governance voting
- [ ] Station token launch feature
- [ ] Farcaster Frames integration

### Q3 2026: Expansion
- [ ] Mobile app integration
- [ ] Partnership integrations
- [ ] Advanced governance features
- [ ] Community grants program

### Q4 2026: Maturity
- [ ] Cross-chain bridge (Arbitrum, Ethereum)
- [ ] Full DAO transition
- [ ] Protocol revenue sharing
- [ ] Ecosystem fund launch

---

## 9. Risk Factors

### 9.1 Market Risks
- Cryptocurrency market volatility
- Regulatory uncertainty
- Competition from other platforms

### 9.2 Technical Risks
- Smart contract vulnerabilities
- Network congestion on Base
- Oracle failures

### 9.3 Operational Risks
- Team execution risk
- Community adoption challenges
- Liquidity constraints

### 9.4 Mitigation
- Security audits and bug bounties
- Diversified treasury management
- Gradual feature rollout
- Community-first approach

---

## 10. Conclusion

The $RADIO token is the economic foundation for Web3 Radio, providing governance rights, utility, and value accrual mechanisms that align the interests of all stakeholders. With a fixed supply, clear utility, and community-driven governance, $RADIO is designed for sustainable long-term growth.

---

## Legal Disclaimer

This whitepaper is for informational purposes only and does not constitute financial advice, investment recommendation, or solicitation to purchase tokens. $RADIO tokens are utility tokens and should not be considered securities. Cryptocurrency investments carry significant risks. Please do your own research and consult with a financial advisor before making investment decisions.

---

**Contact:**
- Website: [web3radio.fm]
- Farcaster: [@web3radio]
- GitHub: [github.com/web3radio]

**Last Updated:** December 2025
