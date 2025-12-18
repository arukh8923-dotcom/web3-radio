// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {StationFactory} from "../src/StationFactory.sol";

/**
 * @title DeployStationFactory
 * @notice Deploy StationFactory contract to Base Mainnet
 * 
 * Usage:
 * forge script script/DeployStationFactory.s.sol:DeployStationFactory --rpc-url $BASE_RPC_URL --broadcast --verify
 */
contract DeployStationFactory is Script {
    // Base Mainnet addresses
    address constant RADIO_TOKEN = 0xaF0741FB82633a190683c5cFb4b8546123E93B07;
    address constant STATION_NFT = 0x938CeF0CD64928330592ff4C58f2076Cf1d31bc3;
    address constant TREASURY = 0x702AA27b8498EB3F9Ec0431BC5Fd258Bc19faf36;
    
    // Creation fees in RADIO (based on ~$0.0000003 per RADIO)
    // Standard: ~$5 worth = ~16.67M RADIO
    // Premium: ~$20 worth = ~66.67M RADIO
    uint256 constant CREATION_FEE = 16_666_666 * 1e18; // ~$5
    uint256 constant PREMIUM_CREATION_FEE = 66_666_666 * 1e18; // ~$20

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        console.log("Deploying StationFactory...");
        console.log("RADIO Token:", RADIO_TOKEN);
        console.log("StationNFT:", STATION_NFT);
        console.log("Treasury:", TREASURY);
        console.log("Creation Fee:", CREATION_FEE);
        console.log("Premium Fee:", PREMIUM_CREATION_FEE);
        
        vm.startBroadcast(deployerPrivateKey);
        
        StationFactory factory = new StationFactory(
            RADIO_TOKEN,
            STATION_NFT,
            TREASURY,
            CREATION_FEE,
            PREMIUM_CREATION_FEE
        );
        
        vm.stopBroadcast();
        
        console.log("StationFactory deployed at:", address(factory));
        console.log("");
        console.log("Add to .env.local:");
        console.log("NEXT_PUBLIC_STATION_FACTORY_ADDRESS=", address(factory));
    }
}
