// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title IRadioCoreRegistry
 * @notice Central registry for all Web3 Radio stations
 */
interface IRadioCoreRegistry {
    // Events
    event StationRegistered(address indexed station, uint256 indexed frequency);
    event TunedIn(address indexed listener, uint256 indexed frequency);
    event TunedOut(address indexed listener, uint256 indexed frequency);
    event SignalStrengthUpdated(uint256 indexed frequency, uint256 strength);

    /**
     * @notice Register a new station
     * @param station The station contract address
     * @param frequency The unique frequency identifier
     */
    function registerStation(address station, uint256 frequency) external;

    /**
     * @notice Get station by frequency
     * @param frequency The frequency to look up
     * @return The station contract address
     */
    function getStationByFrequency(uint256 frequency) external view returns (address);

    /**
     * @notice Get all registered stations
     * @return Array of station addresses
     */
    function getAllStations() external view returns (address[] memory);

    /**
     * @notice Tune in to a station
     * @param frequency The station frequency
     */
    function tuneIn(uint256 frequency) external;

    /**
     * @notice Tune out of a station
     * @param frequency The station frequency
     */
    function tuneOut(uint256 frequency) external;

    /**
     * @notice Get listener count for a station
     * @param frequency The station frequency
     * @return The number of listeners
     */
    function getListenerCount(uint256 frequency) external view returns (uint256);

    /**
     * @notice Get stations a listener is tuned into
     * @param listener The listener's address
     * @return Array of frequencies
     */
    function getListenerStations(address listener) external view returns (uint256[] memory);

    /**
     * @notice Calculate signal strength for a station
     * @param frequency The station frequency
     * @return The signal strength score
     */
    function calculateSignalStrength(uint256 frequency) external view returns (uint256);

    /**
     * @notice Update signal strength (called by keeper or on interaction)
     * @param frequency The station frequency
     */
    function updateSignalStrength(uint256 frequency) external;

    /**
     * @notice Check if a listener is tuned into a station
     * @param listener The listener's address
     * @param frequency The station frequency
     * @return True if tuned in
     */
    function isTunedIn(address listener, uint256 frequency) external view returns (bool);
}
