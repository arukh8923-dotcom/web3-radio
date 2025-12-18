// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DJAttestations
 * @notice DJ verification and attestation system
 * @dev Integrates with Ethereum Attestation Service (EAS) on Base
 * 
 * Features:
 * - Attestation request flow
 * - Attestation badge display
 * - Attestation revocation handling
 * - Verified DJ filtering
 * 
 * EAS on Base: 0x4200000000000000000000000000000000000021
 */
contract DJAttestations is Ownable {
    // =============================================================
    //                           TYPES
    // =============================================================
    
    enum VerificationStatus { None, Pending, Verified, Revoked }
    
    struct DJProfile {
        address djAddress;
        string name;
        string bio;
        string imageUrl;
        string[] genres;
        uint256 totalBroadcasts;
        uint256 totalListeners;
        uint256 totalTips;
        VerificationStatus status;
        bytes32 easAttestation; // EAS attestation UID
        uint256 verifiedAt;
        uint256 requestedAt;
    }
    
    struct AttestationRequest {
        address dj;
        string name;
        string socialProof; // Twitter/Farcaster handle for verification
        string portfolioUrl;
        uint256 requestedAt;
        bool processed;
        bool approved;
        string rejectionReason;
    }
    
    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice EAS contract address on Base
    address public constant EAS_ADDRESS = 0x4200000000000000000000000000000000000021;
    
    /// @notice EAS Schema UID for DJ verification
    bytes32 public schemaUID;
    
    /// @notice DJ profiles
    mapping(address => DJProfile) public djProfiles;
    
    /// @notice Attestation requests
    mapping(address => AttestationRequest) public requests;
    
    /// @notice All verified DJs
    address[] public verifiedDJs;
    mapping(address => uint256) public verifiedDJIndex;
    
    /// @notice Pending requests
    address[] public pendingRequests;
    
    /// @notice Authorized attesters (can approve/reject)
    mapping(address => bool) public attesters;
    
    /// @notice Stats
    uint256 public totalVerified;
    uint256 public totalRequests;
    uint256 public totalRevoked;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event ProfileCreated(address indexed dj, string name);
    event ProfileUpdated(address indexed dj);
    event VerificationRequested(address indexed dj, string name, string socialProof);
    event VerificationApproved(address indexed dj, bytes32 attestationUID);
    event VerificationRejected(address indexed dj, string reason);
    event VerificationRevoked(address indexed dj, string reason);
    event AttesterAdded(address indexed attester);
    event AttesterRemoved(address indexed attester);
    event SchemaUpdated(bytes32 newSchemaUID);
    
    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================
    
    constructor() Ownable(msg.sender) {
        attesters[msg.sender] = true;
    }
    
    // =============================================================
    //                      DJ PROFILE FUNCTIONS
    // =============================================================
    
    /**
     * @notice Create or update DJ profile
     */
    function createProfile(
        string calldata name,
        string calldata bio,
        string calldata imageUrl,
        string[] calldata genres
    ) external {
        DJProfile storage profile = djProfiles[msg.sender];
        
        bool isNew = profile.djAddress == address(0);
        
        profile.djAddress = msg.sender;
        profile.name = name;
        profile.bio = bio;
        profile.imageUrl = imageUrl;
        profile.genres = genres;
        
        if (isNew) {
            emit ProfileCreated(msg.sender, name);
        } else {
            emit ProfileUpdated(msg.sender);
        }
    }
    
    /**
     * @notice Update DJ stats (called by authorized contracts)
     */
    function updateStats(
        address dj,
        uint256 broadcasts,
        uint256 listeners,
        uint256 tips
    ) external {
        // Only owner or authorized contracts can update
        require(msg.sender == owner() || attesters[msg.sender], "DJAttestations: not authorized");
        
        DJProfile storage profile = djProfiles[dj];
        profile.totalBroadcasts = broadcasts;
        profile.totalListeners = listeners;
        profile.totalTips = tips;
    }
    
    // =============================================================
    //                      VERIFICATION FUNCTIONS
    // =============================================================
    
    /**
     * @notice Request verification
     */
    function requestVerification(
        string calldata socialProof,
        string calldata portfolioUrl
    ) external {
        DJProfile storage profile = djProfiles[msg.sender];
        require(profile.djAddress != address(0), "DJAttestations: create profile first");
        require(profile.status == VerificationStatus.None, "DJAttestations: already requested or verified");
        
        requests[msg.sender] = AttestationRequest({
            dj: msg.sender,
            name: profile.name,
            socialProof: socialProof,
            portfolioUrl: portfolioUrl,
            requestedAt: block.timestamp,
            processed: false,
            approved: false,
            rejectionReason: ""
        });
        
        profile.status = VerificationStatus.Pending;
        profile.requestedAt = block.timestamp;
        
        pendingRequests.push(msg.sender);
        totalRequests++;
        
        emit VerificationRequested(msg.sender, profile.name, socialProof);
    }
    
    /**
     * @notice Approve verification (attester only)
     */
    function approveVerification(address dj, bytes32 attestationUID) external {
        require(attesters[msg.sender], "DJAttestations: not attester");
        
        AttestationRequest storage request = requests[dj];
        require(!request.processed, "DJAttestations: already processed");
        
        DJProfile storage profile = djProfiles[dj];
        require(profile.status == VerificationStatus.Pending, "DJAttestations: not pending");
        
        request.processed = true;
        request.approved = true;
        
        profile.status = VerificationStatus.Verified;
        profile.easAttestation = attestationUID;
        profile.verifiedAt = block.timestamp;
        
        verifiedDJIndex[dj] = verifiedDJs.length;
        verifiedDJs.push(dj);
        totalVerified++;
        
        emit VerificationApproved(dj, attestationUID);
    }
    
    /**
     * @notice Reject verification (attester only)
     */
    function rejectVerification(address dj, string calldata reason) external {
        require(attesters[msg.sender], "DJAttestations: not attester");
        
        AttestationRequest storage request = requests[dj];
        require(!request.processed, "DJAttestations: already processed");
        
        DJProfile storage profile = djProfiles[dj];
        require(profile.status == VerificationStatus.Pending, "DJAttestations: not pending");
        
        request.processed = true;
        request.approved = false;
        request.rejectionReason = reason;
        
        profile.status = VerificationStatus.None; // Can request again
        
        emit VerificationRejected(dj, reason);
    }
    
    /**
     * @notice Revoke verification (attester only)
     */
    function revokeVerification(address dj, string calldata reason) external {
        require(attesters[msg.sender], "DJAttestations: not attester");
        
        DJProfile storage profile = djProfiles[dj];
        require(profile.status == VerificationStatus.Verified, "DJAttestations: not verified");
        
        profile.status = VerificationStatus.Revoked;
        profile.easAttestation = bytes32(0);
        
        // Remove from verified list
        uint256 index = verifiedDJIndex[dj];
        uint256 lastIndex = verifiedDJs.length - 1;
        if (index != lastIndex) {
            address lastDJ = verifiedDJs[lastIndex];
            verifiedDJs[index] = lastDJ;
            verifiedDJIndex[lastDJ] = index;
        }
        verifiedDJs.pop();
        delete verifiedDJIndex[dj];
        
        totalRevoked++;
        
        emit VerificationRevoked(dj, reason);
    }
    
    // =============================================================
    //                      VIEW FUNCTIONS
    // =============================================================
    
    function getProfile(address dj) external view returns (DJProfile memory) {
        return djProfiles[dj];
    }
    
    function getRequest(address dj) external view returns (AttestationRequest memory) {
        return requests[dj];
    }
    
    function isVerified(address dj) external view returns (bool) {
        return djProfiles[dj].status == VerificationStatus.Verified;
    }
    
    function getVerifiedDJs(uint256 limit, uint256 offset) external view returns (address[] memory) {
        uint256 total = verifiedDJs.length;
        if (offset >= total) return new address[](0);
        
        uint256 count = limit;
        if (offset + limit > total) count = total - offset;
        
        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = verifiedDJs[offset + i];
        }
        return result;
    }
    
    function getPendingRequests() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < pendingRequests.length; i++) {
            if (!requests[pendingRequests[i]].processed) count++;
        }
        
        address[] memory result = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < pendingRequests.length && idx < count; i++) {
            if (!requests[pendingRequests[i]].processed) {
                result[idx++] = pendingRequests[i];
            }
        }
        return result;
    }
    
    function getVerifiedDJsByGenre(string calldata genre, uint256 limit) external view returns (address[] memory) {
        address[] memory temp = new address[](limit);
        uint256 count = 0;
        
        for (uint256 i = 0; i < verifiedDJs.length && count < limit; i++) {
            DJProfile storage profile = djProfiles[verifiedDJs[i]];
            for (uint256 j = 0; j < profile.genres.length; j++) {
                if (keccak256(bytes(profile.genres[j])) == keccak256(bytes(genre))) {
                    temp[count++] = verifiedDJs[i];
                    break;
                }
            }
        }
        
        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        return result;
    }
    
    // =============================================================
    //                      ADMIN FUNCTIONS
    // =============================================================
    
    function addAttester(address attester) external onlyOwner {
        attesters[attester] = true;
        emit AttesterAdded(attester);
    }
    
    function removeAttester(address attester) external onlyOwner {
        attesters[attester] = false;
        emit AttesterRemoved(attester);
    }
    
    function setSchemaUID(bytes32 _schemaUID) external onlyOwner {
        schemaUID = _schemaUID;
        emit SchemaUpdated(_schemaUID);
    }
}
