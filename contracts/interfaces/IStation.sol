// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title IStation
 * @notice Interface for individual radio station contracts
 */
interface IStation {
    // Enums
    enum BroadcastType { AUDIO, VISUAL, GENERATIVE }

    // Structs
    struct Broadcast {
        bytes32 contentHash;
        uint256 timestamp;
        address dj;
        uint256 unlockTime; // 0 = immediate
        BroadcastType broadcastType;
    }

    struct StationMetadata {
        string name;
        string description;
        string category;
        string imageUrl;
        bool isPremium;
        uint256 subscriptionFee;
    }

    // Events
    event NewBroadcast(bytes32 indexed contentHash, address indexed dj, uint256 timestamp);
    event ScheduledBroadcast(bytes32 indexed contentHash, uint256 unlockTime);
    event DJAdded(address indexed dj);
    event DJRemoved(address indexed dj);
    event MetadataUpdated(string name, string description);

    /**
     * @notice Broadcast content to the station
     * @param contentHash The content hash (IPFS or blob commitment)
     * @param bType The type of broadcast
     */
    function broadcast(bytes32 contentHash, BroadcastType bType) external;

    /**
     * @notice Schedule a broadcast for future time
     * @param contentHash The content hash
     * @param unlockTime When the broadcast should unlock
     * @param bType The type of broadcast
     */
    function scheduleBroadcast(bytes32 contentHash, uint256 unlockTime, BroadcastType bType) external;

    /**
     * @notice Get the latest broadcast
     * @return The latest broadcast struct
     */
    function getLatestBroadcast() external view returns (Broadcast memory);

    /**
     * @notice Get broadcast history
     * @param limit Maximum number of broadcasts to return
     * @return Array of broadcasts
     */
    function getBroadcastHistory(uint256 limit) external view returns (Broadcast[] memory);

    /**
     * @notice Add a DJ to the station
     * @param dj The DJ's address
     */
    function addDJ(address dj) external;

    /**
     * @notice Remove a DJ from the station
     * @param dj The DJ's address
     */
    function removeDJ(address dj) external;

    /**
     * @notice Check if an address is a DJ
     * @param account The address to check
     * @return True if the address is a DJ
     */
    function isDJ(address account) external view returns (bool);

    /**
     * @notice Set premium status and fee
     * @param isPremium Whether the station is premium
     * @param subscriptionFee The subscription fee
     */
    function setPremium(bool isPremium, uint256 subscriptionFee) external;

    /**
     * @notice Check if station is premium
     * @return True if premium
     */
    function isPremiumStation() external view returns (bool);

    /**
     * @notice Get station metadata
     * @return The station metadata
     */
    function getMetadata() external view returns (StationMetadata memory);

    /**
     * @notice Update station metadata
     * @param name New station name
     * @param description New description
     * @param imageUrl New image URL
     */
    function updateMetadata(string calldata name, string calldata description, string calldata imageUrl) external;
}
