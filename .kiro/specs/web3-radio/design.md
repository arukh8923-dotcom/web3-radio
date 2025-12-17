# Web3 Radio - Design Document

## Overview

Web3 Radio adalah decentralized radio platform yang berjalan fully on-chain di Base mainnet. Platform ini mentransformasi konsep radio tradisional ke Web3, di mana setiap station adalah smart contract, setiap broadcast adalah on-chain event, dan setiap interaksi adalah blockchain transaction.

### Key Design Principles

1. **Full On-Chain** - Semua state dan logic disimpan di blockchain
2. **Multi-Platform** - Berjalan di Farcaster Frame, Base App, dan browser
3. **Community-Driven** - 420 culture integration dengan social tokens
4. **Gas-Optimized** - Memanfaatkan EIP-4844 blobs dan Account Abstraction

### Technology Stack

- **Blockchain**: Base Mainnet (L2 Ethereum)
- **Smart Contracts**: Solidity 0.8.x
- **Token Deployment**: Clanker (Farcaster-native token deployer)
- **Frontend**: React/Next.js dengan ethers.js/viem
- **Frame SDK**: Farcaster Frames v2
- **Storage**: EIP-4844 Blobs + IPFS fallback
- **Indexing**: The Graph Protocol
- **Randomness**: Chainlink VRF
- **Attestations**: Ethereum Attestation Service (EAS)

### Clanker Integration

$RADIO dan $VIBES tokens akan di-deploy menggunakan Clanker, token deployer native Farcaster di Base. Keuntungan:

1. **Native Farcaster Integration** - Token langsung terlihat di Farcaster ecosystem
2. **Built-in Liquidity** - Clanker menyediakan initial liquidity pool
3. **Social Discovery** - Token dapat di-discover melalui Farcaster social graph
4. **Verified Deployment** - Clanker tokens memiliki trust signal di community

Wrapper contracts akan dibuat untuk menambahkan functionality khusus Web3 Radio (tipping, governance, mood tracking) di atas Clanker-deployed tokens.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Farcaster      │    Base App     │      Browser                │
│  Frame          │    (PWA)        │      (Web3 Wallet)          │
└────────┬────────┴────────┬────────┴────────┬────────────────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    MIDDLEWARE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Account Abstraction (ERC-4337)  │  The Graph Indexer           │
│  Paymaster Service               │  Event Listener              │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    SMART CONTRACT LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ RadioCore   │  │ StationNFT  │  │ RadioToken  │              │
│  │ Registry    │  │ (ERC-721)   │  │ ($RADIO)    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Station     │  │ Broadcast   │  │ Subscription│              │
│  │ Factory     │  │ Manager     │  │ Manager     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ VibesToken  │  │ SessionNFT  │  │ HotboxRoom  │              │
│  │ (ERC-20)    │  │ Factory     │  │ Manager     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ AuxPass     │  │ Community   │  │ Smoke       │              │
│  │ Controller  │  │ Drops       │  │ Signals     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  Chainlink VRF  │  EAS  │  EIP-4844 Blobs  │  IPFS             │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. RadioCore Registry

Central registry untuk semua stations dan global state.

```solidity
interface IRadioCoreRegistry {
    // Station Management
    function registerStation(address station, uint256 frequency) external;
    function getStationByFrequency(uint256 frequency) external view returns (address);
    function getAllStations() external view returns (address[] memory);
    
    // Listener Management
    function tuneIn(uint256 frequency) external;
    function tuneOut(uint256 frequency) external;
    function getListenerCount(uint256 frequency) external view returns (uint256);
    function getListenerStations(address listener) external view returns (uint256[] memory);
    
    // Signal Strength
    function calculateSignalStrength(uint256 frequency) external view returns (uint256);
    function updateSignalStrength(uint256 frequency) external;
    
    // Events
    event StationRegistered(address indexed station, uint256 indexed frequency);
    event TunedIn(address indexed listener, uint256 indexed frequency);
    event TunedOut(address indexed listener, uint256 indexed frequency);
    event SignalStrengthUpdated(uint256 indexed frequency, uint256 strength);
}
```

### 2. StationNFT (Frequency Ownership)

ERC-721 untuk frequency ownership.

```solidity
interface IStationNFT {
    function mintFrequency(uint256 frequency, string calldata metadata) external returns (uint256);
    function getFrequencyOwner(uint256 frequency) external view returns (address);
    function transferFrequency(uint256 frequency, address to) external;
    function setStationMetadata(uint256 frequency, string calldata metadata) external;
    
    event FrequencyMinted(uint256 indexed frequency, address indexed owner);
    event FrequencyTransferred(uint256 indexed frequency, address indexed from, address indexed to);
}
```

### 3. Station Contract

Individual station dengan broadcast capabilities.

```solidity
interface IStation {
    struct Broadcast {
        bytes32 contentHash;
        uint256 timestamp;
        address dj;
        uint256 unlockTime; // 0 = immediate
        BroadcastType broadcastType;
    }
    
    enum BroadcastType { AUDIO, VISUAL, GENERATIVE }
    
    function broadcast(bytes32 contentHash, BroadcastType bType) external;
    function scheduleBroadcast(bytes32 contentHash, uint256 unlockTime, BroadcastType bType) external;
    function getLatestBroadcast() external view returns (Broadcast memory);
    function getBroadcastHistory(uint256 limit) external view returns (Broadcast[] memory);
    
    // DJ Management
    function addDJ(address dj) external;
    function removeDJ(address dj) external;
    function isDJ(address account) external view returns (bool);
    
    // Premium Settings
    function setPremium(bool isPremium, uint256 subscriptionFee) external;
    function isPremiumStation() external view returns (bool);
    
    event NewBroadcast(bytes32 indexed contentHash, address indexed dj, uint256 timestamp);
    event ScheduledBroadcast(bytes32 indexed contentHash, uint256 unlockTime);
}
```

### 4. RadioToken ($RADIO)

ERC-20 governance dan utility token.

```solidity
interface IRadioToken {
    function tip(address dj, uint256 amount) external;
    function subscribe(uint256 frequency, uint256 duration) external;
    function vote(uint256 proposalId, bool support) external;
    
    event Tipped(address indexed from, address indexed to, uint256 amount);
    event Subscribed(address indexed listener, uint256 indexed frequency, uint256 expiry);
    event Voted(address indexed voter, uint256 indexed proposalId, bool support);
}
```

### 5. VibesToken

Social token untuk 420 culture engagement.

```solidity
interface IVibesToken {
    enum Mood { CHILL, HYPE, MELANCHOLY, EUPHORIC, ZEN }
    
    function react(uint256 frequency, Mood mood) external;
    function getMoodRing(uint256 frequency) external view returns (Mood);
    function spendVibes(uint256 amount, string calldata action) external;
    
    event Reaction(address indexed listener, uint256 indexed frequency, Mood mood);
    event MoodRingUpdated(uint256 indexed frequency, Mood newMood);
    event VibesSpent(address indexed user, uint256 amount, string action);
}
```

### 6. SessionNFT Factory

Commemorative NFTs untuk special sessions.

```solidity
interface ISessionNFTFactory {
    struct Session {
        uint256 frequency;
        uint256 startTime;
        uint256 endTime;
        address dj;
        uint256 attendeeCount;
        bool mintingClosed;
    }
    
    function createSession(uint256 frequency, uint256 duration) external returns (uint256 sessionId);
    function claimSessionNFT(uint256 sessionId) external;
    function closeSession(uint256 sessionId) external;
    function getSession(uint256 sessionId) external view returns (Session memory);
    
    event SessionCreated(uint256 indexed sessionId, uint256 indexed frequency);
    event SessionNFTClaimed(uint256 indexed sessionId, address indexed attendee);
    event SessionClosed(uint256 indexed sessionId, uint256 attendeeCount);
}
```

### 7. SmokeSignals

Ephemeral on-chain messages.

```solidity
interface ISmokeSignals {
    struct Signal {
        address sender;
        string message;
        uint256 timestamp;
        uint256 expiryTime;
        uint256 vibesCost;
    }
    
    function sendSignal(uint256 frequency, string calldata message, uint256 duration) external;
    function getActiveSignals(uint256 frequency) external view returns (Signal[] memory);
    function isExpired(uint256 signalId) external view returns (bool);
    
    event SignalSent(uint256 indexed signalId, address indexed sender, uint256 expiryTime);
    event SignalExpired(uint256 indexed signalId);
}
```

### 8. HotboxRoom Manager

Token-gated private rooms.

```solidity
interface IHotboxRoomManager {
    struct Room {
        uint256 frequency;
        address tokenGate;
        uint256 minBalance;
        address[] members;
        bool isActive;
    }
    
    function createRoom(uint256 frequency, address tokenGate, uint256 minBalance) external returns (uint256);
    function enterRoom(uint256 roomId) external;
    function exitRoom(uint256 roomId) external;
    function checkAccess(uint256 roomId, address user) external view returns (bool);
    
    event RoomCreated(uint256 indexed roomId, uint256 indexed frequency);
    event MemberEntered(uint256 indexed roomId, address indexed member);
    event MemberExited(uint256 indexed roomId, address indexed member);
}
```

### 9. AuxPass Controller

Rotating DJ control.

```solidity
interface IAuxPassController {
    struct AuxQueue {
        address[] queue;
        uint256 currentIndex;
        uint256 sessionDuration;
        uint256 sessionStart;
    }
    
    function joinQueue(uint256 frequency) external;
    function leaveQueue(uint256 frequency) external;
    function passAux(uint256 frequency) external;
    function getCurrentHolder(uint256 frequency) external view returns (address);
    function getTimeRemaining(uint256 frequency) external view returns (uint256);
    
    event AuxPassed(uint256 indexed frequency, address indexed from, address indexed to);
    event JoinedQueue(uint256 indexed frequency, address indexed user);
}
```

### 10. CommunityDrops

Random airdrops dengan Chainlink VRF.

```solidity
interface ICommunityDrops {
    struct Drop {
        uint256 frequency;
        uint256 timestamp;
        address[] recipients;
        uint256 rewardAmount;
        bool executed;
    }
    
    function triggerDrop(uint256 frequency) external;
    function claimDrop(uint256 dropId) external;
    function getEligibleListeners(uint256 frequency) external view returns (address[] memory);
    
    event DropTriggered(uint256 indexed dropId, uint256 indexed frequency);
    event DropClaimed(uint256 indexed dropId, address indexed recipient, uint256 amount);
}
```

## Data Models

### Station Metadata (JSON)

```typescript
interface StationMetadata {
  name: string;
  description: string;
  category: StationCategory;
  imageUrl: string;
  frequency: number;
  owner: string;
  djs: string[];
  isPremium: boolean;
  subscriptionFee?: bigint;
  createdAt: number;
}

enum StationCategory {
  MUSIC = "music",
  TALK = "talk",
  NEWS = "news",
  SPORTS = "sports",
  CULTURE_420 = "420",
  AMBIENT = "ambient"
}
```

### Broadcast Content (JSON)

```typescript
interface BroadcastContent {
  contentHash: string;
  contentType: ContentType;
  title: string;
  duration: number;
  djAddress: string;
  timestamp: number;
  blobCommitment?: string; // EIP-4844
  ipfsHash?: string; // Fallback
  visualParams?: GenerativeParams;
}

enum ContentType {
  AUDIO = "audio",
  VISUAL = "visual", 
  GENERATIVE = "generative"
}

interface GenerativeParams {
  seed: number;
  colorPalette: string[];
  waveformType: string;
  bpm: number;
}
```

### User Preferences (On-Chain)

```typescript
interface UserPreferences {
  wallet: string;
  equalizerSettings: EqualizerParams;
  subscribedStations: number[];
  vibesBalance: bigint;
  sessionNFTs: number[];
  lastActive: number;
}

interface EqualizerParams {
  bass: number;      // 0-100
  mid: number;       // 0-100
  treble: number;    // 0-100
  volume: number;    // 0-100
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following correctness properties have been identified:

### Property 1: Station Search Accuracy
*For any* valid frequency or category filter, the search function SHALL return only stations that match the search criteria exactly.
**Validates: Requirements 1.2, 1.3**

### Property 2: Tune In/Out Round-Trip
*For any* listener and station, tuning in then tuning out SHALL result in the listener not being registered to that station, and the listener count returning to its original value.
**Validates: Requirements 2.1, 2.2**

### Property 3: Station Creation Ownership
*For any* DJ creating a station, the resulting station contract SHALL have that DJ as the owner.
**Validates: Requirements 5.1**

### Property 4: Station Metadata Round-Trip
*For any* station metadata (name, description, category), setting then retrieving the metadata SHALL produce an equivalent object.
**Validates: Requirements 5.2**

### Property 5: Broadcast Publishing Consistency
*For any* broadcast published to a station, the content hash SHALL be stored on-chain, an event SHALL be emitted, and the station's latest broadcast reference SHALL be updated.
**Validates: Requirements 5.3, 6.2, 6.3**

### Property 6: Content Upload Hash Integrity
*For any* content uploaded, the recorded hash on-chain SHALL match the hash of the original content.
**Validates: Requirements 6.1**

### Property 7: Listener Count Accuracy
*For any* station, the on-chain listener count SHALL equal the number of unique addresses currently tuned in.
**Validates: Requirements 6.4**

### Property 8: State Persistence Across Sessions
*For any* user with on-chain state (subscriptions, preferences), reconnecting from any platform SHALL restore the complete state identically.
**Validates: Requirements 7.4, 8.1, 8.2, 8.3**

### Property 9: Content Serialization Round-Trip
*For any* valid BroadcastContent object, serializing to JSON then deserializing SHALL produce an object equivalent to the original, containing timestamp, content hash, and DJ address.
**Validates: Requirements 9.1, 9.2, 9.3, 9.4**

### Property 10: Tipping Token Transfer
*For any* tip transaction, the DJ's token balance SHALL increase by exactly the tip amount, and an event SHALL be emitted with correct sender and amount.
**Validates: Requirements 10.1, 10.2**

### Property 11: Subscription Lifecycle
*For any* subscription, the subscriber SHALL have access while active, and access SHALL be revoked when the subscription expires.
**Validates: Requirements 11.1, 11.2, 11.3, 11.4**

### Property 12: Generative Content Determinism
*For any* set of GenerativeParams, rendering SHALL produce identical visual output given the same parameters.
**Validates: Requirements 12.3**

### Property 13: Governance Vote Calculation
*For any* governance proposal, the final vote tally SHALL equal the sum of all votes weighted by token balance at voting time.
**Validates: Requirements 13.1, 13.2, 13.3, 13.4**

### Property 14: Frequency NFT Ownership
*For any* frequency NFT, the owner query SHALL return the current holder, and transfers SHALL update ownership atomically.
**Validates: Requirements 14.1, 14.2, 14.3**

### Property 15: Signal Strength Calculation
*For any* station, signal strength SHALL be a deterministic function of listener count, tip volume, and engagement metrics.
**Validates: Requirements 15.1, 15.2, 15.4**

### Property 16: Blob Storage Round-Trip
*For any* audio content stored via EIP-4844 blobs, retrieving and reconstructing SHALL produce audio equivalent to the original.
**Validates: Requirements 16.1, 16.2, 16.3**

### Property 17: Time-Lock Access Control
*For any* time-locked broadcast, access SHALL be denied before unlock time and granted after unlock time.
**Validates: Requirements 17.1, 17.2, 17.4**

### Property 18: Equalizer Settings Persistence
*For any* equalizer settings (bass, mid, treble), storing then retrieving SHALL produce identical values.
**Validates: Requirements 18.1, 18.2, 18.4**

### Property 19: DJ Attestation Validity
*For any* DJ attestation, the attestation SHALL be valid until revoked, and filtering by verified DJs SHALL only return DJs with valid attestations.
**Validates: Requirements 19.1, 19.3, 19.4**

### Property 20: Multi-Sig Broadcast Approval
*For any* collaborative station, broadcasts SHALL only execute when threshold approvals are met.
**Validates: Requirements 21.1, 21.2, 21.3, 21.4**

### Property 21: 420 Zone Event Triggering
*For any* 4:20 time occurrence, special events SHALL be triggered and Vibes_Token earning SHALL be enabled for active participants.
**Validates: Requirements 22.2, 22.3**

### Property 22: Vibes Token Minting and Spending
*For any* reaction, Vibes_Token SHALL be minted, and spending Vibes SHALL enable the corresponding feature.
**Validates: Requirements 23.1, 23.2, 23.4**

### Property 23: Session NFT Lifecycle
*For any* special session, eligible attendees SHALL receive Session_NFT, and minting SHALL be closed after session ends.
**Validates: Requirements 24.1, 24.2, 24.3, 24.4**

### Property 24: Smoke Signal Expiry
*For any* Smoke_Signal, the message SHALL be visible until expiry time, then marked as expired and hidden from active signals list.
**Validates: Requirements 25.1, 25.2, 25.3, 25.4**

### Property 25: Hotbox Room Token Gating
*For any* Hotbox_Room, access SHALL be granted only when token balance meets threshold, and revoked when balance drops below.
**Validates: Requirements 26.1, 26.2, 26.3, 26.4**

### Property 26: Aux Pass Queue Management
*For any* Aux_Pass queue, control SHALL transfer to next eligible holder when session ends or holder is inactive.
**Validates: Requirements 27.1, 27.2, 27.3, 27.4**

### Property 27: Community Drop Distribution
*For any* community drop, recipients SHALL be randomly selected via VRF, and rewards SHALL be minted to selected wallets.
**Validates: Requirements 28.1, 28.2, 28.3, 28.4**

## Feature Integration Map

Semua fitur Web3 Radio saling terintegrasi dalam ekosistem yang kohesif:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           WEB3 RADIO ECOSYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │  $RADIO     │────▶│  Tipping    │────▶│  DJ Revenue │                    │
│  │  (Clanker)  │     │  System     │     │  & Rewards  │                    │
│  └──────┬──────┘     └─────────────┘     └─────────────┘                    │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │ Governance  │────▶│  Proposals  │────▶│  Platform   │                    │
│  │   Voting    │     │  & Voting   │     │  Evolution  │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │  $VIBES     │────▶│  Reactions  │────▶│  Mood Ring  │                    │
│  │  (Clanker)  │     │  & Mood     │     │  Community  │                    │
│  └──────┬──────┘     └─────────────┘     └─────────────┘                    │
│         │                                                                    │
│         ├────────────▶ Smoke Signals (burn to send)                         │
│         ├────────────▶ Request Line (stake for requests)                    │
│         └────────────▶ Special Features (spend to unlock)                   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                         STATION ECOSYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │ Frequency   │────▶│  Station    │────▶│  Signal     │                    │
│  │   NFT       │     │  Ownership  │     │  Strength   │                    │
│  └─────────────┘     └─────────────┘     └──────┬──────┘                    │
│                                                  │                           │
│                                                  ▼                           │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │ Auto-Scan   │────▶│  Discovery  │◀────│  Ranking    │                    │
│  │             │     │  Algorithm  │     │  by Signal  │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │ Band/Genre  │────▶│  Filtering  │────▶│  Preset     │                    │
│  │  Switching  │     │  System     │     │  Favorites  │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                         LISTENER EXPERIENCE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │ Tune In/Out │────▶│  Playback   │────▶│  Visual     │                    │
│  │             │     │  Controls   │     │  Renderer   │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│         │                   │                   │                            │
│         ▼                   ▼                   ▼                            │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │ Subscription│     │  Volume &   │     │  Now Playing│                    │
│  │  Premium    │     │  Equalizer  │     │  (RDS Info) │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│         │                   │                   │                            │
│         ▼                   ▼                   ▼                            │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │ Recording   │     │  Stereo/    │     │  Reception  │                    │
│  │  DVR NFT    │     │  Mono Mode  │     │  Quality    │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐                                        │
│  │ Sleep Timer │     │  Alarm      │                                        │
│  │             │     │  Wake-Up    │                                        │
│  └─────────────┘     └─────────────┘                                        │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                         420 CULTURE ZONE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │ 420.0 FM    │────▶│  Special    │────▶│  Community  │                    │
│  │  Frequency  │     │  Events     │     │  Drops      │                    │
│  └─────────────┘     └─────────────┘     └──────┬──────┘                    │
│                                                  │                           │
│                                                  ▼                           │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │ Session NFT │◀────│  Special    │────▶│  Chainlink  │                    │
│  │  Attendance │     │  Sessions   │     │  VRF Random │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │ Hotbox Room │────▶│  Token-Gate │────▶│  Private    │                    │
│  │             │     │  Access     │     │  Content    │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐                                        │
│  │ Pass the    │────▶│  Rotating   │                                        │
│  │  Aux        │     │  DJ Control │                                        │
│  └─────────────┘     └─────────────┘                                        │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                         DJ ECOSYSTEM                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │ Station     │────▶│  Broadcast  │────▶│  Blob/IPFS  │                    │
│  │  Creation   │     │  Upload     │     │  Storage    │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │ Multi-Sig   │────▶│  Collab     │────▶│  Threshold  │                    │
│  │  Station    │     │  Broadcasts │     │  Approval   │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │ Scheduled   │────▶│  Time-Lock  │────▶│  Auto       │                    │
│  │  Broadcasts │     │  Content    │     │  Publish    │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐                                        │
│  │ Request     │────▶│  Fulfill &  │                                        │
│  │  Queue      │     │  Earn Vibes │                                        │
│  └─────────────┘     └─────────────┘                                        │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐                                        │
│  │ EAS         │────▶│  Verified   │                                        │
│  │ Attestation │     │  DJ Badge   │                                        │
│  └─────────────┘     └─────────────┘                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Integration Points

| Feature A | Integrates With | How |
|-----------|-----------------|-----|
| $RADIO Token | Tipping, Subscription, Governance | Payment & voting weight |
| $VIBES Token | Reactions, Smoke Signals, Requests | Earn from engagement, spend for features |
| Frequency NFT | Station Ownership, Signal Strength | NFT holder = station owner |
| Signal Strength | Auto-Scan, Discovery, Ranking | Higher signal = more visible |
| Tune In | Listener Count, Signal Strength | More listeners = stronger signal |
| Preset Favorites | Auto-Scan, Band Switching | Quick access to saved stations |
| Now Playing | Recording DVR, Request Line | Know what to record/request |
| Equalizer | Stereo Mode, User Preferences | All audio settings on-chain |
| 420 Zone | Vibes Earning, Community Drops | Special rewards at 4:20 |
| Session NFT | Hotbox Room, Special Events | Proof of attendance |
| Request Line | Vibes Stake, DJ Queue | Listeners influence content |
| Recording DVR | Now Playing, Subscription | Record premium content |
| Alarm Radio | Preset Favorites, Tune In | Wake to favorite station |

### Classic Retro Radio UI Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RETRO RADIO CABINET                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ ╔═══════════════════════════════════════════════════════════════════╗ │  │
│  │ ║                    FREQUENCY DIAL                                  ║ │  │
│  │ ║   88 ─── 92 ─── 96 ─── 100 ─── 104 ─── 108  FM                   ║ │  │
│  │ ║              ▼ [TUNING INDICATOR]                                  ║ │  │
│  │ ║   530 ─── 700 ─── 1000 ─── 1400 ─── 1700   AM                    ║ │  │
│  │ ╚═══════════════════════════════════════════════════════════════════╝ │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ ████████████████████████████████████████████████████████████████████│    │
│  │ ████████████████████  SPEAKER GRILLE  ██████████████████████████████│    │
│  │ ████████████████████████████████████████████████████████████████████│    │
│  │ ████████████████████████████████████████████████████████████████████│    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  ┌────┐  │  │  ┌────┐  │  │  ┌────┐  │  │  ┌────┐  │  │  ┌────┐  │      │
│  │  │ 1  │  │  │  │ 2  │  │  │  │ 3  │  │  │  │ 4  │  │  │  │ 5  │  │      │
│  │  └────┘  │  │  └────┘  │  │  └────┘  │  │  └────┘  │  │  └────┘  │      │
│  │ PRESET   │  │ PRESET   │  │ PRESET   │  │ PRESET   │  │ PRESET   │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                              │
│     ╭─────╮        ╭─────╮        ╭─────╮        ┌─────────────────┐        │
│    ╱   ●   ╲      ╱   ●   ╲      ╱   ●   ╲      │  ┌───┐ ┌───┐    │        │
│   │  VOLUME │    │  BASS   │    │ TREBLE │      │  │VU │ │VU │    │        │
│    ╲       ╱      ╲       ╱      ╲       ╱      │  │ L │ │ R │    │        │
│     ╰─────╯        ╰─────╯        ╰─────╯        │  └───┘ └───┘    │        │
│                                                  └─────────────────┘        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  NOW PLAYING: ░█░█░█░ TRACK NAME ░█░█░█░  │  ⏵ PLAY  │  ● REC     │    │
│  │  DJ: @username  │  SIGNAL: ████░░  │  420.0 FM  │  ◉ PILOT LIGHT  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Cabinet Wood | Warm Walnut | #5D4037 |
| Cabinet Accent | Brass/Gold | #D4AF37 |
| Dial Background | Cream | #FFF8E7 |
| Dial Numbers | Dark Brown | #3E2723 |
| Tuning Indicator | Cherry Red | #C62828 |
| Nixie Glow | Warm Orange | #FF6D00 |
| VU Meter Needle | Red | #D32F2F |
| Pilot Light | Amber | #FFB300 |
| Speaker Grille | Dark Fabric | #212121 |
| 420 Zone Accent | Purple Haze | #7B1FA2 |

#### Typography

- **Dial Numbers**: Futura, Art Deco style
- **Station Names**: Nixie tube font (custom)
- **Labels**: Vintage sans-serif
- **Now Playing**: Flip-clock style digits

#### Animation Specs

| Animation | Duration | Easing |
|-----------|----------|--------|
| Dial rotation | 300ms | ease-out |
| Knob turn | 150ms | linear |
| VU needle bounce | 100ms | spring |
| Nixie digit flip | 200ms | ease-in-out |
| Pilot light pulse | 2000ms | sine |
| Tube warm-up | 1500ms | ease-in |

### Token Flow Diagram

```
LISTENER                          DJ                           PLATFORM
   │                               │                               │
   │──── $RADIO (tip) ────────────▶│                               │
   │──── $RADIO (subscribe) ──────▶│                               │
   │                               │                               │
   │◀─── Content ─────────────────│                               │
   │◀─── Session NFT ─────────────│                               │
   │                               │                               │
   │──── $VIBES (react) ──────────▶│◀─── $VIBES (from requests) ──│
   │──── $VIBES (smoke signal) ───▶│                               │
   │──── $VIBES (request) ────────▶│                               │
   │                               │                               │
   │◀─── $VIBES (earn from 420) ──│◀─── Community Drops ──────────│
   │                               │                               │
   │──── $RADIO (governance) ─────▶│──── $RADIO (governance) ─────▶│
   │                               │                               │
```

## Error Handling

### Smart Contract Errors

```solidity
// Custom errors for gas efficiency
error InvalidFrequency(uint256 frequency);
error NotStationOwner(address caller);
error NotDJ(address caller);
error AlreadyTunedIn(address listener, uint256 frequency);
error NotTunedIn(address listener, uint256 frequency);
error InsufficientBalance(uint256 required, uint256 available);
error SubscriptionExpired(address listener, uint256 frequency);
error ContentLocked(uint256 unlockTime);
error InvalidAttestation(bytes32 attestationId);
error ThresholdNotMet(uint256 required, uint256 received);
error RoomAccessDenied(address user, uint256 roomId);
error SignalExpired(uint256 signalId);
error AuxNotHolder(address caller);
error DropAlreadyClaimed(address user, uint256 dropId);
```

### Frontend Error Handling

```typescript
enum ErrorCode {
  WALLET_NOT_CONNECTED = "WALLET_NOT_CONNECTED",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  CONTENT_UNAVAILABLE = "CONTENT_UNAVAILABLE",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  NETWORK_ERROR = "NETWORK_ERROR",
  BLOB_STORAGE_FAILED = "BLOB_STORAGE_FAILED",
  IPFS_FALLBACK_FAILED = "IPFS_FALLBACK_FAILED"
}

interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  recoverable: boolean;
  retryAction?: () => Promise<void>;
}
```

### Recovery Strategies

1. **Transaction Failures**: Retry with increased gas, or fallback to user-paid gas if paymaster fails
2. **Content Retrieval**: Try blob storage first, fallback to IPFS, then show cached version
3. **Network Issues**: Implement exponential backoff with max 3 retries
4. **State Sync**: Re-fetch on-chain state on reconnection

## Testing Strategy

### Property-Based Testing Library

**Library**: fast-check (TypeScript)

Property-based tests will be used to verify correctness properties across many random inputs.

### Test Configuration

```typescript
// fast-check configuration
const fcConfig = {
  numRuns: 100,  // Minimum 100 iterations per property
  seed: Date.now(),
  verbose: true
};
```

### Property Test Structure

Each property-based test MUST:
1. Be tagged with format: `**Feature: web3-radio, Property {number}: {property_text}**`
2. Reference the correctness property from this design document
3. Generate random valid inputs using fast-check arbitraries
4. Assert the property holds for all generated inputs

### Unit Tests

Unit tests will cover:
- Specific examples demonstrating correct behavior
- Edge cases (empty inputs, boundary values)
- Error conditions and recovery
- Integration points between components

### Test Categories

1. **Smart Contract Tests** (Foundry/Hardhat)
   - Unit tests for each contract function
   - Property tests for state invariants
   - Integration tests for contract interactions

2. **Frontend Tests** (Vitest + fast-check)
   - Property tests for serialization/deserialization
   - Unit tests for UI components
   - Integration tests for wallet interactions

3. **E2E Tests** (Playwright)
   - Multi-platform testing (browser, Frame simulation)
   - User flow testing
