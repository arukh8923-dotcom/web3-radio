// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SmokeSignals
 * @notice Ephemeral messages that expire after a set duration
 * @dev Messages cost VIBES to send and disappear after expiry
 * 
 * Features:
 * - Signal storage with expiry timestamp
 * - Signal sending with Vibes burn
 * - Active signals retrieval (filter expired)
 * - Expiry marking
 */
contract SmokeSignals is Ownable, ReentrancyGuard {
    // =============================================================
    //                           TYPES
    // =============================================================
    
    struct Signal {
        uint256 id;
        address sender;
        uint256 frequency;
        string message;
        uint256 createdAt;
        uint256 expiresAt;
        uint256 vibesBurned;
        bool isExpired;
    }
    
    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice VIBES token for burning
    IERC20 public immutable vibesToken;
    
    /// @notice Treasury receives burned vibes
    address public treasury;
    
    /// @notice Signal counter
    uint256 public signalCount;
    
    /// @notice Cost per minute of signal duration (in VIBES)
    uint256 public costPerMinute = 5 * 1e18; // 5 VIBES per minute
    
    /// @notice Minimum signal duration (1 minute)
    uint256 public constant MIN_DURATION = 60;
    
    /// @notice Maximum signal duration (24 hours)
    uint256 public constant MAX_DURATION = 24 hours;
    
    /// @notice Maximum message length
    uint256 public constant MAX_MESSAGE_LENGTH = 280;
    
    /// @notice All signals
    mapping(uint256 => Signal) public signals;
    
    /// @notice Signals by frequency
    mapping(uint256 => uint256[]) public frequencySignals;
    
    /// @notice Signals by sender
    mapping(address => uint256[]) public senderSignals;
    
    /// @notice Active signal IDs (for iteration)
    uint256[] public activeSignalIds;
    mapping(uint256 => uint256) public activeSignalIndex;
    
    /// @notice Stats
    uint256 public totalVibesBurned;
    uint256 public activeSignalCount;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event SignalSent(
        uint256 indexed signalId,
        address indexed sender,
        uint256 indexed frequency,
        string message,
        uint256 expiresAt,
        uint256 vibesBurned
    );
    
    event SignalExpired(uint256 indexed signalId);
    event SignalsCleanedUp(uint256 count);
    
    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================
    
    constructor(address _vibesToken, address _treasury) Ownable(msg.sender) {
        require(_vibesToken != address(0), "SmokeSignals: invalid token");
        require(_treasury != address(0), "SmokeSignals: invalid treasury");
        
        vibesToken = IERC20(_vibesToken);
        treasury = _treasury;
    }
    
    // =============================================================
    //                      SIGNAL FUNCTIONS
    // =============================================================
    
    /**
     * @notice Send a smoke signal
     * @param frequency Target frequency
     * @param message Signal message
     * @param duration Duration in seconds
     */
    function sendSignal(
        uint256 frequency,
        string calldata message,
        uint256 duration
    ) external nonReentrant returns (uint256) {
        require(bytes(message).length > 0, "SmokeSignals: empty message");
        require(bytes(message).length <= MAX_MESSAGE_LENGTH, "SmokeSignals: message too long");
        require(duration >= MIN_DURATION, "SmokeSignals: duration too short");
        require(duration <= MAX_DURATION, "SmokeSignals: duration too long");
        
        // Calculate cost
        uint256 minutes_ = (duration + 59) / 60; // Round up
        uint256 cost = minutes_ * costPerMinute;
        
        require(vibesToken.balanceOf(msg.sender) >= cost, "SmokeSignals: insufficient VIBES");
        
        // Transfer VIBES to treasury (burn)
        require(vibesToken.transferFrom(msg.sender, treasury, cost), "SmokeSignals: transfer failed");
        
        signalCount++;
        uint256 expiresAt = block.timestamp + duration;
        
        signals[signalCount] = Signal({
            id: signalCount,
            sender: msg.sender,
            frequency: frequency,
            message: message,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            vibesBurned: cost,
            isExpired: false
        });
        
        frequencySignals[frequency].push(signalCount);
        senderSignals[msg.sender].push(signalCount);
        
        activeSignalIndex[signalCount] = activeSignalIds.length;
        activeSignalIds.push(signalCount);
        activeSignalCount++;
        
        totalVibesBurned += cost;
        
        emit SignalSent(signalCount, msg.sender, frequency, message, expiresAt, cost);
        
        return signalCount;
    }
    
    /**
     * @notice Mark expired signals
     * @param signalIds Array of signal IDs to check
     */
    function markExpired(uint256[] calldata signalIds) external {
        for (uint256 i = 0; i < signalIds.length; i++) {
            Signal storage signal = signals[signalIds[i]];
            if (!signal.isExpired && block.timestamp >= signal.expiresAt) {
                signal.isExpired = true;
                _removeFromActive(signalIds[i]);
                emit SignalExpired(signalIds[i]);
            }
        }
    }
    
    /**
     * @notice Cleanup expired signals (batch)
     * @param maxCleanup Maximum signals to cleanup
     */
    function cleanupExpired(uint256 maxCleanup) external returns (uint256) {
        uint256 cleaned = 0;
        uint256 i = 0;
        
        while (i < activeSignalIds.length && cleaned < maxCleanup) {
            uint256 signalId = activeSignalIds[i];
            Signal storage signal = signals[signalId];
            
            if (block.timestamp >= signal.expiresAt) {
                signal.isExpired = true;
                _removeFromActiveAt(i);
                emit SignalExpired(signalId);
                cleaned++;
                // Don't increment i since we removed element
            } else {
                i++;
            }
        }
        
        if (cleaned > 0) {
            emit SignalsCleanedUp(cleaned);
        }
        
        return cleaned;
    }
    
    // =============================================================
    //                      INTERNAL FUNCTIONS
    // =============================================================
    
    function _removeFromActive(uint256 signalId) internal {
        uint256 index = activeSignalIndex[signalId];
        _removeFromActiveAt(index);
    }
    
    function _removeFromActiveAt(uint256 index) internal {
        if (index >= activeSignalIds.length) return;
        
        uint256 lastIndex = activeSignalIds.length - 1;
        uint256 signalId = activeSignalIds[index];
        
        if (index != lastIndex) {
            uint256 lastSignalId = activeSignalIds[lastIndex];
            activeSignalIds[index] = lastSignalId;
            activeSignalIndex[lastSignalId] = index;
        }
        
        activeSignalIds.pop();
        delete activeSignalIndex[signalId];
        activeSignalCount--;
    }
    
    // =============================================================
    //                      VIEW FUNCTIONS
    // =============================================================
    
    /**
     * @notice Get signal by ID
     */
    function getSignal(uint256 signalId) external view returns (Signal memory) {
        return signals[signalId];
    }
    
    /**
     * @notice Get active signals for a frequency
     */
    function getActiveSignals(uint256 frequency, uint256 limit) external view returns (Signal[] memory) {
        uint256[] storage ids = frequencySignals[frequency];
        
        // Count active signals
        uint256 activeCount = 0;
        for (uint256 i = ids.length; i > 0 && activeCount < limit; i--) {
            Signal storage signal = signals[ids[i - 1]];
            if (!signal.isExpired && block.timestamp < signal.expiresAt) {
                activeCount++;
            }
        }
        
        // Build result
        Signal[] memory result = new Signal[](activeCount);
        uint256 idx = 0;
        for (uint256 i = ids.length; i > 0 && idx < activeCount; i--) {
            Signal storage signal = signals[ids[i - 1]];
            if (!signal.isExpired && block.timestamp < signal.expiresAt) {
                result[idx++] = signal;
            }
        }
        
        return result;
    }
    
    /**
     * @notice Get all active signals (global)
     */
    function getAllActiveSignals(uint256 limit, uint256 offset) external view returns (Signal[] memory) {
        uint256 total = activeSignalIds.length;
        if (offset >= total) return new Signal[](0);
        
        uint256 count = limit;
        if (offset + limit > total) {
            count = total - offset;
        }
        
        // Filter out expired ones
        Signal[] memory temp = new Signal[](count);
        uint256 validCount = 0;
        
        for (uint256 i = 0; i < count && validCount < limit; i++) {
            uint256 signalId = activeSignalIds[offset + i];
            Signal storage signal = signals[signalId];
            if (!signal.isExpired && block.timestamp < signal.expiresAt) {
                temp[validCount++] = signal;
            }
        }
        
        // Trim result
        Signal[] memory result = new Signal[](validCount);
        for (uint256 i = 0; i < validCount; i++) {
            result[i] = temp[i];
        }
        
        return result;
    }
    
    /**
     * @notice Get signals sent by user
     */
    function getUserSignals(address user, uint256 limit) external view returns (Signal[] memory) {
        uint256[] storage ids = senderSignals[user];
        uint256 count = limit > ids.length ? ids.length : limit;
        
        Signal[] memory result = new Signal[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = signals[ids[ids.length - 1 - i]];
        }
        
        return result;
    }
    
    /**
     * @notice Check if signal is still active
     */
    function isActive(uint256 signalId) external view returns (bool) {
        Signal storage signal = signals[signalId];
        return !signal.isExpired && block.timestamp < signal.expiresAt;
    }
    
    /**
     * @notice Calculate cost for duration
     */
    function calculateCost(uint256 duration) external view returns (uint256) {
        uint256 minutes_ = (duration + 59) / 60;
        return minutes_ * costPerMinute;
    }
    
    /**
     * @notice Get time remaining for signal
     */
    function getTimeRemaining(uint256 signalId) external view returns (uint256) {
        Signal storage signal = signals[signalId];
        if (signal.isExpired || block.timestamp >= signal.expiresAt) {
            return 0;
        }
        return signal.expiresAt - block.timestamp;
    }
    
    // =============================================================
    //                      ADMIN FUNCTIONS
    // =============================================================
    
    function setCostPerMinute(uint256 newCost) external onlyOwner {
        costPerMinute = newCost;
    }
    
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "SmokeSignals: invalid treasury");
        treasury = newTreasury;
    }
}
