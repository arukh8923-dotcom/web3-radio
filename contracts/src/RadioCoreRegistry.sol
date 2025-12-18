// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IRadioCoreRegistry} from "../interfaces/IRadioCoreRegistry.sol";

/**
 * @title RadioCoreRegistry
 * @notice Central registry for all Web3 Radio stations
 * @dev Implements station registration, tune in/out, and signal strength tracking
 * 
 * Requirements covered:
 * - 1.1: Station discovery by frequency
 * - 1.2: Station listing
 * - 2.1: Tune in to station
 * - 2.2: Tune out of station
 * - 15.1: Signal strength calculation
 * - 15.2: Signal strength updates
 */
contract RadioCoreRegistry is IRadioCoreRegistry, Ownable {
    // =============================================================
    //                           STORAGE
    // =============================================================

    /// @notice Mapping from frequency to station address
    mapping(uint256 => address) public frequencyToStation;

    /// @notice Mapping from station address to frequency
    mapping(address => uint256) public stationToFrequency;

    /// @notice Array of all registered station addresses
    address[] public stations;

    /// @notice Mapping from frequency to listener count
    mapping(uint256 => uint256) public listenerCounts;

    /// @notice Mapping from frequency to signal strength
    mapping(uint256 => uint256) public signalStrengths;

    /// @notice Mapping from listener to frequencies they're tuned into
    mapping(address => uint256[]) private _listenerStations;

    /// @notice Mapping to check if listener is tuned into a frequency
    mapping(address => mapping(uint256 => bool)) private _isTunedIn;

    /// @notice Mapping to track index in _listenerStations array
    mapping(address => mapping(uint256 => uint256)) private _listenerStationIndex;

    /// @notice Last signal strength update timestamp per frequency
    mapping(uint256 => uint256) public lastSignalUpdate;

    // =============================================================
    //                          ERRORS
    // =============================================================

    error FrequencyAlreadyRegistered(uint256 frequency);
    error StationAlreadyRegistered(address station);
    error FrequencyNotRegistered(uint256 frequency);
    error AlreadyTunedIn(address listener, uint256 frequency);
    error NotTunedIn(address listener, uint256 frequency);
    error InvalidFrequency();
    error InvalidStation();

    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================

    constructor() Ownable(msg.sender) {}

    // =============================================================
    //                    STATION REGISTRATION
    // =============================================================

    /// @inheritdoc IRadioCoreRegistry
    function registerStation(address station, uint256 frequency) external onlyOwner {
        if (station == address(0)) revert InvalidStation();
        if (frequency == 0) revert InvalidFrequency();
        if (frequencyToStation[frequency] != address(0)) revert FrequencyAlreadyRegistered(frequency);
        if (stationToFrequency[station] != 0) revert StationAlreadyRegistered(station);

        frequencyToStation[frequency] = station;
        stationToFrequency[station] = frequency;
        stations.push(station);

        // Initialize signal strength
        signalStrengths[frequency] = 100; // Start with full signal
        lastSignalUpdate[frequency] = block.timestamp;

        emit StationRegistered(station, frequency);
    }

    /// @inheritdoc IRadioCoreRegistry
    function getStationByFrequency(uint256 frequency) external view returns (address) {
        return frequencyToStation[frequency];
    }

    /// @inheritdoc IRadioCoreRegistry
    function getAllStations() external view returns (address[] memory) {
        return stations;
    }

    // =============================================================
    //                      TUNE IN / OUT
    // =============================================================

    /// @inheritdoc IRadioCoreRegistry
    function tuneIn(uint256 frequency) external {
        if (frequencyToStation[frequency] == address(0)) revert FrequencyNotRegistered(frequency);
        if (_isTunedIn[msg.sender][frequency]) revert AlreadyTunedIn(msg.sender, frequency);

        _isTunedIn[msg.sender][frequency] = true;
        _listenerStationIndex[msg.sender][frequency] = _listenerStations[msg.sender].length;
        _listenerStations[msg.sender].push(frequency);
        listenerCounts[frequency]++;

        // Update signal strength on activity
        _updateSignalStrengthInternal(frequency);

        emit TunedIn(msg.sender, frequency);
    }

    /// @inheritdoc IRadioCoreRegistry
    function tuneOut(uint256 frequency) external {
        if (!_isTunedIn[msg.sender][frequency]) revert NotTunedIn(msg.sender, frequency);

        _isTunedIn[msg.sender][frequency] = false;
        listenerCounts[frequency]--;

        // Remove from listener's station list (swap and pop)
        uint256 index = _listenerStationIndex[msg.sender][frequency];
        uint256 lastIndex = _listenerStations[msg.sender].length - 1;
        
        if (index != lastIndex) {
            uint256 lastFrequency = _listenerStations[msg.sender][lastIndex];
            _listenerStations[msg.sender][index] = lastFrequency;
            _listenerStationIndex[msg.sender][lastFrequency] = index;
        }
        
        _listenerStations[msg.sender].pop();
        delete _listenerStationIndex[msg.sender][frequency];

        emit TunedOut(msg.sender, frequency);
    }

    /// @inheritdoc IRadioCoreRegistry
    function getListenerCount(uint256 frequency) external view returns (uint256) {
        return listenerCounts[frequency];
    }

    /// @inheritdoc IRadioCoreRegistry
    function getListenerStations(address listener) external view returns (uint256[] memory) {
        return _listenerStations[listener];
    }

    /// @inheritdoc IRadioCoreRegistry
    function isTunedIn(address listener, uint256 frequency) external view returns (bool) {
        return _isTunedIn[listener][frequency];
    }

    // =============================================================
    //                    SIGNAL STRENGTH
    // =============================================================

    /// @inheritdoc IRadioCoreRegistry
    function calculateSignalStrength(uint256 frequency) external view returns (uint256) {
        if (frequencyToStation[frequency] == address(0)) return 0;

        uint256 listeners = listenerCounts[frequency];
        uint256 timeSinceUpdate = block.timestamp - lastSignalUpdate[frequency];
        
        // Base signal from listeners (max 50 points from listeners)
        uint256 listenerBonus = listeners > 100 ? 50 : (listeners * 50) / 100;
        
        // Activity decay (lose up to 30 points if no activity for 1 day)
        uint256 activityDecay = timeSinceUpdate > 1 days ? 30 : (timeSinceUpdate * 30) / 1 days;
        
        // Base signal of 50 + listener bonus - decay
        uint256 signal = 50 + listenerBonus;
        if (signal > activityDecay) {
            signal -= activityDecay;
        } else {
            signal = 20; // Minimum signal
        }

        return signal > 100 ? 100 : signal;
    }

    /// @inheritdoc IRadioCoreRegistry
    function updateSignalStrength(uint256 frequency) external {
        _updateSignalStrengthInternal(frequency);
    }

    function _updateSignalStrengthInternal(uint256 frequency) internal {
        if (frequencyToStation[frequency] == address(0)) return;

        uint256 newStrength = this.calculateSignalStrength(frequency);
        signalStrengths[frequency] = newStrength;
        lastSignalUpdate[frequency] = block.timestamp;

        emit SignalStrengthUpdated(frequency, newStrength);
    }

    // =============================================================
    //                      VIEW FUNCTIONS
    // =============================================================

    /// @notice Get total number of registered stations
    function getStationCount() external view returns (uint256) {
        return stations.length;
    }

    /// @notice Get station info by index
    function getStationByIndex(uint256 index) external view returns (address station, uint256 frequency) {
        require(index < stations.length, "Index out of bounds");
        station = stations[index];
        frequency = stationToFrequency[station];
    }
}
