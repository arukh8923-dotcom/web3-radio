// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {HotboxRoom} from "../src/HotboxRoom.sol";
import {AuxPass} from "../src/AuxPass.sol";
import {CommunityDrops} from "../src/CommunityDrops.sol";

contract DeployPhase5Remaining is Script {
    address constant RADIO_TOKEN = 0xaF0741FB82633a190683c5cFb4b8546123E93B07;
    address constant VIBES_TOKEN = 0xCD6387AfA893C1Ad070c9870B5e9C4c0B5D56b07;
    address constant TREASURY = 0x702AA27b8498EB3F9Ec0431BC5Fd258Bc19faf36;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
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
        
        console.log("\n========== Remaining Deployment Summary ==========");
        console.log("HotboxRoom:        ", address(hotboxRoom));
        console.log("AuxPass:           ", address(auxPass));
        console.log("CommunityDrops:    ", address(communityDrops));
        console.log("==================================================");
    }
}
