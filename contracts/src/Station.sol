// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IStation} from "../interfaces/IStation.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Station
 * @notice Individual radio station contract with broadcast and DJ management
 * @dev Deployed by StationFactory for each frequency NFT owner
 * 
 * Revenue Split (x402):
 * - Free DJ: 60% DJ / 40% Treasury
 * - Verified DJ: 70% DJ / 30% Treasury  
 * - Premium DJ: 80% DJ / 20% Treasury
 */
contract Station is IStation, Ownable, ReentrancyGuard {
    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice Station metadata
    StationMetadata public metadata;
    
    /// @notice Frequency ID (from StationNFT)
    uint256 public immutable frequency;
    
    /// @notice RADIO token for payments
    IERC20 public immutable radioToken;
    
    /// @notice Treasury address for platform fees
    address public immutable treasury;
    
    /// @notice DJ tier for revenue split
    enum DJTier { FREE, VERIFIED, PREMIUM }
    DJTier public djTier;
    
    /// @notice Mapping of authorized DJs
    mapping(address => bool) public authorizedDJs;
    
    /// @notice List of DJ addresses
    address[] public djList;
    
    /// @notice Broadcast history
    Broadcast[] public broadcasts;
    
    /// @notice Maximum broadcasts to store
    uint256 public constant MAX_BROADCASTS = 1000;
    
    /// @notice Subscription fee in RADIO tokens
    uint256 public subscriptionFeeRadio;
    
    /// @notice Subscriber mapping
    mapping(address => uint256) public subscriberExpiry;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event SubscriptionPurchased(address indexed subscriber, uint256 expiry, uint256 amount);
    event TipReceived(address indexed tipper, address indexed dj, uint256 amount);
    event DJTierUpdated(DJTier newTier);
    event RevenueDistributed(address indexed dj, uint256 djAmount, uint256 treasuryAmount);
    
    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================
    
    constructor(
        uint256 _frequency,
        address _owner,
        address _radioToken,
        address _treasury,
        string memory _name,
        string memory _description,
        string memory _category
    ) Ownable(_owner) {
        frequency = _frequency;
        radioToken = IERC20(_radioToken);
        treasury = _treasury;
        djTier = DJTier.FREE;
        
        metadata = StationMetadata({
            name: _name,
            description: _description,
            category: _category,
            imageUrl: "",
            isPremium: false,
            subscriptionFee: 0
        });
        
        // Owner is automatically a DJ
        authorizedDJs[_owner] = true;
        djList.push(_owner);
    }
    
    // =============================================================
    //                        MODIFIERS
    // =============================================================
    
    modifier onlyDJ() {
        require(authorizedDJs[msg.sender], "Station: not authorized DJ");
        _;
    }
    
    modifier onlySubscriberOrFree() {
        if (metadata.isPremium) {
            require(
                subscriberExpiry[msg.sender] >= block.timestamp || 
                authorizedDJs[msg.sender] ||
                msg.sender == owner(),
                "Station: subscription required"
            );
        }
        _;
    }
    
    // =============================================================
    //                      BROADCAST FUNCTIONS
    // =============================================================
    
    /// @inheritdoc IStation
    function broadcast(bytes32 contentHash, BroadcastType bType) external onlyDJ {
        _addBroadcast(contentHash, 0, bType);
    }
    
    /// @inheritdoc IStation
    function scheduleBroadcast(
        bytes32 contentHash, 
        uint256 unlockTime, 
        BroadcastType bType
    ) external onlyDJ {
        require(unlockTime > block.timestamp, "Station: unlock time must be future");
        _addBroadcast(contentHash, unlockTime, bType);
    }
    
    function _addBroadcast(bytes32 contentHash, uint256 unlockTime, BroadcastType bType) internal {
        Broadcast memory newBroadcast = Broadcast({
            contentHash: contentHash,
            timestamp: block.timestamp,
            dj: msg.sender,
            unlockTime: unlockTime,
            broadcastType: bType
        });
        
        // Manage storage - remove oldest if at max
        if (broadcasts.length >= MAX_BROADCASTS) {
            // Shift array (expensive but maintains order)
            for (uint256 i = 0; i < broadcasts.length - 1; i++) {
                broadcasts[i] = broadcasts[i + 1];
            }
            broadcasts.pop();
        }
        
        broadcasts.push(newBroadcast);
        
        if (unlockTime > 0) {
            emit ScheduledBroadcast(contentHash, unlockTime);
        } else {
            emit NewBroadcast(contentHash, msg.sender, block.timestamp);
        }
    }
    
    /// @inheritdoc IStation
    function getLatestBroadcast() external view returns (Broadcast memory) {
        require(broadcasts.length > 0, "Station: no broadcasts");
        
        // Find latest unlocked broadcast
        for (uint256 i = broadcasts.length; i > 0; i--) {
            Broadcast memory b = broadcasts[i - 1];
            if (b.unlockTime == 0 || b.unlockTime <= block.timestamp) {
                return b;
            }
        }
        
        revert("Station: no available broadcasts");
    }
    
    /// @inheritdoc IStation
    function getBroadcastHistory(uint256 limit) external view returns (Broadcast[] memory) {
        uint256 count = limit > broadcasts.length ? broadcasts.length : limit;
        Broadcast[] memory result = new Broadcast[](count);
        
        for (uint256 i = 0; i < count; i++) {
            uint256 idx = broadcasts.length - 1 - i;
            Broadcast memory b = broadcasts[idx];
            // Only include unlocked broadcasts
            if (b.unlockTime == 0 || b.unlockTime <= block.timestamp) {
                result[i] = b;
            }
        }
        
        return result;
    }
    
    // =============================================================
    //                       DJ MANAGEMENT
    // =============================================================
    
    /// @inheritdoc IStation
    function addDJ(address dj) external onlyOwner {
        require(dj != address(0), "Station: invalid address");
        require(!authorizedDJs[dj], "Station: already DJ");
        
        authorizedDJs[dj] = true;
        djList.push(dj);
        
        emit DJAdded(dj);
    }
    
    /// @inheritdoc IStation
    function removeDJ(address dj) external onlyOwner {
        require(dj != owner(), "Station: cannot remove owner");
        require(authorizedDJs[dj], "Station: not a DJ");
        
        authorizedDJs[dj] = false;
        
        // Remove from list
        for (uint256 i = 0; i < djList.length; i++) {
            if (djList[i] == dj) {
                djList[i] = djList[djList.length - 1];
                djList.pop();
                break;
            }
        }
        
        emit DJRemoved(dj);
    }
    
    /// @inheritdoc IStation
    function isDJ(address account) external view returns (bool) {
        return authorizedDJs[account];
    }
    
    /// @notice Get all DJs
    function getDJs() external view returns (address[] memory) {
        return djList;
    }
    
    // =============================================================
    //                      PREMIUM & SUBSCRIPTION
    // =============================================================
    
    /// @inheritdoc IStation
    function setPremium(bool isPremium, uint256 _subscriptionFee) external onlyOwner {
        metadata.isPremium = isPremium;
        metadata.subscriptionFee = _subscriptionFee;
        subscriptionFeeRadio = _subscriptionFee;
    }
    
    /// @inheritdoc IStation
    function isPremiumStation() external view returns (bool) {
        return metadata.isPremium;
    }
    
    /// @notice Subscribe to premium station (pay in RADIO)
    /// @param months Number of months to subscribe
    function subscribe(uint256 months) external nonReentrant {
        require(metadata.isPremium, "Station: not premium");
        require(months > 0 && months <= 12, "Station: invalid duration");
        
        uint256 totalFee = subscriptionFeeRadio * months;
        require(radioToken.balanceOf(msg.sender) >= totalFee, "Station: insufficient RADIO");
        
        // Distribute revenue
        (uint256 djAmount, uint256 treasuryAmount) = _calculateSplit(totalFee);
        
        // Transfer to DJ (owner)
        require(radioToken.transferFrom(msg.sender, owner(), djAmount), "Station: DJ transfer failed");
        
        // Transfer to treasury
        require(radioToken.transferFrom(msg.sender, treasury, treasuryAmount), "Station: treasury transfer failed");
        
        // Update subscription
        uint256 currentExpiry = subscriberExpiry[msg.sender];
        uint256 startTime = currentExpiry > block.timestamp ? currentExpiry : block.timestamp;
        subscriberExpiry[msg.sender] = startTime + (months * 30 days);
        
        emit SubscriptionPurchased(msg.sender, subscriberExpiry[msg.sender], totalFee);
        emit RevenueDistributed(owner(), djAmount, treasuryAmount);
    }
    
    /// @notice Check if address is subscribed
    function isSubscribed(address account) external view returns (bool) {
        return subscriberExpiry[account] >= block.timestamp;
    }
    
    // =============================================================
    //                          TIPPING
    // =============================================================
    
    /// @notice Tip a DJ (pay in RADIO)
    /// @param dj The DJ to tip
    /// @param amount Amount of RADIO to tip
    function tipDJ(address dj, uint256 amount) external nonReentrant {
        require(authorizedDJs[dj], "Station: not a DJ");
        require(amount > 0, "Station: invalid amount");
        require(radioToken.balanceOf(msg.sender) >= amount, "Station: insufficient RADIO");
        
        // Distribute revenue
        (uint256 djAmount, uint256 treasuryAmount) = _calculateSplit(amount);
        
        // Transfer to DJ
        require(radioToken.transferFrom(msg.sender, dj, djAmount), "Station: DJ transfer failed");
        
        // Transfer to treasury
        require(radioToken.transferFrom(msg.sender, treasury, treasuryAmount), "Station: treasury transfer failed");
        
        emit TipReceived(msg.sender, dj, amount);
        emit RevenueDistributed(dj, djAmount, treasuryAmount);
    }
    
    // =============================================================
    //                       REVENUE SPLIT
    // =============================================================
    
    /// @notice Calculate revenue split based on DJ tier
    function _calculateSplit(uint256 amount) internal view returns (uint256 djAmount, uint256 treasuryAmount) {
        uint256 djPercent;
        
        if (djTier == DJTier.PREMIUM) {
            djPercent = 80;
        } else if (djTier == DJTier.VERIFIED) {
            djPercent = 70;
        } else {
            djPercent = 60;
        }
        
        djAmount = (amount * djPercent) / 100;
        treasuryAmount = amount - djAmount;
    }
    
    /// @notice Update DJ tier (only factory/admin can call)
    function setDJTier(DJTier newTier) external onlyOwner {
        djTier = newTier;
        emit DJTierUpdated(newTier);
    }
    
    /// @notice Get current revenue split percentages
    function getRevenueSplit() external view returns (uint256 djPercent, uint256 treasuryPercent) {
        if (djTier == DJTier.PREMIUM) {
            return (80, 20);
        } else if (djTier == DJTier.VERIFIED) {
            return (70, 30);
        } else {
            return (60, 40);
        }
    }
    
    // =============================================================
    //                         METADATA
    // =============================================================
    
    /// @inheritdoc IStation
    function getMetadata() external view returns (StationMetadata memory) {
        return metadata;
    }
    
    /// @inheritdoc IStation
    function updateMetadata(
        string calldata name, 
        string calldata description, 
        string calldata imageUrl
    ) external onlyOwner {
        metadata.name = name;
        metadata.description = description;
        metadata.imageUrl = imageUrl;
        
        emit MetadataUpdated(name, description);
    }
    
    /// @notice Update category
    function setCategory(string calldata category) external onlyOwner {
        metadata.category = category;
    }
    
    // =============================================================
    //                          GETTERS
    // =============================================================
    
    /// @notice Get total broadcast count
    function getBroadcastCount() external view returns (uint256) {
        return broadcasts.length;
    }
    
    /// @notice Get station info
    function getStationInfo() external view returns (
        uint256 _frequency,
        address _owner,
        string memory _name,
        string memory _category,
        bool _isPremium,
        uint256 _subscriptionFee,
        uint256 _djCount,
        uint256 _broadcastCount,
        DJTier _tier
    ) {
        return (
            frequency,
            owner(),
            metadata.name,
            metadata.category,
            metadata.isPremium,
            subscriptionFeeRadio,
            djList.length,
            broadcasts.length,
            djTier
        );
    }
}
