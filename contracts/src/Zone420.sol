// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Zone420
 * @notice Special 420.0 frequency zone with unique mechanics
 * @dev 4:20 time-based events, Vibes earning, mood tracking
 * 
 * Features:
 * - Special 420.0 frequency with unique mechanics
 * - 4:20 time-based event triggers (AM/PM)
 * - Vibes earning for zone participants
 * - Community mood ring indicator
 */
contract Zone420 is Ownable, ReentrancyGuard {
    // =============================================================
    //                           TYPES
    // =============================================================
    
    enum Mood { CHILL, VIBING, HYPED, MELLOW, BLAZED }
    
    struct Participant {
        address user;
        uint256 joinTime;
        uint256 lastVibesEarned;
        uint256 totalVibesEarned;
        Mood currentMood;
        uint256 sessionCount;
    }
    
    struct Session420 {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 participantCount;
        uint256 totalVibesDistributed;
        bool isActive;
    }
    
    struct MoodVote {
        Mood mood;
        uint256 votes;
    }
    
    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice VIBES token for rewards
    IERC20 public immutable vibesToken;
    
    /// @notice Treasury for funding rewards
    address public treasury;
    
    /// @notice The special 420.0 frequency
    uint256 public constant FREQUENCY_420 = 4200; // 420.0 * 10
    
    /// @notice Vibes earned per minute in zone
    uint256 public vibesPerMinute = 10 * 1e18; // 10 VIBES per minute
    
    /// @notice Bonus multiplier during 4:20 events (2x)
    uint256 public eventMultiplier = 2;
    
    /// @notice Minimum time to earn vibes (1 minute)
    uint256 public constant MIN_EARN_TIME = 60;
    
    /// @notice Current participants in zone
    mapping(address => Participant) public participants;
    address[] public activeParticipants;
    mapping(address => uint256) public participantIndex;
    
    /// @notice Session tracking
    uint256 public currentSessionId;
    mapping(uint256 => Session420) public sessions;
    
    /// @notice Mood voting
    mapping(Mood => uint256) public moodVotes;
    Mood public communityMood;
    uint256 public lastMoodUpdate;
    
    /// @notice 4:20 event tracking
    uint256 public last420Event;
    bool public is420Active;
    
    /// @notice Stats
    uint256 public totalParticipants;
    uint256 public totalVibesDistributed;
    uint256 public total420Events;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event JoinedZone420(address indexed user, uint256 timestamp);
    event LeftZone420(address indexed user, uint256 vibesEarned, uint256 duration);
    event VibesEarned(address indexed user, uint256 amount, bool is420Bonus);
    event MoodChanged(address indexed user, Mood newMood);
    event CommunityMoodUpdated(Mood newMood, uint256 totalVotes);
    event Event420Started(uint256 indexed sessionId, uint256 timestamp);
    event Event420Ended(uint256 indexed sessionId, uint256 totalVibes, uint256 participants);
    event Session420Created(uint256 indexed sessionId, uint256 startTime);
    
    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================
    
    constructor(address _vibesToken, address _treasury) Ownable(msg.sender) {
        require(_vibesToken != address(0), "Zone420: invalid token");
        require(_treasury != address(0), "Zone420: invalid treasury");
        
        vibesToken = IERC20(_vibesToken);
        treasury = _treasury;
        communityMood = Mood.CHILL;
    }
    
    // =============================================================
    //                      ZONE PARTICIPATION
    // =============================================================
    
    /**
     * @notice Join the 420 zone
     */
    function joinZone() external nonReentrant {
        require(participants[msg.sender].joinTime == 0, "Zone420: already in zone");
        
        participants[msg.sender] = Participant({
            user: msg.sender,
            joinTime: block.timestamp,
            lastVibesEarned: block.timestamp,
            totalVibesEarned: 0,
            currentMood: Mood.CHILL,
            sessionCount: participants[msg.sender].sessionCount + 1
        });
        
        participantIndex[msg.sender] = activeParticipants.length;
        activeParticipants.push(msg.sender);
        
        if (participants[msg.sender].sessionCount == 1) {
            totalParticipants++;
        }
        
        emit JoinedZone420(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Leave the 420 zone and claim earned vibes
     */
    function leaveZone() external nonReentrant {
        Participant storage p = participants[msg.sender];
        require(p.joinTime > 0, "Zone420: not in zone");
        
        // Calculate and distribute vibes
        uint256 vibesEarned = _calculateVibes(msg.sender);
        if (vibesEarned > 0) {
            _distributeVibes(msg.sender, vibesEarned);
        }
        
        uint256 duration = block.timestamp - p.joinTime;
        
        // Remove from active participants
        _removeParticipant(msg.sender);
        
        // Clear participant data (keep stats)
        uint256 totalEarned = p.totalVibesEarned;
        uint256 sessionCount_ = p.sessionCount;
        delete participants[msg.sender];
        participants[msg.sender].totalVibesEarned = totalEarned;
        participants[msg.sender].sessionCount = sessionCount_;
        
        emit LeftZone420(msg.sender, vibesEarned, duration);
    }
    
    /**
     * @notice Claim accumulated vibes without leaving
     */
    function claimVibes() external nonReentrant {
        Participant storage p = participants[msg.sender];
        require(p.joinTime > 0, "Zone420: not in zone");
        
        uint256 vibesEarned = _calculateVibes(msg.sender);
        require(vibesEarned > 0, "Zone420: no vibes to claim");
        
        _distributeVibes(msg.sender, vibesEarned);
        p.lastVibesEarned = block.timestamp;
    }
    
    /**
     * @notice Set your mood
     */
    function setMood(Mood newMood) external {
        Participant storage p = participants[msg.sender];
        require(p.joinTime > 0, "Zone420: not in zone");
        
        // Update mood votes
        if (p.currentMood != newMood) {
            if (moodVotes[p.currentMood] > 0) {
                moodVotes[p.currentMood]--;
            }
            moodVotes[newMood]++;
            p.currentMood = newMood;
            
            emit MoodChanged(msg.sender, newMood);
            
            // Update community mood if needed
            _updateCommunityMood();
        }
    }

    
    // =============================================================
    //                      4:20 EVENTS
    // =============================================================
    
    /**
     * @notice Trigger 4:20 event (can be called by anyone at 4:20)
     * @dev In production, use Chainlink Automation for precise timing
     */
    function trigger420Event() external {
        require(!is420Active, "Zone420: event already active");
        require(block.timestamp >= last420Event + 6 hours, "Zone420: too soon");
        
        is420Active = true;
        last420Event = block.timestamp;
        currentSessionId++;
        total420Events++;
        
        sessions[currentSessionId] = Session420({
            id: currentSessionId,
            startTime: block.timestamp,
            endTime: 0,
            participantCount: activeParticipants.length,
            totalVibesDistributed: 0,
            isActive: true
        });
        
        emit Event420Started(currentSessionId, block.timestamp);
        emit Session420Created(currentSessionId, block.timestamp);
    }
    
    /**
     * @notice End 4:20 event
     */
    function end420Event() external {
        require(is420Active, "Zone420: no active event");
        require(block.timestamp >= last420Event + 4 minutes + 20 seconds, "Zone420: event not finished");
        
        Session420 storage session = sessions[currentSessionId];
        session.endTime = block.timestamp;
        session.isActive = false;
        
        is420Active = false;
        
        emit Event420Ended(currentSessionId, session.totalVibesDistributed, session.participantCount);
    }
    
    /**
     * @notice Check if it's 4:20 time (approximate)
     */
    function is420Time() public view returns (bool) {
        // Check if within 4:20 window (4 minutes 20 seconds)
        return is420Active && block.timestamp <= last420Event + 4 minutes + 20 seconds;
    }
    
    // =============================================================
    //                      INTERNAL FUNCTIONS
    // =============================================================
    
    function _calculateVibes(address user) internal view returns (uint256) {
        Participant storage p = participants[user];
        if (p.joinTime == 0) return 0;
        
        uint256 timeInZone = block.timestamp - p.lastVibesEarned;
        if (timeInZone < MIN_EARN_TIME) return 0;
        
        uint256 minutes_ = timeInZone / 60;
        uint256 baseVibes = minutes_ * vibesPerMinute;
        
        // Apply 4:20 bonus if active
        if (is420Active) {
            baseVibes = baseVibes * eventMultiplier;
        }
        
        return baseVibes;
    }
    
    function _distributeVibes(address user, uint256 amount) internal {
        uint256 balance = vibesToken.balanceOf(treasury);
        if (balance < amount) {
            amount = balance;
        }
        
        if (amount > 0) {
            // Transfer from treasury (requires approval)
            require(vibesToken.transferFrom(treasury, user, amount), "Zone420: transfer failed");
            
            participants[user].totalVibesEarned += amount;
            totalVibesDistributed += amount;
            
            if (is420Active) {
                sessions[currentSessionId].totalVibesDistributed += amount;
            }
            
            emit VibesEarned(user, amount, is420Active);
        }
    }
    
    function _removeParticipant(address user) internal {
        uint256 index = participantIndex[user];
        uint256 lastIndex = activeParticipants.length - 1;
        
        if (index != lastIndex) {
            address lastUser = activeParticipants[lastIndex];
            activeParticipants[index] = lastUser;
            participantIndex[lastUser] = index;
        }
        
        activeParticipants.pop();
        delete participantIndex[user];
    }
    
    function _updateCommunityMood() internal {
        // Only update every 5 minutes
        if (block.timestamp < lastMoodUpdate + 5 minutes) return;
        
        Mood highestMood = Mood.CHILL;
        uint256 highestVotes = 0;
        
        for (uint8 i = 0; i <= uint8(Mood.BLAZED); i++) {
            Mood m = Mood(i);
            if (moodVotes[m] > highestVotes) {
                highestVotes = moodVotes[m];
                highestMood = m;
            }
        }
        
        if (highestMood != communityMood) {
            communityMood = highestMood;
            lastMoodUpdate = block.timestamp;
            
            uint256 totalVotes = 0;
            for (uint8 i = 0; i <= uint8(Mood.BLAZED); i++) {
                totalVotes += moodVotes[Mood(i)];
            }
            
            emit CommunityMoodUpdated(communityMood, totalVotes);
        }
    }
    
    // =============================================================
    //                      VIEW FUNCTIONS
    // =============================================================
    
    function getParticipant(address user) external view returns (Participant memory) {
        return participants[user];
    }
    
    function getActiveParticipantCount() external view returns (uint256) {
        return activeParticipants.length;
    }
    
    function getActiveParticipants(uint256 limit, uint256 offset) external view returns (address[] memory) {
        uint256 total = activeParticipants.length;
        if (offset >= total) return new address[](0);
        
        uint256 count = limit;
        if (offset + limit > total) {
            count = total - offset;
        }
        
        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeParticipants[offset + i];
        }
        return result;
    }
    
    function getPendingVibes(address user) external view returns (uint256) {
        return _calculateVibes(user);
    }
    
    function getSession(uint256 sessionId) external view returns (Session420 memory) {
        return sessions[sessionId];
    }
    
    function getMoodDistribution() external view returns (uint256[5] memory) {
        return [
            moodVotes[Mood.CHILL],
            moodVotes[Mood.VIBING],
            moodVotes[Mood.HYPED],
            moodVotes[Mood.MELLOW],
            moodVotes[Mood.BLAZED]
        ];
    }
    
    function isInZone(address user) external view returns (bool) {
        return participants[user].joinTime > 0;
    }
    
    // =============================================================
    //                      ADMIN FUNCTIONS
    // =============================================================
    
    function setVibesPerMinute(uint256 newRate) external onlyOwner {
        vibesPerMinute = newRate;
    }
    
    function setEventMultiplier(uint256 newMultiplier) external onlyOwner {
        require(newMultiplier >= 1 && newMultiplier <= 10, "Zone420: invalid multiplier");
        eventMultiplier = newMultiplier;
    }
    
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Zone420: invalid treasury");
        treasury = newTreasury;
    }
}
