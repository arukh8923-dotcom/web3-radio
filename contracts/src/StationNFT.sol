// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title StationNFT
 * @notice ERC-721 contract for radio frequency ownership
 * @dev Each NFT represents ownership of a unique frequency on Web3 Radio
 *      Payment is in $RADIO token only (no ETH/USDC)
 * 
 * Requirements covered:
 * - 14.1: Mint frequency NFT with unique frequency validation
 * - 14.2: Transfer frequency with ownership update
 * - 14.3: Store metadata for station info
 * - 14.4: Query frequency ownership
 * 
 * Created by ukhy89 (FID 250705)
 */
contract StationNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;
    using SafeERC20 for IERC20;

    // =============================================================
    //                           STORAGE
    // =============================================================

    /// @notice Frequency metadata
    struct FrequencyMetadata {
        uint256 frequency;      // e.g., 88100 = 88.1 FM (stored as frequency * 1000)
        string name;
        string description;
        string category;
        uint256 mintedAt;
        address creator;        // Original minter (never changes)
        uint256 creatorFid;     // Farcaster FID of creator
    }

    /// @notice Token ID => Frequency metadata
    mapping(uint256 => FrequencyMetadata) public frequencyMetadata;

    /// @notice Frequency => Token ID (0 = not minted)
    mapping(uint256 => uint256) public frequencyToTokenId;

    /// @notice Token ID => Frequency
    mapping(uint256 => uint256) public tokenIdToFrequency;

    /// @notice Next token ID
    uint256 private _nextTokenId;

    /// @notice Base URI for metadata API
    string private _baseTokenURI;

    /// @notice $RADIO token contract
    IERC20 public immutable radioToken;

    /// @notice Mint fee in RADIO tokens (dynamic, set by admin based on USD target)
    uint256 public mintFeeRadio;

    /// @notice Premium frequency mint fee (for special frequencies like 420.0)
    uint256 public premiumMintFeeRadio;

    /// @notice Platform creator info
    uint256 public constant PLATFORM_CREATOR_FID = 250705;
    string public constant PLATFORM_CREATOR_USERNAME = "ukhy89";

    /// @notice Minimum frequency (87500 = 87.5 FM)
    uint256 public constant MIN_FREQUENCY = 87500;

    /// @notice Maximum frequency (108000 = 108.0 FM)
    uint256 public constant MAX_FREQUENCY = 108000;

    /// @notice Special 420 frequency (420000 = 420.0)
    uint256 public constant FREQUENCY_420 = 420000;

    /// @notice Treasury address for collecting fees
    address public treasury;

    // =============================================================
    //                          EVENTS
    // =============================================================

    event FrequencyMinted(
        uint256 indexed tokenId,
        uint256 indexed frequency,
        address indexed owner,
        string name,
        uint256 creatorFid,
        uint256 radioFee
    );

    event FrequencyMetadataUpdated(
        uint256 indexed tokenId,
        string name,
        string description
    );

    event MintFeeUpdated(uint256 oldFee, uint256 newFee, bool isPremium);
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    // =============================================================
    //                          ERRORS
    // =============================================================

    error FrequencyAlreadyMinted(uint256 frequency);
    error FrequencyOutOfRange(uint256 frequency);
    error InsufficientRadioBalance(uint256 required, uint256 balance);
    error InsufficientRadioAllowance(uint256 required, uint256 allowance);
    error NotTokenOwner(uint256 tokenId, address caller);
    error InvalidFrequency(uint256 frequency);
    error ZeroAddress();

    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================

    /**
     * @param _radioToken Address of $RADIO token contract
     * @param baseURI_ Base URI for metadata API
     * @param _mintFeeRadio Mint fee in RADIO tokens (~$10 USD worth)
     * @param _premiumMintFeeRadio Premium mint fee for special frequencies (~$50 USD worth)
     * @param _treasury Treasury address for collecting fees
     */
    constructor(
        address _radioToken,
        string memory baseURI_,
        uint256 _mintFeeRadio,
        uint256 _premiumMintFeeRadio,
        address _treasury
    ) ERC721("Web3 Radio Frequency License", "FREQ") Ownable(msg.sender) {
        if (_radioToken == address(0)) revert ZeroAddress();
        if (_treasury == address(0)) revert ZeroAddress();
        
        radioToken = IERC20(_radioToken);
        _baseTokenURI = baseURI_;
        mintFeeRadio = _mintFeeRadio;
        premiumMintFeeRadio = _premiumMintFeeRadio;
        treasury = _treasury;
        _nextTokenId = 1; // Start from 1
    }

    // =============================================================
    //                      MINTING (Req 14.1)
    // =============================================================

    /**
     * @notice Mint a new frequency NFT (pays with $RADIO token)
     * @param frequency The frequency to mint (e.g., 88100 = 88.1 FM)
     * @param name Station name
     * @param description Station description
     * @param category Station category/genre
     * @param creatorFid Farcaster FID of the creator (for display)
     */
    function mintFrequency(
        uint256 frequency,
        string calldata name,
        string calldata description,
        string calldata category,
        uint256 creatorFid
    ) external returns (uint256) {
        // Validate frequency
        if (!_isValidFrequency(frequency)) {
            revert FrequencyOutOfRange(frequency);
        }

        // Check if frequency already minted
        if (frequencyToTokenId[frequency] != 0) {
            revert FrequencyAlreadyMinted(frequency);
        }

        // Determine fee (premium for special frequencies)
        uint256 fee = _isPremiumFrequency(frequency) ? premiumMintFeeRadio : mintFeeRadio;

        // Check RADIO balance and allowance
        uint256 balance = radioToken.balanceOf(msg.sender);
        if (balance < fee) {
            revert InsufficientRadioBalance(fee, balance);
        }
        
        uint256 allowance = radioToken.allowance(msg.sender, address(this));
        if (allowance < fee) {
            revert InsufficientRadioAllowance(fee, allowance);
        }

        // Transfer RADIO to treasury
        radioToken.safeTransferFrom(msg.sender, treasury, fee);

        uint256 tokenId = _nextTokenId++;

        // Store mappings
        frequencyToTokenId[frequency] = tokenId;
        tokenIdToFrequency[tokenId] = frequency;

        // Store metadata
        frequencyMetadata[tokenId] = FrequencyMetadata({
            frequency: frequency,
            name: name,
            description: description,
            category: category,
            mintedAt: block.timestamp,
            creator: msg.sender,
            creatorFid: creatorFid
        });

        // Mint NFT
        _safeMint(msg.sender, tokenId);

        emit FrequencyMinted(tokenId, frequency, msg.sender, name, creatorFid, fee);

        return tokenId;
    }

    // =============================================================
    //                    METADATA (Req 14.3)
    // =============================================================

    /**
     * @notice Update frequency metadata (only token owner)
     */
    function updateMetadata(
        uint256 tokenId,
        string calldata name,
        string calldata description
    ) external {
        if (ownerOf(tokenId) != msg.sender) {
            revert NotTokenOwner(tokenId, msg.sender);
        }

        FrequencyMetadata storage meta = frequencyMetadata[tokenId];
        meta.name = name;
        meta.description = description;

        emit FrequencyMetadataUpdated(tokenId, name, description);
    }

    // =============================================================
    //                    QUERIES (Req 14.4)
    // =============================================================

    /**
     * @notice Get the owner of a frequency
     */
    function getFrequencyOwner(uint256 frequency) external view returns (address) {
        uint256 tokenId = frequencyToTokenId[frequency];
        if (tokenId == 0) return address(0);
        return ownerOf(tokenId);
    }

    /**
     * @notice Check if a frequency is available
     */
    function isFrequencyAvailable(uint256 frequency) external view returns (bool) {
        return _isValidFrequency(frequency) && frequencyToTokenId[frequency] == 0;
    }

    /**
     * @notice Get all frequencies owned by an address
     */
    function getOwnedFrequencies(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory frequencies = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(owner, i);
            frequencies[i] = tokenIdToFrequency[tokenId];
        }
        
        return frequencies;
    }

    /**
     * @notice Get frequency metadata
     */
    function getFrequencyMetadata(uint256 frequency) external view returns (FrequencyMetadata memory) {
        uint256 tokenId = frequencyToTokenId[frequency];
        if (tokenId == 0) revert InvalidFrequency(frequency);
        return frequencyMetadata[tokenId];
    }

    /**
     * @notice Get token metadata by ID
     */
    function getTokenMetadata(uint256 tokenId) external view returns (FrequencyMetadata memory) {
        _requireOwned(tokenId);
        return frequencyMetadata[tokenId];
    }

    /**
     * @notice Get mint fee for a frequency
     */
    function getMintFee(uint256 frequency) external view returns (uint256) {
        return _isPremiumFrequency(frequency) ? premiumMintFeeRadio : mintFeeRadio;
    }

    /**
     * @notice Get total minted count
     */
    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    // =============================================================
    //                      INTERNAL
    // =============================================================

    function _isValidFrequency(uint256 frequency) internal pure returns (bool) {
        // Allow standard FM range OR special 420 frequency
        return (frequency >= MIN_FREQUENCY && frequency <= MAX_FREQUENCY) || 
               frequency == FREQUENCY_420;
    }

    function _isPremiumFrequency(uint256 frequency) internal pure returns (bool) {
        // 420.0 FM is premium
        return frequency == FREQUENCY_420;
    }

    function _formatFrequency(uint256 freq) internal pure returns (string memory) {
        uint256 whole = freq / 1000;
        uint256 decimal = (freq % 1000) / 100;
        return string(abi.encodePacked(whole.toString(), ".", decimal.toString()));
    }

    // =============================================================
    //                      OVERRIDES
    // =============================================================

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        string memory baseURI = _baseURI();
        // Point to our dynamic metadata API
        if (bytes(baseURI).length > 0) {
            return string(abi.encodePacked(baseURI, tokenId.toString(), "/metadata"));
        }
        
        // Fallback: generate basic on-chain metadata
        return _generateOnChainMetadata(tokenId);
    }

    function _generateOnChainMetadata(uint256 tokenId) internal view returns (string memory) {
        FrequencyMetadata memory meta = frequencyMetadata[tokenId];
        string memory frequencyStr = _formatFrequency(meta.frequency);
        
        return string(abi.encodePacked(
            'data:application/json;utf8,{"name":"',
            frequencyStr,
            ' FM - ',
            meta.name,
            '","description":"Radio License NFT for frequency ',
            frequencyStr,
            ' FM on Web3 Radio. Created by @',
            PLATFORM_CREATOR_USERNAME,
            '.","external_url":"https://web3-radio-omega.vercel.app/station/',
            frequencyStr,
            '","attributes":[{"trait_type":"Frequency","value":"',
            frequencyStr,
            ' FM"},{"trait_type":"Category","value":"',
            meta.category,
            '"},{"trait_type":"Network","value":"Base"},{"trait_type":"Creator FID","display_type":"number","value":',
            meta.creatorFid.toString(),
            '}]}'
        ));
    }

    // =============================================================
    //                      ADMIN
    // =============================================================

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function setMintFee(uint256 newFee, bool isPremium) external onlyOwner {
        if (isPremium) {
            uint256 oldFee = premiumMintFeeRadio;
            premiumMintFeeRadio = newFee;
            emit MintFeeUpdated(oldFee, newFee, true);
        } else {
            uint256 oldFee = mintFeeRadio;
            mintFeeRadio = newFee;
            emit MintFeeUpdated(oldFee, newFee, false);
        }
    }

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }
}
