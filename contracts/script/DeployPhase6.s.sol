// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {RadioGovernance} from "../src/RadioGovernance.sol";
import {DJAttestations} from "../src/DJAttestations.sol";

/**
 * @title DeployPhase6
 * @notice Deploys Phase 6: Governance & Attestations contracts
 * 
 * Note: MultiSigStation is a factory pattern - deployed per station
 */
contract DeployPhase6 is Script {
    address constant RADIO_TOKEN = 0xaF0741FB82633a190683c5cFb4b8546123E93B07;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy RadioGovernance
        console.log("Deploying RadioGovernance...");
        RadioGovernance governance = new RadioGovernance(RADIO_TOKEN);
        console.log("RadioGovernance deployed at:", address(governance));
        
        // 2. Deploy DJAttestations
        console.log("Deploying DJAttestations...");
        DJAttestations attestations = new DJAttestations();
        console.log("DJAttestations deployed at:", address(attestations));
        
        vm.stopBroadcast();
        
        console.log("\n========== Phase 6 Deployment Summary ==========");
        console.log("RadioGovernance:", address(governance));
        console.log("DJAttestations: ", address(attestations));
        console.log("================================================");
        console.log("Note: MultiSigStation is deployed per-station via factory");
    }
}
