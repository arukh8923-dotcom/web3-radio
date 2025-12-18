// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MultiSigStation
 * @notice Collaborative station with multi-signature broadcast approval
 * @dev Multiple DJs can propose and approve broadcasts
 * 
 * Features:
 * - Multi-sig station contract
 * - Broadcast proposal system
 * - Threshold approval mechanism
 * - Collaborator management via multi-sig
 */
contract MultiSigStation is ReentrancyGuard {
    // =============================================================
    //                           TYPES
    // =============================================================
    
    enum ProposalType { Broadcast, AddCollaborator, RemoveCollaborator, UpdateThreshold, UpdateMetadata }
    enum ProposalStatus { Pending, Approved, Rejected, Executed, Expired }
    
    struct Proposal {
        uint256 id;
        ProposalType proposalType;
        address proposer;
        bytes data;
        uint256 approvals;
        uint256 rejections;
        uint256 createdAt;
        uint256 expiresAt;
        ProposalStatus status;
        bool executed;
    }
    
    struct StationMetadata {
        string name;
        string description;
        string category;
        string imageUrl;
        uint256 frequency;
    }
    
    struct Broadcast {
        bytes32 contentHash;
        uint256 timestamp;
        address proposer;
        uint256 proposalId;
    }
    
    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice RADIO token
    IERC20 public immutable radioToken;
    
    /// @notice Treasury
    address public treasury;
    
    /// @notice Station metadata
    StationMetadata public metadata;
    
    /// @notice Collaborators (multi-sig signers)
    address[] public collaborators;
    mapping(address => bool) public isCollaborator;
    mapping(address => uint256) public collaboratorIndex;
    
    /// @notice Approval threshold (number of approvals needed)
    uint256 public threshold;
    
    /// @notice Proposal counter
    uint256 public proposalCount;
    
    /// @notice Proposals
    mapping(uint256 => Proposal) public proposals;
    
    /// @notice Votes: proposalId => collaborator => voted
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => bool)) public voteValue; // true = approve
    
    /// @notice Broadcasts
    Broadcast[] public broadcasts;
    
    /// @notice Proposal expiry time
    uint256 public proposalExpiry = 7 days;
    
    /// @notice Stats
    uint256 public totalBroadcasts;
    uint256 public totalProposals;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event CollaboratorAdded(address indexed collaborator);
    event CollaboratorRemoved(address indexed collaborator);
    event ThresholdUpdated(uint256 newThreshold);
    event ProposalCreated(uint256 indexed proposalId, ProposalType proposalType, address indexed proposer);
    event ProposalApproved(uint256 indexed proposalId, address indexed approver);
    event ProposalRejected(uint256 indexed proposalId, address indexed rejector);
    event ProposalExecuted(uint256 indexed proposalId);
    event BroadcastPublished(bytes32 indexed contentHash, uint256 indexed proposalId);
    event MetadataUpdated(string name, string description);
    
    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================
    
    constructor(
        address _radioToken,
        address _treasury,
        string memory _name,
        string memory _description,
        string memory _category,
        uint256 _frequency,
        address[] memory _initialCollaborators,
        uint256 _threshold
    ) {
        require(_radioToken != address(0), "MultiSigStation: invalid token");
        require(_treasury != address(0), "MultiSigStation: invalid treasury");
        require(_initialCollaborators.length >= _threshold, "MultiSigStation: invalid threshold");
        require(_threshold > 0, "MultiSigStation: threshold must be > 0");
        
        radioToken = IERC20(_radioToken);
        treasury = _treasury;
        
        metadata = StationMetadata({
            name: _name,
            description: _description,
            category: _category,
            imageUrl: "",
            frequency: _frequency
        });
        
        threshold = _threshold;
        
        for (uint256 i = 0; i < _initialCollaborators.length; i++) {
            address collab = _initialCollaborators[i];
            require(collab != address(0), "MultiSigStation: invalid collaborator");
            require(!isCollaborator[collab], "MultiSigStation: duplicate collaborator");
            
            isCollaborator[collab] = true;
            collaboratorIndex[collab] = collaborators.length;
            collaborators.push(collab);
            
            emit CollaboratorAdded(collab);
        }
    }
    
    // =============================================================
    //                      MODIFIERS
    // =============================================================
    
    modifier onlyCollaborator() {
        require(isCollaborator[msg.sender], "MultiSigStation: not collaborator");
        _;
    }
    
    // =============================================================
    //                      PROPOSAL FUNCTIONS
    // =============================================================
    
    /**
     * @notice Propose a broadcast
     */
    function proposeBroadcast(bytes32 contentHash) external onlyCollaborator returns (uint256) {
        return _createProposal(ProposalType.Broadcast, abi.encode(contentHash));
    }
    
    /**
     * @notice Propose adding a collaborator
     */
    function proposeAddCollaborator(address newCollaborator) external onlyCollaborator returns (uint256) {
        require(newCollaborator != address(0), "MultiSigStation: invalid address");
        require(!isCollaborator[newCollaborator], "MultiSigStation: already collaborator");
        return _createProposal(ProposalType.AddCollaborator, abi.encode(newCollaborator));
    }
    
    /**
     * @notice Propose removing a collaborator
     */
    function proposeRemoveCollaborator(address collaborator) external onlyCollaborator returns (uint256) {
        require(isCollaborator[collaborator], "MultiSigStation: not collaborator");
        require(collaborators.length > threshold, "MultiSigStation: would break threshold");
        return _createProposal(ProposalType.RemoveCollaborator, abi.encode(collaborator));
    }
    
    /**
     * @notice Propose updating threshold
     */
    function proposeUpdateThreshold(uint256 newThreshold) external onlyCollaborator returns (uint256) {
        require(newThreshold > 0 && newThreshold <= collaborators.length, "MultiSigStation: invalid threshold");
        return _createProposal(ProposalType.UpdateThreshold, abi.encode(newThreshold));
    }
    
    /**
     * @notice Propose updating metadata
     */
    function proposeUpdateMetadata(
        string calldata name,
        string calldata description,
        string calldata imageUrl
    ) external onlyCollaborator returns (uint256) {
        return _createProposal(ProposalType.UpdateMetadata, abi.encode(name, description, imageUrl));
    }
    
    function _createProposal(ProposalType pType, bytes memory data) internal returns (uint256) {
        proposalCount++;
        totalProposals++;
        
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            proposalType: pType,
            proposer: msg.sender,
            data: data,
            approvals: 1, // Proposer auto-approves
            rejections: 0,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + proposalExpiry,
            status: ProposalStatus.Pending,
            executed: false
        });
        
        hasVoted[proposalCount][msg.sender] = true;
        voteValue[proposalCount][msg.sender] = true;
        
        emit ProposalCreated(proposalCount, pType, msg.sender);
        emit ProposalApproved(proposalCount, msg.sender);
        
        // Check if already meets threshold
        if (1 >= threshold) {
            _executeProposal(proposalCount);
        }
        
        return proposalCount;
    }
    
    // =============================================================
    //                      VOTING FUNCTIONS
    // =============================================================
    
    /**
     * @notice Approve a proposal
     */
    function approve(uint256 proposalId) external onlyCollaborator nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Pending, "MultiSigStation: not pending");
        require(block.timestamp < proposal.expiresAt, "MultiSigStation: expired");
        require(!hasVoted[proposalId][msg.sender], "MultiSigStation: already voted");
        
        hasVoted[proposalId][msg.sender] = true;
        voteValue[proposalId][msg.sender] = true;
        proposal.approvals++;
        
        emit ProposalApproved(proposalId, msg.sender);
        
        if (proposal.approvals >= threshold) {
            _executeProposal(proposalId);
        }
    }
    
    /**
     * @notice Reject a proposal
     */
    function reject(uint256 proposalId) external onlyCollaborator {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Pending, "MultiSigStation: not pending");
        require(block.timestamp < proposal.expiresAt, "MultiSigStation: expired");
        require(!hasVoted[proposalId][msg.sender], "MultiSigStation: already voted");
        
        hasVoted[proposalId][msg.sender] = true;
        voteValue[proposalId][msg.sender] = false;
        proposal.rejections++;
        
        emit ProposalRejected(proposalId, msg.sender);
        
        // Check if rejection threshold reached (majority reject)
        if (proposal.rejections > collaborators.length - threshold) {
            proposal.status = ProposalStatus.Rejected;
        }
    }
    
    function _executeProposal(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        proposal.status = ProposalStatus.Approved;
        proposal.executed = true;
        
        if (proposal.proposalType == ProposalType.Broadcast) {
            bytes32 contentHash = abi.decode(proposal.data, (bytes32));
            broadcasts.push(Broadcast({
                contentHash: contentHash,
                timestamp: block.timestamp,
                proposer: proposal.proposer,
                proposalId: proposalId
            }));
            totalBroadcasts++;
            emit BroadcastPublished(contentHash, proposalId);
            
        } else if (proposal.proposalType == ProposalType.AddCollaborator) {
            address newCollab = abi.decode(proposal.data, (address));
            isCollaborator[newCollab] = true;
            collaboratorIndex[newCollab] = collaborators.length;
            collaborators.push(newCollab);
            emit CollaboratorAdded(newCollab);
            
        } else if (proposal.proposalType == ProposalType.RemoveCollaborator) {
            address collab = abi.decode(proposal.data, (address));
            _removeCollaborator(collab);
            emit CollaboratorRemoved(collab);
            
        } else if (proposal.proposalType == ProposalType.UpdateThreshold) {
            uint256 newThreshold = abi.decode(proposal.data, (uint256));
            threshold = newThreshold;
            emit ThresholdUpdated(newThreshold);
            
        } else if (proposal.proposalType == ProposalType.UpdateMetadata) {
            (string memory name, string memory description, string memory imageUrl) = 
                abi.decode(proposal.data, (string, string, string));
            metadata.name = name;
            metadata.description = description;
            metadata.imageUrl = imageUrl;
            emit MetadataUpdated(name, description);
        }
        
        proposal.status = ProposalStatus.Executed;
        emit ProposalExecuted(proposalId);
    }
    
    function _removeCollaborator(address collab) internal {
        uint256 index = collaboratorIndex[collab];
        uint256 lastIndex = collaborators.length - 1;
        
        if (index != lastIndex) {
            address lastCollab = collaborators[lastIndex];
            collaborators[index] = lastCollab;
            collaboratorIndex[lastCollab] = index;
        }
        
        collaborators.pop();
        delete collaboratorIndex[collab];
        isCollaborator[collab] = false;
    }
    
    // =============================================================
    //                      VIEW FUNCTIONS
    // =============================================================
    
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }
    
    function getCollaborators() external view returns (address[] memory) {
        return collaborators;
    }
    
    function getCollaboratorCount() external view returns (uint256) {
        return collaborators.length;
    }
    
    function getBroadcasts(uint256 limit) external view returns (Broadcast[] memory) {
        uint256 count = limit > broadcasts.length ? broadcasts.length : limit;
        Broadcast[] memory result = new Broadcast[](count);
        
        for (uint256 i = 0; i < count; i++) {
            result[i] = broadcasts[broadcasts.length - 1 - i];
        }
        return result;
    }
    
    function getPendingProposals() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (proposals[i].status == ProposalStatus.Pending && 
                block.timestamp < proposals[i].expiresAt) {
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = proposalCount; i > 0 && idx < count; i--) {
            if (proposals[i].status == ProposalStatus.Pending && 
                block.timestamp < proposals[i].expiresAt) {
                result[idx++] = i;
            }
        }
        return result;
    }
    
    function getMetadata() external view returns (StationMetadata memory) {
        return metadata;
    }
    
    function hasCollaboratorVoted(uint256 proposalId, address collaborator) external view returns (bool voted, bool approved) {
        return (hasVoted[proposalId][collaborator], voteValue[proposalId][collaborator]);
    }
}
