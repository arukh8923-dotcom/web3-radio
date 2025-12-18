# Web3 Radio - Critical Rules & Memory

## CRITICAL RULES (ALWAYS FOLLOW)

### 1. Payment Rules
- **ALL payments use $RADIO and $VIBES tokens ONLY**
- **NO ETH or USDC for transactions**
- Revenue goes to treasury: `0x702AA27b8498EB3F9Ec0431BC5Fd258Bc19faf36`

### 2. Revenue Split (x402 Technology)
- Free DJ: 60% DJ / 40% Treasury
- Verified DJ: 70% DJ / 30% Treasury  
- Premium DJ: 80% DJ / 20% Treasury

### 3. Dynamic Pricing (Context-Based USD Worth)
- **NEVER use hardcoded token amounts** - ALL prices MUST be dynamic
- **NO hardcoded prices in contracts OR frontend** - always fetch from price oracle or API
- Token prices are dynamic, so amounts must be configurable
- Use setter functions to update values post-deployment
- **$5 USD worth is NOT a fixed value** - adjust based on:
  - Context of the file/contract
  - Function purpose and usage
  - User experience considerations
  - Economic balance of the platform
  - Example contexts:
    - Premium status threshold: ~$50-100 USD worth
    - Room creation fee: ~$5 USD worth
    - Proposal threshold: ~$500 USD worth (governance should be meaningful)
    - Tip minimum: ~$0.10-1 USD worth
    - Signal cost per minute: ~$0.05-0.10 USD worth

### 4. Deployment Rules
- **ALWAYS ask user before deploying any contract**
- **Explain what will be deployed and why**
- **NO compiler warnings allowed** - fix ALL warnings before deployment
- **NEVER ignore warnings** - deployment must be 100% clean
- **NEVER use `--force` or skip warning flags**
- If warnings exist, fix them first before proceeding
- Forge path: `& "$env:USERPROFILE\.foundry\bin\forge.exe"`

### 5. Network & Addresses
- Network: Base Mainnet (Chain ID: 8453)
- Treasury: `0x702AA27b8498EB3F9Ec0431BC5Fd258Bc19faf36`
- RADIO Token: `0xaF0741FB82633a190683c5cFb4b8546123E93B07`
- VIBES Token: `0xCD6387AfA893C1Ad070c9870B5e9C4c0B7D56b07`

### 6. Creator Info
- FID: 250705
- Username: ukhy89

### 7. CDP Integration
- Using CDP for RPC and Paymaster (NOT Alchemy)
- RPC: `https://api.developer.coinbase.com/rpc/v1/base/{API_KEY}`

### 8. Confirmation Rule
- If something looks wrong, **CONFIRM with user before proceeding**
- Don't assume - ask first

### 9. Contract Deduplication Rule (CRITICAL)
- **BEFORE creating any new contract/component/file** - check if similar function already exists
- **BEFORE deploying new contract** - verify no duplicate functionality with existing deployed contracts
- **Selaraskan semua kontrak** - ensure no overlapping functions across contracts
- **This is HIGH RISK** - duplicate contracts waste gas and create confusion
- If duplicate found: use existing contract, don't create new one
- Functions to watch: `tip()`, `subscribe()`, `vote()`, `createProposal()`, `broadcast()`

### 10. Zero Warnings Deployment Rule
- **NO compiler warnings allowed** when deploying contracts, tokens, or NFTs
- Must be 100% clean build before deployment
- Run `forge build` and fix ALL warnings first
- Never use `--force` or skip warning flags

### 11. No Sliced/Truncated Values Rule (CRITICAL)
- **NEVER truncate, slice, or highlight parts** of any environment-related values
- This applies to ALL of the following:
  - Addresses: `0xCD6387AfA893C1Ad070c9870B5e9C4c0B7D56b07` (never `0xCD63...b07`)
  - URLs: full URL always (never `https://api...com`)
  - Contract names: full name (never `Radio...Manager`)
  - FIDs: `250705` (never `250...`)
  - API keys: full key or use placeholder `{API_KEY}`
  - Chain IDs: `8453` (never truncate)
  - Any numbers, hashes, or identifiers
- **NEVER use `...` or `**` to indicate truncation**
- If value is too long, still write it completely

### 12. Terminal/RAM Limitation Rule (CRITICAL)
- **User has LIMITED RAM** - maximum 2-3 terminals only
- **NEVER open new terminal** if there's already a process running
- **Wait for existing process to complete** before running new commands
- **Check terminal status first** before executing any command
- If build/test is already running, DO NOT run another one

### 13. Farcaster Mini App Rule (CRITICAL - November 2025+)
- **ALWAYS use Farcaster Mini App SDK** - NOT Frames
- Frames are deprecated for this project
- Reference: https://miniapps.farcaster.xyz/docs
- SDK: `@farcaster/miniapp-sdk`
- Wagmi connector: `@farcaster/miniapp-wagmi-connector`
- Key features:
  - `sdk.actions.ready()` - Signal app loaded
  - `sdk.context` - Get user FID, username, etc.
  - `sdk.wallet.ethProvider` - Ethereum provider
  - `sdk.actions.openUrl()` - Open URLs
  - `sdk.actions.addFrame()` - Prompt to add app
- **NEVER create Frame-specific code** (og:frame, fc:frame meta tags)
- Use `fc:miniapp` meta tag for Mini App embed

---

## DEPLOYED CONTRACT ADDRESSES (Base Mainnet)

| Contract | Address |
|----------|---------|
| RADIO Token | `0xaF0741FB82633a190683c5cFb4b8546123E93B07` |
| VIBES Token | `0xCD6387AfA893C1Ad070c9870B5e9C4c0B7D56b07` |
| RadioCoreRegistry | `0x716D07766eE2B6e62337B052B3501e66d12B8563` |
| StationNFT | `0x938CeF0CD64928330592ff4C58f2076Cf1d31bc3` |
| StationFactory | `0xD4Ff45ae4095EeB7b5650C58d6B7C979d679f560` |
| BroadcastManager | `0xEfa1ac40697efDf229A67f521255A3CBbBD714eC` |
| SubscriptionManager | `0xc39d19eb191714Dde7dc069CA86059Fb5c5C935E` |
| Zone420 | `0x6D4aad448235C1f0275aa06F940dC67695BD0496` |
| SessionNFTFactory | `0xBDbFf9019678D42791D4bc2CA795B56b3Dc0F542` |
| SmokeSignals | `0x20D58d0ef3367C19bbF9D85e4Bd09Ddcfe53BB6f` |
| HotboxRoom | `0x7EaEC34D63D44bcE860f8a97d8c8c6440ad4F56B` |
| AuxPass | `0x1E73B052B3Fd68eE757F70E5a923547445Cb37d5` |
| CommunityDrops | `0xa522Def5D4493ccfBf7ce934DE8aA6F9B11C56f2` |
| RadioGovernance | `0xE429D96A304dfaB96F85EBd618ad527101408ACc` |
| DJAttestations | `0xd10eD354Cd558a4e59F079070d9E75D5181263D0` |
| RadioPaymaster | `0x6e3cbf3F9C5E8F7932cBf8CDA389b69Ad246914b` |
| Treasury | `0x702AA27b8498EB3F9Ec0431BC5Fd258Bc19faf36` |

---

## CONTRACT AUDIT RESULTS

### Hardcoded Values Found (Need Admin Update)

All contracts below have **setter functions** to update values post-deployment.
Call these functions to set proper ~$5 USD worth values:

#### 1. RadioPaymaster.sol ✅ HAS SETTER
- `premiumThreshold = 1000 * 1e18` (1000 RADIO) - TOO LOW
- **Fix**: Call `setPremiumConfig(newThreshold, multiplier)`
- Recommended: Set to ~$50 USD worth of RADIO for premium status

#### 2. Zone420.sol ✅ HAS SETTER
- `vibesPerMinute = 10 * 1e18` (10 VIBES/min)
- **Fix**: Call `setVibesPerMinute(newRate)`
- Recommended: Adjust based on VIBES price

#### 3. SmokeSignals.sol ✅ HAS SETTER
- `costPerMinute = 5 * 1e18` (5 VIBES/min)
- **Fix**: Call `setCostPerMinute(newCost)`
- Recommended: ~$0.10 USD per minute

#### 4. HotboxRoom.sol ✅ HAS SETTER
- `roomCreationFee = 100 * 1e18` (100 RADIO)
- **Fix**: Call `setRoomCreationFee(newFee)`
- Recommended: ~$5 USD worth of RADIO

#### 5. RadioGovernance.sol ✅ HAS SETTER
- `proposalThreshold = 10000 * 1e18` (10K RADIO)
- **Fix**: Call `setConfig(votingDelay, votingPeriod, proposalThreshold, quorumPercentage)`
- Recommended: ~$500 USD worth of RADIO for proposals

#### 6. CommunityDrops.sol ✅ HAS SETTER
- `defaultDropAmount = 420 * 1e18` (420 tokens)
- **Fix**: Call `setDefaultDropAmount(newAmount)`
- Recommended: ~$20 USD worth per drop

#### 7. StationNFT.sol ✅ HAS SETTER
- `mintFeeRadio` and `premiumMintFeeRadio` - set at deployment
- **Fix**: Call `setMintFee(newFee, isPremium)`
- Recommended: ~$10 USD standard, ~$50 USD premium

#### 8. StationFactory.sol ✅ HAS SETTER
- `creationFeeRadio` and `premiumCreationFeeRadio` - set at deployment
- **Fix**: Call `setCreationFees(newFee, newPremiumFee)`

---

## DUPLICATE/REDUNDANT CONTRACTS FOUND

### Issue: RadioTokenWrapper.sol & VibeTokenWrapper.sol
These contracts have **duplicate functionality** with other contracts:
- Tipping → Already in `SubscriptionManager.sol` and `Station.sol`
- Subscription → Already in `SubscriptionManager.sol`
- Governance → Already in `RadioGovernance.sol`

**Recommendation**: 
- These wrapper contracts are NOT deployed
- Use the main contracts instead (SubscriptionManager, RadioGovernance)
- Consider removing these files to avoid confusion

### Contracts with Similar Functions:
| Function | Found In |
|----------|----------|
| `tip()` | Station.sol, SubscriptionManager.sol, RadioTokenWrapper.sol, VibeTokenWrapper.sol |
| `subscribe()` | Station.sol, SubscriptionManager.sol, RadioTokenWrapper.sol, VibeTokenWrapper.sol |
| `vote()` | RadioGovernance.sol, RadioTokenWrapper.sol, VibeTokenWrapper.sol |
| `createProposal()` | RadioGovernance.sol, RadioTokenWrapper.sol, VibeTokenWrapper.sol |

---

## CONTRACTS WITHOUT HARDCODED TOKEN AMOUNTS ✅

These contracts are clean (no hardcoded token amounts):
- BroadcastManager.sol ✅
- DJAttestations.sol ✅
- SessionNFTFactory.sol ✅
- RadioCoreRegistry.sol ✅
- Station.sol ✅ (fees set by owner)
- MultiSigStation.sol ✅
- AuxPass.sol ✅ (minStake set per station)

---

## ADMIN FUNCTIONS TO CALL (Post-Deployment)

To update hardcoded values to dynamic ~$5 USD worth:

```solidity
// RadioPaymaster - Set premium threshold (~$50 USD worth)
RadioPaymaster.setPremiumConfig(newThreshold, 3);

// Zone420 - Set vibes per minute
Zone420.setVibesPerMinute(newRate);

// SmokeSignals - Set cost per minute (~$0.10/min)
SmokeSignals.setCostPerMinute(newCost);

// HotboxRoom - Set room creation fee (~$5 USD)
HotboxRoom.setRoomCreationFee(newFee);

// RadioGovernance - Set proposal threshold (~$500 USD)
RadioGovernance.setConfig(votingDelay, votingPeriod, newThreshold, quorumPercentage);

// CommunityDrops - Set drop amount (~$20 USD)
CommunityDrops.setDefaultDropAmount(newAmount);

// StationNFT - Set mint fees
StationNFT.setMintFee(newFee, false); // Standard ~$10 USD
StationNFT.setMintFee(newPremiumFee, true); // Premium ~$50 USD

// StationFactory - Set creation fees
StationFactory.setCreationFees(newFee, newPremiumFee);
```

---

## COMPILER WARNINGS

Before any deployment, ensure:
1. Run `forge build` with no warnings
2. Fix all unused variable warnings
3. Fix all visibility warnings
4. No deprecated function usage

---

## x402 TECHNOLOGY COMPLIANCE

All payment contracts implement x402 revenue split:
- ✅ Station.sol - `_calculateSplit()` function
- ✅ SubscriptionManager.sol - `_calculateSplit()` function
- ✅ RadioTokenWrapper.sol - (not deployed, redundant)
- ✅ VibeTokenWrapper.sol - (not deployed, redundant)

Revenue always goes to:
1. DJ (60-80% based on tier)
2. Treasury (20-40% based on tier)

---

## CDP INTEGRATION STATUS

- ✅ CDP RPC configured in `.env.local`
- ✅ RadioPaymaster deployed for gas sponsorship
- ✅ Frontend hooks created (`usePaymaster.ts`)
- ✅ UI components created (`SponsoredTxIndicator.tsx`)

---

## FRONTEND AUDIT STATUS (December 18, 2025)

### Centralized Addresses ✅
All contract addresses now use centralized config from `src/constants/addresses.ts`:
- ✅ `src/lib/contracts.ts` - Updated to use CONTRACTS from addresses.ts
- ✅ `src/lib/zone420.ts` - Uses CONTRACTS.ZONE_420
- ✅ `src/lib/governance.ts` - Uses CONTRACTS.RADIO_GOVERNANCE
- ✅ `src/lib/smokeSignals.ts` - Uses CONTRACTS.SMOKE_SIGNALS
- ✅ `src/lib/hotboxRoom.ts` - Uses CONTRACTS.HOTBOX_ROOM
- ✅ `src/lib/communityDrops.ts` - Uses CONTRACTS.COMMUNITY_DROPS
- ✅ `src/lib/sessionNFT.ts` - Uses CONTRACTS.SESSION_NFT_FACTORY
- ✅ `src/lib/auxPass.ts` - Uses CONTRACTS.AUX_PASS
- ✅ `src/lib/djAttestations.ts` - Uses CONTRACTS.DJ_ATTESTATIONS
- ✅ `src/lib/stationNFT.ts` - Uses CONTRACTS.STATION_NFT
- ✅ `src/lib/stationFactory.ts` - Uses CONTRACTS.STATION_FACTORY
- ✅ `src/lib/broadcastManager.ts` - Uses CONTRACTS.BROADCAST_MANAGER
- ✅ `src/lib/paymaster.ts` - Uses CONTRACTS.RADIO_PAYMASTER
- ✅ `src/lib/x402.ts` - Uses CONTRACTS and TREASURY_ADDRESS

### Payment Validation ✅
- ✅ `src/app/api/tips/route.ts` - Enforces RADIO/VIBES only (rejects ETH/USDC)
- ✅ `src/components/radio/TipDJModal.tsx` - Uses RADIO_TOKEN_ADDRESS for API calls

### Fixed Issues
1. **VIBES Token Address Typo** - Fixed in addresses.ts and x402.ts
   - Was: `0xCD6387AfA893C1Ad070c9870B5e9C4c0B**5**D56b07` (wrong)
   - Now: `0xCD6387AfA893C1Ad070c9870B5e9C4c0B**7**D56b07` (correct)

2. **Empty Contract Addresses** - All deployed addresses now populated in addresses.ts

3. **API Tips Validation** - Now requires token_address and validates against RADIO/VIBES only

---

## PENDING USER DECISIONS

1. **Delete duplicate contracts?**
   - `contracts/src/RadioTokenWrapper.sol`
   - `contracts/src/VibeTokenWrapper.sol`
   - These have duplicate functionality with deployed contracts

2. **Update hardcoded values via admin calls?**
   - Need to call setter functions on deployed contracts
   - Values should be based on current token prices

---

*Last Updated: December 18, 2025*
