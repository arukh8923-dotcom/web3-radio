// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {RadioCoreRegistry} from "../src/RadioCoreRegistry.sol";

/**
 * @title DeployRadioCoreRegistry
 * @notice Deployment script for RadioCoreRegistry on Base mainnet
 */
contract DeployRadioCoreRegistry is Script {
    function run() external returns (RadioCoreRegistry) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        console.log("Deploying RadioCoreRegistry...");

        vm.startBroadcast(deployerPrivateKey);

        RadioCoreRegistry registry = new RadioCoreRegistry();

        console.log("RadioCoreRegistry deployed at:", address(registry));

        vm.stopBroadcast();

        return registry;
    }
}
