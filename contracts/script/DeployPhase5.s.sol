// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {Zone420} from "../src/Zone420.sol";
import {SessionNFTFactory} from "../src/SessionNFTFactory.sol";
import {SmokeSignals} from "../src/SmokeSignals.sol";
import {HotboxRoom} from "../src/HotboxRoom.sol";
import {AuxPass} from "../src/AuxPass.sol";
import {CommunityDrops} from "../src/CommunityDrops.sol";

/**
 * @title DeployPhase5
 * @notice Deploys all Phase 5: 420 Culture Features contracts
 * 
 * Contracts:
 * - Zone420: Special 420.0 frequency zone
 * - SessionNFTFactory: Session attendance NFTs
 * - SmokeSignals: Ephemeral messages
 * - HotboxRoom: Token-gated rooms
 * - AuxPass: Queue management
 * - CommunityDrops: Random rewards
 */
contract DeployPhase5 is Script {
    // Token addresses (Base Mainnet)
    address constant RADIO_TOKEN = 0xaF0741FB82633a190683c5cFb4b8546123E93B07;
    address constant VIBES_TOKEN = 0xCD6387AfA893C1Ad070c9870B5e9C4c0B5D56b07;
    address constant TREASURY = 0x702AA27b8498EB3F9Ec0431BC5Fd258Bc19faf36;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy Zone420
        console.log("Deploying Zone420...");
        Zone420 zone420 = new Zone420(VIBES_TOKEN, TREASURY);
        console.log("Zone420 deployed at:", address(zone420));
        
        // 2. Deploy SessionNFTFactory
        console.log("Deploying SessionNFTFactory...");
        SessionNFTFactory sessionNFT = new SessionNFTFactory();
        console.log("SessionNFTFactory deployed at:", address(sessionNFT));
        
        // 3. Deploy SmokeSignals
        console.log("Deploying SmokeSignals...");
        SmokeSignals smokeSignals = new SmokeSignals(VIBES_TOKEN, TREASURY);
        console.log("SmokeSignals deployed at:", address(smokeSignals));
        
        // 4. Deploy HotboxRoom
        console.log("Deploying HotboxRoom...");
        HotboxRoom hotboxRoom = new HotboxRoom(RADIO_TOKEN, VIBES_TOKEN, TREASURY);
        console.log("HotboxRoom deployed at:", address(hotboxRoom));
        
        // 5. Deploy AuxPass
        console.log("Deploying AuxPass...");
        AuxPass auxPass = new AuxPass(RADIO_TOKEN, TREASURY);
        console.log("AuxPass deployed at:", address(auxPass));
        
        // 6. Deploy CommunityDrops
        console.log("Deploying CommunityDrops...");
        CommunityDrops communityDrops = new CommunityDrops(RADIO_TOKEN, VIBES_TOKEN, TREASURY);
        console.log("CommunityDrops deployed at:", address(communityDrops));
        
        vm.stopBroadcast();
        
        // Summary
        console.log("\n========== Phase 5 Deployment Summary ==========");
        console.log("Zone420:          ", address(zone420));
        console.log("SessionNFTFactory:", address(sessionNFT));
        console.log("SmokeSignals:     ", address(smokeSignals));
        console.log("HotboxRoom:       ", address(hotboxRoom));
        console.log("AuxPass:          ", address(auxPass));
        console.log("CommunityDrops:   ", address(communityDrops));
        console.log("================================================");
    }
}
