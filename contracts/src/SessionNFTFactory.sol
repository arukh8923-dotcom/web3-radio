// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title SessionNFTFactory
 * @notice Creates and manages session attendance NFTs
 * @dev Tracks session attendance and mints NFTs for eligible attendees
 * 
 * Features:
 * - Session creation with frequency and duration
 * - Attendance tracking
 * - SessionNFT minting for eligible attendees
 * - Session closing and minting finalization
 */
contract SessionNFTFactory is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Strings for uint256;
    
    // =============================================================
    //                           TYPES
    // =============================================================
    
    struct Session {
        uint256 id;
        uint256 frequency;
        address host;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 minAttendanceTime; // Minimum time to qualify for NFT
        uint256 attendeeCount;
        uint256 nftsMinted;
        bool isActive;
        bool mintingClosed;
    }
    
    struct Attendance {
        address attendee;
        uint256 joinTime;
        uint256 leaveTime;
        uint256 totalTime;
        bool claimed;
    }
    
    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice Session counter
    uint256 public sessionCount;
    
    /// @notice NFT token counter
    uint256 public tokenCount;
    
    /// @notice Sessions by ID
    mapping(uint256 => Session) public sessions;
    
    /// @notice Attendance records: sessionId => attendee => Attendance
    mapping(uint256 => mapping(address => Attendance)) public attendance;
    
    /// @notice Attendee list per session
    mapping(uint256 => address[]) public sessionAttendees;
    
    /// @notice NFT to session mapping
    mapping(uint256 => uint256) public tokenToSession;
    
    /// @notice User's session NFTs
    mapping(address => uint256[]) public userSessionNFTs;
    
    /// @notice Authorized session creators
    mapping(address => bool) public authorizedCreators;
    
    /// @notice Stats
    uint256 public totalAttendees;
    uint256 public totalNFTsMinted;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event SessionCreated(uint256 indexed sessionId, uint256 frequency, address indexed host, string title);
    event SessionEnded(uint256 indexed sessionId, uint256 attendeeCount);
    event AttendeeJoined(uint256 indexed sessionId, address indexed attendee);
    event AttendeeLeft(uint256 indexed sessionId, address indexed attendee, uint256 totalTime);
    event SessionNFTMinted(uint256 indexed sessionId, uint256 indexed tokenId, address indexed attendee);
    event MintingClosed(uint256 indexed sessionId, uint256 totalMinted);
    
    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================
    
    constructor() ERC721("Web3 Radio Session", "SESSION") Ownable(msg.sender) {
        authorizedCreators[msg.sender] = true;
    }
    
    // =============================================================
    //                      SESSION MANAGEMENT
    // =============================================================
    
    /**
     * @notice Create a new session
     * @param frequency Station frequency
     * @param title Session title
     * @param description Session description
     * @param duration Expected duration in seconds
     * @param minAttendanceTime Minimum time to qualify for NFT
     */
    function createSession(
        uint256 frequency,
        string calldata title,
        string calldata description,
        uint256 duration,
        uint256 minAttendanceTime
    ) external returns (uint256) {
        require(authorizedCreators[msg.sender] || msg.sender == owner(), "SessionNFT: not authorized");
        require(minAttendanceTime <= duration, "SessionNFT: invalid min attendance");
        
        sessionCount++;
        
        sessions[sessionCount] = Session({
            id: sessionCount,
            frequency: frequency,
            host: msg.sender,
            title: title,
            description: description,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            minAttendanceTime: minAttendanceTime,
            attendeeCount: 0,
            nftsMinted: 0,
            isActive: true,
            mintingClosed: false
        });
        
        emit SessionCreated(sessionCount, frequency, msg.sender, title);
        return sessionCount;
    }
    
    /**
     * @notice End a session
     */
    function endSession(uint256 sessionId) external {
        Session storage session = sessions[sessionId];
        require(session.isActive, "SessionNFT: session not active");
        require(session.host == msg.sender || msg.sender == owner(), "SessionNFT: not authorized");
        
        session.isActive = false;
        session.endTime = block.timestamp;
        
        // Auto-leave all remaining attendees
        address[] storage attendees = sessionAttendees[sessionId];
        for (uint256 i = 0; i < attendees.length; i++) {
            Attendance storage att = attendance[sessionId][attendees[i]];
            if (att.leaveTime == 0) {
                att.leaveTime = block.timestamp;
                att.totalTime = att.leaveTime - att.joinTime;
            }
        }
        
        emit SessionEnded(sessionId, session.attendeeCount);
    }

    
    // =============================================================
    //                      ATTENDANCE TRACKING
    // =============================================================
    
    /**
     * @notice Join a session
     */
    function joinSession(uint256 sessionId) external nonReentrant {
        Session storage session = sessions[sessionId];
        require(session.isActive, "SessionNFT: session not active");
        require(attendance[sessionId][msg.sender].joinTime == 0, "SessionNFT: already joined");
        
        attendance[sessionId][msg.sender] = Attendance({
            attendee: msg.sender,
            joinTime: block.timestamp,
            leaveTime: 0,
            totalTime: 0,
            claimed: false
        });
        
        sessionAttendees[sessionId].push(msg.sender);
        session.attendeeCount++;
        totalAttendees++;
        
        emit AttendeeJoined(sessionId, msg.sender);
    }
    
    /**
     * @notice Leave a session
     */
    function leaveSession(uint256 sessionId) external nonReentrant {
        Attendance storage att = attendance[sessionId][msg.sender];
        require(att.joinTime > 0, "SessionNFT: not in session");
        require(att.leaveTime == 0, "SessionNFT: already left");
        
        att.leaveTime = block.timestamp;
        att.totalTime = att.leaveTime - att.joinTime;
        
        emit AttendeeLeft(sessionId, msg.sender, att.totalTime);
    }
    
    // =============================================================
    //                      NFT MINTING
    // =============================================================
    
    /**
     * @notice Claim session NFT (for eligible attendees)
     */
    function claimSessionNFT(uint256 sessionId) external nonReentrant {
        Session storage session = sessions[sessionId];
        require(!session.isActive, "SessionNFT: session still active");
        require(!session.mintingClosed, "SessionNFT: minting closed");
        
        Attendance storage att = attendance[sessionId][msg.sender];
        require(att.joinTime > 0, "SessionNFT: did not attend");
        require(!att.claimed, "SessionNFT: already claimed");
        
        // Calculate total time if not left
        uint256 totalTime = att.totalTime;
        if (totalTime == 0 && att.leaveTime == 0) {
            totalTime = session.endTime - att.joinTime;
        }
        
        require(totalTime >= session.minAttendanceTime, "SessionNFT: insufficient attendance");
        
        att.claimed = true;
        tokenCount++;
        
        _safeMint(msg.sender, tokenCount);
        tokenToSession[tokenCount] = sessionId;
        userSessionNFTs[msg.sender].push(tokenCount);
        session.nftsMinted++;
        totalNFTsMinted++;
        
        emit SessionNFTMinted(sessionId, tokenCount, msg.sender);
    }
    
    /**
     * @notice Close minting for a session
     */
    function closeMinting(uint256 sessionId) external {
        Session storage session = sessions[sessionId];
        require(!session.isActive, "SessionNFT: session still active");
        require(session.host == msg.sender || msg.sender == owner(), "SessionNFT: not authorized");
        require(!session.mintingClosed, "SessionNFT: already closed");
        
        session.mintingClosed = true;
        
        emit MintingClosed(sessionId, session.nftsMinted);
    }
    
    /**
     * @notice Check if user is eligible for NFT
     */
    function isEligible(uint256 sessionId, address user) external view returns (bool) {
        Session storage session = sessions[sessionId];
        Attendance storage att = attendance[sessionId][user];
        
        if (att.joinTime == 0 || att.claimed) return false;
        
        uint256 totalTime = att.totalTime;
        if (totalTime == 0 && att.leaveTime == 0 && !session.isActive) {
            totalTime = session.endTime - att.joinTime;
        }
        
        return totalTime >= session.minAttendanceTime;
    }
    
    // =============================================================
    //                      TOKEN URI
    // =============================================================
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        _requireOwned(tokenId);
        
        uint256 sessionId = tokenToSession[tokenId];
        Session storage session = sessions[sessionId];
        
        string memory svg = _generateSVG(session, tokenId);
        
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{"name":"Session #', sessionId.toString(), ' - ', session.title,
            '","description":"Proof of attendance for Web3 Radio session: ', session.description,
            '","image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)),
            '","attributes":[',
            '{"trait_type":"Session ID","value":"', sessionId.toString(), '"},',
            '{"trait_type":"Frequency","value":"', (session.frequency / 10).toString(), '.', (session.frequency % 10).toString(), ' FM"},',
            '{"trait_type":"Host","display_type":"address","value":"', _addressToString(session.host), '"},',
            '{"trait_type":"Date","display_type":"date","value":', session.startTime.toString(), '}',
            ']}'
        ))));
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }
    
    function _generateSVG(Session storage session, uint256 tokenId) internal view returns (string memory) {
        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
            '<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:#1a1a2e"/><stop offset="100%" style="stop-color:#16213e"/></linearGradient></defs>',
            '<rect width="400" height="400" fill="url(#bg)"/>',
            '<circle cx="200" cy="150" r="80" fill="none" stroke="#00d4aa" stroke-width="3"/>',
            '<text x="200" y="155" text-anchor="middle" fill="#00d4aa" font-size="24" font-family="monospace">SESSION</text>',
            '<text x="200" y="260" text-anchor="middle" fill="#fff" font-size="18" font-family="sans-serif">', session.title, '</text>',
            '<text x="200" y="290" text-anchor="middle" fill="#888" font-size="14" font-family="monospace">', 
            (session.frequency / 10).toString(), '.', (session.frequency % 10).toString(), ' FM</text>',
            '<text x="200" y="350" text-anchor="middle" fill="#00d4aa" font-size="12" font-family="monospace">#', tokenId.toString(), '</text>',
            '</svg>'
        ));
    }
    
    function _addressToString(address addr) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            // Safe: result is always 0-15 after masking with 0xf
            // solhint-disable-next-line
            str[2+i*2] = alphabet[uint8((uint160(addr) >> (8 * (19 - i)) >> 4) & 0xf)];
            // solhint-disable-next-line
            str[3+i*2] = alphabet[uint8((uint160(addr) >> (8 * (19 - i))) & 0xf)];
        }
        return string(str);
    }
    
    // =============================================================
    //                      VIEW FUNCTIONS
    // =============================================================
    
    function getSession(uint256 sessionId) external view returns (Session memory) {
        return sessions[sessionId];
    }
    
    function getAttendance(uint256 sessionId, address user) external view returns (Attendance memory) {
        return attendance[sessionId][user];
    }
    
    function getSessionAttendees(uint256 sessionId) external view returns (address[] memory) {
        return sessionAttendees[sessionId];
    }
    
    function getUserSessionNFTs(address user) external view returns (uint256[] memory) {
        return userSessionNFTs[user];
    }
    
    function getActiveSessions(uint256 limit) external view returns (Session[] memory) {
        uint256 count = 0;
        for (uint256 i = sessionCount; i > 0 && count < limit; i--) {
            if (sessions[i].isActive) count++;
        }
        
        Session[] memory result = new Session[](count);
        uint256 idx = 0;
        for (uint256 i = sessionCount; i > 0 && idx < count; i--) {
            if (sessions[i].isActive) {
                result[idx++] = sessions[i];
            }
        }
        return result;
    }
    
    // =============================================================
    //                      ADMIN FUNCTIONS
    // =============================================================
    
    function authorizeCreator(address creator) external onlyOwner {
        authorizedCreators[creator] = true;
    }
    
    function revokeCreator(address creator) external onlyOwner {
        authorizedCreators[creator] = false;
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
