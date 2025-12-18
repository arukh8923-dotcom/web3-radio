# Web3 Radio Smart Contracts

## Deployed Contracts (Base Mainnet)

| Contract | Address |
|----------|---------|
| $RADIO Token (Clanker) | `0xaF0741FB82633a190683c5cFb4b8546123E93B07` |
| RadioTokenWrapper | *Pending deployment* |

## Setup

1. Install Foundry:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. Install dependencies:
```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit
```

3. Build contracts:
```bash
forge build
```

## Deploy RadioTokenWrapper

1. Create `.env` file in contracts folder:
```bash
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key
```

2. Deploy to Base mainnet:
```bash
source .env
forge script script/DeployRadioTokenWrapper.s.sol:DeployRadioTokenWrapper \
  --rpc-url https://mainnet.base.org \
  --broadcast \
  --verify \
  -vvvv
```

3. After deployment, update `NEXT_PUBLIC_RADIO_TOKEN_WRAPPER_ADDRESS` in `.env.local`

## Contract Overview

### RadioTokenWrapper
Wraps the Clanker-deployed $RADIO token with Web3 Radio functionality:

- **tip()** - Tip DJs with $RADIO tokens
- **subscribe()** - Subscribe to premium stations
- **vote()** - Governance voting weighted by token balance
- **createProposal()** - Create governance proposals
- **registerStation()** - Admin: Register stations for subscriptions

### Parameters
- Proposal Threshold: 1000 RADIO
- Voting Period: 3 days
