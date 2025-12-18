// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RadioPaymaster
 * @notice Gas sponsorship contract for Web3 Radio platform
 * @dev Works with CDP Paymaster for ERC-4337 Account Abstraction
 * 
 * Features:
 * - Sponsor gas for platform transactions
 * - Whitelist contracts for sponsorship
 * - Daily/monthly limits per user
 * - Fallback to user-paid gas
 * - Treasury funding
 * 
 * Note: This contract manages sponsorship policies and funds.
 * Actual gas sponsorship is handled by CDP Paymaster service.
 */
contract RadioPaymaster is Ownable, ReentrancyGuard {
    // =============================================================
    //                           TYPES
    // =============================================================
    
    struct SponsorshipPolicy {
        bool enabled;
        uint256 maxGasPerTx;      // Max gas units per transaction
        uint256 dailyLimit;       // Daily gas limit per user (in wei)
        uint256 monthlyLimit;     // Monthly gas limit per user (in wei)
    }
    
    struct UserUsage {
        uint256 dailyUsed;
        uint256 monthlyUsed;
        uint256 lastDailyReset;
        uint256 lastMonthlyReset;
        uint256 totalSponsored;
        uint256 txCount;
    }
    
    struct SponsoredTx {
        address user;
        address target;
        uint256 gasUsed;
        uint256 gasCost;
        uint256 timestamp;
        bytes4 selector;
    }
    
    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice Treasury address for funding
    address public treasury;
    
    /// @notice RADIO token for premium sponsorship
    IERC20 public immutable radioToken;
    
    /// @notice Whitelisted contracts for sponsorship
    mapping(address => bool) public whitelistedContracts;
    
    /// @notice Whitelisted function selectors per contract
    mapping(address => mapping(bytes4 => bool)) public whitelistedSelectors;
    
    /// @notice User usage tracking
    mapping(address => UserUsage) public userUsage;
    
    /// @notice Sponsorship policy
    SponsorshipPolicy public policy;
    
    /// @notice Premium users (RADIO holders get higher limits)
    uint256 public premiumThreshold = 1000 * 1e18; // 1000 RADIO
    uint256 public premiumMultiplier = 3; // 3x limits for premium
    
    /// @notice Total gas sponsored
    uint256 public totalGasSponsored;
    uint256 public totalTxSponsored;
    
    /// @notice Sponsored transaction history (last 100)
    SponsoredTx[] public sponsoredTxs;
    uint256 public constant MAX_HISTORY = 100;
    
    /// @notice Pause sponsorship
    bool public paused;
    
    /// @notice Contract balance for gas funding
    uint256 public sponsorshipFund;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event GasSponsored(
        address indexed user,
        address indexed target,
        uint256 gasUsed,
        uint256 gasCost
    );
    
    event ContractWhitelisted(address indexed target, bool status);
    event SelectorWhitelisted(address indexed target, bytes4 selector, bool status);
    event PolicyUpdated(uint256 maxGasPerTx, uint256 dailyLimit, uint256 monthlyLimit);
    event FundDeposited(address indexed from, uint256 amount);
    event FundWithdrawn(address indexed to, uint256 amount);
    event PremiumConfigUpdated(uint256 threshold, uint256 multiplier);
    event Paused(bool status);
    
    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================
    
    constructor(
        address _radioToken,
        address _treasury
    ) Ownable(msg.sender) {
        require(_radioToken != address(0), "Paymaster: invalid token");
        require(_treasury != address(0), "Paymaster: invalid treasury");
        
        radioToken = IERC20(_radioToken);
        treasury = _treasury;
        
        // Default policy
        policy = SponsorshipPolicy({
            enabled: true,
            maxGasPerTx: 500000,           // 500k gas per tx
            dailyLimit: 0.01 ether,        // 0.01 ETH daily
            monthlyLimit: 0.1 ether        // 0.1 ETH monthly
        });
    }

    
    // =============================================================
    //                      SPONSORSHIP FUNCTIONS
    // =============================================================
    
    /**
     * @notice Check if a transaction can be sponsored
     * @param user User address
     * @param target Target contract
     * @param selector Function selector
     * @param estimatedGas Estimated gas for the transaction
     */
    function canSponsor(
        address user,
        address target,
        bytes4 selector,
        uint256 estimatedGas
    ) external view returns (bool sponsorable, string memory reason) {
        if (paused) {
            return (false, "Sponsorship paused");
        }
        
        if (!policy.enabled) {
            return (false, "Sponsorship disabled");
        }
        
        if (!whitelistedContracts[target]) {
            return (false, "Contract not whitelisted");
        }
        
        if (!whitelistedSelectors[target][selector] && selector != bytes4(0)) {
            return (false, "Function not whitelisted");
        }
        
        if (estimatedGas > policy.maxGasPerTx) {
            return (false, "Gas exceeds max per tx");
        }
        
        // Check user limits
        UserUsage storage usage = userUsage[user];
        (uint256 dailyLimit, uint256 monthlyLimit) = _getUserLimits(user);
        
        uint256 currentDaily = _getCurrentDailyUsage(usage);
        uint256 currentMonthly = _getCurrentMonthlyUsage(usage);
        
        // Estimate cost (use current gas price approximation)
        uint256 estimatedCost = estimatedGas * 1 gwei; // Simplified
        
        if (currentDaily + estimatedCost > dailyLimit) {
            return (false, "Daily limit exceeded");
        }
        
        if (currentMonthly + estimatedCost > monthlyLimit) {
            return (false, "Monthly limit exceeded");
        }
        
        if (sponsorshipFund < estimatedCost) {
            return (false, "Insufficient sponsorship fund");
        }
        
        return (true, "");
    }
    
    /**
     * @notice Record a sponsored transaction
     * @dev Called by authorized relayer after successful sponsorship
     */
    function recordSponsorship(
        address user,
        address target,
        bytes4 selector,
        uint256 gasUsed,
        uint256 gasCost
    ) external onlyOwner nonReentrant {
        require(!paused, "Paymaster: paused");
        
        // Update user usage
        UserUsage storage usage = userUsage[user];
        _resetUsageIfNeeded(usage);
        
        usage.dailyUsed += gasCost;
        usage.monthlyUsed += gasCost;
        usage.totalSponsored += gasCost;
        usage.txCount++;
        
        // Update totals
        totalGasSponsored += gasCost;
        totalTxSponsored++;
        
        // Deduct from fund
        if (sponsorshipFund >= gasCost) {
            sponsorshipFund -= gasCost;
        }
        
        // Record history
        if (sponsoredTxs.length >= MAX_HISTORY) {
            // Shift array (remove oldest)
            for (uint256 i = 0; i < MAX_HISTORY - 1; i++) {
                sponsoredTxs[i] = sponsoredTxs[i + 1];
            }
            sponsoredTxs.pop();
        }
        
        sponsoredTxs.push(SponsoredTx({
            user: user,
            target: target,
            gasUsed: gasUsed,
            gasCost: gasCost,
            timestamp: block.timestamp,
            selector: selector
        }));
        
        emit GasSponsored(user, target, gasUsed, gasCost);
    }
    
    // =============================================================
    //                      INTERNAL FUNCTIONS
    // =============================================================
    
    function _getUserLimits(address user) internal view returns (uint256 daily, uint256 monthly) {
        bool isPremium = radioToken.balanceOf(user) >= premiumThreshold;
        
        if (isPremium) {
            return (
                policy.dailyLimit * premiumMultiplier,
                policy.monthlyLimit * premiumMultiplier
            );
        }
        
        return (policy.dailyLimit, policy.monthlyLimit);
    }
    
    function _getCurrentDailyUsage(UserUsage storage usage) internal view returns (uint256) {
        if (block.timestamp >= usage.lastDailyReset + 1 days) {
            return 0;
        }
        return usage.dailyUsed;
    }
    
    function _getCurrentMonthlyUsage(UserUsage storage usage) internal view returns (uint256) {
        if (block.timestamp >= usage.lastMonthlyReset + 30 days) {
            return 0;
        }
        return usage.monthlyUsed;
    }
    
    function _resetUsageIfNeeded(UserUsage storage usage) internal {
        if (block.timestamp >= usage.lastDailyReset + 1 days) {
            usage.dailyUsed = 0;
            usage.lastDailyReset = block.timestamp;
        }
        
        if (block.timestamp >= usage.lastMonthlyReset + 30 days) {
            usage.monthlyUsed = 0;
            usage.lastMonthlyReset = block.timestamp;
        }
    }
    
    // =============================================================
    //                      VIEW FUNCTIONS
    // =============================================================
    
    /**
     * @notice Get user's remaining limits
     */
    function getUserLimits(address user) external view returns (
        uint256 dailyRemaining,
        uint256 monthlyRemaining,
        uint256 totalSponsored,
        uint256 txCount,
        bool isPremium
    ) {
        UserUsage storage usage = userUsage[user];
        (uint256 dailyLimit, uint256 monthlyLimit) = _getUserLimits(user);
        
        uint256 currentDaily = _getCurrentDailyUsage(usage);
        uint256 currentMonthly = _getCurrentMonthlyUsage(usage);
        
        return (
            dailyLimit > currentDaily ? dailyLimit - currentDaily : 0,
            monthlyLimit > currentMonthly ? monthlyLimit - currentMonthly : 0,
            usage.totalSponsored,
            usage.txCount,
            radioToken.balanceOf(user) >= premiumThreshold
        );
    }
    
    /**
     * @notice Get recent sponsored transactions
     */
    function getRecentSponsoredTxs(uint256 limit) external view returns (SponsoredTx[] memory) {
        uint256 count = limit > sponsoredTxs.length ? sponsoredTxs.length : limit;
        SponsoredTx[] memory result = new SponsoredTx[](count);
        
        for (uint256 i = 0; i < count; i++) {
            result[i] = sponsoredTxs[sponsoredTxs.length - 1 - i];
        }
        
        return result;
    }
    
    /**
     * @notice Get sponsorship stats
     */
    function getStats() external view returns (
        uint256 totalGas,
        uint256 totalTx,
        uint256 fundBalance,
        bool isPaused,
        bool isEnabled
    ) {
        return (
            totalGasSponsored,
            totalTxSponsored,
            sponsorshipFund,
            paused,
            policy.enabled
        );
    }
    
    // =============================================================
    //                      ADMIN FUNCTIONS
    // =============================================================
    
    /**
     * @notice Whitelist a contract for sponsorship
     */
    function setContractWhitelist(address target, bool status) external onlyOwner {
        whitelistedContracts[target] = status;
        emit ContractWhitelisted(target, status);
    }
    
    /**
     * @notice Whitelist multiple contracts
     */
    function setContractsWhitelist(address[] calldata targets, bool status) external onlyOwner {
        for (uint256 i = 0; i < targets.length; i++) {
            whitelistedContracts[targets[i]] = status;
            emit ContractWhitelisted(targets[i], status);
        }
    }
    
    /**
     * @notice Whitelist a function selector
     */
    function setSelectorWhitelist(
        address target,
        bytes4 selector,
        bool status
    ) external onlyOwner {
        whitelistedSelectors[target][selector] = status;
        emit SelectorWhitelisted(target, selector, status);
    }
    
    /**
     * @notice Update sponsorship policy
     */
    function setPolicy(
        bool enabled,
        uint256 maxGasPerTx,
        uint256 dailyLimit,
        uint256 monthlyLimit
    ) external onlyOwner {
        policy = SponsorshipPolicy({
            enabled: enabled,
            maxGasPerTx: maxGasPerTx,
            dailyLimit: dailyLimit,
            monthlyLimit: monthlyLimit
        });
        
        emit PolicyUpdated(maxGasPerTx, dailyLimit, monthlyLimit);
    }
    
    /**
     * @notice Update premium config
     */
    function setPremiumConfig(uint256 threshold, uint256 multiplier) external onlyOwner {
        require(multiplier >= 1 && multiplier <= 10, "Paymaster: invalid multiplier");
        premiumThreshold = threshold;
        premiumMultiplier = multiplier;
        emit PremiumConfigUpdated(threshold, multiplier);
    }
    
    /**
     * @notice Pause/unpause sponsorship
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }
    
    /**
     * @notice Update treasury
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Paymaster: invalid treasury");
        treasury = _treasury;
    }
    
    /**
     * @notice Deposit funds for sponsorship
     */
    function depositFund() external payable {
        require(msg.value > 0, "Paymaster: zero deposit");
        sponsorshipFund += msg.value;
        emit FundDeposited(msg.sender, msg.value);
    }
    
    /**
     * @notice Withdraw funds (owner only)
     */
    function withdrawFund(uint256 amount) external onlyOwner {
        require(amount <= sponsorshipFund, "Paymaster: insufficient fund");
        sponsorshipFund -= amount;
        
        (bool success, ) = treasury.call{value: amount}("");
        require(success, "Paymaster: transfer failed");
        
        emit FundWithdrawn(treasury, amount);
    }
    
    /**
     * @notice Emergency withdraw all
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        sponsorshipFund = 0;
        
        (bool success, ) = treasury.call{value: balance}("");
        require(success, "Paymaster: transfer failed");
        
        emit FundWithdrawn(treasury, balance);
    }
    
    // Receive ETH
    receive() external payable {
        sponsorshipFund += msg.value;
        emit FundDeposited(msg.sender, msg.value);
    }
}
