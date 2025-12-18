// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AuxPass
 * @notice Queue management for temporary broadcast control
 * @dev Token-weighted queue with automatic control transfer
 * 
 * Features:
 * - Queue management based on token holdings
 * - Automatic control transfer on session end
 * - Temporary broadcast permissions
 * - Inactive holder skip
 */
contract AuxPass is Ownable, ReentrancyGuard {
    // =============================================================
    //                           TYPES
    // =============================================================
    
    struct QueueEntry {
        address holder;
        uint256 tokenStake;
        uint256 joinTime;
        uint256 position;
        bool isActive;
    }
    
    struct AuxSession {
        address currentHolder;
        uint256 startTime;
        uint256 endTime;
        uint256 maxDuration;
        bool isActive;
    }
    
    struct StationAux {
        uint256 frequency;
        address station;
        AuxSession currentSession;
        uint256 queueLength;
        uint256 defaultDuration; // Default session duration
        uint256 minStake;        // Minimum stake to join queue
        bool isEnabled;
    }
    
    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice RADIO token for staking
    IERC20 public immutable radioToken;
    
    /// @notice Treasury for fees
    address public treasury;
    
    /// @notice Station aux configs: station => StationAux
    mapping(address => StationAux) public stationAux;
    
    /// @notice Queue entries: station => position => QueueEntry
    mapping(address => mapping(uint256 => QueueEntry)) public queues;
    
    /// @notice User position in queue: station => user => position (0 = not in queue)
    mapping(address => mapping(address => uint256)) public userPosition;
    
    /// @notice Queue head position per station
    mapping(address => uint256) public queueHead;
    
    /// @notice Queue tail position per station
    mapping(address => uint256) public queueTail;
    
    /// @notice Inactivity timeout (default 2 minutes)
    uint256 public inactivityTimeout = 2 minutes;
    
    /// @notice Last activity timestamp per holder
    mapping(address => mapping(address => uint256)) public lastActivity;
    
    /// @notice Stats
    uint256 public totalSessions;
    uint256 public totalStaked;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event AuxEnabled(address indexed station, uint256 frequency, uint256 defaultDuration, uint256 minStake);
    event AuxDisabled(address indexed station);
    event JoinedQueue(address indexed station, address indexed user, uint256 position, uint256 stake);
    event LeftQueue(address indexed station, address indexed user);
    event AuxPassed(address indexed station, address indexed from, address indexed to);
    event SessionStarted(address indexed station, address indexed holder, uint256 duration);
    event SessionEnded(address indexed station, address indexed holder, uint256 duration);
    event HolderSkipped(address indexed station, address indexed holder, string reason);
    event ActivityRecorded(address indexed station, address indexed holder);
    
    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================
    
    constructor(address _radioToken, address _treasury) Ownable(msg.sender) {
        require(_radioToken != address(0), "AuxPass: invalid token");
        require(_treasury != address(0), "AuxPass: invalid treasury");
        
        radioToken = IERC20(_radioToken);
        treasury = _treasury;
    }
    
    // =============================================================
    //                      STATION SETUP
    // =============================================================
    
    /**
     * @notice Enable aux pass for a station
     * @param station Station address
     * @param frequency Station frequency
     * @param defaultDuration Default session duration in seconds
     * @param minStake Minimum RADIO stake to join queue
     */
    function enableAux(
        address station,
        uint256 frequency,
        uint256 defaultDuration,
        uint256 minStake
    ) external {
        // Only station owner or contract owner can enable
        require(msg.sender == station || msg.sender == owner(), "AuxPass: not authorized");
        require(defaultDuration >= 60 && defaultDuration <= 30 minutes, "AuxPass: invalid duration");
        
        stationAux[station] = StationAux({
            frequency: frequency,
            station: station,
            currentSession: AuxSession({
                currentHolder: address(0),
                startTime: 0,
                endTime: 0,
                maxDuration: defaultDuration,
                isActive: false
            }),
            queueLength: 0,
            defaultDuration: defaultDuration,
            minStake: minStake,
            isEnabled: true
        });
        
        emit AuxEnabled(station, frequency, defaultDuration, minStake);
    }
    
    /**
     * @notice Disable aux pass for a station
     */
    function disableAux(address station) external {
        require(msg.sender == station || msg.sender == owner(), "AuxPass: not authorized");
        
        StationAux storage aux = stationAux[station];
        aux.isEnabled = false;
        
        // End current session if active
        if (aux.currentSession.isActive) {
            _endSession(station);
        }
        
        emit AuxDisabled(station);
    }
    
    // =============================================================
    //                      QUEUE MANAGEMENT
    // =============================================================
    
    /**
     * @notice Join the aux queue
     * @param station Station address
     * @param stake Amount of RADIO to stake
     */
    function joinQueue(address station, uint256 stake) external nonReentrant {
        StationAux storage aux = stationAux[station];
        require(aux.isEnabled, "AuxPass: aux not enabled");
        require(stake >= aux.minStake, "AuxPass: stake too low");
        require(userPosition[station][msg.sender] == 0, "AuxPass: already in queue");
        require(radioToken.balanceOf(msg.sender) >= stake, "AuxPass: insufficient balance");
        
        // Transfer stake
        require(radioToken.transferFrom(msg.sender, address(this), stake), "AuxPass: stake transfer failed");
        
        // Add to queue
        queueTail[station]++;
        uint256 position = queueTail[station];
        
        queues[station][position] = QueueEntry({
            holder: msg.sender,
            tokenStake: stake,
            joinTime: block.timestamp,
            position: position,
            isActive: true
        });
        
        userPosition[station][msg.sender] = position;
        aux.queueLength++;
        totalStaked += stake;
        
        emit JoinedQueue(station, msg.sender, position, stake);
        
        // If no active session and this is first in queue, start session
        if (!aux.currentSession.isActive && queueHead[station] == 0) {
            queueHead[station] = position;
            _startSession(station, msg.sender);
        }
    }
    
    /**
     * @notice Leave the queue (forfeit stake if currently holding)
     */
    function leaveQueue(address station) external nonReentrant {
        uint256 position = userPosition[station][msg.sender];
        require(position > 0, "AuxPass: not in queue");
        
        QueueEntry storage entry = queues[station][position];
        require(entry.isActive, "AuxPass: entry not active");
        
        StationAux storage aux = stationAux[station];
        
        // If currently holding, end session and pass to next
        if (aux.currentSession.currentHolder == msg.sender) {
            _endSession(station);
            _passToNext(station);
        }
        
        // Return stake
        uint256 stake = entry.tokenStake;
        entry.isActive = false;
        userPosition[station][msg.sender] = 0;
        aux.queueLength--;
        totalStaked -= stake;
        
        require(radioToken.transfer(msg.sender, stake), "AuxPass: stake return failed");
        
        emit LeftQueue(station, msg.sender);
    }
    
    /**
     * @notice Pass aux to next in queue (current holder only)
     */
    function passAux(address station) external {
        StationAux storage aux = stationAux[station];
        require(aux.currentSession.currentHolder == msg.sender, "AuxPass: not current holder");
        
        _endSession(station);
        _passToNext(station);
    }
    
    /**
     * @notice Record activity (prevents being skipped for inactivity)
     */
    function recordActivity(address station) external {
        StationAux storage aux = stationAux[station];
        require(aux.currentSession.currentHolder == msg.sender, "AuxPass: not current holder");
        
        lastActivity[station][msg.sender] = block.timestamp;
        
        emit ActivityRecorded(station, msg.sender);
    }
    
    /**
     * @notice Skip inactive holder (anyone can call)
     */
    function skipInactive(address station) external {
        StationAux storage aux = stationAux[station];
        require(aux.currentSession.isActive, "AuxPass: no active session");
        
        address holder = aux.currentSession.currentHolder;
        uint256 lastAct = lastActivity[station][holder];
        
        // Check if inactive (no activity for timeout period)
        require(
            block.timestamp > lastAct + inactivityTimeout ||
            block.timestamp > aux.currentSession.endTime,
            "AuxPass: holder still active"
        );
        
        emit HolderSkipped(station, holder, "Inactive");
        
        _endSession(station);
        _passToNext(station);
    }
    
    // =============================================================
    //                      INTERNAL FUNCTIONS
    // =============================================================
    
    function _startSession(address station, address holder) internal {
        StationAux storage aux = stationAux[station];
        
        aux.currentSession = AuxSession({
            currentHolder: holder,
            startTime: block.timestamp,
            endTime: block.timestamp + aux.defaultDuration,
            maxDuration: aux.defaultDuration,
            isActive: true
        });
        
        lastActivity[station][holder] = block.timestamp;
        totalSessions++;
        
        emit SessionStarted(station, holder, aux.defaultDuration);
    }
    
    function _endSession(address station) internal {
        StationAux storage aux = stationAux[station];
        
        if (!aux.currentSession.isActive) return;
        
        address holder = aux.currentSession.currentHolder;
        uint256 duration = block.timestamp - aux.currentSession.startTime;
        
        aux.currentSession.isActive = false;
        
        emit SessionEnded(station, holder, duration);
    }
    
    function _passToNext(address station) internal {
        StationAux storage aux = stationAux[station];
        
        address previousHolder = aux.currentSession.currentHolder;
        
        // Find next active entry in queue
        uint256 head = queueHead[station];
        uint256 tail = queueTail[station];
        
        // Skip current holder's position
        if (head > 0 && queues[station][head].holder == previousHolder) {
            head++;
        }
        
        // Find next active entry
        while (head <= tail) {
            QueueEntry storage entry = queues[station][head];
            if (entry.isActive && entry.holder != previousHolder) {
                queueHead[station] = head;
                _startSession(station, entry.holder);
                emit AuxPassed(station, previousHolder, entry.holder);
                return;
            }
            head++;
        }
        
        // No one else in queue
        queueHead[station] = 0;
        aux.currentSession.currentHolder = address(0);
        
        emit AuxPassed(station, previousHolder, address(0));
    }
    
    // =============================================================
    //                      VIEW FUNCTIONS
    // =============================================================
    
    function getStationAux(address station) external view returns (StationAux memory) {
        return stationAux[station];
    }
    
    function getCurrentHolder(address station) external view returns (address) {
        return stationAux[station].currentSession.currentHolder;
    }
    
    function getSessionTimeRemaining(address station) external view returns (uint256) {
        AuxSession storage session = stationAux[station].currentSession;
        if (!session.isActive || block.timestamp >= session.endTime) {
            return 0;
        }
        return session.endTime - block.timestamp;
    }
    
    function getQueuePosition(address station, address user) external view returns (uint256) {
        uint256 pos = userPosition[station][user];
        if (pos == 0) return 0;
        
        // Calculate actual position in queue
        uint256 head = queueHead[station];
        if (pos < head) return 0;
        
        uint256 actualPos = 0;
        for (uint256 i = head; i <= pos; i++) {
            if (queues[station][i].isActive) {
                actualPos++;
            }
        }
        
        return actualPos;
    }
    
    function getQueueEntry(address station, address user) external view returns (QueueEntry memory) {
        uint256 pos = userPosition[station][user];
        return queues[station][pos];
    }
    
    function getQueue(address station, uint256 limit) external view returns (QueueEntry[] memory) {
        StationAux storage aux = stationAux[station];
        uint256 count = limit > aux.queueLength ? aux.queueLength : limit;
        
        QueueEntry[] memory result = new QueueEntry[](count);
        uint256 idx = 0;
        uint256 head = queueHead[station];
        uint256 tail = queueTail[station];
        
        for (uint256 i = head; i <= tail && idx < count; i++) {
            if (queues[station][i].isActive) {
                result[idx++] = queues[station][i];
            }
        }
        
        // Trim if needed
        if (idx < count) {
            assembly {
                mstore(result, idx)
            }
        }
        
        return result;
    }
    
    function isInQueue(address station, address user) external view returns (bool) {
        uint256 pos = userPosition[station][user];
        return pos > 0 && queues[station][pos].isActive;
    }
    
    function isCurrentHolder(address station, address user) external view returns (bool) {
        return stationAux[station].currentSession.currentHolder == user &&
               stationAux[station].currentSession.isActive;
    }
    
    // =============================================================
    //                      ADMIN FUNCTIONS
    // =============================================================
    
    function setInactivityTimeout(uint256 newTimeout) external onlyOwner {
        require(newTimeout >= 30 seconds && newTimeout <= 10 minutes, "AuxPass: invalid timeout");
        inactivityTimeout = newTimeout;
    }
    
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "AuxPass: invalid treasury");
        treasury = newTreasury;
    }
    
    /**
     * @notice Emergency withdraw stuck tokens
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(treasury, amount), "AuxPass: transfer failed");
    }
}
