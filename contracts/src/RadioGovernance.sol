// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RadioGovernance
 * @notice Governance system for Web3 Radio platform
 * @dev Token-weighted voting with RADIO tokens
 * 
 * Features:
 * - Proposal creation with voting parameters
 * - Vote recording weighted by token balance
 * - Vote tally calculation
 * - Proposal execution on approval
 */
contract RadioGovernance is Ownable, ReentrancyGuard {
    // =============================================================
    //                           TYPES
    // =============================================================
    
    enum ProposalState { Pending, Active, Canceled, Defeated, Succeeded, Queued, Executed, Expired }
    enum VoteType { Against, For, Abstain }
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 quorum;
        bool executed;
        bool canceled;
        bytes[] calldatas;
        address[] targets;
    }
    
    struct Vote {
        bool hasVoted;
        VoteType voteType;
        uint256 weight;
    }
    
    struct ProposalConfig {
        uint256 votingDelay;      // Time before voting starts
        uint256 votingPeriod;     // Duration of voting
        uint256 proposalThreshold; // Min tokens to create proposal
        uint256 quorumPercentage; // % of total supply needed
    }
    
    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice RADIO token for voting
    IERC20 public immutable radioToken;
    
    /// @notice Proposal counter
    uint256 public proposalCount;
    
    /// @notice Proposals by ID
    mapping(uint256 => Proposal) public proposals;
    
    /// @notice Votes: proposalId => voter => Vote
    mapping(uint256 => mapping(address => Vote)) public votes;
    
    /// @notice Voter list per proposal
    mapping(uint256 => address[]) public proposalVoters;
    
    /// @notice User's proposals
    mapping(address => uint256[]) public userProposals;
    
    /// @notice Governance config
    ProposalConfig public config;
    
    /// @notice Timelock for execution (optional)
    uint256 public timelockDelay = 1 days;
    
    /// @notice Queued proposals execution time
    mapping(uint256 => uint256) public queuedAt;
    
    /// @notice Stats
    uint256 public totalProposals;
    uint256 public executedProposals;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        VoteType voteType,
        uint256 weight
    );
    
    event ProposalCanceled(uint256 indexed proposalId);
    event ProposalQueued(uint256 indexed proposalId, uint256 executionTime);
    event ProposalExecuted(uint256 indexed proposalId);
    event ConfigUpdated(uint256 votingDelay, uint256 votingPeriod, uint256 proposalThreshold, uint256 quorumPercentage);
    
    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================
    
    constructor(address _radioToken) Ownable(msg.sender) {
        require(_radioToken != address(0), "Governance: invalid token");
        
        radioToken = IERC20(_radioToken);
        
        // Default config
        config = ProposalConfig({
            votingDelay: 1 days,
            votingPeriod: 3 days,
            proposalThreshold: 10000 * 1e18, // 10K RADIO to propose
            quorumPercentage: 4 // 4% of total supply
        });
    }
    
    // =============================================================
    //                      PROPOSAL FUNCTIONS
    // =============================================================
    
    /**
     * @notice Create a new proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param targets Target addresses for execution
     * @param calldatas Calldata for each target
     */
    function propose(
        string calldata title,
        string calldata description,
        address[] calldata targets,
        bytes[] calldata calldatas
    ) external returns (uint256) {
        require(
            radioToken.balanceOf(msg.sender) >= config.proposalThreshold,
            "Governance: below proposal threshold"
        );
        require(bytes(title).length > 0, "Governance: empty title");
        require(targets.length == calldatas.length, "Governance: length mismatch");
        
        proposalCount++;
        
        uint256 startTime = block.timestamp + config.votingDelay;
        uint256 endTime = startTime + config.votingPeriod;
        uint256 quorum = (radioToken.totalSupply() * config.quorumPercentage) / 100;
        
        Proposal storage proposal = proposals[proposalCount];
        proposal.id = proposalCount;
        proposal.proposer = msg.sender;
        proposal.title = title;
        proposal.description = description;
        proposal.startTime = startTime;
        proposal.endTime = endTime;
        proposal.quorum = quorum;
        proposal.targets = targets;
        proposal.calldatas = calldatas;
        
        userProposals[msg.sender].push(proposalCount);
        totalProposals++;
        
        emit ProposalCreated(proposalCount, msg.sender, title, startTime, endTime);
        
        return proposalCount;
    }
    
    /**
     * @notice Cancel a proposal (proposer or owner only)
     */
    function cancel(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Governance: not authorized"
        );
        require(!proposal.executed, "Governance: already executed");
        require(!proposal.canceled, "Governance: already canceled");
        
        proposal.canceled = true;
        
        emit ProposalCanceled(proposalId);
    }
    
    // =============================================================
    //                      VOTING FUNCTIONS
    // =============================================================
    
    /**
     * @notice Cast a vote
     * @param proposalId Proposal ID
     * @param voteType Vote type (Against, For, Abstain)
     */
    function castVote(uint256 proposalId, VoteType voteType) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.startTime, "Governance: voting not started");
        require(block.timestamp <= proposal.endTime, "Governance: voting ended");
        require(!proposal.canceled, "Governance: proposal canceled");
        
        Vote storage vote = votes[proposalId][msg.sender];
        require(!vote.hasVoted, "Governance: already voted");
        
        uint256 weight = radioToken.balanceOf(msg.sender);
        require(weight > 0, "Governance: no voting power");
        
        vote.hasVoted = true;
        vote.voteType = voteType;
        vote.weight = weight;
        
        if (voteType == VoteType.For) {
            proposal.forVotes += weight;
        } else if (voteType == VoteType.Against) {
            proposal.againstVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }
        
        proposalVoters[proposalId].push(msg.sender);
        
        emit VoteCast(proposalId, msg.sender, voteType, weight);
    }
    
    /**
     * @notice Queue a successful proposal for execution
     */
    function queue(uint256 proposalId) external {
        require(state(proposalId) == ProposalState.Succeeded, "Governance: not succeeded");
        
        queuedAt[proposalId] = block.timestamp;
        
        emit ProposalQueued(proposalId, block.timestamp + timelockDelay);
    }
    
    /**
     * @notice Execute a queued proposal
     */
    function execute(uint256 proposalId) external nonReentrant {
        require(state(proposalId) == ProposalState.Queued, "Governance: not queued");
        require(
            block.timestamp >= queuedAt[proposalId] + timelockDelay,
            "Governance: timelock not passed"
        );
        
        Proposal storage proposal = proposals[proposalId];
        proposal.executed = true;
        executedProposals++;
        
        // Execute calls
        for (uint256 i = 0; i < proposal.targets.length; i++) {
            (bool success, ) = proposal.targets[i].call(proposal.calldatas[i]);
            require(success, "Governance: execution failed");
        }
        
        emit ProposalExecuted(proposalId);
    }

    
    // =============================================================
    //                      VIEW FUNCTIONS
    // =============================================================
    
    /**
     * @notice Get proposal state
     */
    function state(uint256 proposalId) public view returns (ProposalState) {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.canceled) {
            return ProposalState.Canceled;
        }
        
        if (proposal.executed) {
            return ProposalState.Executed;
        }
        
        if (block.timestamp < proposal.startTime) {
            return ProposalState.Pending;
        }
        
        if (block.timestamp <= proposal.endTime) {
            return ProposalState.Active;
        }
        
        // Voting ended
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        
        if (totalVotes < proposal.quorum) {
            return ProposalState.Defeated;
        }
        
        if (proposal.forVotes <= proposal.againstVotes) {
            return ProposalState.Defeated;
        }
        
        if (queuedAt[proposalId] > 0) {
            if (block.timestamp >= queuedAt[proposalId] + timelockDelay + 14 days) {
                return ProposalState.Expired;
            }
            return ProposalState.Queued;
        }
        
        return ProposalState.Succeeded;
    }
    
    /**
     * @notice Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        ProposalState currentState
    ) {
        Proposal storage p = proposals[proposalId];
        return (
            p.id,
            p.proposer,
            p.title,
            p.description,
            p.startTime,
            p.endTime,
            p.forVotes,
            p.againstVotes,
            p.abstainVotes,
            state(proposalId)
        );
    }
    
    /**
     * @notice Get vote details
     */
    function getVote(uint256 proposalId, address voter) external view returns (Vote memory) {
        return votes[proposalId][voter];
    }
    
    /**
     * @notice Get proposal voters
     */
    function getProposalVoters(uint256 proposalId) external view returns (address[] memory) {
        return proposalVoters[proposalId];
    }
    
    /**
     * @notice Get user's proposals
     */
    function getUserProposals(address user) external view returns (uint256[] memory) {
        return userProposals[user];
    }
    
    /**
     * @notice Get active proposals
     */
    function getActiveProposals(uint256 limit) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = proposalCount; i > 0 && count < limit; i--) {
            if (state(i) == ProposalState.Active) count++;
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = proposalCount; i > 0 && idx < count; i--) {
            if (state(i) == ProposalState.Active) {
                result[idx++] = i;
            }
        }
        return result;
    }
    
    /**
     * @notice Check if user can propose
     */
    function canPropose(address user) external view returns (bool) {
        return radioToken.balanceOf(user) >= config.proposalThreshold;
    }
    
    /**
     * @notice Get voting power
     */
    function getVotingPower(address user) external view returns (uint256) {
        return radioToken.balanceOf(user);
    }
    
    // =============================================================
    //                      ADMIN FUNCTIONS
    // =============================================================
    
    /**
     * @notice Update governance config
     */
    function setConfig(
        uint256 votingDelay,
        uint256 votingPeriod,
        uint256 proposalThreshold,
        uint256 quorumPercentage
    ) external onlyOwner {
        require(votingDelay >= 1 hours && votingDelay <= 7 days, "Governance: invalid delay");
        require(votingPeriod >= 1 days && votingPeriod <= 14 days, "Governance: invalid period");
        require(quorumPercentage >= 1 && quorumPercentage <= 50, "Governance: invalid quorum");
        
        config = ProposalConfig({
            votingDelay: votingDelay,
            votingPeriod: votingPeriod,
            proposalThreshold: proposalThreshold,
            quorumPercentage: quorumPercentage
        });
        
        emit ConfigUpdated(votingDelay, votingPeriod, proposalThreshold, quorumPercentage);
    }
    
    /**
     * @notice Update timelock delay
     */
    function setTimelockDelay(uint256 newDelay) external onlyOwner {
        require(newDelay >= 1 hours && newDelay <= 7 days, "Governance: invalid timelock");
        timelockDelay = newDelay;
    }
}
