// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";

/**
 * @title UpdateContractValues
 * @notice Script to update hardcoded values in deployed contracts
 * @dev All values should be ~$5 USD worth of tokens (dynamic pricing)
 * 
 * IMPORTANT: Run this script to update values after deployment
 * These values should be adjusted based on current token prices
 * 
 * Current Token Price Assumptions (UPDATE THESE):
 * - RADIO: $0.01 USD -> $5 = 500 RADIO
 * - VIBES: $0.001 USD -> $5 = 5000 VIBES
 * 
 * For premium features, use higher thresholds:
 * - Premium threshold: ~$50 USD worth = 5000 RADIO
 * - Governance proposal: ~$100 USD worth = 10000 RADIO
 */

// Interfaces for calling setter functions
interface IRadioPaymaster {
    function setPremiumConfig(uint256 threshold, uint256 multiplier) external;
    function owner() external view returns (address);
}

interface IZone420 {
    function setVibesPerMinute(uint256 newRate) external;
    function owner() external view returns (address);
}

interface ISmokeSignals {
    function setCostPerMinute(uint256 newCost) external;
    function owner() external view returns (address);
}

interface IHotboxRoom {
    function setRoomCreationFee(uint256 newFee) external;
    function owner() external view returns (address);
}

interface IRadioGovernance {
    function setConfig(
        uint256 votingDelay,
        uint256 votingPeriod,
        uint256 proposalThreshold,
        uint256 quorumPercentage
    ) external;
    function owner() external view returns (address);
}

interface ICommunityDrops {
    function setDefaultDropAmount(uint256 newAmount) external;
    function owner() external view returns (address);
}

contract UpdateContractValues is Script {
    // =============================================================
    //                    DEPLOYED ADDRESSES (Base Mainnet)
    // =============================================================
    
    address constant RADIO_PAYMASTER = 0x6e3cbf3F9C5E8F7932cBf8CDA389b69Ad246914b;
    address constant ZONE_420 = 0x6D4aad448235C1f0275aa06F940dC67695BD0496;
    address constant SMOKE_SIGNALS = 0x20D58d0ef3367C19bbF9D85e4Bd09Ddcfe53BB6f;
    address constant HOTBOX_ROOM = 0x7EaEC34D63D44bcE860f8a97d8c8c6440ad4F56B;
    address constant RADIO_GOVERNANCE = 0xE429D96A304dfaB96F85EBd618ad527101408ACc;
    address constant COMMUNITY_DROPS = 0xa522Def5D4493ccfBf7ce934DE8aA6F9B11C56f2;
    
    // =============================================================
    //                    DYNAMIC VALUES (~$5 USD worth)
    // =============================================================
    
    // Adjust these based on current token prices!
    // Formula: TARGET_USD / TOKEN_PRICE = TOKEN_AMOUNT
    
    // RadioPaymaster - Premium threshold (~$50 USD worth for premium status)
    // If RADIO = $0.01, then $50 = 5000 RADIO
    uint256 constant PREMIUM_THRESHOLD = 5000 * 1e18;
    uint256 constant PREMIUM_MULTIPLIER = 3; // 3x limits for premium users
    
    // Zone420 - Vibes per minute (~$0.05 USD per minute = reasonable earning rate)
    // If VIBES = $0.001, then $0.05 = 50 VIBES per minute
    uint256 constant VIBES_PER_MINUTE = 50 * 1e18;
    
    // SmokeSignals - Cost per minute (~$0.10 USD per minute)
    // If VIBES = $0.001, then $0.10 = 100 VIBES per minute
    uint256 constant SIGNAL_COST_PER_MINUTE = 100 * 1e18;
    
    // HotboxRoom - Room creation fee (~$5 USD)
    // If RADIO = $0.01, then $5 = 500 RADIO
    uint256 constant ROOM_CREATION_FEE = 500 * 1e18;
    
    // RadioGovernance - Proposal threshold (~$100 USD to prevent spam)
    // If RADIO = $0.01, then $100 = 10000 RADIO
    uint256 constant PROPOSAL_THRESHOLD = 10000 * 1e18;
    uint256 constant VOTING_DELAY = 1 days;
    uint256 constant VOTING_PERIOD = 3 days;
    uint256 constant QUORUM_PERCENTAGE = 4; // 4% of total supply
    
    // CommunityDrops - Default drop amount (~$4.20 USD for the meme)
    // If tokens = $0.01, then $4.20 = 420 tokens (keep the meme!)
    uint256 constant DEFAULT_DROP_AMOUNT = 420 * 1e18;
    
    // =============================================================
    //                         MAIN SCRIPT
    // =============================================================
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== Updating Contract Values ===");
        console.log("All values based on ~$5 USD worth of tokens");
        console.log("");
        
        // 1. Update RadioPaymaster
        _updateRadioPaymaster();
        
        // 2. Update Zone420
        _updateZone420();
        
        // 3. Update SmokeSignals
        _updateSmokeSignals();
        
        // 4. Update HotboxRoom
        _updateHotboxRoom();
        
        // 5. Update RadioGovernance
        _updateRadioGovernance();
        
        // 6. Update CommunityDrops
        _updateCommunityDrops();
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("=== All Updates Complete ===");
    }
    
    function _updateRadioPaymaster() internal {
        console.log("1. RadioPaymaster:");
        console.log("   - Premium Threshold: ", PREMIUM_THRESHOLD / 1e18, " RADIO (~$50 USD)");
        console.log("   - Premium Multiplier: ", PREMIUM_MULTIPLIER, "x");
        
        IRadioPaymaster(RADIO_PAYMASTER).setPremiumConfig(
            PREMIUM_THRESHOLD,
            PREMIUM_MULTIPLIER
        );
        
        console.log("   [OK] Updated");
    }
    
    function _updateZone420() internal {
        console.log("2. Zone420:");
        console.log("   - Vibes Per Minute: ", VIBES_PER_MINUTE / 1e18, " VIBES (~$0.05 USD)");
        
        IZone420(ZONE_420).setVibesPerMinute(VIBES_PER_MINUTE);
        
        console.log("   [OK] Updated");
    }
    
    function _updateSmokeSignals() internal {
        console.log("3. SmokeSignals:");
        console.log("   - Cost Per Minute: ", SIGNAL_COST_PER_MINUTE / 1e18, " VIBES (~$0.10 USD)");
        
        ISmokeSignals(SMOKE_SIGNALS).setCostPerMinute(SIGNAL_COST_PER_MINUTE);
        
        console.log("   [OK] Updated");
    }
    
    function _updateHotboxRoom() internal {
        console.log("4. HotboxRoom:");
        console.log("   - Room Creation Fee: ", ROOM_CREATION_FEE / 1e18, " RADIO (~$5 USD)");
        
        IHotboxRoom(HOTBOX_ROOM).setRoomCreationFee(ROOM_CREATION_FEE);
        
        console.log("   [OK] Updated");
    }
    
    function _updateRadioGovernance() internal {
        console.log("5. RadioGovernance:");
        console.log("   - Proposal Threshold: ", PROPOSAL_THRESHOLD / 1e18, " RADIO (~$100 USD)");
        console.log("   - Voting Delay: 1 day");
        console.log("   - Voting Period: 3 days");
        console.log("   - Quorum: 4%");
        
        IRadioGovernance(RADIO_GOVERNANCE).setConfig(
            VOTING_DELAY,
            VOTING_PERIOD,
            PROPOSAL_THRESHOLD,
            QUORUM_PERCENTAGE
        );
        
        console.log("   [OK] Updated");
    }
    
    function _updateCommunityDrops() internal {
        console.log("6. CommunityDrops:");
        console.log("   - Default Drop Amount: ", DEFAULT_DROP_AMOUNT / 1e18, " tokens (~$4.20 USD)");
        
        ICommunityDrops(COMMUNITY_DROPS).setDefaultDropAmount(DEFAULT_DROP_AMOUNT);
        
        console.log("   [OK] Updated");
    }
    
    // =============================================================
    //                    INDIVIDUAL UPDATE FUNCTIONS
    // =============================================================
    
    /// @notice Update only RadioPaymaster premium config
    function updatePaymasterOnly() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        _updateRadioPaymaster();
        vm.stopBroadcast();
    }
    
    /// @notice Update only Zone420 vibes rate
    function updateZone420Only() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        _updateZone420();
        vm.stopBroadcast();
    }
    
    /// @notice Update only SmokeSignals cost
    function updateSmokeSignalsOnly() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        _updateSmokeSignals();
        vm.stopBroadcast();
    }
    
    /// @notice Update only HotboxRoom fee
    function updateHotboxRoomOnly() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        _updateHotboxRoom();
        vm.stopBroadcast();
    }
    
    /// @notice Update only RadioGovernance config
    function updateGovernanceOnly() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        _updateRadioGovernance();
        vm.stopBroadcast();
    }
    
    /// @notice Update only CommunityDrops amount
    function updateCommunityDropsOnly() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        _updateCommunityDrops();
        vm.stopBroadcast();
    }
}
