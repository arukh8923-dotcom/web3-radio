// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";

// Import all contracts
import "../src/RadioCoreRegistry.sol";
import "../src/SubscriptionManager.sol";
import "../src/Zone420.sol";
import "../src/SmokeSignals.sol";
import "../src/HotboxRoom.sol";
import "../src/SessionNFTFactory.sol";
import "../src/AuxPass.sol";
import "../src/CommunityDrops.sol";
import "../src/RadioGovernance.sol";
import "../src/DJAttestations.sol";
import "../src/StationNFT.sol";
import "../src/StationFactory.sol";
import "../src/BroadcastManager.sol";
import "../src/Station.sol";
import "../src/MultiSigStation.sol";
import "../src/RadioPaymaster.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 100000000 * 1e18);
    }
}

/**
 * @title AllContractsTest
 * @notice Comprehensive tests for all 16 Web3 Radio contracts
 */
contract AllContractsTest is Test {
    // Tokens
    MockToken public radio;
    MockToken public vibes;
    
    // Addresses
    address public owner = address(1);
    address public treasury = address(0x702AA27b8498EB3F9Ec0431BC5Fd258Bc19faf36);
    address public user1 = address(3);
    address public user2 = address(4);
    address public station = address(5);

    function setUp() public {
        vm.startPrank(owner);
        radio = new MockToken("RADIO", "RADIO");
        vibes = new MockToken("VIBES", "VIBES");
        radio.transfer(user1, 100000 * 1e18);
        radio.transfer(user2, 100000 * 1e18);
        vibes.transfer(user1, 100000 * 1e18);
        vibes.transfer(user2, 100000 * 1e18);
        vm.stopPrank();
    }

    // ============ RadioCoreRegistry Tests ============
    
    function test_RadioCoreRegistry_Deploy() public {
        vm.prank(owner);
        RadioCoreRegistry registry = new RadioCoreRegistry();
        assertEq(registry.owner(), owner);
    }

    function test_RadioCoreRegistry_RegisterStation() public {
        vm.startPrank(owner);
        RadioCoreRegistry registry = new RadioCoreRegistry();
        registry.registerStation(station, 880);
        vm.stopPrank();
        assertEq(registry.getStationByFrequency(880), station);
    }

    function test_RadioCoreRegistry_TuneIn() public {
        vm.startPrank(owner);
        RadioCoreRegistry registry = new RadioCoreRegistry();
        registry.registerStation(station, 880);
        vm.stopPrank();
        
        vm.prank(user1);
        registry.tuneIn(880);
        assertTrue(registry.isTunedIn(user1, 880));
    }

    // ============ SubscriptionManager Tests ============

    function test_SubscriptionManager_Deploy() public {
        vm.prank(owner);
        SubscriptionManager manager = new SubscriptionManager(address(radio), treasury);
        assertEq(address(manager.radioToken()), address(radio));
    }

    function test_SubscriptionManager_Tip() public {
        vm.prank(owner);
        SubscriptionManager manager = new SubscriptionManager(address(radio), treasury);
        
        vm.startPrank(user1);
        radio.approve(address(manager), 100 * 1e18);
        manager.tip(user2, station, 100 * 1e18, "Great!");
        vm.stopPrank();
        
        assertGt(radio.balanceOf(user2), 0);
    }

    // ============ Zone420 Tests ============

    function test_Zone420_Deploy() public {
        vm.prank(owner);
        Zone420 zone = new Zone420(address(vibes), treasury);
        assertEq(address(zone.vibesToken()), address(vibes));
    }

    function test_Zone420_JoinLeave() public {
        vm.startPrank(owner);
        Zone420 zone = new Zone420(address(vibes), treasury);
        vibes.transfer(address(zone), 100000 * 1e18);
        vm.stopPrank();
        
        vm.prank(user1);
        zone.joinZone();
        assertTrue(zone.isInZone(user1));
    }

    // ============ SmokeSignals Tests ============

    function test_SmokeSignals_Deploy() public {
        vm.prank(owner);
        SmokeSignals signals = new SmokeSignals(address(vibes), treasury);
        assertEq(address(signals.vibesToken()), address(vibes));
    }

    // ============ HotboxRoom Tests ============

    function test_HotboxRoom_Deploy() public {
        vm.prank(owner);
        HotboxRoom room = new HotboxRoom(address(radio), address(vibes), treasury);
        assertEq(address(room.radioToken()), address(radio));
        assertEq(address(room.vibesToken()), address(vibes));
    }

    // ============ CommunityDrops Tests ============

    function test_CommunityDrops_Deploy() public {
        vm.prank(owner);
        CommunityDrops drops = new CommunityDrops(address(radio), address(vibes), treasury);
        assertEq(address(drops.radioToken()), address(radio));
        assertEq(address(drops.vibesToken()), address(vibes));
    }

    // ============ AuxPass Tests ============

    function test_AuxPass_Deploy() public {
        vm.prank(owner);
        AuxPass auxPass = new AuxPass(address(radio), treasury);
        assertEq(address(auxPass.radioToken()), address(radio));
    }

    // ============ SessionNFTFactory Tests ============

    function test_SessionNFTFactory_Deploy() public {
        vm.prank(owner);
        SessionNFTFactory factory = new SessionNFTFactory();
        assertEq(factory.owner(), owner);
    }

    function test_SessionNFTFactory_CreateSession() public {
        vm.prank(owner);
        SessionNFTFactory factory = new SessionNFTFactory();
        
        vm.prank(owner);
        uint256 sessionId = factory.createSession(420, "Test", "Description", 60, 5);
        assertGt(sessionId, 0);
    }

    // ============ RadioGovernance Tests ============

    function test_RadioGovernance_Deploy() public {
        vm.prank(owner);
        RadioGovernance governance = new RadioGovernance(address(radio));
        assertEq(address(governance.radioToken()), address(radio));
    }

    // ============ DJAttestations Tests ============

    function test_DJAttestations_Deploy() public {
        vm.prank(owner);
        DJAttestations attestations = new DJAttestations();
        assertEq(attestations.owner(), owner);
    }

    function test_DJAttestations_AddAttester() public {
        vm.startPrank(owner);
        DJAttestations attestations = new DJAttestations();
        attestations.addAttester(user1);
        vm.stopPrank();
        assertTrue(attestations.attesters(user1));
    }

    // ============ StationNFT Tests ============

    function test_StationNFT_Deploy() public {
        vm.prank(owner);
        StationNFT nft = new StationNFT(address(radio), "https://api.web3radio.xyz/nft/", 100 * 1e18, 500 * 1e18, treasury);
        assertEq(address(nft.radioToken()), address(radio));
    }

    // ============ StationFactory Tests ============

    function test_StationFactory_Deploy() public {
        vm.startPrank(owner);
        StationNFT nft = new StationNFT(address(radio), "https://api.web3radio.xyz/nft/", 100 * 1e18, 500 * 1e18, treasury);
        StationFactory factory = new StationFactory(address(radio), address(nft), treasury, 50 * 1e18, 200 * 1e18);
        vm.stopPrank();
        assertEq(factory.treasury(), treasury);
    }

    // ============ BroadcastManager Tests ============

    function test_BroadcastManager_Deploy() public {
        vm.prank(owner);
        BroadcastManager manager = new BroadcastManager();
        assertEq(manager.owner(), owner);
    }

    // ============ Station Tests ============

    function test_Station_Deploy() public {
        vm.prank(owner);
        Station s = new Station(880, owner, address(radio), treasury, "Test", "Desc", "music");
        assertEq(s.frequency(), 880);
    }

    function test_Station_AddDJ() public {
        vm.startPrank(owner);
        Station s = new Station(880, owner, address(radio), treasury, "Test", "Desc", "music");
        s.addDJ(user1);
        vm.stopPrank();
        assertTrue(s.isDJ(user1));
    }

    // ============ MultiSigStation Tests ============

    function test_MultiSigStation_Deploy() public {
        address[] memory collabs = new address[](2);
        collabs[0] = user1;
        collabs[1] = user2;
        
        vm.prank(owner);
        MultiSigStation ms = new MultiSigStation(address(radio), treasury, "Multi", "Desc", "music", 880, collabs, 2);
        assertEq(ms.threshold(), 2);
    }

    // ============ RadioPaymaster Tests ============

    function test_RadioPaymaster_Deploy() public {
        vm.prank(owner);
        RadioPaymaster paymaster = new RadioPaymaster(address(radio), treasury);
        assertEq(address(paymaster.radioToken()), address(radio));
    }

    // ============ Property-Based Tests ============

    function testFuzz_TuneInOut(uint256 frequency) public {
        frequency = bound(frequency, 880, 1080);
        
        vm.startPrank(owner);
        RadioCoreRegistry registry = new RadioCoreRegistry();
        registry.registerStation(station, frequency);
        vm.stopPrank();
        
        vm.startPrank(user1);
        registry.tuneIn(frequency);
        assertTrue(registry.isTunedIn(user1, frequency));
        
        registry.tuneOut(frequency);
        assertFalse(registry.isTunedIn(user1, frequency));
        vm.stopPrank();
    }

    function testFuzz_Tip(uint256 amount) public {
        amount = bound(amount, 1 * 1e18, 1000 * 1e18);
        
        vm.prank(owner);
        SubscriptionManager manager = new SubscriptionManager(address(radio), treasury);
        
        uint256 user2Before = radio.balanceOf(user2);
        
        vm.startPrank(user1);
        radio.approve(address(manager), amount);
        manager.tip(user2, station, amount, "");
        vm.stopPrank();
        
        // User2 should receive 60% (FREE tier)
        assertEq(radio.balanceOf(user2) - user2Before, (amount * 60) / 100);
    }

    function testFuzz_CreateSession(uint256 frequency, uint256 duration) public {
        frequency = bound(frequency, 880, 1080);
        duration = bound(duration, 10, 480);
        
        vm.prank(owner);
        SessionNFTFactory factory = new SessionNFTFactory();
        
        vm.prank(owner);
        uint256 sessionId = factory.createSession(frequency, "Fuzz", "Desc", duration, 2);
        assertGt(sessionId, 0);
    }
}
