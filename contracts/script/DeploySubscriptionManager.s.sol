// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {SubscriptionManager} from "../src/SubscriptionManager.sol";

/**
 * @title DeploySubscriptionManager
 * @notice Deploy SubscriptionManager contract to Base Mainnet
 */
contract DeploySubscriptionManager is Script {
    // Base Mainnet addresses
    address constant RADIO_TOKEN = 0xaF0741FB82633a190683c5cFb4b8546123E93B07;
    address constant TREASURY = 0x702AA27b8498EB3F9Ec0431BC5Fd258Bc19faf36;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        console.log("Deploying SubscriptionManager...");
        console.log("RADIO Token:", RADIO_TOKEN);
        console.log("Treasury:", TREASURY);
        
        vm.startBroadcast(deployerPrivateKey);
        
        SubscriptionManager manager = new SubscriptionManager(
            RADIO_TOKEN,
            TREASURY
        );
        
        vm.stopBroadcast();
        
        console.log("SubscriptionManager deployed at:", address(manager));
        console.log("");
        console.log("Add to .env.local:");
        console.log("NEXT_PUBLIC_SUBSCRIPTION_MANAGER_ADDRESS=", address(manager));
    }
}
