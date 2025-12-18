// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BroadcastManager
 * @notice Central manager for broadcast content across all stations
 * @dev Stores content hashes and metadata, supports IPFS and blob storage
 * 
 * Content Storage Options:
 * 1. IPFS - contentHash is IPFS CID
 * 2. Blob (EIP-4844) - contentHash is blob commitment
 * 3. Arweave - contentHash is Arweave TX ID
 */
contract BroadcastManager is Ownable, ReentrancyGuard {
    // =============================================================
    //                           TYPES
    // =============================================================
    
    enum StorageType { IPFS, BLOB, ARWEAVE, CUSTOM }
    enum ContentType { AUDIO, VIDEO, IMAGE, METADATA, PLAYLIST }
    
    struct BroadcastContent {
        bytes32 contentHash;        // Content identifier (IPFS CID, blob commitment, etc.)
        address station;            // Station contract address
        address dj;                 // DJ who created the broadcast
        uint256 frequency;          // Station frequency
        uint256 timestamp;          // Block timestamp
        uint256 duration;           // Content duration in seconds (0 = unknown)
        StorageType storageType;    // Where content is stored
        ContentType contentType;    // Type of content
        string title;               // Broadcast title
        string artist;              // Artist/creator name
        bool isLive;                // Is this a live broadcast
    }
    
    struct ContentMetadata {
        string title;
        string artist;
        string album;
        string genre;
        string imageUrl;
        uint256 bpm;
        string[] tags;
    }
    
    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice All broadcasts indexed by content hash
    mapping(bytes32 => BroadcastContent) public broadcasts;
    
    /// @notice Broadcasts by station
    mapping(address => bytes32[]) public stationBroadcasts;
    
    /// @notice Broadcasts by DJ
    mapping(address => bytes32[]) public djBroadcasts;
    
    /// @notice Broadcasts by frequency
    mapping(uint256 => bytes32[]) public frequencyBroadcasts;
    
    /// @notice Content metadata (optional, stored separately)
    mapping(bytes32 => ContentMetadata) public contentMetadata;
    
    /// @notice Live broadcasts (station => contentHash)
    mapping(address => bytes32) public liveStreams;
    
    /// @notice Authorized stations that can register broadcasts
    mapping(address => bool) public authorizedStations;
    
    /// @notice Total broadcast count
    uint256 public totalBroadcasts;
    
    /// @notice All content hashes (for enumeration)
    bytes32[] public allBroadcasts;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event BroadcastRegistered(
        bytes32 indexed contentHash,
        address indexed station,
        address indexed dj,
        uint256 frequency,
        StorageType storageType,
        ContentType contentType,
        string title
    );
    
    event LiveStreamStarted(
        bytes32 indexed contentHash,
        address indexed station,
        address indexed dj,
        uint256 frequency
    );
    
    event LiveStreamEnded(
        bytes32 indexed contentHash,
        address indexed station,
        uint256 duration
    );
    
    event MetadataUpdated(
        bytes32 indexed contentHash,
        string title,
        string artist
    );
    
    event StationAuthorized(address indexed station);
    event StationRevoked(address indexed station);
    
    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================
    
    constructor() Ownable(msg.sender) {}
    
    // =============================================================
    //                        MODIFIERS
    // =============================================================
    
    modifier onlyAuthorizedStation() {
        require(authorizedStations[msg.sender], "BroadcastManager: not authorized");
        _;
    }
    
    // =============================================================
    //                    BROADCAST REGISTRATION
    // =============================================================
    
    /**
     * @notice Register a new broadcast
     * @param contentHash The content identifier
     * @param frequency Station frequency
     * @param dj DJ address
     * @param duration Content duration in seconds
     * @param storageType Where content is stored
     * @param contentType Type of content
     * @param title Broadcast title
     * @param artist Artist name
     */
    function registerBroadcast(
        bytes32 contentHash,
        uint256 frequency,
        address dj,
        uint256 duration,
        StorageType storageType,
        ContentType contentType,
        string calldata title,
        string calldata artist
    ) external onlyAuthorizedStation {
        require(contentHash != bytes32(0), "BroadcastManager: invalid hash");
        require(broadcasts[contentHash].timestamp == 0, "BroadcastManager: already registered");
        
        BroadcastContent memory content = BroadcastContent({
            contentHash: contentHash,
            station: msg.sender,
            dj: dj,
            frequency: frequency,
            timestamp: block.timestamp,
            duration: duration,
            storageType: storageType,
            contentType: contentType,
            title: title,
            artist: artist,
            isLive: false
        });
        
        broadcasts[contentHash] = content;
        stationBroadcasts[msg.sender].push(contentHash);
        djBroadcasts[dj].push(contentHash);
        frequencyBroadcasts[frequency].push(contentHash);
        allBroadcasts.push(contentHash);
        totalBroadcasts++;
        
        emit BroadcastRegistered(
            contentHash,
            msg.sender,
            dj,
            frequency,
            storageType,
            contentType,
            title
        );
    }
    
    /**
     * @notice Start a live stream
     * @param contentHash Stream identifier
     * @param frequency Station frequency
     * @param dj DJ address
     * @param title Stream title
     */
    function startLiveStream(
        bytes32 contentHash,
        uint256 frequency,
        address dj,
        string calldata title
    ) external onlyAuthorizedStation {
        require(contentHash != bytes32(0), "BroadcastManager: invalid hash");
        require(liveStreams[msg.sender] == bytes32(0), "BroadcastManager: already streaming");
        
        BroadcastContent memory content = BroadcastContent({
            contentHash: contentHash,
            station: msg.sender,
            dj: dj,
            frequency: frequency,
            timestamp: block.timestamp,
            duration: 0,
            storageType: StorageType.CUSTOM,
            contentType: ContentType.AUDIO,
            title: title,
            artist: "",
            isLive: true
        });
        
        broadcasts[contentHash] = content;
        liveStreams[msg.sender] = contentHash;
        stationBroadcasts[msg.sender].push(contentHash);
        djBroadcasts[dj].push(contentHash);
        frequencyBroadcasts[frequency].push(contentHash);
        allBroadcasts.push(contentHash);
        totalBroadcasts++;
        
        emit LiveStreamStarted(contentHash, msg.sender, dj, frequency);
    }
    
    /**
     * @notice End a live stream
     */
    function endLiveStream() external onlyAuthorizedStation {
        bytes32 contentHash = liveStreams[msg.sender];
        require(contentHash != bytes32(0), "BroadcastManager: no active stream");
        
        BroadcastContent storage content = broadcasts[contentHash];
        content.isLive = false;
        content.duration = block.timestamp - content.timestamp;
        
        delete liveStreams[msg.sender];
        
        emit LiveStreamEnded(contentHash, msg.sender, content.duration);
    }
    
    /**
     * @notice Update broadcast metadata
     * @param contentHash The content identifier
     * @param metadata The metadata to store
     */
    function setMetadata(
        bytes32 contentHash,
        ContentMetadata calldata metadata
    ) external onlyAuthorizedStation {
        require(broadcasts[contentHash].station == msg.sender, "BroadcastManager: not owner");
        
        contentMetadata[contentHash] = metadata;
        
        // Update main record title/artist
        broadcasts[contentHash].title = metadata.title;
        broadcasts[contentHash].artist = metadata.artist;
        
        emit MetadataUpdated(contentHash, metadata.title, metadata.artist);
    }
    
    // =============================================================
    //                          GETTERS
    // =============================================================
    
    /**
     * @notice Get broadcast by content hash
     */
    function getBroadcast(bytes32 contentHash) external view returns (BroadcastContent memory) {
        return broadcasts[contentHash];
    }
    
    /**
     * @notice Get broadcasts for a station
     * @param station Station address
     * @param limit Maximum number to return
     * @param offset Starting index
     */
    function getStationBroadcasts(
        address station,
        uint256 limit,
        uint256 offset
    ) external view returns (BroadcastContent[] memory) {
        bytes32[] storage hashes = stationBroadcasts[station];
        return _getBroadcastsFromHashes(hashes, limit, offset);
    }
    
    /**
     * @notice Get broadcasts by DJ
     * @param dj DJ address
     * @param limit Maximum number to return
     * @param offset Starting index
     */
    function getDJBroadcasts(
        address dj,
        uint256 limit,
        uint256 offset
    ) external view returns (BroadcastContent[] memory) {
        bytes32[] storage hashes = djBroadcasts[dj];
        return _getBroadcastsFromHashes(hashes, limit, offset);
    }
    
    /**
     * @notice Get broadcasts by frequency
     * @param frequency Station frequency
     * @param limit Maximum number to return
     * @param offset Starting index
     */
    function getFrequencyBroadcasts(
        uint256 frequency,
        uint256 limit,
        uint256 offset
    ) external view returns (BroadcastContent[] memory) {
        bytes32[] storage hashes = frequencyBroadcasts[frequency];
        return _getBroadcastsFromHashes(hashes, limit, offset);
    }
    
    /**
     * @notice Get recent broadcasts (global)
     * @param limit Maximum number to return
     */
    function getRecentBroadcasts(uint256 limit) external view returns (BroadcastContent[] memory) {
        uint256 total = allBroadcasts.length;
        if (total == 0) return new BroadcastContent[](0);
        
        uint256 count = limit > total ? total : limit;
        BroadcastContent[] memory result = new BroadcastContent[](count);
        
        for (uint256 i = 0; i < count; i++) {
            bytes32 hash = allBroadcasts[total - 1 - i];
            result[i] = broadcasts[hash];
        }
        
        return result;
    }
    
    /**
     * @notice Get live stream for a station
     */
    function getLiveStream(address station) external view returns (BroadcastContent memory) {
        bytes32 hash = liveStreams[station];
        require(hash != bytes32(0), "BroadcastManager: no live stream");
        return broadcasts[hash];
    }
    
    /**
     * @notice Check if station has active live stream
     */
    function isLive(address station) external view returns (bool) {
        return liveStreams[station] != bytes32(0);
    }
    
    /**
     * @notice Get content metadata
     */
    function getMetadata(bytes32 contentHash) external view returns (ContentMetadata memory) {
        return contentMetadata[contentHash];
    }
    
    /**
     * @notice Get broadcast count for station
     */
    function getStationBroadcastCount(address station) external view returns (uint256) {
        return stationBroadcasts[station].length;
    }
    
    /**
     * @notice Get broadcast count for DJ
     */
    function getDJBroadcastCount(address dj) external view returns (uint256) {
        return djBroadcasts[dj].length;
    }
    
    // =============================================================
    //                       ADMIN FUNCTIONS
    // =============================================================
    
    /**
     * @notice Authorize a station to register broadcasts
     */
    function authorizeStation(address station) external onlyOwner {
        require(station != address(0), "BroadcastManager: invalid station");
        authorizedStations[station] = true;
        emit StationAuthorized(station);
    }
    
    /**
     * @notice Revoke station authorization
     */
    function revokeStation(address station) external onlyOwner {
        authorizedStations[station] = false;
        emit StationRevoked(station);
    }
    
    /**
     * @notice Batch authorize stations
     */
    function authorizeStations(address[] calldata stations) external onlyOwner {
        for (uint256 i = 0; i < stations.length; i++) {
            if (stations[i] != address(0)) {
                authorizedStations[stations[i]] = true;
                emit StationAuthorized(stations[i]);
            }
        }
    }
    
    // =============================================================
    //                       INTERNAL HELPERS
    // =============================================================
    
    function _getBroadcastsFromHashes(
        bytes32[] storage hashes,
        uint256 limit,
        uint256 offset
    ) internal view returns (BroadcastContent[] memory) {
        uint256 total = hashes.length;
        if (offset >= total) return new BroadcastContent[](0);
        
        uint256 end = offset + limit;
        if (end > total) end = total;
        
        uint256 count = end - offset;
        BroadcastContent[] memory result = new BroadcastContent[](count);
        
        // Return in reverse order (newest first)
        for (uint256 i = 0; i < count; i++) {
            uint256 idx = total - 1 - offset - i;
            result[i] = broadcasts[hashes[idx]];
        }
        
        return result;
    }
}
