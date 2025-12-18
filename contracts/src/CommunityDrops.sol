// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CommunityDrops
 * @notice Random reward drops at 4:20 times
 * @dev Uses block-based randomness (Chainlink VRF can be added for production)
 * 
 * Features:
 * - Drop trigger at 4:20 times
 * - Random selection of recipients
 * - Reward minting to recipients
 * - Drop history tracking
 * 
 * Note: For production, integrate Chainlink VRF for secure randomness
 */
contract CommunityDrops is Ownable, ReentrancyGuard {
    // =============================================================
    //                           TYPES
    // =============================================================
    
    enum RewardType { VIBES, RADIO, NFT }
    
    struct Drop {
        uint256 id;
        uint256 timestamp;
        RewardType rewardType;
        uint256 totalAmount;
        uint256 recipientCount;
        uint256 amountPerRecipient;
        bool isCompleted;
    }
    
    struct DropRecipient {
        address recipient;
        uint256 amount;
        bool claimed;
    }
    
    struct EligibleUser {
        address user;
        uint256 weight; // Based on activity/holdings
        bool isEligible;
    }
    
    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice RADIO token
    IERC20 public immutable radioToken;
    
    /// @notice VIBES token
    IERC20 public immutable vibesToken;
    
    /// @notice Treasury for funding drops
    address public treasury;
    
    /// @notice Drop counter
    uint256 public dropCount;
    
    /// @notice Drops by ID
    mapping(uint256 => Drop) public drops;
    
    /// @notice Drop recipients: dropId => index => DropRecipient
    mapping(uint256 => mapping(uint256 => DropRecipient)) public dropRecipients;
    
    /// @notice User's drops: user => dropIds
    mapping(address => uint256[]) public userDrops;
    
    /// @notice Eligible users for drops
    address[] public eligibleUsers;
    mapping(address => uint256) public userWeight;
    mapping(address => bool) public isEligible;
    
    /// @notice Last drop timestamp
    uint256 public lastDropTime;
    
    /// @notice Minimum time between drops (6 hours)
    uint256 public dropCooldown = 6 hours;
    
    /// @notice Default drop amount (in tokens)
    uint256 public defaultDropAmount = 420 * 1e18; // 420 tokens
    
    /// @notice Default recipient count
    uint256 public defaultRecipientCount = 10;
    
    /// @notice Authorized drop triggers
    mapping(address => bool) public authorizedTriggers;
    
    /// @notice Stats
    uint256 public totalDropsCompleted;
    uint256 public totalVibesDropped;
    uint256 public totalRadioDropped;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event DropTriggered(uint256 indexed dropId, RewardType rewardType, uint256 totalAmount, uint256 recipientCount);
    event DropCompleted(uint256 indexed dropId, uint256 actualRecipients);
    event RewardClaimed(uint256 indexed dropId, address indexed recipient, uint256 amount);
    event UserRegistered(address indexed user, uint256 weight);
    event UserRemoved(address indexed user);
    event EligibilityUpdated(address indexed user, uint256 newWeight);
    
    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================
    
    constructor(
        address _radioToken,
        address _vibesToken,
        address _treasury
    ) Ownable(msg.sender) {
        require(_radioToken != address(0), "CommunityDrops: invalid RADIO");
        require(_vibesToken != address(0), "CommunityDrops: invalid VIBES");
        require(_treasury != address(0), "CommunityDrops: invalid treasury");
        
        radioToken = IERC20(_radioToken);
        vibesToken = IERC20(_vibesToken);
        treasury = _treasury;
        
        authorizedTriggers[msg.sender] = true;
    }
    
    // =============================================================
    //                      ELIGIBILITY
    // =============================================================
    
    /**
     * @notice Register for drop eligibility
     */
    function registerForDrops() external {
        require(!isEligible[msg.sender], "CommunityDrops: already registered");
        
        // Calculate weight based on token holdings
        uint256 radioBalance = radioToken.balanceOf(msg.sender);
        uint256 vibesBalance = vibesToken.balanceOf(msg.sender);
        uint256 weight = (radioBalance + vibesBalance) / 1e18;
        
        require(weight > 0, "CommunityDrops: need tokens to register");
        
        isEligible[msg.sender] = true;
        userWeight[msg.sender] = weight;
        eligibleUsers.push(msg.sender);
        
        emit UserRegistered(msg.sender, weight);
    }
    
    /**
     * @notice Update eligibility weight
     */
    function updateWeight(address user) external {
        require(isEligible[user], "CommunityDrops: not registered");
        
        uint256 radioBalance = radioToken.balanceOf(user);
        uint256 vibesBalance = vibesToken.balanceOf(user);
        uint256 newWeight = (radioBalance + vibesBalance) / 1e18;
        
        if (newWeight == 0) {
            // Remove if no longer eligible
            isEligible[user] = false;
            userWeight[user] = 0;
            emit UserRemoved(user);
        } else {
            userWeight[user] = newWeight;
            emit EligibilityUpdated(user, newWeight);
        }
    }
    
    /**
     * @notice Batch update weights
     */
    function batchUpdateWeights(address[] calldata users) external {
        for (uint256 i = 0; i < users.length; i++) {
            if (isEligible[users[i]]) {
                uint256 radioBalance = radioToken.balanceOf(users[i]);
                uint256 vibesBalance = vibesToken.balanceOf(users[i]);
                uint256 newWeight = (radioBalance + vibesBalance) / 1e18;
                
                if (newWeight == 0) {
                    isEligible[users[i]] = false;
                }
                userWeight[users[i]] = newWeight;
            }
        }
    }
    
    // =============================================================
    //                      DROP FUNCTIONS
    // =============================================================
    
    /**
     * @notice Trigger a community drop
     * @param rewardType Type of reward (VIBES or RADIO)
     * @param totalAmount Total amount to distribute
     * @param recipientCount Number of recipients
     */
    function triggerDrop(
        RewardType rewardType,
        uint256 totalAmount,
        uint256 recipientCount
    ) external nonReentrant returns (uint256) {
        require(authorizedTriggers[msg.sender] || msg.sender == owner(), "CommunityDrops: not authorized");
        require(block.timestamp >= lastDropTime + dropCooldown, "CommunityDrops: cooldown active");
        require(rewardType != RewardType.NFT, "CommunityDrops: NFT drops not supported yet");
        require(recipientCount > 0 && recipientCount <= 100, "CommunityDrops: invalid recipient count");
        require(eligibleUsers.length >= recipientCount, "CommunityDrops: not enough eligible users");
        
        // Verify treasury has enough tokens
        IERC20 token = rewardType == RewardType.VIBES ? vibesToken : radioToken;
        require(token.balanceOf(treasury) >= totalAmount, "CommunityDrops: insufficient treasury balance");
        
        dropCount++;
        lastDropTime = block.timestamp;
        
        uint256 amountPerRecipient = totalAmount / recipientCount;
        
        drops[dropCount] = Drop({
            id: dropCount,
            timestamp: block.timestamp,
            rewardType: rewardType,
            totalAmount: totalAmount,
            recipientCount: recipientCount,
            amountPerRecipient: amountPerRecipient,
            isCompleted: false
        });
        
        emit DropTriggered(dropCount, rewardType, totalAmount, recipientCount);
        
        // Select random recipients
        _selectRecipients(dropCount, recipientCount);
        
        return dropCount;
    }
    
    /**
     * @notice Trigger 4:20 drop with defaults
     */
    function trigger420Drop() external returns (uint256) {
        require(authorizedTriggers[msg.sender] || msg.sender == owner(), "CommunityDrops: not authorized");
        require(block.timestamp >= lastDropTime + dropCooldown, "CommunityDrops: cooldown active");
        
        // Alternate between VIBES and RADIO
        RewardType rewardType = dropCount % 2 == 0 ? RewardType.VIBES : RewardType.RADIO;
        
        return this.triggerDrop(rewardType, defaultDropAmount, defaultRecipientCount);
    }
    
    /**
     * @notice Claim drop reward
     */
    function claimDrop(uint256 dropId, uint256 recipientIndex) external nonReentrant {
        Drop storage drop = drops[dropId];
        require(drop.isCompleted, "CommunityDrops: drop not completed");
        
        DropRecipient storage recipient = dropRecipients[dropId][recipientIndex];
        require(recipient.recipient == msg.sender, "CommunityDrops: not recipient");
        require(!recipient.claimed, "CommunityDrops: already claimed");
        
        recipient.claimed = true;
        
        // Transfer reward from treasury
        IERC20 token = drop.rewardType == RewardType.VIBES ? vibesToken : radioToken;
        require(token.transferFrom(treasury, msg.sender, recipient.amount), "CommunityDrops: transfer failed");
        
        emit RewardClaimed(dropId, msg.sender, recipient.amount);
    }
    
    // =============================================================
    //                      INTERNAL FUNCTIONS
    // =============================================================
    
    function _selectRecipients(uint256 dropId, uint256 count) internal {
        Drop storage drop = drops[dropId];
        
        // Simple weighted random selection
        // Note: For production, use Chainlink VRF
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < eligibleUsers.length; i++) {
            if (isEligible[eligibleUsers[i]]) {
                totalWeight += userWeight[eligibleUsers[i]];
            }
        }
        
        uint256 selected = 0;
        uint256 seed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            dropId,
            msg.sender
        )));
        
        // Track selected users to avoid duplicates
        mapping(address => bool) storage selectedUsers = _getSelectedMapping(dropId);
        
        uint256 attempts = 0;
        uint256 maxAttempts = eligibleUsers.length * 3;
        
        while (selected < count && attempts < maxAttempts) {
            seed = uint256(keccak256(abi.encodePacked(seed, attempts)));
            uint256 randomWeight = seed % totalWeight;
            
            uint256 cumulative = 0;
            for (uint256 i = 0; i < eligibleUsers.length; i++) {
                address user = eligibleUsers[i];
                if (!isEligible[user] || selectedUsers[user]) continue;
                
                cumulative += userWeight[user];
                if (cumulative > randomWeight) {
                    selectedUsers[user] = true;
                    
                    dropRecipients[dropId][selected] = DropRecipient({
                        recipient: user,
                        amount: drop.amountPerRecipient,
                        claimed: false
                    });
                    
                    userDrops[user].push(dropId);
                    selected++;
                    break;
                }
            }
            attempts++;
        }
        
        drop.recipientCount = selected;
        drop.isCompleted = true;
        totalDropsCompleted++;
        
        if (drop.rewardType == RewardType.VIBES) {
            totalVibesDropped += drop.amountPerRecipient * selected;
        } else {
            totalRadioDropped += drop.amountPerRecipient * selected;
        }
        
        emit DropCompleted(dropId, selected);
    }
    
    // Workaround for mapping in memory
    mapping(uint256 => mapping(address => bool)) private _selectedMappings;
    
    function _getSelectedMapping(uint256 dropId) internal view returns (mapping(address => bool) storage) {
        return _selectedMappings[dropId];
    }
    
    // =============================================================
    //                      VIEW FUNCTIONS
    // =============================================================
    
    function getDrop(uint256 dropId) external view returns (Drop memory) {
        return drops[dropId];
    }
    
    function getDropRecipients(uint256 dropId) external view returns (DropRecipient[] memory) {
        Drop storage drop = drops[dropId];
        DropRecipient[] memory result = new DropRecipient[](drop.recipientCount);
        
        for (uint256 i = 0; i < drop.recipientCount; i++) {
            result[i] = dropRecipients[dropId][i];
        }
        
        return result;
    }
    
    function getUserDrops(address user) external view returns (uint256[] memory) {
        return userDrops[user];
    }
    
    function getEligibleUserCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < eligibleUsers.length; i++) {
            if (isEligible[eligibleUsers[i]]) count++;
        }
        return count;
    }
    
    function canTriggerDrop() external view returns (bool) {
        return block.timestamp >= lastDropTime + dropCooldown;
    }
    
    function getTimeUntilNextDrop() external view returns (uint256) {
        if (block.timestamp >= lastDropTime + dropCooldown) return 0;
        return (lastDropTime + dropCooldown) - block.timestamp;
    }
    
    function getUserPendingClaims(address user) external view returns (uint256[] memory dropIds, uint256[] memory amounts) {
        uint256[] storage userDropIds = userDrops[user];
        
        // Count pending
        uint256 pendingCount = 0;
        for (uint256 i = 0; i < userDropIds.length; i++) {
            uint256 dropId = userDropIds[i];
            Drop storage drop = drops[dropId];
            
            for (uint256 j = 0; j < drop.recipientCount; j++) {
                if (dropRecipients[dropId][j].recipient == user && !dropRecipients[dropId][j].claimed) {
                    pendingCount++;
                    break;
                }
            }
        }
        
        // Build result
        dropIds = new uint256[](pendingCount);
        amounts = new uint256[](pendingCount);
        uint256 idx = 0;
        
        for (uint256 i = 0; i < userDropIds.length && idx < pendingCount; i++) {
            uint256 dropId = userDropIds[i];
            Drop storage drop = drops[dropId];
            
            for (uint256 j = 0; j < drop.recipientCount; j++) {
                if (dropRecipients[dropId][j].recipient == user && !dropRecipients[dropId][j].claimed) {
                    dropIds[idx] = dropId;
                    amounts[idx] = dropRecipients[dropId][j].amount;
                    idx++;
                    break;
                }
            }
        }
    }
    
    // =============================================================
    //                      ADMIN FUNCTIONS
    // =============================================================
    
    function setDropCooldown(uint256 newCooldown) external onlyOwner {
        require(newCooldown >= 1 hours && newCooldown <= 24 hours, "CommunityDrops: invalid cooldown");
        dropCooldown = newCooldown;
    }
    
    function setDefaultDropAmount(uint256 newAmount) external onlyOwner {
        defaultDropAmount = newAmount;
    }
    
    function setDefaultRecipientCount(uint256 newCount) external onlyOwner {
        require(newCount > 0 && newCount <= 100, "CommunityDrops: invalid count");
        defaultRecipientCount = newCount;
    }
    
    function authorizeTrigger(address trigger) external onlyOwner {
        authorizedTriggers[trigger] = true;
    }
    
    function revokeTrigger(address trigger) external onlyOwner {
        authorizedTriggers[trigger] = false;
    }
    
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "CommunityDrops: invalid treasury");
        treasury = newTreasury;
    }
}
