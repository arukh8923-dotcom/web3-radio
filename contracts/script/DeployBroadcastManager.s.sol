// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {BroadcastManager} from "../src/BroadcastManager.sol";

/**
 * @title DeployBroadcastManager
 * @notice Deploy BroadcastManager contract to Base Mainnet
 * 
 * Usage:
 * forge script script/DeployBroadcastManager.s.sol:DeployBroadcastManager --rpc-url $BASE_RPC_URL --broadcast
 */
contract DeployBroadcastManager is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        console.log("Deploying BroadcastManager...");
        
        vm.startBroadcast(deployerPrivateKey);
        
        BroadcastManager manager = new BroadcastManager();
        
        vm.stopBroadcast();
        
        console.log("BroadcastManager deployed at:", address(manager));
        console.log("");
        console.log("Add to .env.local:");
        console.log("NEXT_PUBLIC_BROADCAST_MANAGER_ADDRESS=", address(manager));
        console.log("");
        console.log("Next steps:");
        console.log("1. Authorize StationFactory to register broadcasts");
        console.log("2. Authorize individual Station contracts as they are created");
    }
}
