// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {RadioPaymaster} from "../src/RadioPaymaster.sol";

/**
 * @title DeployPhase7
 * @notice Deploy Phase 7 contracts: Account Abstraction & Gas Optimization
 * 
 * Contracts:
 * - RadioPaymaster: Gas sponsorship management
 * 
 * Run: forge script script/DeployPhase7.s.sol:DeployPhase7 --rpc-url $RPC_URL --broadcast --verify
 */
contract DeployPhase7 is Script {
    // Existing contract addresses (Base Mainnet)
    address constant RADIO_TOKEN = 0xaF0741FB82633a190683c5cFb4b8546123E93B07;
    address constant TREASURY = 0x702AA27b8498EB3F9Ec0431BC5Fd258Bc19faf36;
    
    // Phase 3-6 contracts to whitelist
    address constant RADIO_CORE_REGISTRY = 0x716D07766eE2B6e62337B052B3501e66d12B8563;
    address constant STATION_NFT = 0x938CeF0CD64928330592ff4C58f2076Cf1d31bc3;
    address constant STATION_FACTORY = 0xD4Ff45ae4095EeB7b5650C58d6B7C979d679f560;
    address constant BROADCAST_MANAGER = 0xEfa1ac40697efDf229A67f521255A3CBbBD714eC;
    address constant SUBSCRIPTION_MANAGER = 0xc39d19eb191714Dde7dc069CA86059Fb5c5C935E;
    
    // Phase 5 contracts
    address constant ZONE420 = 0x6D4aad448235C1f0275aa06F940dC67695BD0496;
    address constant SESSION_NFT_FACTORY = 0xBDbFf9019678D42791D4bc2CA795B56b3Dc0F542;
    address constant SMOKE_SIGNALS = 0x20D58d0ef3367C19bbF9D85e4Bd09Ddcfe53BB6f;
    address constant HOTBOX_ROOM = 0x7EaEC34D63D44bcE860f8a97d8c8c6440ad4F56B;
    address constant AUX_PASS = 0x1E73B052B3Fd68eE757F70E5a923547445Cb37d5;
    address constant COMMUNITY_DROPS = 0xa522Def5D4493ccfBf7ce934DE8aA6F9B11C56f2;
    
    // Phase 6 contracts
    address constant GOVERNANCE = 0xE429D96A304dfaB96F85EBd618ad527101408ACc;
    address constant DJ_ATTESTATIONS = 0xd10eD354Cd558a4e59F079070d9E75D5181263D0;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy RadioPaymaster
        RadioPaymaster paymaster = new RadioPaymaster(
            RADIO_TOKEN,
            TREASURY
        );
        console.log("RadioPaymaster deployed at:", address(paymaster));
        
        // Whitelist all platform contracts
        address[] memory contracts = new address[](12);
        contracts[0] = RADIO_CORE_REGISTRY;
        contracts[1] = STATION_NFT;
        contracts[2] = STATION_FACTORY;
        contracts[3] = BROADCAST_MANAGER;
        contracts[4] = SUBSCRIPTION_MANAGER;
        contracts[5] = ZONE420;
        contracts[6] = SESSION_NFT_FACTORY;
        contracts[7] = SMOKE_SIGNALS;
        contracts[8] = HOTBOX_ROOM;
        contracts[9] = AUX_PASS;
        contracts[10] = COMMUNITY_DROPS;
        contracts[11] = GOVERNANCE;
        
        paymaster.setContractsWhitelist(contracts, true);
        console.log("Whitelisted", contracts.length, "contracts");
        
        vm.stopBroadcast();
        
        console.log("\n=== Phase 7 Deployment Complete ===");
        console.log("RadioPaymaster:", address(paymaster));
        console.log("\nNext steps:");
        console.log("1. Fund the paymaster with ETH for gas sponsorship");
        console.log("2. Configure CDP Paymaster policy in dashboard");
        console.log("3. Update .env.local with contract address");
    }
}
