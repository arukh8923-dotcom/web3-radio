// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Station} from "./Station.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StationFactory
 * @notice Factory contract for deploying Station contracts
 * @dev Only StationNFT (frequency) owners can create stations
 * 
 * Payment: RADIO token only (no ETH/USDC)
 * Revenue: Creation fee goes to treasury
 */
contract StationFactory is Ownable, ReentrancyGuard {
    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice RADIO token for payments
    IERC20 public immutable radioToken;
    
    /// @notice StationNFT contract (frequency ownership)
    IERC721 public immutable stationNFT;
    
    /// @notice Treasury address
    address public treasury;
    
    /// @notice Station creation fee in RADIO
    uint256 public creationFeeRadio;
    
    /// @notice Premium station creation fee in RADIO
    uint256 public premiumCreationFeeRadio;
    
    /// @notice Mapping of frequency to station contract
    mapping(uint256 => address) public frequencyToStation;
    
    /// @notice Mapping of owner to their stations
    mapping(address => address[]) public ownerStations;
    
    /// @notice All deployed stations
    address[] public allStations;
    
    /// @notice Station count
    uint256 public stationCount;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event StationCreated(
        address indexed station,
        address indexed owner,
        uint256 indexed frequency,
        string name,
        bool isPremium
    );
    event CreationFeeUpdated(uint256 newFee, uint256 newPremiumFee);
    event TreasuryUpdated(address newTreasury);
    
    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================
    
    constructor(
        address _radioToken,
        address _stationNFT,
        address _treasury,
        uint256 _creationFeeRadio,
        uint256 _premiumCreationFeeRadio
    ) Ownable(msg.sender) {
        require(_radioToken != address(0), "Factory: invalid RADIO token");
        require(_stationNFT != address(0), "Factory: invalid StationNFT");
        require(_treasury != address(0), "Factory: invalid treasury");
        
        radioToken = IERC20(_radioToken);
        stationNFT = IERC721(_stationNFT);
        treasury = _treasury;
        creationFeeRadio = _creationFeeRadio;
        premiumCreationFeeRadio = _premiumCreationFeeRadio;
    }
    
    // =============================================================
    //                      STATION CREATION
    // =============================================================
    
    /**
     * @notice Create a new station for a frequency
     * @param frequency The frequency (must own the NFT)
     * @param name Station name
     * @param description Station description
     * @param category Station category
     * @param isPremium Whether to create as premium station
     * @return station The deployed station address
     */
    function createStation(
        uint256 frequency,
        string calldata name,
        string calldata description,
        string calldata category,
        bool isPremium
    ) external nonReentrant returns (address station) {
        // Verify caller owns the frequency NFT
        require(stationNFT.ownerOf(frequency) == msg.sender, "Factory: not frequency owner");
        
        // Check station doesn't already exist for this frequency
        require(frequencyToStation[frequency] == address(0), "Factory: station exists");
        
        // Calculate and collect fee
        uint256 fee = isPremium ? premiumCreationFeeRadio : creationFeeRadio;
        if (fee > 0) {
            require(radioToken.balanceOf(msg.sender) >= fee, "Factory: insufficient RADIO");
            require(radioToken.transferFrom(msg.sender, treasury, fee), "Factory: fee transfer failed");
        }
        
        // Deploy new station
        station = address(new Station(
            frequency,
            msg.sender,
            address(radioToken),
            treasury,
            name,
            description,
            category
        ));
        
        // Update mappings
        frequencyToStation[frequency] = station;
        ownerStations[msg.sender].push(station);
        allStations.push(station);
        stationCount++;
        
        emit StationCreated(station, msg.sender, frequency, name, isPremium);
        
        return station;
    }
    
    /**
     * @notice Create station with initial premium settings
     * @param frequency The frequency
     * @param name Station name
     * @param description Station description
     * @param category Station category
     * @param subscriptionFee Monthly subscription fee in RADIO
     * @return station The deployed station address
     */
    function createPremiumStation(
        uint256 frequency,
        string calldata name,
        string calldata description,
        string calldata category,
        uint256 subscriptionFee
    ) external nonReentrant returns (address station) {
        // Verify caller owns the frequency NFT
        require(stationNFT.ownerOf(frequency) == msg.sender, "Factory: not frequency owner");
        require(frequencyToStation[frequency] == address(0), "Factory: station exists");
        
        // Collect premium creation fee
        if (premiumCreationFeeRadio > 0) {
            require(radioToken.balanceOf(msg.sender) >= premiumCreationFeeRadio, "Factory: insufficient RADIO");
            require(radioToken.transferFrom(msg.sender, treasury, premiumCreationFeeRadio), "Factory: fee transfer failed");
        }
        
        // Deploy new station
        station = address(new Station(
            frequency,
            msg.sender,
            address(radioToken),
            treasury,
            name,
            description,
            category
        ));
        
        // Set premium settings
        Station(station).setPremium(true, subscriptionFee);
        
        // Update mappings
        frequencyToStation[frequency] = station;
        ownerStations[msg.sender].push(station);
        allStations.push(station);
        stationCount++;
        
        emit StationCreated(station, msg.sender, frequency, name, true);
        
        return station;
    }
    
    // =============================================================
    //                          GETTERS
    // =============================================================
    
    /**
     * @notice Get station address for a frequency
     * @param frequency The frequency to look up
     * @return The station address (or zero if none)
     */
    function getStation(uint256 frequency) external view returns (address) {
        return frequencyToStation[frequency];
    }
    
    /**
     * @notice Get all stations owned by an address
     * @param owner The owner address
     * @return Array of station addresses
     */
    function getOwnerStations(address owner) external view returns (address[] memory) {
        return ownerStations[owner];
    }
    
    /**
     * @notice Get all stations (paginated)
     * @param offset Starting index
     * @param limit Maximum number to return
     * @return Array of station addresses
     */
    function getStations(uint256 offset, uint256 limit) external view returns (address[] memory) {
        if (offset >= allStations.length) {
            return new address[](0);
        }
        
        uint256 end = offset + limit;
        if (end > allStations.length) {
            end = allStations.length;
        }
        
        address[] memory result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = allStations[i];
        }
        
        return result;
    }
    
    /**
     * @notice Check if a station exists for a frequency
     * @param frequency The frequency to check
     * @return True if station exists
     */
    function stationExists(uint256 frequency) external view returns (bool) {
        return frequencyToStation[frequency] != address(0);
    }
    
    /**
     * @notice Get creation fees
     * @return standard Standard creation fee
     * @return premium Premium creation fee
     */
    function getCreationFees() external view returns (uint256 standard, uint256 premium) {
        return (creationFeeRadio, premiumCreationFeeRadio);
    }
    
    // =============================================================
    //                       ADMIN FUNCTIONS
    // =============================================================
    
    /**
     * @notice Update creation fees
     * @param newFee New standard fee
     * @param newPremiumFee New premium fee
     */
    function setCreationFees(uint256 newFee, uint256 newPremiumFee) external onlyOwner {
        creationFeeRadio = newFee;
        premiumCreationFeeRadio = newPremiumFee;
        emit CreationFeeUpdated(newFee, newPremiumFee);
    }
    
    /**
     * @notice Update treasury address
     * @param newTreasury New treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Factory: invalid treasury");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }
}
