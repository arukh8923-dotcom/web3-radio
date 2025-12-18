// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SubscriptionManager
 * @notice Manages subscriptions and tipping for Web3 Radio
 * @dev Payment in RADIO tokens only (no ETH/USDC)
 * 
 * Revenue Split:
 * - Free DJ: 60% DJ / 40% Treasury
 * - Verified DJ: 70% DJ / 30% Treasury
 * - Premium DJ: 80% DJ / 20% Treasury
 */
contract SubscriptionManager is Ownable, ReentrancyGuard {
    // =============================================================
    //                           TYPES
    // =============================================================
    
    enum SubscriptionTier { BASIC, PREMIUM, VIP }
    enum DJTier { FREE, VERIFIED, PREMIUM }
    
    struct Subscription {
        address subscriber;
        address station;
        SubscriptionTier tier;
        uint256 startTime;
        uint256 endTime;
        uint256 amountPaid;
        bool autoRenew;
    }
    
    struct TipRecord {
        address tipper;
        address dj;
        address station;
        uint256 amount;
        uint256 timestamp;
        string message;
    }
    
    struct StationConfig {
        address owner;
        DJTier djTier;
        uint256 basicFee;      // Monthly fee for basic tier
        uint256 premiumFee;    // Monthly fee for premium tier
        uint256 vipFee;        // Monthly fee for VIP tier
        bool acceptsSubscriptions;
    }
    
    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice RADIO token for payments
    IERC20 public immutable radioToken;
    
    /// @notice Treasury address
    address public treasury;
    
    /// @notice Station configurations
    mapping(address => StationConfig) public stationConfigs;
    
    /// @notice Subscriptions by subscriber => station => subscription
    mapping(address => mapping(address => Subscription)) public subscriptions;
    
    /// @notice All subscriptions for a station
    mapping(address => address[]) public stationSubscribers;
    
    /// @notice All subscriptions for a user
    mapping(address => address[]) public userSubscriptions;
    
    /// @notice Tip history by station
    mapping(address => TipRecord[]) public stationTips;
    
    /// @notice Tip history by DJ
    mapping(address => TipRecord[]) public djTips;
    
    /// @notice Total tips received by DJ
    mapping(address => uint256) public totalTipsReceived;
    
    /// @notice Total subscription revenue by station
    mapping(address => uint256) public stationRevenue;
    
    /// @notice Global stats
    uint256 public totalSubscriptions;
    uint256 public totalTips;
    uint256 public totalTipAmount;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event SubscriptionCreated(
        address indexed subscriber,
        address indexed station,
        SubscriptionTier tier,
        uint256 endTime,
        uint256 amount
    );
    
    event SubscriptionRenewed(
        address indexed subscriber,
        address indexed station,
        uint256 newEndTime,
        uint256 amount
    );
    
    event SubscriptionCancelled(
        address indexed subscriber,
        address indexed station
    );
    
    event TipSent(
        address indexed tipper,
        address indexed dj,
        address indexed station,
        uint256 amount,
        string message
    );
    
    event RevenueDistributed(
        address indexed recipient,
        uint256 djAmount,
        uint256 treasuryAmount
    );
    
    event StationConfigured(
        address indexed station,
        address indexed owner,
        uint256 basicFee,
        uint256 premiumFee,
        uint256 vipFee
    );
    
    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================
    
    constructor(address _radioToken, address _treasury) Ownable(msg.sender) {
        require(_radioToken != address(0), "SubscriptionManager: invalid token");
        require(_treasury != address(0), "SubscriptionManager: invalid treasury");
        
        radioToken = IERC20(_radioToken);
        treasury = _treasury;
    }
    
    // =============================================================
    //                    STATION CONFIGURATION
    // =============================================================
    
    /**
     * @notice Configure a station for subscriptions
     * @param station Station address
     * @param djTier DJ tier for revenue split
     * @param basicFee Monthly fee for basic tier (in RADIO)
     * @param premiumFee Monthly fee for premium tier
     * @param vipFee Monthly fee for VIP tier
     */
    function configureStation(
        address station,
        DJTier djTier,
        uint256 basicFee,
        uint256 premiumFee,
        uint256 vipFee
    ) external {
        // Only station owner or contract owner can configure
        StationConfig storage config = stationConfigs[station];
        require(
            config.owner == address(0) || 
            config.owner == msg.sender || 
            msg.sender == owner(),
            "SubscriptionManager: not authorized"
        );
        
        config.owner = msg.sender;
        config.djTier = djTier;
        config.basicFee = basicFee;
        config.premiumFee = premiumFee;
        config.vipFee = vipFee;
        config.acceptsSubscriptions = true;
        
        emit StationConfigured(station, msg.sender, basicFee, premiumFee, vipFee);
    }
    
    /**
     * @notice Update DJ tier for a station
     */
    function updateDJTier(address station, DJTier newTier) external {
        StationConfig storage config = stationConfigs[station];
        require(config.owner == msg.sender || msg.sender == owner(), "SubscriptionManager: not authorized");
        config.djTier = newTier;
    }
    
    // =============================================================
    //                      SUBSCRIPTIONS
    // =============================================================
    
    /**
     * @notice Subscribe to a station
     * @param station Station address
     * @param tier Subscription tier
     * @param months Number of months
     * @param autoRenew Enable auto-renewal
     */
    function subscribe(
        address station,
        SubscriptionTier tier,
        uint256 months,
        bool autoRenew
    ) external nonReentrant {
        require(months > 0 && months <= 12, "SubscriptionManager: invalid duration");
        
        StationConfig storage config = stationConfigs[station];
        require(config.acceptsSubscriptions, "SubscriptionManager: not accepting subscriptions");
        
        // Calculate fee
        uint256 monthlyFee = _getMonthlyFee(config, tier);
        uint256 totalFee = monthlyFee * months;
        
        require(radioToken.balanceOf(msg.sender) >= totalFee, "SubscriptionManager: insufficient balance");
        
        // Distribute revenue
        (uint256 djAmount, uint256 treasuryAmount) = _calculateSplit(totalFee, config.djTier);
        
        require(radioToken.transferFrom(msg.sender, config.owner, djAmount), "SubscriptionManager: DJ transfer failed");
        require(radioToken.transferFrom(msg.sender, treasury, treasuryAmount), "SubscriptionManager: treasury transfer failed");
        
        // Update subscription
        Subscription storage sub = subscriptions[msg.sender][station];
        
        uint256 startTime = sub.endTime > block.timestamp ? sub.endTime : block.timestamp;
        uint256 endTime = startTime + (months * 30 days);
        
        if (sub.subscriber == address(0)) {
            // New subscription
            sub.subscriber = msg.sender;
            sub.station = station;
            stationSubscribers[station].push(msg.sender);
            userSubscriptions[msg.sender].push(station);
            totalSubscriptions++;
        }
        
        sub.tier = tier;
        sub.startTime = startTime;
        sub.endTime = endTime;
        sub.amountPaid += totalFee;
        sub.autoRenew = autoRenew;
        
        stationRevenue[station] += totalFee;
        
        emit SubscriptionCreated(msg.sender, station, tier, endTime, totalFee);
        emit RevenueDistributed(config.owner, djAmount, treasuryAmount);
    }
    
    /**
     * @notice Renew subscription
     * @param station Station address
     * @param months Number of months to add
     */
    function renewSubscription(address station, uint256 months) external nonReentrant {
        require(months > 0 && months <= 12, "SubscriptionManager: invalid duration");
        
        Subscription storage sub = subscriptions[msg.sender][station];
        require(sub.subscriber != address(0), "SubscriptionManager: no subscription");
        
        StationConfig storage config = stationConfigs[station];
        uint256 monthlyFee = _getMonthlyFee(config, sub.tier);
        uint256 totalFee = monthlyFee * months;
        
        require(radioToken.balanceOf(msg.sender) >= totalFee, "SubscriptionManager: insufficient balance");
        
        // Distribute revenue
        (uint256 djAmount, uint256 treasuryAmount) = _calculateSplit(totalFee, config.djTier);
        
        require(radioToken.transferFrom(msg.sender, config.owner, djAmount), "SubscriptionManager: DJ transfer failed");
        require(radioToken.transferFrom(msg.sender, treasury, treasuryAmount), "SubscriptionManager: treasury transfer failed");
        
        // Extend subscription
        uint256 startTime = sub.endTime > block.timestamp ? sub.endTime : block.timestamp;
        sub.endTime = startTime + (months * 30 days);
        sub.amountPaid += totalFee;
        
        stationRevenue[station] += totalFee;
        
        emit SubscriptionRenewed(msg.sender, station, sub.endTime, totalFee);
        emit RevenueDistributed(config.owner, djAmount, treasuryAmount);
    }
    
    /**
     * @notice Cancel auto-renewal
     */
    function cancelAutoRenew(address station) external {
        Subscription storage sub = subscriptions[msg.sender][station];
        require(sub.subscriber != address(0), "SubscriptionManager: no subscription");
        sub.autoRenew = false;
        emit SubscriptionCancelled(msg.sender, station);
    }
    
    /**
     * @notice Check if user is subscribed to station
     */
    function isSubscribed(address user, address station) external view returns (bool) {
        return subscriptions[user][station].endTime >= block.timestamp;
    }
    
    /**
     * @notice Get subscription details
     */
    function getSubscription(address user, address station) external view returns (Subscription memory) {
        return subscriptions[user][station];
    }
    
    /**
     * @notice Get subscription tier for access control
     */
    function getSubscriptionTier(address user, address station) external view returns (SubscriptionTier, bool) {
        Subscription storage sub = subscriptions[user][station];
        bool isActive = sub.endTime >= block.timestamp;
        return (sub.tier, isActive);
    }
    
    // =============================================================
    //                         TIPPING
    // =============================================================
    
    /**
     * @notice Tip a DJ
     * @param dj DJ address
     * @param station Station address (for tracking)
     * @param amount Amount of RADIO to tip
     * @param message Optional message
     */
    function tip(
        address dj,
        address station,
        uint256 amount,
        string calldata message
    ) external nonReentrant {
        require(dj != address(0), "SubscriptionManager: invalid DJ");
        require(amount > 0, "SubscriptionManager: invalid amount");
        require(radioToken.balanceOf(msg.sender) >= amount, "SubscriptionManager: insufficient balance");
        
        // Get DJ tier (default to FREE if station not configured)
        DJTier djTier = DJTier.FREE;
        if (stationConfigs[station].owner != address(0)) {
            djTier = stationConfigs[station].djTier;
        }
        
        // Distribute revenue
        (uint256 djAmount, uint256 treasuryAmount) = _calculateSplit(amount, djTier);
        
        require(radioToken.transferFrom(msg.sender, dj, djAmount), "SubscriptionManager: DJ transfer failed");
        require(radioToken.transferFrom(msg.sender, treasury, treasuryAmount), "SubscriptionManager: treasury transfer failed");
        
        // Record tip
        TipRecord memory record = TipRecord({
            tipper: msg.sender,
            dj: dj,
            station: station,
            amount: amount,
            timestamp: block.timestamp,
            message: message
        });
        
        stationTips[station].push(record);
        djTips[dj].push(record);
        totalTipsReceived[dj] += djAmount;
        totalTips++;
        totalTipAmount += amount;
        
        emit TipSent(msg.sender, dj, station, amount, message);
        emit RevenueDistributed(dj, djAmount, treasuryAmount);
    }
    
    /**
     * @notice Get recent tips for a station
     */
    function getStationTips(address station, uint256 limit) external view returns (TipRecord[] memory) {
        TipRecord[] storage tips = stationTips[station];
        uint256 count = limit > tips.length ? tips.length : limit;
        
        TipRecord[] memory result = new TipRecord[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tips[tips.length - 1 - i];
        }
        return result;
    }
    
    /**
     * @notice Get recent tips for a DJ
     */
    function getDJTips(address dj, uint256 limit) external view returns (TipRecord[] memory) {
        TipRecord[] storage tips = djTips[dj];
        uint256 count = limit > tips.length ? tips.length : limit;
        
        TipRecord[] memory result = new TipRecord[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tips[tips.length - 1 - i];
        }
        return result;
    }
    
    // =============================================================
    //                       REVENUE SPLIT
    // =============================================================
    
    function _calculateSplit(uint256 amount, DJTier tier) internal pure returns (uint256 djAmount, uint256 treasuryAmount) {
        uint256 djPercent;
        
        if (tier == DJTier.PREMIUM) {
            djPercent = 80;
        } else if (tier == DJTier.VERIFIED) {
            djPercent = 70;
        } else {
            djPercent = 60;
        }
        
        djAmount = (amount * djPercent) / 100;
        treasuryAmount = amount - djAmount;
    }
    
    function _getMonthlyFee(StationConfig storage config, SubscriptionTier tier) internal view returns (uint256) {
        if (tier == SubscriptionTier.VIP) {
            return config.vipFee;
        } else if (tier == SubscriptionTier.PREMIUM) {
            return config.premiumFee;
        } else {
            return config.basicFee;
        }
    }
    
    // =============================================================
    //                       ADMIN FUNCTIONS
    // =============================================================
    
    /**
     * @notice Update treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "SubscriptionManager: invalid treasury");
        treasury = newTreasury;
    }
    
    /**
     * @notice Get revenue split percentages for a tier
     */
    function getRevenueSplit(DJTier tier) external pure returns (uint256 djPercent, uint256 treasuryPercent) {
        if (tier == DJTier.PREMIUM) {
            return (80, 20);
        } else if (tier == DJTier.VERIFIED) {
            return (70, 30);
        } else {
            return (60, 40);
        }
    }
}
