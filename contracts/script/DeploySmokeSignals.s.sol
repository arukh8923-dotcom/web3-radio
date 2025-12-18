// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {SmokeSignals} from "../src/SmokeSignals.sol";

contract DeploySmokeSignals is Script {
    address constant VIBES_TOKEN = 0xCD6387AfA893C1Ad070c9870B5e9C4c0B5D56b07;
    address constant TREASURY = 0x702AA27b8498EB3F9Ec0431BC5Fd258Bc19faf36;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        SmokeSignals smokeSignals = new SmokeSignals(VIBES_TOKEN, TREASURY);
        console.log("SmokeSignals deployed at:", address(smokeSignals));
        
        vm.stopBroadcast();
    }
}
