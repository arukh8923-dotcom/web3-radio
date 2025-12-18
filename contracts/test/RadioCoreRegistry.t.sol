// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/RadioCoreRegistry.sol";

contract RadioCoreRegistryTest is Test {
    RadioCoreRegistry public registry;
    
    address public owner = address(1);
    address public station1 = address(2);
    address public station2 = address(3);
    address public listener1 = address(4);
    address public listener2 = address(5);
    
    uint256 public constant FREQUENCY_1 = 880; // 88.0 FM
    uint256 public constant FREQUENCY_2 = 1040; // 104.0 FM
    
    event StationRegistered(address indexed station, uint256 indexed frequency);
    event TunedIn(address indexed listener, uint256 indexed frequency);
    event TunedOut(address indexed listener, uint256 indexed frequency);
    event SignalStrengthUpdated(uint256 indexed frequency, uint256 strength);

    function setUp() public {
        vm.prank(owner);
        registry = new RadioCoreRegistry();
    }

    // ============ Station Registration Tests ============

    function test_RegisterStation() public {
        vm.prank(owner);
        
        vm.expectEmit(true, true, false, true);
        emit StationRegistered(station1, FREQUENCY_1);
        
        registry.registerStation(station1, FREQUENCY_1);
        
        assertEq(registry.getStationByFrequency(FREQUENCY_1), station1);
        assertEq(registry.stationToFrequency(station1), FREQUENCY_1);
    }

    function test_RegisterStation_RevertIfFrequencyTaken() public {
        vm.startPrank(owner);
        registry.registerStation(station1, FREQUENCY_1);
        
        vm.expectRevert();
        registry.registerStation(station2, FREQUENCY_1);
        vm.stopPrank();
    }

    function test_RegisterStation_RevertIfNotOwner() public {
        vm.prank(listener1);
        vm.expectRevert();
        registry.registerStation(station1, FREQUENCY_1);
    }

    function test_RegisterStation_MultipleStations() public {
        vm.startPrank(owner);
        registry.registerStation(station1, FREQUENCY_1);
        registry.registerStation(station2, FREQUENCY_2);
        vm.stopPrank();
        
        assertEq(registry.getStationByFrequency(FREQUENCY_1), station1);
        assertEq(registry.getStationByFrequency(FREQUENCY_2), station2);
    }

    // ============ Tune In/Out Tests ============

    function test_TuneIn() public {
        vm.prank(owner);
        registry.registerStation(station1, FREQUENCY_1);
        
        vm.prank(listener1);
        
        vm.expectEmit(true, true, false, true);
        emit TunedIn(listener1, FREQUENCY_1);
        
        registry.tuneIn(FREQUENCY_1);
        
        assertTrue(registry.isTunedIn(listener1, FREQUENCY_1));
        assertEq(registry.getListenerCount(FREQUENCY_1), 1);
    }

    function test_TuneIn_RevertIfNoStation() public {
        vm.prank(listener1);
        vm.expectRevert();
        registry.tuneIn(FREQUENCY_1);
    }

    function test_TuneOut() public {
        vm.prank(owner);
        registry.registerStation(station1, FREQUENCY_1);
        
        vm.startPrank(listener1);
        registry.tuneIn(FREQUENCY_1);
        
        vm.expectEmit(true, true, false, true);
        emit TunedOut(listener1, FREQUENCY_1);
        
        registry.tuneOut(FREQUENCY_1);
        vm.stopPrank();
        
        assertFalse(registry.isTunedIn(listener1, FREQUENCY_1));
        assertEq(registry.getListenerCount(FREQUENCY_1), 0);
    }

    function test_TuneIn_MultipleStations() public {
        vm.startPrank(owner);
        registry.registerStation(station1, FREQUENCY_1);
        registry.registerStation(station2, FREQUENCY_2);
        vm.stopPrank();
        
        vm.startPrank(listener1);
        registry.tuneIn(FREQUENCY_1);
        registry.tuneIn(FREQUENCY_2);
        vm.stopPrank();
        
        assertTrue(registry.isTunedIn(listener1, FREQUENCY_1));
        assertTrue(registry.isTunedIn(listener1, FREQUENCY_2));
        
        uint256[] memory stations = registry.getListenerStations(listener1);
        assertEq(stations.length, 2);
    }

    // ============ Signal Strength Tests ============

    function test_SignalStrength() public {
        vm.prank(owner);
        registry.registerStation(station1, FREQUENCY_1);
        
        // Add listeners to increase signal strength
        vm.prank(listener1);
        registry.tuneIn(FREQUENCY_1);
        
        vm.prank(listener2);
        registry.tuneIn(FREQUENCY_1);
        
        uint256 strength = registry.calculateSignalStrength(FREQUENCY_1);
        assertGt(strength, 0);
    }

    function test_SignalStrength_NoStation() public view {
        uint256 strength = registry.calculateSignalStrength(FREQUENCY_1);
        assertEq(strength, 0);
    }

    // ============ Property-Based Tests ============

    function testFuzz_TuneInOut_RoundTrip(uint256 frequency) public {
        // Bound frequency to valid range (880-1080 = 88.0-108.0 FM)
        frequency = bound(frequency, 880, 1080);
        
        vm.prank(owner);
        registry.registerStation(station1, frequency);
        
        vm.startPrank(listener1);
        
        // Tune in
        registry.tuneIn(frequency);
        assertTrue(registry.isTunedIn(listener1, frequency));
        assertEq(registry.getListenerCount(frequency), 1);
        
        // Tune out
        registry.tuneOut(frequency);
        assertFalse(registry.isTunedIn(listener1, frequency));
        assertEq(registry.getListenerCount(frequency), 0);
        
        vm.stopPrank();
    }

    function testFuzz_MultipleListeners(uint8 numListeners) public {
        numListeners = uint8(bound(numListeners, 1, 50));
        
        vm.prank(owner);
        registry.registerStation(station1, FREQUENCY_1);
        
        // Tune in multiple listeners
        for (uint8 i = 0; i < numListeners; i++) {
            address listener = address(uint160(100 + i));
            vm.prank(listener);
            registry.tuneIn(FREQUENCY_1);
        }
        
        assertEq(registry.getListenerCount(FREQUENCY_1), numListeners);
    }

    function test_GetAllStations() public {
        vm.startPrank(owner);
        registry.registerStation(station1, FREQUENCY_1);
        registry.registerStation(station2, FREQUENCY_2);
        vm.stopPrank();
        
        address[] memory allStations = registry.getAllStations();
        assertEq(allStations.length, 2);
        assertEq(allStations[0], station1);
        assertEq(allStations[1], station2);
    }

    function test_GetStationCount() public {
        assertEq(registry.getStationCount(), 0);
        
        vm.startPrank(owner);
        registry.registerStation(station1, FREQUENCY_1);
        assertEq(registry.getStationCount(), 1);
        
        registry.registerStation(station2, FREQUENCY_2);
        assertEq(registry.getStationCount(), 2);
        vm.stopPrank();
    }
}
