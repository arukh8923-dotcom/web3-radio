# Web3 Radio x402 Tokenomics Analysis

## Token Information

### $RADIO Token
- **Contract**: `0xaF0741FB82633a190683c5cFb4b8546123E93B07`
- **Total Supply**: 100,000,000,000 (100B)
- **Creator Vault (Dev)**: 30% = 30,000,000,000 (30B) - unlocked after 7 days
- **Liquidity Pool**: 70% = 70,000,000,000 (70B) - locked forever in Uniswap V4

### $VIBES Token  
- **Contract**: `0xCD6387AfA893C1Ad070c9870B5e9C4c0B5D56b07`
- **Total Supply**: 100,000,000,000 (100B)
- **Creator Vault (Dev)**: 30% = 30,000,000,000 (30B) - unlocked after 7 days
- **Liquidity Pool**: 70% = 70,000,000,000 (70B) - locked forever in Uniswap V4

---

## Project Features Analysis

### Features Using $RADIO (Utility/Payment Token)
| Feature | Description | Token Usage |
|---------|-------------|-------------|
| **Tips** | Tip DJs for good content | User pays RADIO |
| **Subscriptions** | Premium station access | User pays RADIO |
| **Station Creation** | Create new radio station | User pays RADIO (one-time) |
| **Governance** | Vote on platform decisions | User stakes RADIO |
| **Premium Content** | Access exclusive broadcasts | User pays RADIO |
| **Ad Sponsorship** | Buy ad slots on stations | User pays RADIO |

### Features Using $VIBES (Social/Reward Token)
| Feature | Description | Token Usage |
|---------|-------------|-------------|
| **Smoke Signals** | Ephemeral messages | User pays VIBES |
| **Request Line** | Request songs (stake) | User stakes VIBES |
| **Mood Ring** | Send vibes/reactions | Earn VIBES |
| **Session NFT** | Attendance rewards | Earn VIBES |
| **Aux Pass** | Queue for guest DJ | Requires VIBES balance |
| **Backstage Room** | Token-gated VIP rooms | Requires VIBES balance |
| **Community Drops** | Random rewards at Golden Hour | Earn VIBES |
| **Achievements** | Unlock badges | Earn VIBES |
| **Referrals** | Invite new users | Earn VIBES |
| **Listening Rewards** | Passive listening rewards | Earn VIBES |

---

## Monthly Token Calculation (100 Users/Day Average)

### Assumptions
- **Active Users**: 100/day average
- **Month Duration**: 30 days
- **Total User Sessions**: 3,000/month (100 × 30)
- **Average Session**: 30 minutes
- **Active Engagement Rate**: 40% (users who interact beyond listening)

---

## $VIBES Distribution (Rewards - Platform Pays Out)

### Daily VIBES Rewards Per User
| Activity | VIBES/Action | Actions/User/Day | Daily Total |
|----------|--------------|------------------|-------------|
| Tune-in Bonus | 88 | 1 | 88 |
| Listening (per 10 min) | 10 | 3 | 30 |
| Send Mood/Vibe | 5 | 2 | 10 |
| Golden Hour Bonus | 98 | 0.2 (20% chance) | 19.6 |
| Achievement Unlock | 50 | 0.1 | 5 |
| Referral Bonus | 500 | 0.05 | 25 |
| **Daily Total/User** | | | **~178 VIBES** |

### Monthly VIBES Outflow (Platform Pays)
```
Daily: 100 users × 178 VIBES = 17,800 VIBES
Monthly: 17,800 × 30 = 534,000 VIBES

With 2x buffer for special events: ~1,000,000 VIBES/month
```

---

## $VIBES Consumption (Users Spend - Platform Receives Back)

### Daily VIBES Spending Per Active User (40% engagement)
| Activity | VIBES/Action | Actions/User/Day | Daily Total |
|----------|--------------|------------------|-------------|
| Smoke Signal (5 min) | 5 | 1 | 5 |
| Smoke Signal (10 min) | 10 | 0.5 | 5 |
| Request Line Stake | 20 | 0.3 | 6 |
| Backstage Entry | 100 | 0.1 | 10 |
| **Daily Total/Active User** | | | **~26 VIBES** |

### Monthly VIBES Inflow (Platform Receives)
```
Active users: 100 × 40% = 40 users
Daily: 40 users × 26 VIBES = 1,040 VIBES
Monthly: 1,040 × 30 = 31,200 VIBES
```

### Net VIBES Flow
```
Outflow: 1,000,000 VIBES/month
Inflow:     31,200 VIBES/month
Net Cost:  968,800 VIBES/month (~1M VIBES)
```

---

## $RADIO Flow Analysis

### $RADIO is NOT distributed by platform
Users must BUY $RADIO from Uniswap pool to use features.

### Estimated $RADIO Usage Per Active User
| Activity | RADIO/Action | Frequency/Month | Monthly Total |
|----------|--------------|-----------------|---------------|
| Tip DJ (small) | 100 | 5 | 500 |
| Tip DJ (medium) | 500 | 2 | 1,000 |
| Subscription | 1,000 | 1 | 1,000 |
| Station Creation | 10,000 | 0.1 | 1,000 |
| **Monthly/Active User** | | | **~3,500 RADIO** |

### Platform $RADIO Revenue (Fees)
If platform takes 5% fee on transactions:
```
Active users: 40
Monthly volume: 40 × 3,500 = 140,000 RADIO
Platform fee (5%): 7,000 RADIO/month
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

### x402 Micropayment Use Cases
| Feature | Payment Amount | Token |
|---------|---------------|-------|
| Premium Stream Access | 0.1 RADIO/minute | RADIO |
| Ad-Free Listening | 1 RADIO/hour | RADIO |
| Priority Request | 10-100 VIBES | VIBES |
| Exclusive Content | 50-500 RADIO | RADIO |
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
