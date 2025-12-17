# Requirements Document

## Introduction

Web3 Radio adalah mini app yang mentransformasi konsep radio tradisional ke dalam ekosistem Web3 yang full on-chain di Base mainnet. Aplikasi ini dapat dijalankan di Farcaster Frame, Base App, dan browser standar. Semua fungsi radio klasik seperti tuning frequency, volume control, channel switching, dan playback diimplementasikan sebagai interaksi blockchain, di mana setiap "station" adalah smart contract dan setiap "broadcast" adalah on-chain content.

### Base Mainnet Innovation Opportunities

Base mainnet sebagai L2 Ethereum menawarkan beberapa keunggulan yang belum dimanfaatkan untuk konsep radio:

1. **Low Gas Fees** - Memungkinkan micro-transactions untuk setiap interaksi radio (tune, tip, vote)
2. **EIP-4844 Blobs** - Data availability layer untuk menyimpan audio/visual data on-chain dengan biaya rendah
3. **Account Abstraction (ERC-4337)** - Gasless transactions untuk UX seamless
4. **On-chain Events as Broadcast** - Smart contract events sebagai "radio waves" yang bisa di-subscribe
5. **Chainlink VRF** - Randomness untuk generative audio/visual content
6. **The Graph Protocol** - Indexing untuk real-time station discovery
7. **EAS (Ethereum Attestation Service)** - On-chain attestations untuk DJ credentials dan content authenticity

### Novel On-Chain Radio Concepts

- **Frequency as NFT** - Setiap frequency adalah unique NFT yang bisa di-trade
- **Signal Strength** - On-chain metric berdasarkan listener count dan engagement
- **Radio Waves as Events** - Blockchain events yang propagate seperti radio waves
- **Decentralized Audio Streaming** - Audio chunks stored on-chain via blobs
- **Collaborative Mixing** - Multiple DJs dapat mix on same frequency via multi-sig
- **Time-locked Broadcasts** - Content yang unlock pada waktu tertentu (scheduled shows)
- **On-chain Equalizer** - Audio parameters stored and modified on-chain

### 420 On-Chain Culture Integration

Memanfaatkan viral trend 420 on-chain di Base untuk fitur radio yang unik:

1. **420 Frequency** - Special frequency slot (420.0 FM) dengan unique mechanics
2. **Vibes Token** - Social token untuk community engagement dan mood tracking
3. **On-chain Mood Ring** - Collective mood indicator berdasarkan listener reactions
4. **Chill Mode** - Special playback mode dengan on-chain ambient generation
5. **Community Drops** - Random airdrops untuk active listeners pada waktu tertentu (4:20)
6. **Vibe Check** - On-chain voting untuk track/content yang sedang playing
7. **Smoke Signals** - Ephemeral on-chain messages yang disappear setelah waktu tertentu
8. **Session NFTs** - Commemorative NFTs untuk listeners yang hadir di special sessions
9. **Hotbox Mode** - Private listening rooms dengan token-gated access
10. **Pass the Aux** - Rotating DJ control berdasarkan token holdings

## Glossary

- **Web3_Radio_System**: Sistem aplikasi radio terdesentralisasi yang berjalan di blockchain Base
- **Station**: Smart contract yang merepresentasikan channel radio, menyimpan metadata dan content references
- **Frequency**: Identifier unik on-chain untuk setiap station (mirip token ID atau contract address)
- **Broadcast**: Content yang di-publish ke station, disimpan sebagai on-chain data atau IPFS hash
- **Tune_In**: Aksi user untuk subscribe/connect ke station tertentu
- **Tune_Out**: Aksi user untuk unsubscribe/disconnect dari station
- **Volume**: Parameter on-chain yang mengatur prioritas atau visibility content
- **Listener**: Wallet address yang terhubung ke satu atau lebih station
- **DJ**: Wallet address yang memiliki permission untuk broadcast ke station
- **Tip**: Token transfer dari listener ke DJ sebagai apresiasi
- **Subscription**: Paid access ke premium station dengan recurring on-chain payment
- **Visual_Content**: On-chain data yang divisualisasikan sebagai audio waveform, generative art, atau media player
- **$RADIO**: Native token untuk ecosystem (tipping, subscription, governance)
- **Frequency_NFT**: ERC-721 token yang merepresentasikan kepemilikan frequency unik
- **Signal_Strength**: On-chain metric yang dihitung dari listener count, tips, dan engagement
- **Radio_Wave_Event**: Smart contract event yang berfungsi sebagai broadcast signal
- **Blob_Storage**: EIP-4844 blob untuk menyimpan audio/visual data on-chain
- **Time_Lock**: Mechanism untuk scheduled broadcasts yang unlock pada waktu tertentu
- **Equalizer_Params**: On-chain parameters untuk audio processing (bass, treble, etc.)
- **Attestation**: EAS record untuk verifikasi DJ credentials dan content authenticity
- **Vibes_Token**: Social token untuk mood tracking dan community engagement
- **Mood_Ring**: Collective on-chain indicator dari listener reactions
- **Session_NFT**: Commemorative token untuk special broadcast attendance
- **Smoke_Signal**: Ephemeral on-chain message dengan auto-expiry
- **Hotbox_Room**: Token-gated private listening room
- **Aux_Pass**: Rotating DJ control mechanism berdasarkan token holdings

## Requirements

### Requirement 1: Station Discovery

**User Story:** As a listener, I want to browse and discover radio stations by frequency, so that I can find content that interests me.

#### Acceptance Criteria

1. WHEN a user opens the Web3_Radio_System THEN the Web3_Radio_System SHALL display a list of available stations retrieved from the blockchain
2. WHEN a user searches for a specific frequency THEN the Web3_Radio_System SHALL query the smart contract and return the matching station
3. WHEN a user filters stations by category THEN the Web3_Radio_System SHALL display only stations matching the selected category
4. IF no stations match the search criteria THEN the Web3_Radio_System SHALL display a message indicating no results found

### Requirement 2: Tune In/Out Functionality

**User Story:** As a listener, I want to tune in and tune out of stations, so that I can manage my subscriptions on-chain.

#### Acceptance Criteria

1. WHEN a user tunes in to a station THEN the Web3_Radio_System SHALL execute a blockchain transaction to register the listener address
2. WHEN a user tunes out of a station THEN the Web3_Radio_System SHALL execute a blockchain transaction to remove the listener registration
3. WHILE a user is tuned in to a station THEN the Web3_Radio_System SHALL display real-time broadcasts from that station
4. WHEN a tune in transaction fails THEN the Web3_Radio_System SHALL display an error message with the failure reason

### Requirement 3: Playback Control

**User Story:** As a listener, I want to control playback of broadcasts, so that I can play and pause content as needed.

#### Acceptance Criteria

1. WHEN a user presses play on a broadcast THEN the Web3_Radio_System SHALL retrieve the content from on-chain storage or IPFS and begin playback
2. WHEN a user presses pause THEN the Web3_Radio_System SHALL stop playback and preserve the current position
3. WHEN a user resumes playback THEN the Web3_Radio_System SHALL continue from the preserved position
4. IF broadcast content is unavailable THEN the Web3_Radio_System SHALL display an error indicating content retrieval failure

### Requirement 4: Volume Control

**User Story:** As a listener, I want to adjust volume settings, so that I can control the audio output level.

#### Acceptance Criteria

1. WHEN a user adjusts the volume slider THEN the Web3_Radio_System SHALL update the audio output level immediately
2. WHEN a user mutes the audio THEN the Web3_Radio_System SHALL set volume to zero and display a mute indicator
3. WHEN a user unmutes the audio THEN the Web3_Radio_System SHALL restore the previous volume level
4. WHILE volume is at zero THEN the Web3_Radio_System SHALL display a visual mute indicator

### Requirement 5: Station Creation (DJ Mode)

**User Story:** As a DJ, I want to create and manage my own station, so that I can broadcast content to listeners.

#### Acceptance Criteria

1. WHEN a DJ creates a new station THEN the Web3_Radio_System SHALL deploy a new station smart contract with the DJ as owner
2. WHEN a DJ sets station metadata THEN the Web3_Radio_System SHALL store the metadata on-chain including name, description, and category
3. WHEN a DJ broadcasts content THEN the Web3_Radio_System SHALL store the content reference on-chain and notify tuned-in listeners
4. IF station creation transaction fails THEN the Web3_Radio_System SHALL display an error with the failure reason

### Requirement 6: Broadcasting

**User Story:** As a DJ, I want to broadcast content to my station, so that listeners can receive my transmissions.

#### Acceptance Criteria

1. WHEN a DJ uploads content THEN the Web3_Radio_System SHALL store the content on IPFS and record the hash on-chain
2. WHEN a DJ publishes a broadcast THEN the Web3_Radio_System SHALL emit an on-chain event that listeners can subscribe to
3. WHEN a broadcast is published THEN the Web3_Radio_System SHALL update the station's latest broadcast reference
4. WHILE a station has active listeners THEN the Web3_Radio_System SHALL maintain a count of current listeners on-chain

### Requirement 7: Multi-Platform Support

**User Story:** As a user, I want to access Web3 Radio from multiple platforms, so that I can use the app wherever I am.

#### Acceptance Criteria

1. WHEN the app runs in a Farcaster Frame THEN the Web3_Radio_System SHALL render within Frame constraints and use Frame SDK for wallet interactions
2. WHEN the app runs in Base App THEN the Web3_Radio_System SHALL integrate with Base wallet and use Base-specific optimizations
3. WHEN the app runs in a standard browser THEN the Web3_Radio_System SHALL support WalletConnect and injected wallet providers
4. WHEN switching platforms THEN the Web3_Radio_System SHALL maintain consistent user state via on-chain data

### Requirement 8: On-Chain State Management

**User Story:** As a user, I want my preferences and subscriptions stored on-chain, so that my data persists across sessions and platforms.

#### Acceptance Criteria

1. WHEN a user connects their wallet THEN the Web3_Radio_System SHALL retrieve their subscription list from the blockchain
2. WHEN a user updates preferences THEN the Web3_Radio_System SHALL store the updated preferences on-chain
3. WHEN a user reconnects from a different device THEN the Web3_Radio_System SHALL restore their complete state from on-chain data
4. IF on-chain state retrieval fails THEN the Web3_Radio_System SHALL display an error and offer retry option

### Requirement 9: Content Serialization

**User Story:** As a system, I want to serialize and deserialize broadcast content, so that content can be stored and retrieved reliably.

#### Acceptance Criteria

1. WHEN content is prepared for storage THEN the Web3_Radio_System SHALL serialize the content metadata to JSON format
2. WHEN content is retrieved from storage THEN the Web3_Radio_System SHALL deserialize the JSON and validate the structure
3. WHEN serializing content THEN the Web3_Radio_System SHALL include timestamp, content hash, and DJ address
4. WHEN deserializing content THEN the Web3_Radio_System SHALL produce an object equivalent to the original content

### Requirement 10: Tokenomics - Tipping

**User Story:** As a listener, I want to tip DJs with tokens, so that I can support creators I enjoy.

#### Acceptance Criteria

1. WHEN a listener sends a tip THEN the Web3_Radio_System SHALL execute a token transfer from listener to DJ wallet
2. WHEN a tip is sent THEN the Web3_Radio_System SHALL emit an on-chain event recording the tip amount and sender
3. WHEN a tip transaction completes THEN the Web3_Radio_System SHALL display a confirmation with transaction hash
4. IF a tip transaction fails THEN the Web3_Radio_System SHALL display an error and refund any locked tokens

### Requirement 11: Tokenomics - Subscription

**User Story:** As a listener, I want to subscribe to premium stations, so that I can access exclusive content.

#### Acceptance Criteria

1. WHEN a listener subscribes to a premium station THEN the Web3_Radio_System SHALL execute a token transfer for the subscription fee
2. WHEN a subscription is active THEN the Web3_Radio_System SHALL grant access to premium broadcasts
3. WHEN a subscription expires THEN the Web3_Radio_System SHALL revoke premium access and prompt for renewal
4. WHEN checking subscription status THEN the Web3_Radio_System SHALL verify the on-chain subscription record

### Requirement 12: Visual Content Rendering

**User Story:** As a listener, I want to see visual representations of broadcasts, so that I can experience content beyond just audio.

#### Acceptance Criteria

1. WHEN a broadcast is playing THEN the Web3_Radio_System SHALL render on-chain data as visual content (waveforms, generative art, or media visualization)
2. WHEN content type is audio THEN the Web3_Radio_System SHALL display an audio waveform visualization synchronized with playback
3. WHEN content type is generative THEN the Web3_Radio_System SHALL render generative art based on on-chain parameters
4. WHEN content includes media references THEN the Web3_Radio_System SHALL fetch and display the media from decentralized storage

### Requirement 13: Token Governance

**User Story:** As a $RADIO token holder, I want to participate in governance, so that I can influence the platform direction.

#### Acceptance Criteria

1. WHEN a governance proposal is created THEN the Web3_Radio_System SHALL record the proposal on-chain with voting parameters
2. WHEN a token holder votes THEN the Web3_Radio_System SHALL record the vote weighted by token balance
3. WHEN voting period ends THEN the Web3_Radio_System SHALL calculate results and execute approved proposals
4. WHILE a proposal is active THEN the Web3_Radio_System SHALL display current vote tallies to all users

### Requirement 14: Frequency NFT Ownership

**User Story:** As a DJ, I want to own my frequency as an NFT, so that I have verifiable ownership and can trade it.

#### Acceptance Criteria

1. WHEN a DJ mints a new frequency THEN the Web3_Radio_System SHALL create an ERC-721 NFT with unique frequency identifier
2. WHEN a frequency NFT is transferred THEN the Web3_Radio_System SHALL update station ownership to the new holder
3. WHEN querying frequency ownership THEN the Web3_Radio_System SHALL return the current NFT holder address
4. WHILE a frequency is owned THEN the Web3_Radio_System SHALL display ownership badge on the station

### Requirement 15: Signal Strength Metrics

**User Story:** As a listener, I want to see signal strength of stations, so that I can discover popular and engaging content.

#### Acceptance Criteria

1. WHEN calculating signal strength THEN the Web3_Radio_System SHALL aggregate listener count, tip volume, and engagement metrics on-chain
2. WHEN signal strength changes THEN the Web3_Radio_System SHALL update the on-chain metric in real-time
3. WHEN browsing stations THEN the Web3_Radio_System SHALL display signal strength indicator for each station
4. WHEN sorting stations THEN the Web3_Radio_System SHALL allow ordering by signal strength

### Requirement 16: On-Chain Audio Storage (Blob)

**User Story:** As a DJ, I want to store audio data fully on-chain, so that my content is permanently decentralized.

#### Acceptance Criteria

1. WHEN a DJ uploads audio content THEN the Web3_Radio_System SHALL chunk the audio and store via EIP-4844 blobs
2. WHEN retrieving audio THEN the Web3_Radio_System SHALL reconstruct the audio from on-chain blob data
3. WHEN audio is stored THEN the Web3_Radio_System SHALL record the blob commitment hash on the station contract
4. IF blob storage fails THEN the Web3_Radio_System SHALL fallback to IPFS with on-chain hash reference

### Requirement 17: Scheduled Broadcasts (Time-Lock)

**User Story:** As a DJ, I want to schedule broadcasts for future times, so that I can plan shows in advance.

#### Acceptance Criteria

1. WHEN a DJ schedules a broadcast THEN the Web3_Radio_System SHALL store the content with a time-lock parameter
2. WHEN the scheduled time arrives THEN the Web3_Radio_System SHALL automatically unlock and publish the broadcast
3. WHEN viewing scheduled broadcasts THEN the Web3_Radio_System SHALL display countdown timer until unlock
4. WHILE content is time-locked THEN the Web3_Radio_System SHALL prevent access to the content

### Requirement 18: On-Chain Equalizer

**User Story:** As a listener, I want to adjust equalizer settings stored on-chain, so that my audio preferences persist across sessions.

#### Acceptance Criteria

1. WHEN a listener adjusts equalizer THEN the Web3_Radio_System SHALL store bass, treble, and mid parameters on-chain
2. WHEN a listener connects wallet THEN the Web3_Radio_System SHALL retrieve and apply their equalizer settings
3. WHEN equalizer is modified THEN the Web3_Radio_System SHALL apply changes to audio output in real-time
4. WHEN sharing equalizer preset THEN the Web3_Radio_System SHALL allow export as shareable on-chain reference

### Requirement 19: DJ Attestations

**User Story:** As a DJ, I want to have verified credentials, so that listeners can trust my authenticity.

#### Acceptance Criteria

1. WHEN a DJ requests verification THEN the Web3_Radio_System SHALL create an EAS attestation with credential data
2. WHEN viewing a DJ profile THEN the Web3_Radio_System SHALL display attestation badges for verified credentials
3. WHEN an attestation is revoked THEN the Web3_Radio_System SHALL remove the verification badge
4. WHEN filtering stations THEN the Web3_Radio_System SHALL allow filtering by verified DJs only

### Requirement 20: Gasless Transactions (Account Abstraction)

**User Story:** As a user, I want to interact without paying gas directly, so that the experience is seamless.

#### Acceptance Criteria

1. WHEN a user performs an action THEN the Web3_Radio_System SHALL bundle the transaction via ERC-4337 paymaster
2. WHEN gas is sponsored THEN the Web3_Radio_System SHALL execute the transaction without user ETH balance
3. WHEN paymaster balance is low THEN the Web3_Radio_System SHALL fallback to user-paid gas with notification
4. WHILE using gasless mode THEN the Web3_Radio_System SHALL display sponsored transaction indicator

### Requirement 21: Collaborative Mixing (Multi-Sig Station)

**User Story:** As a DJ collective, I want to share station control with other DJs, so that we can collaborate on broadcasts.

#### Acceptance Criteria

1. WHEN creating a collaborative station THEN the Web3_Radio_System SHALL deploy a multi-sig controlled station contract
2. WHEN a DJ proposes a broadcast THEN the Web3_Radio_System SHALL require approval from threshold of co-DJs
3. WHEN threshold approvals are met THEN the Web3_Radio_System SHALL execute the broadcast automatically
4. WHEN managing collaborators THEN the Web3_Radio_System SHALL allow adding or removing DJs via multi-sig vote

### Requirement 22: 420 Frequency Special Zone

**User Story:** As a community member, I want to access the special 420 frequency, so that I can participate in unique on-chain culture experiences.

#### Acceptance Criteria

1. WHEN accessing frequency 420.0 THEN the Web3_Radio_System SHALL load special UI theme and mechanics
2. WHEN the clock reaches 4:20 (any timezone) THEN the Web3_Radio_System SHALL trigger special on-chain events and drops
3. WHEN in 420 zone THEN the Web3_Radio_System SHALL enable Vibes_Token earning for active participants
4. WHILE in 420 frequency THEN the Web3_Radio_System SHALL display community mood ring indicator

### Requirement 23: Vibes Token and Mood Tracking

**User Story:** As a listener, I want to express my mood and earn vibes, so that I can participate in community sentiment.

#### Acceptance Criteria

1. WHEN a listener reacts to content THEN the Web3_Radio_System SHALL record the reaction on-chain and mint Vibes_Token
2. WHEN aggregating reactions THEN the Web3_Radio_System SHALL calculate collective mood and update Mood_Ring
3. WHEN Mood_Ring changes THEN the Web3_Radio_System SHALL adjust visual theme to reflect community sentiment
4. WHEN spending Vibes_Token THEN the Web3_Radio_System SHALL enable special features like song requests or shoutouts

### Requirement 24: Session NFTs

**User Story:** As a listener, I want to receive commemorative NFTs for attending special sessions, so that I have proof of participation.

#### Acceptance Criteria

1. WHEN a special session starts THEN the Web3_Radio_System SHALL create a Session_NFT collection for that event
2. WHEN a listener is present for minimum duration THEN the Web3_Radio_System SHALL mint a Session_NFT to their wallet
3. WHEN viewing Session_NFT THEN the Web3_Radio_System SHALL display session metadata including timestamp, DJ, and attendee count
4. WHEN session ends THEN the Web3_Radio_System SHALL close minting and finalize the collection

### Requirement 25: Smoke Signals (Ephemeral Messages)

**User Story:** As a listener, I want to send ephemeral messages that disappear, so that I can communicate without permanent on-chain footprint.

#### Acceptance Criteria

1. WHEN a user sends a Smoke_Signal THEN the Web3_Radio_System SHALL store the message with expiry timestamp on-chain
2. WHEN expiry time is reached THEN the Web3_Radio_System SHALL mark the message as expired and hide from display
3. WHEN viewing chat THEN the Web3_Radio_System SHALL only display non-expired Smoke_Signals
4. WHEN sending Smoke_Signal THEN the Web3_Radio_System SHALL require Vibes_Token burn as cost

### Requirement 26: Hotbox Rooms (Token-Gated)

**User Story:** As a token holder, I want to access private listening rooms, so that I can enjoy exclusive content with my community.

#### Acceptance Criteria

1. WHEN creating a Hotbox_Room THEN the Web3_Radio_System SHALL deploy a token-gated access contract
2. WHEN a user attempts to enter THEN the Web3_Radio_System SHALL verify token holdings meet minimum threshold
3. WHILE in Hotbox_Room THEN the Web3_Radio_System SHALL enable private chat and exclusive content
4. IF token balance drops below threshold THEN the Web3_Radio_System SHALL revoke access and remove from room

### Requirement 27: Pass the Aux (Rotating DJ)

**User Story:** As a community member, I want to take turns being DJ, so that everyone can share their music.

#### Acceptance Criteria

1. WHEN Aux_Pass mode is enabled THEN the Web3_Radio_System SHALL create a queue of eligible DJs based on token holdings
2. WHEN current DJ session ends THEN the Web3_Radio_System SHALL automatically transfer control to next in queue
3. WHEN holding the Aux THEN the Web3_Radio_System SHALL grant temporary broadcast permissions
4. WHEN Aux holder is inactive THEN the Web3_Radio_System SHALL skip to next eligible holder after timeout

### Requirement 28: Community Drops

**User Story:** As an active listener, I want to receive random airdrops, so that I am rewarded for engagement.

#### Acceptance Criteria

1. WHEN clock reaches 4:20 THEN the Web3_Radio_System SHALL trigger airdrop eligibility check for active listeners
2. WHEN airdrop triggers THEN the Web3_Radio_System SHALL use Chainlink VRF to randomly select recipients
3. WHEN selected for drop THEN the Web3_Radio_System SHALL mint reward tokens or NFTs to recipient wallet
4. WHEN viewing drop history THEN the Web3_Radio_System SHALL display past drops with recipient addresses


### Requirement 29: Auto-Scan Discovery

**User Story:** As a listener, I want to auto-scan through frequencies, so that I can discover new stations without manual searching.

#### Acceptance Criteria

1. WHEN a user activates auto-scan THEN the Web3_Radio_System SHALL iterate through frequencies and pause on active stations
2. WHEN auto-scan finds an active station THEN the Web3_Radio_System SHALL play a preview and wait for user confirmation
3. WHEN user confirms during scan THEN the Web3_Radio_System SHALL tune in to that station and stop scanning
4. WHEN user skips during scan THEN the Web3_Radio_System SHALL continue to the next active frequency

### Requirement 30: Preset Favorites

**User Story:** As a listener, I want to save favorite stations as presets, so that I can quickly access them later.

#### Acceptance Criteria

1. WHEN a user saves a station as preset THEN the Web3_Radio_System SHALL store the frequency in user's on-chain preset list
2. WHEN a user selects a preset THEN the Web3_Radio_System SHALL immediately tune to that saved frequency
3. WHEN viewing presets THEN the Web3_Radio_System SHALL display all saved stations with their current status
4. WHEN a user removes a preset THEN the Web3_Radio_System SHALL delete the frequency from on-chain preset list

### Requirement 31: Now Playing Info (RDS Equivalent)

**User Story:** As a listener, I want to see information about what's currently playing, so that I can discover new content.

#### Acceptance Criteria

1. WHILE a broadcast is playing THEN the Web3_Radio_System SHALL display current track title, artist, and DJ name
2. WHEN track changes THEN the Web3_Radio_System SHALL update the now playing information in real-time
3. WHEN viewing now playing THEN the Web3_Radio_System SHALL show on-chain metadata including content hash and timestamp
4. WHEN a listener likes current track THEN the Web3_Radio_System SHALL record the preference on-chain

### Requirement 32: Sleep Timer

**User Story:** As a listener, I want to set a sleep timer, so that playback stops automatically after a set duration.

#### Acceptance Criteria

1. WHEN a user sets sleep timer THEN the Web3_Radio_System SHALL store the end time in local state
2. WHEN sleep timer expires THEN the Web3_Radio_System SHALL fade out audio and stop playback
3. WHEN viewing active timer THEN the Web3_Radio_System SHALL display countdown until auto-stop
4. WHEN user cancels timer THEN the Web3_Radio_System SHALL remove the scheduled stop

### Requirement 33: Alarm/Wake-Up Radio

**User Story:** As a listener, I want to set an alarm that plays a station, so that I can wake up to my favorite content.

#### Acceptance Criteria

1. WHEN a user sets radio alarm THEN the Web3_Radio_System SHALL store alarm time and target frequency on-chain
2. WHEN alarm time arrives THEN the Web3_Radio_System SHALL automatically tune to the set frequency and begin playback
3. WHEN alarm triggers THEN the Web3_Radio_System SHALL gradually increase volume from zero
4. WHEN user dismisses alarm THEN the Web3_Radio_System SHALL stop the alarm but continue playback if desired

### Requirement 34: Broadcast Recording (DVR)

**User Story:** As a listener, I want to record broadcasts, so that I can listen to them later.

#### Acceptance Criteria

1. WHEN a user starts recording THEN the Web3_Radio_System SHALL capture broadcast content and store to user's on-chain storage
2. WHEN recording completes THEN the Web3_Radio_System SHALL mint a Recording_NFT with content reference
3. WHEN viewing recordings THEN the Web3_Radio_System SHALL display user's recorded broadcasts with metadata
4. WHEN playing a recording THEN the Web3_Radio_System SHALL retrieve content from user's storage and play

### Requirement 35: Band/Genre Switching

**User Story:** As a listener, I want to switch between different bands/genres, so that I can explore different content categories.

#### Acceptance Criteria

1. WHEN a user switches band THEN the Web3_Radio_System SHALL filter stations to show only that genre/category
2. WHEN viewing band selector THEN the Web3_Radio_System SHALL display available bands (Music, Talk, News, 420, Ambient)
3. WHEN band is selected THEN the Web3_Radio_System SHALL update frequency range to match that band
4. WHILE in a specific band THEN the Web3_Radio_System SHALL only show stations within that category

### Requirement 36: Request Line

**User Story:** As a listener, I want to request content from DJs, so that I can influence what gets played.

#### Acceptance Criteria

1. WHEN a listener submits a request THEN the Web3_Radio_System SHALL record the request on-chain with Vibes_Token stake
2. WHEN DJ views requests THEN the Web3_Radio_System SHALL display pending requests sorted by stake amount
3. WHEN DJ fulfills a request THEN the Web3_Radio_System SHALL transfer staked tokens to DJ and mark request complete
4. WHEN request expires unfulfilled THEN the Web3_Radio_System SHALL refund staked tokens to requester

### Requirement 37: Reception Quality Indicator

**User Story:** As a listener, I want to see reception quality, so that I know if connection issues are affecting playback.

#### Acceptance Criteria

1. WHILE connected to a station THEN the Web3_Radio_System SHALL display reception quality based on network latency and block confirmation
2. WHEN reception quality drops THEN the Web3_Radio_System SHALL display warning indicator
3. WHEN reception is poor THEN the Web3_Radio_System SHALL attempt to reconnect or switch to backup source
4. WHEN viewing station info THEN the Web3_Radio_System SHALL show historical reception quality metrics

### Requirement 38: Stereo/Audio Mode

**User Story:** As a listener, I want to toggle audio modes, so that I can optimize playback for my setup.

#### Acceptance Criteria

1. WHEN a user toggles stereo mode THEN the Web3_Radio_System SHALL switch between stereo and mono audio output
2. WHEN in mono mode THEN the Web3_Radio_System SHALL combine audio channels for single speaker setups
3. WHEN audio mode changes THEN the Web3_Radio_System SHALL store preference on-chain
4. WHEN connecting from new device THEN the Web3_Radio_System SHALL apply saved audio mode preference


### Requirement 39: Classic Retro Radio UI Theme

**User Story:** As a user, I want the interface to look like a classic retro radio, so that I have a nostalgic and unique visual experience.

#### Acceptance Criteria

1. WHEN the app loads THEN the Web3_Radio_System SHALL display a skeuomorphic retro radio interface with vintage aesthetics
2. WHEN viewing the frequency dial THEN the Web3_Radio_System SHALL render an analog-style tuning dial with glowing frequency numbers
3. WHEN adjusting volume THEN the Web3_Radio_System SHALL display a rotating knob with tactile visual feedback
4. WHEN viewing signal strength THEN the Web3_Radio_System SHALL show a vintage VU meter with needle animation
5. WHILE playing audio THEN the Web3_Radio_System SHALL display warm tube-glow effects and speaker grille visualization

### Requirement 40: Retro Visual Elements

**User Story:** As a user, I want authentic retro visual elements, so that the experience feels like using a real vintage radio.

#### Acceptance Criteria

1. WHEN displaying station info THEN the Web3_Radio_System SHALL use a nixie tube or flip-clock style display
2. WHEN showing preset buttons THEN the Web3_Radio_System SHALL render mechanical push-button style presets
3. WHEN indicating power status THEN the Web3_Radio_System SHALL display a warm pilot light indicator
4. WHEN switching bands THEN the Web3_Radio_System SHALL animate a mechanical band selector switch
5. WHILE in 420 zone THEN the Web3_Radio_System SHALL add psychedelic color overlays to the retro theme

### Requirement 41: Retro Audio Visualization

**User Story:** As a listener, I want retro-style audio visualizations, so that I can see the music in a vintage way.

#### Acceptance Criteria

1. WHEN audio is playing THEN the Web3_Radio_System SHALL display oscilloscope-style waveform visualization
2. WHEN showing equalizer THEN the Web3_Radio_System SHALL render vintage slider-style EQ controls
3. WHEN displaying stereo mode THEN the Web3_Radio_System SHALL show dual VU meters for left/right channels
4. WHEN reception quality changes THEN the Web3_Radio_System SHALL animate static/noise overlay effect
_System SHALL apply saved audio mode preference

### Requirement 42: Farcaster Social Integration

**User Story:** As a Farcaster user, I want to share my radio activity to my feed, so that my followers can discover what I'm listening to.

#### Acceptance Criteria

1. WHEN a user shares current station THEN the Web3_Radio_System SHALL create a Farcaster cast with station info and tune-in link
2. WHEN a user tips a DJ THEN the Web3_Radio_System SHALL optionally post a cast celebrating the tip
3. WHEN viewing a station THEN the Web3_Radio_System SHALL display Farcaster profiles of current listeners
4. WHEN a DJ broadcasts THEN the Web3_Radio_System SHALL optionally notify followers via Farcaster

### Requirement 43: Farcaster Frame Actions

**User Story:** As a Farcaster user, I want to interact with radio directly from my feed, so that I can tune in without leaving the app.

#### Acceptance Criteria

1. WHEN viewing a radio Frame in feed THEN the Web3_Radio_System SHALL display current station info and play button
2. WHEN user clicks play in Frame THEN the Web3_Radio_System SHALL begin audio playback within Frame context
3. WHEN user clicks tune in THEN the Web3_Radio_System SHALL execute tune-in transaction via Frame SDK
4. WHEN user clicks tip THEN the Web3_Radio_System SHALL display tip amount options and execute transfer

### Requirement 44: Farcaster Channel Integration

**User Story:** As a community, I want dedicated Farcaster channels for stations, so that listeners can discuss content.

#### Acceptance Criteria

1. WHEN a DJ creates a station THEN the Web3_Radio_System SHALL optionally create a linked Farcaster channel
2. WHEN viewing station THEN the Web3_Radio_System SHALL display recent casts from the linked channel
3. WHEN a listener posts in channel THEN the Web3_Radio_System SHALL display the cast in station chat
4. WHEN DJ broadcasts THEN the Web3_Radio_System SHALL auto-post to linked channel

### Requirement 45: Clanker Token Launchpad

**User Story:** As a DJ, I want to launch my own station token via Clanker, so that I can create a community economy.

#### Acceptance Criteria

1. WHEN a DJ wants a station token THEN the Web3_Radio_System SHALL integrate with Clanker to deploy a new token
2. WHEN station token is deployed THEN the Web3_Radio_System SHALL link it to the station for tipping and access
3. WHEN listeners hold station token THEN the Web3_Radio_System SHALL grant special perks (priority requests, exclusive content)
4. WHEN station token is traded THEN the Web3_Radio_System SHALL display price and holder count on station page

### Requirement 46: Base Name Service Integration

**User Story:** As a user, I want to use my Base name for my radio identity, so that I have a memorable on-chain identity.

#### Acceptance Criteria

1. WHEN a user has a Base name THEN the Web3_Radio_System SHALL display the Base name instead of wallet address
2. WHEN searching for users THEN the Web3_Radio_System SHALL support Base name lookup
3. WHEN a DJ creates a station THEN the Web3_Radio_System SHALL optionally use Base name as station identifier
4. WHEN viewing profiles THEN the Web3_Radio_System SHALL link to Base name profile

### Requirement 47: Coinbase Wallet Deep Integration

**User Story:** As a Coinbase Wallet user, I want seamless integration, so that I can use radio features easily.

#### Acceptance Criteria

1. WHEN connecting via Coinbase Wallet THEN the Web3_Radio_System SHALL use Coinbase Wallet SDK for optimal UX
2. WHEN making transactions THEN the Web3_Radio_System SHALL support Coinbase Pay for easy token purchase
3. WHEN viewing NFTs THEN the Web3_Radio_System SHALL integrate with Coinbase NFT for display
4. WHEN using Base App THEN the Web3_Radio_System SHALL leverage native Base features

### Requirement 48: Live Listener Chat

**User Story:** As a listener, I want to chat with other listeners in real-time, so that I can discuss the broadcast.

#### Acceptance Criteria

1. WHILE tuned in to a station THEN the Web3_Radio_System SHALL display a live chat with other listeners
2. WHEN a user sends a chat message THEN the Web3_Radio_System SHALL broadcast via on-chain events or off-chain relay
3. WHEN viewing chat THEN the Web3_Radio_System SHALL show sender's wallet/Base name and Vibes balance
4. WHEN a message is flagged THEN the Web3_Radio_System SHALL allow community moderation via voting

### Requirement 49: DJ Leaderboard

**User Story:** As a listener, I want to see top DJs ranked by metrics, so that I can discover popular creators.

#### Acceptance Criteria

1. WHEN viewing leaderboard THEN the Web3_Radio_System SHALL display DJs ranked by listener count, tips, and engagement
2. WHEN a DJ's metrics change THEN the Web3_Radio_System SHALL update leaderboard position in real-time
3. WHEN viewing DJ profile THEN the Web3_Radio_System SHALL show historical ranking and stats
4. WHEN filtering leaderboard THEN the Web3_Radio_System SHALL allow filtering by genre/band

### Requirement 50: Listener Achievements

**User Story:** As a listener, I want to earn achievements for my activity, so that I have recognition for engagement.

#### Acceptance Criteria

1. WHEN a listener reaches milestones THEN the Web3_Radio_System SHALL mint achievement NFTs (first tune-in, 100 hours listened, etc.)
2. WHEN viewing profile THEN the Web3_Radio_System SHALL display earned achievement badges
3. WHEN achievement is earned THEN the Web3_Radio_System SHALL notify user and optionally share to Farcaster
4. WHEN comparing with friends THEN the Web3_Radio_System SHALL show achievement comparison

### Requirement 51: Radio Playlist/Queue

**User Story:** As a DJ, I want to queue multiple broadcasts, so that I can plan continuous programming.

#### Acceptance Criteria

1. WHEN a DJ adds to queue THEN the Web3_Radio_System SHALL store the broadcast order on-chain
2. WHEN current broadcast ends THEN the Web3_Radio_System SHALL automatically play next in queue
3. WHEN viewing queue THEN the Web3_Radio_System SHALL display upcoming broadcasts with estimated times
4. WHEN DJ reorders queue THEN the Web3_Radio_System SHALL update the on-chain order

### Requirement 52: Cross-Station Simulcast

**User Story:** As a DJ collective, I want to simulcast across multiple stations, so that we can reach wider audiences.

#### Acceptance Criteria

1. WHEN a DJ initiates simulcast THEN the Web3_Radio_System SHALL broadcast to multiple linked stations simultaneously
2. WHEN stations are linked for simulcast THEN the Web3_Radio_System SHALL require approval from all station owners
3. WHEN simulcast is active THEN the Web3_Radio_System SHALL aggregate listener counts across all stations
4. WHEN viewing simulcast THEN the Web3_Radio_System SHALL display all participating stations

### Requirement 53: Radio Show Scheduling

**User Story:** As a listener, I want to see upcoming shows, so that I can plan when to tune in.

#### Acceptance Criteria

1. WHEN a DJ schedules a show THEN the Web3_Radio_System SHALL record show time, duration, and description on-chain
2. WHEN viewing station THEN the Web3_Radio_System SHALL display upcoming show schedule
3. WHEN a show is about to start THEN the Web3_Radio_System SHALL notify subscribed listeners
4. WHEN viewing schedule THEN the Web3_Radio_System SHALL allow adding shows to calendar

### Requirement 54: Referral System

**User Story:** As a user, I want to earn rewards for referring new listeners, so that I'm incentivized to grow the community.

#### Acceptance Criteria

1. WHEN a user generates referral link THEN the Web3_Radio_System SHALL create a unique on-chain referral code
2. WHEN a new user joins via referral THEN the Web3_Radio_System SHALL record the referral relationship on-chain
3. WHEN referred user is active THEN the Web3_Radio_System SHALL distribute Vibes rewards to referrer
4. WHEN viewing referrals THEN the Web3_Radio_System SHALL display referral stats and earnings

### Requirement 55: Radio Advertising/Sponsorship

**User Story:** As a sponsor, I want to advertise on stations, so that I can reach the radio audience.

#### Acceptance Criteria

1. WHEN a sponsor creates an ad THEN the Web3_Radio_System SHALL store ad content and targeting parameters on-chain
2. WHEN ad slot is purchased THEN the Web3_Radio_System SHALL transfer tokens to station owner
3. WHEN ad plays THEN the Web3_Radio_System SHALL record impression and distribute revenue
4. WHEN listeners interact with ad THEN the Web3_Radio_System SHALL track engagement metrics on-chain

### Requirement 56: Emergency Broadcast System

**User Story:** As a platform admin, I want to send emergency broadcasts, so that important announcements reach all listeners.

#### Acceptance Criteria

1. WHEN an emergency broadcast is triggered THEN the Web3_Radio_System SHALL interrupt all stations with the announcement
2. WHEN emergency is active THEN the Web3_Radio_System SHALL display prominent visual indicator
3. WHEN emergency ends THEN the Web3_Radio_System SHALL resume normal programming
4. WHEN viewing history THEN the Web3_Radio_System SHALL show past emergency broadcasts

### Requirement 57: Offline Mode with Sync

**User Story:** As a listener, I want to access recorded content offline, so that I can listen without internet.

#### Acceptance Criteria

1. WHEN a user downloads content THEN the Web3_Radio_System SHALL store encrypted content locally
2. WHEN offline THEN the Web3_Radio_System SHALL allow playback of downloaded content
3. WHEN reconnecting THEN the Web3_Radio_System SHALL sync listening history to on-chain state
4. WHEN download expires THEN the Web3_Radio_System SHALL require re-download or subscription renewal

### Requirement 58: Multi-Language Support

**User Story:** As a global user, I want the interface in my language, so that I can use the app comfortably.

#### Acceptance Criteria

1. WHEN a user selects language THEN the Web3_Radio_System SHALL display all UI text in selected language
2. WHEN viewing stations THEN the Web3_Radio_System SHALL allow filtering by broadcast language
3. WHEN language preference is set THEN the Web3_Radio_System SHALL store preference on-chain
4. WHEN auto-detecting THEN the Web3_Radio_System SHALL use browser/device language setting
