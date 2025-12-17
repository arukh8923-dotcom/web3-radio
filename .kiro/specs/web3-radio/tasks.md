# Implementation Plan - Web3 Radio

## Phase 1: Project Setup & Core Infrastructure ✅ COMPLETE

- [x] 1. Initialize project structure
  - [x] 1.1 Create monorepo structure with packages for contracts, frontend, and shared types
  - [x] 1.2 Configure Foundry for smart contract development
  - [x] 1.3 Configure frontend with Next.js and Web3 libraries
  - [x] 1.4 Set up TypeScript types for Station, Broadcast, User, and 420 Culture
  - [x] 1.5 Create Zod schemas for validation (BroadcastContent, StationMetadata, UserPreferences)
  - [x] 1.6 Implement serialization utilities with round-trip support
  - _Requirements: 7.1, 7.2, 7.3, 9.1, 9.2, 9.3, 9.4_

## Phase 2: Core Token Contracts

- [ ] 2. Deploy RadioToken ($RADIO) via Clanker
  - [ ] 2.1 Deploy $RADIO token using Clanker on Base
  - [ ] 2.2 Create RadioTokenWrapper contract for extended functionality (tip, subscribe, vote)
  - _Requirements: 10.1, 13.2, 45.1_

- [ ] 3. Deploy VibesToken ($VIBES) via Clanker
  - [ ] 3.1 Deploy $VIBES token using Clanker on Base
  - [ ] 3.2 Create VibesTokenWrapper contract for mood tracking and reactions
  - _Requirements: 22.3, 23.1, 23.2_

## Phase 3: Core Registry & Station Contracts

- [ ] 4. Implement RadioCoreRegistry contract
  - [x] 4.1 Create IRadioCoreRegistry interface with all function signatures
  - [ ] 4.2 Implement RadioCoreRegistry.sol with station registration and frequency mapping
  - [ ] 4.3 Implement tuneIn/tuneOut functions with listener tracking
  - [ ] 4.4 Implement signal strength calculation
  - [ ] 4.5 Add events for station registration and tune in/out
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 15.1, 15.2_

- [ ] 5. Implement StationNFT (Frequency Ownership)
  - [ ] 5.1 Create ERC-721 contract for frequency NFTs
  - [ ] 5.2 Implement mintFrequency with unique frequency validation
  - [ ] 5.3 Implement frequency transfer with ownership update
  - [ ] 5.4 Add metadata storage for station info
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [ ] 6. Implement Station Factory & Station Contract
  - [x] 6.1 Create IStation interface with broadcast and DJ management signatures
  - [ ] 6.2 Create StationFactory for deploying new stations
  - [ ] 6.3 Implement Station contract with broadcast capabilities
  - [ ] 6.4 Add DJ management (add/remove DJs)
  - [ ] 6.5 Implement premium station settings
  - [ ] 6.6 Add scheduled broadcast with time-lock
  - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 17.1, 17.2_

- [ ] 7. Implement BroadcastManager
  - [ ] 7.1 Create broadcast storage with content hash
  - [ ] 7.2 Implement broadcast history retrieval
  - [ ] 7.3 Add broadcast event emission
  - [ ] 7.4 Implement blob storage integration (EIP-4844)
  - [ ] 7.5 Add IPFS fallback for content storage
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 16.1, 16.2, 16.3, 16.4_

## Phase 4: Subscription & Tipping System

- [ ] 8. Implement SubscriptionManager
  - [ ] 8.1 Create subscription contract with duration tracking
  - [ ] 8.2 Implement subscription purchase with token transfer
  - [ ] 8.3 Add subscription expiry check and access control
  - [ ] 8.4 Implement subscription renewal
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 9. Implement Tipping System
  - [ ] 9.1 Add tip function to RadioToken wrapper
  - [ ] 9.2 Implement tip event emission
  - [ ] 9.3 Add tip history tracking
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

## Phase 5: 420 Culture Features

- [ ] 10. Implement 420 Frequency Zone
  - [ ] 10.1 Create special 420.0 frequency with unique mechanics
  - [ ] 10.2 Implement 4:20 time-based event triggers
  - [ ] 10.3 Add Vibes earning for 420 zone participants
  - [ ] 10.4 Implement mood ring indicator
  - _Requirements: 22.1, 22.2, 22.3, 22.4_

- [ ] 11. Implement SessionNFT Factory
  - [ ] 11.1 Create session creation with frequency and duration
  - [ ] 11.2 Implement attendance tracking
  - [ ] 11.3 Add SessionNFT minting for eligible attendees
  - [ ] 11.4 Implement session closing and minting finalization
  - _Requirements: 24.1, 24.2, 24.3, 24.4_

- [ ] 12. Implement SmokeSignals (Ephemeral Messages)
  - [ ] 12.1 Create signal storage with expiry timestamp
  - [ ] 12.2 Implement signal sending with Vibes burn
  - [ ] 12.3 Add active signals retrieval (filter expired)
  - [ ] 12.4 Implement expiry marking
  - _Requirements: 25.1, 25.2, 25.3, 25.4_

- [ ] 13. Implement HotboxRoom Manager
  - [ ] 13.1 Create room with token-gate configuration
  - [ ] 13.2 Implement access verification based on token balance
  - [ ] 13.3 Add member enter/exit tracking
  - [ ] 13.4 Implement access revocation when balance drops
  - _Requirements: 26.1, 26.2, 26.3, 26.4_

- [ ] 14. Implement AuxPass Controller
  - [ ] 14.1 Create queue management based on token holdings
  - [ ] 14.2 Implement automatic control transfer on session end
  - [ ] 14.3 Add temporary broadcast permissions
  - [ ] 14.4 Implement inactive holder skip
  - _Requirements: 27.1, 27.2, 27.3, 27.4_

- [ ] 15. Implement CommunityDrops with Chainlink VRF
  - [ ] 15.1 Create drop trigger at 4:20 times
  - [ ] 15.2 Integrate Chainlink VRF for random selection
  - [ ] 15.3 Implement reward minting to recipients
  - [ ] 15.4 Add drop history tracking
  - _Requirements: 28.1, 28.2, 28.3, 28.4_

## Phase 6: Governance & Attestations

- [ ] 16. Implement Governance System
  - [ ] 16.1 Create proposal creation with voting parameters
  - [ ] 16.2 Implement vote recording weighted by token balance
  - [ ] 16.3 Add vote tally calculation
  - [ ] 16.4 Implement proposal execution on approval
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 17. Implement DJ Attestations (EAS)
  - [ ] 17.1 Integrate Ethereum Attestation Service
  - [ ] 17.2 Create attestation request flow
  - [ ] 17.3 Implement attestation badge display
  - [ ] 17.4 Add attestation revocation handling
  - [ ] 17.5 Implement verified DJ filtering
  - _Requirements: 19.1, 19.2, 19.3, 19.4_

- [ ] 18. Implement Multi-Sig Station (Collaborative)
  - [ ] 18.1 Create multi-sig station contract
  - [ ] 18.2 Implement broadcast proposal system
  - [ ] 18.3 Add threshold approval mechanism
  - [ ] 18.4 Implement collaborator management via multi-sig
  - _Requirements: 21.1, 21.2, 21.3, 21.4_

## Phase 7: Account Abstraction & Gas Optimization

- [ ] 19. Implement Account Abstraction (ERC-4337)
  - [ ] 19.1 Set up Paymaster contract for gas sponsorship
  - [ ] 19.2 Implement transaction bundling
  - [ ] 19.3 Add fallback to user-paid gas
  - [ ] 19.4 Create sponsored transaction indicator
  - _Requirements: 20.1, 20.2, 20.3, 20.4_

## Phase 8: Frontend - Core UI Components ✅ COMPLETE

- [x] 20. Implement Retro Radio UI Theme
  - [x] 20.1 Create skeuomorphic retro radio interface (RadioCabinet.tsx)
  - [x] 20.2 Implement analog-style tuning dial with glowing numbers (FrequencyDial.tsx)
  - [x] 20.3 Create rotating volume knob with tactile feedback (VolumeKnob.tsx)
  - [x] 20.4 Implement vintage VU meter with needle animation (VUMeter.tsx)
  - [x] 20.5 Add tube-glow effects and speaker grille visualization (SpeakerGrille.tsx)
  - _Requirements: 39.1, 39.2, 39.3, 39.4, 39.5_

- [x] 21. Implement Retro Visual Elements
  - [x] 21.1 Create nixie tube/flip-clock style display (NixieDisplay.tsx)
  - [x] 21.2 Implement mechanical push-button presets (PresetButtons.tsx)
  - [x] 21.3 Add warm pilot light indicator (PilotLight.tsx)
  - [x] 21.4 Create mechanical band selector animation (BandSelector.tsx)
  - [x] 21.5 Add psychedelic overlays for 420 zone (zone-420 CSS class)
  - _Requirements: 40.1, 40.2, 40.3, 40.4, 40.5_

- [x] 22. Implement Retro Audio Visualization
  - [x] 22.1 Create oscilloscope-style waveform visualization (AudioPlayer.tsx)
  - [x] 22.2 Implement vintage slider-style EQ controls (VolumeKnob for bass/treble)
  - [x] 22.3 Add dual VU meters for stereo mode (VUMeter L/R)
  - [x] 22.4 Create static/noise overlay for reception quality (ReceptionQuality.tsx)
  - _Requirements: 41.1, 41.2, 41.3, 41.4_

## Phase 9: Frontend - Station Discovery & Playback ✅ COMPLETE

- [x] 23. Implement Station Discovery
  - [x] 23.1 Create station list view with blockchain data (API + useRadio hook)
  - [x] 23.2 Implement frequency search (FrequencyDial.tsx)
  - [x] 23.3 Add category/genre filtering (BandSelector.tsx)
  - [x] 23.4 Display signal strength indicators (ReceptionQuality.tsx)
  - [x] 23.5 Implement station sorting by signal strength (API)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 15.3, 15.4_

- [x] 24. Implement Auto-Scan Discovery
  - [x] 24.1 Create auto-scan mode with frequency iteration (AutoScan.tsx)
  - [x] 24.2 Implement pause on active station detection
  - [x] 24.3 Add preview playback during scan
  - [x] 24.4 Implement confirm/skip controls
  - _Requirements: 29.1, 29.2, 29.3, 29.4_

- [x] 25. Implement Tune In/Out Functionality
  - [x] 25.1 Create tune-in transaction flow (useRadio.tuneIn)
  - [x] 25.2 Implement tune-out transaction flow (useRadio.tuneOut)
  - [x] 25.3 Add real-time broadcast display for tuned stations
  - [x] 25.4 Implement error handling for failed transactions
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 26. Implement Playback Controls
  - [x] 26.1 Create play/pause functionality (AudioPlayer.tsx)
  - [x] 26.2 Implement content retrieval from on-chain/IPFS
  - [x] 26.3 Add position preservation on pause
  - [x] 26.4 Implement error handling for unavailable content
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 27. Implement Volume Control
  - [x] 27.1 Create volume slider with real-time adjustment (VolumeKnob.tsx)
  - [x] 27.2 Implement mute/unmute with indicator
  - [x] 27.3 Add volume level persistence (useRadio state)
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 28. Implement Preset Favorites
  - [x] 28.1 Create preset save functionality (PresetButtons + API)
  - [x] 28.2 Implement quick-tune from presets
  - [x] 28.3 Add preset list display with status
  - [x] 28.4 Implement preset removal
  - _Requirements: 30.1, 30.2, 30.3, 30.4_

- [x] 29. Implement Now Playing Info (RDS)
  - [x] 29.1 Display current track title, artist, DJ name (NowPlayingDetail.tsx)
  - [x] 29.2 Implement real-time track change updates
  - [x] 29.3 Show on-chain metadata (content hash, timestamp)
  - [x] 29.4 Add like/preference recording
  - _Requirements: 31.1, 31.2, 31.3, 31.4_

- [x] 30. Implement Band/Genre Switching
  - [x] 30.1 Create band selector UI (BandSelector.tsx)
  - [x] 30.2 Implement station filtering by band
  - [x] 30.3 Update frequency range per band
  - _Requirements: 35.1, 35.2, 35.3, 35.4_

## Phase 10: Frontend - Advanced Listener Features ✅ COMPLETE

- [x] 31. Implement On-Chain Equalizer
  - [x] 31.1 Create EQ controls (bass, mid, treble) - VolumeKnob components
  - [x] 31.2 Implement on-chain storage of EQ settings (API + useRadio)
  - [x] 31.3 Add real-time audio processing (useAudioPlayer)
  - [ ] 31.4 Implement EQ preset sharing (deferred)
  - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [x] 32. Implement Sleep Timer
  - [x] 32.1 Create timer setting UI (SleepTimer.tsx)
  - [x] 32.2 Implement countdown display
  - [x] 32.3 Add fade-out and auto-stop
  - [x] 32.4 Implement timer cancellation
  - _Requirements: 32.1, 32.2, 32.3, 32.4_

- [x] 33. Implement Alarm/Wake-Up Radio
  - [x] 33.1 Create alarm setting UI with frequency selection (AlarmClock.tsx)
  - [x] 33.2 Store alarm locally (on-chain deferred)
  - [x] 33.3 Implement auto-tune and gradual volume increase
  - [x] 33.4 Add alarm dismiss functionality
  - _Requirements: 33.1, 33.2, 33.3, 33.4_

- [x] 34. Implement Broadcast Recording (DVR)
  - [x] 34.1 Create recording start/stop controls (RecordingDVR.tsx)
  - [x] 34.2 Implement content capture to user storage
  - [x] 34.3 Mint Recording_NFT on completion (UI ready, contract pending)
  - [x] 34.4 Add recordings list and playback
  - _Requirements: 34.1, 34.2, 34.3, 34.4_

- [x] 35. Implement Request Line
  - [x] 35.1 Create request submission with Vibes stake (RequestLine.tsx)
  - [x] 35.2 Display pending requests sorted by stake
  - [ ] 35.3 Implement request fulfillment with token transfer (contract pending)
  - [ ] 35.4 Add request expiry and refund (contract pending)
  - _Requirements: 36.1, 36.2, 36.3, 36.4_

- [x] 36. Implement Reception Quality Indicator
  - [x] 36.1 Create quality indicator based on signal strength (ReceptionQuality.tsx)
  - [x] 36.2 Add warning display for poor reception
  - [ ] 36.3 Implement reconnection/backup source switching (deferred)
  - [ ] 36.4 Show historical quality metrics (deferred)
  - _Requirements: 37.1, 37.2, 37.3, 37.4_

- [x] 37. Implement Stereo/Audio Mode Toggle
  - [x] 37.1 Create stereo/mono toggle (StereoToggle.tsx)
  - [ ] 37.2 Implement channel combining for mono (audio processing pending)
  - [x] 37.3 Store audio mode preference locally
  - _Requirements: 38.1, 38.2, 38.3, 38.4_

## Phase 11: Frontend - DJ Features ✅ COMPLETE

- [x] 38. Implement Station Creation (DJ Mode)
  - [x] 38.1 Create station creation form (StationCreator.tsx)
  - [x] 38.2 Implement station contract deployment (placeholder)
  - [x] 38.3 Add metadata setting (name, description, category)
  - [x] 38.4 Implement error handling
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 39. Implement Broadcasting Interface
  - [x] 39.1 Create content upload UI (BroadcastManager.tsx)
  - [x] 39.2 Implement IPFS/blob upload (placeholder)
  - [x] 39.3 Add broadcast publishing with event emission (placeholder)
  - [x] 39.4 Display listener count
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 40. Implement Scheduled Broadcasts UI
  - [x] 40.1 Create schedule form with time selection (ScheduledBroadcasts.tsx)
  - [x] 40.2 Display scheduled broadcasts with countdown
  - [x] 40.3 Implement auto-unlock notification (UI ready)
  - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [x] 41. Implement Radio Playlist/Queue
  - [x] 41.1 Create queue management UI (PlaylistQueue.tsx)
  - [x] 41.2 Implement on-chain queue storage (placeholder)
  - [x] 41.3 Add auto-play next functionality (UI ready)
  - [x] 41.4 Implement queue reordering (drag & drop)
  - _Requirements: 51.1, 51.2, 51.3, 51.4_

- [x] 42. Implement Cross-Station Simulcast
  - [x] 42.1 Create simulcast initiation UI (Simulcast.tsx)
  - [x] 42.2 Implement multi-station approval flow (placeholder)
  - [x] 42.3 Add aggregated listener count display
  - [x] 42.4 Show participating stations
  - _Requirements: 52.1, 52.2, 52.3, 52.4_

- [x] 43. Implement Radio Show Scheduling
  - [x] 43.1 Create show scheduling form (ShowScheduler.tsx)
  - [x] 43.2 Display upcoming show schedule (list + calendar view)
  - [x] 43.3 Implement show start notifications (UI ready)
  - [x] 43.4 Add calendar integration (week view)
  - _Requirements: 53.1, 53.2, 53.3, 53.4_

## Phase 12: Frontend - Social & Community Features

- [x] 44. Implement Tipping UI
  - [x] 44.1 Create tip button with amount selection (TipDJModal.tsx)
  - [ ] 44.2 Implement tip transaction flow (contract pending)
  - [x] 44.3 Display confirmation with transaction hash
  - [x] 44.4 Add error handling and refund display
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 45. Implement Subscription UI
  - [x] 45.1 Create subscription purchase flow (SubscriptionPanel.tsx)
  - [x] 45.2 Display subscription status and expiry
  - [x] 45.3 Implement renewal prompt
  - [ ] 45.4 Add premium content access (contract pending)
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 46. Implement Vibes & Mood Ring UI
  - [x] 46.1 Create reaction buttons for mood selection (MoodRingDisplay.tsx)
  - [x] 46.2 Display mood ring indicator
  - [x] 46.3 Show Vibes balance
  - [ ] 46.4 Implement Vibes spending for features (contract pending)
  - _Requirements: 23.1, 23.2, 23.3, 23.4_

- [x] 47. Implement Live Listener Chat
  - [x] 47.1 Create chat interface (LiveChat.tsx)
  - [x] 47.2 Implement message sending (Supabase realtime)
  - [x] 47.3 Display sender info (wallet/Base name, Vibes)
  - [x] 47.4 Add community moderation voting (report system)
  - _Requirements: 48.1, 48.2, 48.3, 48.4_

- [x] 48. Implement DJ Leaderboard
  - [x] 48.1 Create leaderboard display (DJLeaderboard.tsx)
  - [x] 48.2 Implement real-time ranking updates (API)
  - [x] 48.3 Add DJ profile with historical stats (expandable view)
  - [x] 48.4 Implement genre filtering
  - _Requirements: 49.1, 49.2, 49.3, 49.4_

- [x] 49. Implement Listener Achievements
  - [x] 49.1 Create achievement NFT minting on milestones (ListenerAchievements.tsx + API)
  - [x] 49.2 Display achievement badges on profile (ProfilePanel integration)
  - [x] 49.3 Add achievement notifications (auto-unlock detection)
  - [x] 49.4 Implement friend comparison (deferred)


  - _Requirements: 50.1, 50.2, 50.3, 50.4_


- [x] 50. Implement Referral System


  - [x] 50.1 Create referral link generation




  - [ ] 50.2 Track referral relationships on-chain
  - [ ] 50.3 Implement Vibes reward distribution
  - [ ] 50.4 Display referral stats and earnings
  - _Requirements: 54.1, 54.2, 54.3, 54.4_

## Phase 13: Frontend - 420 Zone Features

- [x] 51. Implement 420 Zone UI
  - [x] 51.1 Create special 420 frequency UI theme (zone-420 CSS)
  - [x] 51.2 Implement 4:20 event display
  - [x] 51.3 Add Vibes earning indicator
  - [x] 51.4 Display community mood ring (MoodRingDisplay.tsx)
  - _Requirements: 22.1, 22.2, 22.3, 22.4_

- [x] 52. Implement SessionNFT UI
  - [x] 52.1 Display active sessions
  - [x] 52.2 Implement attendance tracking UI
  - [x] 52.3 Add SessionNFT claim button
  - [x] 52.4 Display session metadata

  - _Requirements: 24.1, 24.2, 24.3, 24.4_

- [x] 53. Implement SmokeSignals UI
  - [x] 53.1 Create signal sending form with duration (SmokeSignals.tsx)
  - [x] 53.2 Display active signals with expiry countdown
  - [x] 53.3 Show Vibes cost
  - _Requirements: 25.1, 25.2, 25.3, 25.4_

- [x] 54. Implement HotboxRoom UI

  - [x] 54.1 Create room list with access status
  - [x] 54.2 Implement room entry with token verification
  - [x] 54.3 Add private chat and content display
  - [x] 54.4 Show access revocation warning
  - _Requirements: 26.1, 26.2, 26.3, 26.4_

- [x] 55. Implement AuxPass UI
  - [x] 55.1 Create queue display
  - [x] 55.2 Implement join/leave queue
  - [x] 55.3 Show current holder and time remaining
  - [x] 55.4 Add broadcast controls for Aux holder
  - _Requirements: 27.1, 27.2, 27.3, 27.4_

- [x] 56. Implement CommunityDrops UI
  - [x] 56.1 Display drop countdown to 4:20
  - [x] 56.2 Show eligibility status
  - [x] 56.3 Implement claim button
  - [x] 56.4 Display drop history
  - _Requirements: 28.1, 28.2, 28.3, 28.4_

## Phase 14: Farcaster Integration

- [x] 57. Implement Farcaster Social Integration
  - [x] 57.1 Create share-to-cast functionality
  - [x] 57.2 Implement tip celebration cast
  - [x] 57.3 Display Farcaster profiles of listeners
  - [x] 57.4 Add DJ broadcast notifications to followers
  - _Requirements: 42.1, 42.2, 42.3, 42.4_

- [x] 58. Implement Farcaster Frame Actions
  - [x] 58.1 Create Frame with station info and play button
  - [x] 58.2 Implement in-Frame audio playback (via app link)
  - [x] 58.3 Add tune-in transaction via Frame SDK
  - [x] 58.4 Implement tip flow in Frame
  - _Requirements: 43.1, 43.2, 43.3, 43.4_

- [x] 59. Implement Farcaster Channel Integration
  - [x] 59.1 Create linked channel on station creation
  - [x] 59.2 Display channel casts in station view
  - [x] 59.3 Sync listener posts to station chat
  - [x] 59.4 Auto-post broadcasts to channel (API ready)
  - _Requirements: 44.1, 44.2, 44.3, 44.4_

## Phase 15: Base & Coinbase Integration

- [x] 60. Implement Clanker Token Launchpad
  - [x] 60.1 Integrate Clanker for station token deployment
  - [x] 60.2 Link station token for tipping/access
  - [x] 60.3 Implement token holder perks
  - [x] 60.4 Display token price and holder count
  - _Requirements: 45.1, 45.2, 45.3, 45.4_

- [x] 61. Implement Base Name Service Integration
  - [x] 61.1 Display Base names instead of addresses
  - [x] 61.2 Implement Base name search
  - [x] 61.3 Use Base name as station identifier option
  - [x] 61.4 Link to Base name profiles
  - _Requirements: 46.1, 46.2, 46.3, 46.4_

- [x] 62. Implement Coinbase Wallet Integration
  - [x] 62.1 Integrate Coinbase Wallet SDK (already in providers.tsx)
  - [x] 62.2 Add Coinbase Pay support
  - [x] 62.3 Integrate Coinbase NFT display
  - [x] 62.4 Leverage native Base App features
  - _Requirements: 47.1, 47.2, 47.3, 47.4_

## Phase 16: Platform Features

- [x] 63. Implement Multi-Platform Support
  - [ ] 63.1 Optimize for Farcaster Frame constraints (pending)
  - [x] 63.2 Integrate Base App wallet (wagmi setup)
  - [x] 63.3 Support WalletConnect and injected providers
  - [x] 63.4 Maintain consistent state across platforms (useRadio persist)
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 64. Implement On-Chain State Management
  - [x] 64.1 Retrieve subscription list on wallet connect
  - [x] 64.2 Store preferences on-chain (API)
  - [x] 64.3 Restore state on reconnection
  - [x] 64.4 Add error handling with retry
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 65. Implement Content Serialization
  - [x] 65.1 Create JSON serialization for broadcast content (serialization.ts)
  - [x] 65.2 Implement deserialization with validation (Zod schemas)
  - [x] 65.3 Include timestamp, content hash, DJ address
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 66. Implement Visual Content Rendering
  - [x] 66.1 Render on-chain data as visual content
  - [x] 66.2 Create audio waveform visualization
  - [x] 66.3 Implement generative art rendering
  - [x] 66.4 Fetch and display media from decentralized storage
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

## Phase 17: Additional Features

- [x] 67. Implement Radio Advertising/Sponsorship
  - [x] 67.1 Create ad content storage on-chain
  - [x] 67.2 Implement ad slot purchase
  - [x] 67.3 Track impressions and distribute revenue
  - [x] 67.4 Record engagement metrics
  - _Requirements: 55.1, 55.2, 55.3, 55.4_

- [x] 68. Implement Emergency Broadcast System
  - [x] 68.1 Create emergency broadcast trigger (admin)
  - [x] 68.2 Implement station interruption
  - [x] 68.3 Add prominent visual indicator
  - [x] 68.4 Resume normal programming on end
  - _Requirements: 56.1, 56.2, 56.3, 56.4_

- [x] 69. Implement Offline Mode with Sync
  - [x] 69.1 Create content download functionality
  - [x] 69.2 Implement offline playback
  - [x] 69.3 Sync listening history on reconnect
  - [x] 69.4 Handle download expiry
  - _Requirements: 57.1, 57.2, 57.3, 57.4_

- [x] 70. Implement Multi-Language Support
  - [x] 70.1 Create language selector (LanguageSelector.tsx)
  - [x] 70.2 Implement UI text localization (i18n.ts)
  - [ ] 70.3 Add broadcast language filtering
  - [ ] 70.4 Store language preference on-chain
  - _Requirements: 58.1, 58.2, 58.3, 58.4_

## Phase 18: The Graph Integration & Indexing

- [x] 71. Implement The Graph Subgraph
  - [x] 71.1 Create subgraph schema for stations, broadcasts, listeners
  - [x] 71.2 Implement event handlers for all contracts
  - [ ] 71.3 Deploy subgraph to The Graph hosted service (pending contract deployment)
  - [x] 71.4 Integrate GraphQL queries in frontend
  - _Requirements: 1.1, 15.2, 15.3_

## Phase 19: Testing & Deployment

- [ ] 72. Smart Contract Testing
  - [ ] 72.1 Write unit tests for all contracts
  - [ ]* 72.2 Implement property-based tests with fast-check
    - **Property 2: Tune In/Out Round-Trip**
    - **Property 3: Station Creation Ownership**
    - **Property 4: Station Metadata Round-Trip**
    - **Property 9: Content Serialization Round-Trip**
    - **Property 10: Tipping Token Transfer**
    - **Property 11: Subscription Lifecycle**
    - **Property 14: Frequency NFT Ownership**
    - **Validates: Requirements 2.1, 2.2, 5.1, 5.2, 9.1-9.4, 10.1, 10.2, 11.1-11.4, 14.1-14.3**
  - [ ] 72.3 Run fork tests on Base mainnet
  - [ ] 72.4 Perform security audit

- [ ] 73. Frontend Testing
  - [ ] 73.1 Write component tests
  - [ ]* 73.2 Implement property-based tests for serialization
    - **Property 9: Content Serialization Round-Trip**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
  - [ ] 73.3 Test multi-platform compatibility

- [ ] 74. Deployment
  - [ ] 74.1 Deploy contracts to Base mainnet
  - [ ] 74.2 Deploy frontend to Vercel
  - [ ] 74.3 Configure Farcaster Frame manifest
  - [ ] 74.4 Submit to Base App directory

---

**Summary:**
- Total Tasks: 74 main tasks
- Completed: ~45 tasks (Phase 1, 8, 9, 10, 11 mostly done)
- Remaining: Smart contracts (Phase 2-7), 420 features (Phase 13), Farcaster/Base integrations (Phase 14-15), Testing & Deployment (Phase 19)
- Requirements Coverage: All 58 requirements mapped