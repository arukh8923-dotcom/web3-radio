// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {StationNFT} from "../src/StationNFT.sol";

/**
 * @title DeployStationNFT
 * @notice Deploy script for StationNFT contract
 * @dev Payment is in $RADIO token only (no ETH/USDC)
 * 
 * Run: forge script script/DeployStationNFT.s.sol --rpc-url base --broadcast --verify
 */
contract DeployStationNFT is Script {
    // $RADIO token on Base mainnet
    address constant RADIO_TOKEN = 0xaF0741FB82633a190683c5cFb4b8546123E93B07;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);

        // Configuration
        // Base URI points to our dynamic metadata API
        string memory baseURI = "https://web3-radio-omega.vercel.app/api/nft/frequency/";
        
        // Mint fees in RADIO tokens
        // At current price ~$0.00000028 per RADIO:
        // $10 USD = ~35,714,285 RADIO (35.7M)
        // $50 USD = ~178,571,428 RADIO (178.5M)
        // 
        // Using 18 decimals: 35_714_285 * 10^18
        uint256 mintFeeRadio = 35_714_285 * 1e18;        // ~$10 USD for standard frequency
        uint256 premiumMintFeeRadio = 178_571_428 * 1e18; // ~$50 USD for 420.0 FM
        
        // Treasury = deployer (can be changed later)
        address treasury = deployerAddress;

        console.log("=== Deploying StationNFT ===");
        console.log("Deployer:", deployerAddress);
        console.log("RADIO Token:", RADIO_TOKEN);
        console.log("Base URI:", baseURI);
        console.log("Mint Fee (RADIO):", mintFeeRadio / 1e18, "RADIO (~$10)");
        console.log("Premium Mint Fee (RADIO):", premiumMintFeeRadio / 1e18, "RADIO (~$50)");
        console.log("Treasury:", treasury);

        vm.startBroadcast(deployerPrivateKey);

        StationNFT stationNFT = new StationNFT(
            RADIO_TOKEN,
            baseURI,
            mintFeeRadio,
            premiumMintFeeRadio,
            treasury
        );

        vm.stopBroadcast();

        console.log("=== Deployment Complete ===");
        console.log("StationNFT deployed to:", address(stationNFT));
        console.log("Owner:", stationNFT.owner());
        console.log("");
        console.log("Next steps:");
        console.log("1. Update NEXT_PUBLIC_STATION_NFT_ADDRESS in .env");
        console.log("2. Verify contract on BaseScan");
        console.log("3. Test mint with RADIO tokens");
    }
}
