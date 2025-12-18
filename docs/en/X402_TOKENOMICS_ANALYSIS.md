# Web3 Radio x402 Tokenomics Analysis

## Token Information

### $RADIO Token
- **Contract**: `0xaF0741FB82633a190683c5cFb4b8546123E93B07`
- **Total Supply**: 100,000,000,000 (100B)
- **Creator Vault (Dev)**: 30% = 30,000,000,000 (30B) - unlocked after 7 days
- **Liquidity Pool**: 70% = 70,000,000,000 (70B) - locked forever in Uniswap V4
- **Current Price**: ~$0.00000028 (dynamic, fetched from GeckoTerminal/DexScreener)
- **FDV**: ~$28,000

### $VIBES Token  
- **Contract**: `0xCD6387AfA893C1Ad070c9870B5e9C4c0B5D56b07`
- **Total Supply**: 100,000,000,000 (100B)
- **Creator Vault (Dev)**: 30% = 30,000,000,000 (30B) - unlocked after 7 days
- **Liquidity Pool**: 70% = 70,000,000,000 (70B) - locked forever in Uniswap V4
- **Current Price**: ~$0.00000028 (dynamic, fetched from GeckoTerminal/DexScreener)
- **FDV**: ~$28,000

### Price Data Sources
Prices are fetched dynamically from multiple sources with fallback:
1. **GeckoTerminal** (primary) - `api.geckoterminal.com`
2. **DexScreener** (fallback) - `api.dexscreener.com`
3. **Fallback** - $0.0000003 if all APIs fail

---

## Dynamic USD-Based Pricing

All prices in Web3 Radio are set in **USD** and converted to token amounts dynamically based on current market price. This ensures:
- Consistent pricing regardless of token volatility
- Fair value for users
- Predictable revenue for DJs and platform

### API Endpoint
```
GET /api/token/price

Response:
{
  "radio_usd": 0.00000028,
  "vibes_usd": 0.00000028,
  "eth_usd": 3500,
  "source": "geckoterminal",
  "timestamp": 1734567890000
}
```

---

## Project Features Analysis

### Features Using $RADIO (Utility/Payment Token)
| Feature | Description | USD Price | Token Amount (at $0.00000028) |
|---------|-------------|-----------|-------------------------------|
| **Subscription Basic** | Ad-free listening | $1/month | ~3.57M RADIO |
| **Subscription Premium** | Premium features | $5/month | ~17.86M RADIO |
| **Subscription VIP** | All features + VIP | $20/month | ~71.43M RADIO |
| **Tip Small** | Small tip to DJ | $0.10 | ~357K RADIO |
| **Tip Medium** | Medium tip | $1 | ~3.57M RADIO |
| **Tip Large** | Large tip | $5 | ~17.86M RADIO |
| **Station Creation** | Create basic station | $5 | ~17.86M RADIO |
| **Frequency NFT** | Mint frequency ownership | $10 | ~35.71M RADIO |
| **Recording NFT** | Mint recording | $5 | ~17.86M RADIO |

### Features Using $VIBES (Social/Reward Token)
| Feature | Description | USD Equivalent | Token Amount |
|---------|-------------|----------------|--------------|
| **Smoke Signal 5min** | Ephemeral message | $0.05 | ~178K VIBES |
| **Smoke Signal 10min** | Longer message | $0.10 | ~357K VIBES |
| **Request Line Stake** | Song request | $0.20 | ~714K VIBES |
| **Hotbox Entry** | VIP room access | $5 balance | ~17.86M VIBES |
| **Aux Pass Join** | DJ queue | $0.50 | ~1.78M VIBES |
| **Mood Reaction** | Send reaction | FREE | Earn 100 VIBES |
| **Tune-in Bonus** | Daily bonus | - | Earn 1K VIBES |
| **Listening Reward** | Per 10 min | - | Earn 500 VIBES |
| **Golden Hour** | 4:20 bonus | - | Earn 5K VIBES |

---

## Monthly Token Calculation (100 Users/Day Average)

### Assumptions
- **Active Users**: 100/day average
- **Month Duration**: 30 days
- **Total User Sessions**: 3,000/month (100 × 30)
- **Average Session**: 30 minutes
- **Active Engagement Rate**: 40% (users who interact beyond listening)
- **Token Price**: $0.00000028 per RADIO/VIBES

---

## $VIBES Distribution (Rewards - Platform Pays Out)

### Daily VIBES Rewards Per User (Updated)
| Activity | VIBES/Action | Actions/User/Day | Daily Total | USD Value |
|----------|--------------|------------------|-------------|-----------|
| Tune-in Bonus | 1,000 | 1 | 1,000 | $0.00028 |
| Listening (per 10 min) | 500 | 3 | 1,500 | $0.00042 |
| Send Mood/Vibe | 100 | 2 | 200 | $0.000056 |
| Golden Hour Bonus | 5,000 | 0.2 (20% chance) | 1,000 | $0.00028 |
| Achievement Unlock | 10,000 | 0.1 | 1,000 | $0.00028 |
| Referral Bonus | 50,000 | 0.05 | 2,500 | $0.0007 |
| **Daily Total/User** | | | **~7,200 VIBES** | **~$0.002** |

### Monthly VIBES Outflow (Platform Pays)
```
Daily: 100 users × 7,200 VIBES = 720,000 VIBES (~$0.20)
Monthly: 720,000 × 30 = 21,600,000 VIBES (~$6.05)

With 2x buffer for special events: ~50,000,000 VIBES/month (~$14)
```

---

## $VIBES Consumption (Users Spend - Platform Receives Back)

### Daily VIBES Spending Per Active User (40% engagement)
| Activity | VIBES/Action | Actions/User/Day | Daily Total | USD Value |
|----------|--------------|------------------|-------------|-----------|
| Smoke Signal (5 min) | 178,000 | 0.5 | 89,000 | $0.025 |
| Smoke Signal (10 min) | 357,000 | 0.2 | 71,400 | $0.02 |
| Request Line Stake | 714,000 | 0.1 | 71,400 | $0.02 |
| Aux Pass Join | 1,780,000 | 0.05 | 89,000 | $0.025 |
| **Daily Total/Active User** | | | **~320,800 VIBES** | **~$0.09** |

### Monthly VIBES Inflow (Platform Receives)
```
Active users: 100 × 40% = 40 users
Daily: 40 users × 320,800 VIBES = 12,832,000 VIBES (~$3.59)
Monthly: 12,832,000 × 30 = 384,960,000 VIBES (~$107.79)
```

### Net VIBES Flow
```
Outflow: 50,000,000 VIBES/month (~$14)
Inflow:  384,960,000 VIBES/month (~$107.79)
Net:     +334,960,000 VIBES/month (POSITIVE - sustainable!)
```

---

## $RADIO Flow Analysis (USD-Based Pricing)

### $RADIO is NOT distributed by platform
Users must BUY $RADIO from Uniswap pool to use features.

### Estimated $RADIO Usage Per Active User (USD-Based)
| Activity | USD Price | RADIO Amount | Frequency/Month | Monthly USD |
|----------|-----------|--------------|-----------------|-------------|
| Tip DJ (small) | $0.10 | ~357K | 5 | $0.50 |
| Tip DJ (medium) | $1.00 | ~3.57M | 2 | $2.00 |
| Subscription Basic | $1.00 | ~3.57M | 1 | $1.00 |
| Station Creation | $5.00 | ~17.86M | 0.1 | $0.50 |
| **Monthly/Active User** | | | | **~$4.00** |

### Platform $RADIO Revenue (Fees)
If platform takes 5% fee on transactions:
```
Active users: 40
Monthly volume: 40 × $4.00 = $160 USD
Platform fee (5%): $8 USD/month
```

---

## 30B Creator Vault Allocation Strategy

### $VIBES Allocation (30B Available)
| Purpose | Allocation | Amount | Duration |
|---------|------------|--------|----------|
| User Rewards Pool | 50% | 15,000,000,000 | ~15,000 months at 1M/month |
| DJ Incentives | 20% | 6,000,000,000 | DJ bonuses, competitions |
| Marketing/Airdrops | 15% | 4,500,000,000 | Growth campaigns |
| Team | 10% | 3,000,000,000 | 3-year vesting |
| Treasury | 5% | 1,500,000,000 | Emergency/partnerships |

**At 1M VIBES/month burn rate, rewards pool lasts 15,000 months (1,250 years)**
This is extremely sustainable!

### $RADIO Allocation (30B Available)
| Purpose | Allocation | Amount | Duration |
|---------|------------|--------|----------|
| Ecosystem Development | 40% | 12,000,000,000 | Grants, integrations |
| Team | 20% | 6,000,000,000 | 3-year vesting |
| Marketing | 20% | 6,000,000,000 | Partnerships, listings |
| Treasury | 15% | 4,500,000,000 | Operations |
| Initial Liquidity | 5% | 1,500,000,000 | DEX liquidity boost |

---

## x402 Integration Strategy

x402 enables micropayments in **USDC** directly via HTTP 402 protocol. This provides:
- Stable USD pricing (no token volatility)
- Instant settlement on Base
- No wallet popup needed (server-managed wallets)
- AI agent compatible

### x402 Micropayment Use Cases (USDC)
| Feature | Payment Amount | Description |
|---------|---------------|-------------|
| Premium Stream | $0.001/minute | Pay-per-minute premium content |
| Ad-Free Hour | $0.01/hour | Skip ads for 1 hour |
| NFT High-Res | $0.01 | Download high-res NFT image |
| Recording Download | $0.05 | Download DVR recording |
| DJ Direct Tip | $0.10+ | Tip DJ via x402 |
| Exclusive Content | $0.50+ | Access exclusive broadcasts |

### x402 Revenue Flow
```
User Request → 402 Payment Required → User Signs → CDP Facilitator → USDC to Recipient

Revenue Split:
- DJ Tips: 95% to DJ, 5% platform
- Premium Content: 80% to DJ, 20% platform
- NFT Downloads: 100% to platform
```
| DJ Direct Message | 5 VIBES | VIBES |

### x402 Revenue Model
```
Per-minute streaming: 0.1 RADIO
Average session: 30 minutes = 3 RADIO
Daily premium users (10%): 10 users × 3 RADIO = 30 RADIO
Monthly: 30 × 30 = 900 RADIO platform revenue
```

---

## Summary: 1-Month Token Requirements

### $VIBES (Platform Distributes)
| Category | Amount |
|----------|--------|
| User Rewards | 1,000,000 |
| DJ Bonuses | 200,000 |
| Special Events | 100,000 |
| **Total Monthly** | **1,300,000 VIBES** |

### $RADIO (Platform Receives as Fees)
| Category | Amount |
|----------|--------|
| Transaction Fees (5%) | 7,000 |
| x402 Streaming Fees | 900 |
| **Total Monthly Revenue** | **~8,000 RADIO** |

---

## Sustainability Analysis

### VIBES Sustainability
- **Available**: 15B (rewards pool)
- **Monthly Burn**: 1.3M
- **Runway**: 11,538 months (~962 years)
- **Status**: ✅ EXTREMELY SUSTAINABLE

### RADIO Sustainability  
- **Model**: Users buy from market, platform takes fees
- **No platform distribution needed**
- **Status**: ✅ SELF-SUSTAINING

---

## Recommendations

1. **Start Conservative**: Begin with lower reward rates, increase based on growth
2. **Dynamic Rewards**: Adjust VIBES rewards based on user activity
3. **Burn Mechanism**: Consider burning portion of received VIBES to maintain value
4. **x402 Premium Tier**: Implement pay-per-minute for premium content
5. **DJ Revenue Share**: 95% to DJ, 5% platform fee on all RADIO transactions

---

## Contract Addresses (Update Required)

```typescript
// src/constants/addresses.ts
RADIO_TOKEN: '0xaF0741FB82633a190683c5cFb4b8546123E93B07'
VIBES_TOKEN: '0xCD6387AfA893C1Ad070c9870B5e9C4c0B5D56b07'
```
