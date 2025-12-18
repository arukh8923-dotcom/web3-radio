// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HotboxRoom
 * @notice Token-gated private rooms for exclusive content
 * @dev Access based on RADIO/VIBES token balance
 * 
 * Features:
 * - Room creation with token-gate configuration
 * - Access verification based on token balance
 * - Member enter/exit tracking
 * - Access revocation when balance drops
 */
contract HotboxRoom is Ownable, ReentrancyGuard {
    // =============================================================
    //                           TYPES
    // =============================================================
    
    enum GateToken { RADIO, VIBES }
    
    struct Room {
        uint256 id;
        address host;
        string name;
        string description;
        uint256 frequency;
        GateToken gateToken;
        uint256 minBalance;
        uint256 maxMembers;
        uint256 memberCount;
        uint256 createdAt;
        bool isActive;
        bool isPrivate;
    }
    
    struct Member {
        address user;
        uint256 joinTime;
        uint256 lastVerified;
        bool isActive;
    }
    
    // =============================================================
    //                           STORAGE
    // =============================================================
    
    /// @notice RADIO token
    IERC20 public immutable radioToken;
    
    /// @notice VIBES token
    IERC20 public immutable vibesToken;
    
    /// @notice Room counter
    uint256 public roomCount;
    
    /// @notice Rooms by ID
    mapping(uint256 => Room) public rooms;
    
    /// @notice Room members: roomId => member => Member
    mapping(uint256 => mapping(address => Member)) public members;
    
    /// @notice Member list per room
    mapping(uint256 => address[]) public roomMembers;
    
    /// @notice User's rooms
    mapping(address => uint256[]) public userRooms;
    
    /// @notice Room creation fee (in RADIO)
    uint256 public roomCreationFee = 100 * 1e18; // 100 RADIO
    
    /// @notice Treasury
    address public treasury;
    
    /// @notice Stats
    uint256 public totalMembers;
    uint256 public activeRooms;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event RoomCreated(uint256 indexed roomId, address indexed host, string name, GateToken gateToken, uint256 minBalance);
    event RoomClosed(uint256 indexed roomId);
    event MemberJoined(uint256 indexed roomId, address indexed member);
    event MemberLeft(uint256 indexed roomId, address indexed member);
    event MemberRevoked(uint256 indexed roomId, address indexed member, string reason);
    event RoomUpdated(uint256 indexed roomId, uint256 newMinBalance);
    
    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================
    
    constructor(
        address _radioToken,
        address _vibesToken,
        address _treasury
    ) Ownable(msg.sender) {
        require(_radioToken != address(0), "HotboxRoom: invalid RADIO");
        require(_vibesToken != address(0), "HotboxRoom: invalid VIBES");
        require(_treasury != address(0), "HotboxRoom: invalid treasury");
        
        radioToken = IERC20(_radioToken);
        vibesToken = IERC20(_vibesToken);
        treasury = _treasury;
    }
    
    // =============================================================
    //                      ROOM MANAGEMENT
    // =============================================================
    
    /**
     * @notice Create a new hotbox room
     * @param name Room name
     * @param description Room description
     * @param frequency Associated frequency
     * @param gateToken Token used for gating (RADIO or VIBES)
     * @param minBalance Minimum token balance required
     * @param maxMembers Maximum members (0 = unlimited)
     * @param isPrivate Whether room is invite-only
     */
    function createRoom(
        string calldata name,
        string calldata description,
        uint256 frequency,
        GateToken gateToken,
        uint256 minBalance,
        uint256 maxMembers,
        bool isPrivate
    ) external nonReentrant returns (uint256) {
        require(bytes(name).length > 0, "HotboxRoom: empty name");
        require(minBalance > 0, "HotboxRoom: invalid min balance");
        
        // Charge creation fee
        if (roomCreationFee > 0) {
            require(radioToken.balanceOf(msg.sender) >= roomCreationFee, "HotboxRoom: insufficient RADIO");
            require(radioToken.transferFrom(msg.sender, treasury, roomCreationFee), "HotboxRoom: fee transfer failed");
        }
        
        roomCount++;
        
        rooms[roomCount] = Room({
            id: roomCount,
            host: msg.sender,
            name: name,
            description: description,
            frequency: frequency,
            gateToken: gateToken,
            minBalance: minBalance,
            maxMembers: maxMembers,
            memberCount: 0,
            createdAt: block.timestamp,
            isActive: true,
            isPrivate: isPrivate
        });
        
        activeRooms++;
        
        // Host auto-joins
        _addMember(roomCount, msg.sender);
        
        emit RoomCreated(roomCount, msg.sender, name, gateToken, minBalance);
        
        return roomCount;
    }
    
    /**
     * @notice Close a room
     */
    function closeRoom(uint256 roomId) external {
        Room storage room = rooms[roomId];
        require(room.isActive, "HotboxRoom: room not active");
        require(room.host == msg.sender || msg.sender == owner(), "HotboxRoom: not authorized");
        
        room.isActive = false;
        activeRooms--;
        
        emit RoomClosed(roomId);
    }
    
    /**
     * @notice Update room settings
     */
    function updateRoom(
        uint256 roomId,
        uint256 newMinBalance,
        uint256 newMaxMembers
    ) external {
        Room storage room = rooms[roomId];
        require(room.isActive, "HotboxRoom: room not active");
        require(room.host == msg.sender, "HotboxRoom: not host");
        
        room.minBalance = newMinBalance;
        room.maxMembers = newMaxMembers;
        
        emit RoomUpdated(roomId, newMinBalance);
    }
    
    // =============================================================
    //                      MEMBER FUNCTIONS
    // =============================================================
    
    /**
     * @notice Join a room
     */
    function joinRoom(uint256 roomId) external nonReentrant {
        Room storage room = rooms[roomId];
        require(room.isActive, "HotboxRoom: room not active");
        require(!room.isPrivate, "HotboxRoom: room is private");
        require(members[roomId][msg.sender].joinTime == 0, "HotboxRoom: already member");
        require(room.maxMembers == 0 || room.memberCount < room.maxMembers, "HotboxRoom: room full");
        
        // Verify token balance
        require(_hasRequiredBalance(msg.sender, room.gateToken, room.minBalance), "HotboxRoom: insufficient balance");
        
        _addMember(roomId, msg.sender);
        
        emit MemberJoined(roomId, msg.sender);
    }
    
    /**
     * @notice Leave a room
     */
    function leaveRoom(uint256 roomId) external nonReentrant {
        Member storage member = members[roomId][msg.sender];
        require(member.isActive, "HotboxRoom: not a member");
        
        _removeMember(roomId, msg.sender);
        
        emit MemberLeft(roomId, msg.sender);
    }
    
    /**
     * @notice Verify member still has required balance
     * @dev Can be called by anyone to check/revoke access
     */
    function verifyMember(uint256 roomId, address user) external returns (bool) {
        Room storage room = rooms[roomId];
        Member storage member = members[roomId][user];
        
        if (!member.isActive) return false;
        
        bool hasBalance = _hasRequiredBalance(user, room.gateToken, room.minBalance);
        
        if (!hasBalance) {
            _removeMember(roomId, user);
            emit MemberRevoked(roomId, user, "Insufficient balance");
            return false;
        }
        
        member.lastVerified = block.timestamp;
        return true;
    }
    
    /**
     * @notice Batch verify members
     */
    function verifyMembers(uint256 roomId, address[] calldata users) external returns (uint256 revoked) {
        Room storage room = rooms[roomId];
        
        for (uint256 i = 0; i < users.length; i++) {
            Member storage member = members[roomId][users[i]];
            if (!member.isActive) continue;
            
            if (!_hasRequiredBalance(users[i], room.gateToken, room.minBalance)) {
                _removeMember(roomId, users[i]);
                emit MemberRevoked(roomId, users[i], "Insufficient balance");
                revoked++;
            } else {
                member.lastVerified = block.timestamp;
            }
        }
    }
    
    /**
     * @notice Invite user to private room (host only)
     */
    function inviteMember(uint256 roomId, address user) external {
        Room storage room = rooms[roomId];
        require(room.isActive, "HotboxRoom: room not active");
        require(room.host == msg.sender, "HotboxRoom: not host");
        require(members[roomId][user].joinTime == 0, "HotboxRoom: already member");
        require(room.maxMembers == 0 || room.memberCount < room.maxMembers, "HotboxRoom: room full");
        require(_hasRequiredBalance(user, room.gateToken, room.minBalance), "HotboxRoom: user insufficient balance");
        
        _addMember(roomId, user);
        
        emit MemberJoined(roomId, user);
    }
    
    /**
     * @notice Kick member (host only)
     */
    function kickMember(uint256 roomId, address user) external {
        Room storage room = rooms[roomId];
        require(room.host == msg.sender, "HotboxRoom: not host");
        require(user != msg.sender, "HotboxRoom: cannot kick self");
        require(members[roomId][user].isActive, "HotboxRoom: not a member");
        
        _removeMember(roomId, user);
        
        emit MemberRevoked(roomId, user, "Kicked by host");
    }
    
    // =============================================================
    //                      INTERNAL FUNCTIONS
    // =============================================================
    
    function _hasRequiredBalance(address user, GateToken token, uint256 minBalance) internal view returns (bool) {
        if (token == GateToken.RADIO) {
            return radioToken.balanceOf(user) >= minBalance;
        } else {
            return vibesToken.balanceOf(user) >= minBalance;
        }
    }
    
    function _addMember(uint256 roomId, address user) internal {
        members[roomId][user] = Member({
            user: user,
            joinTime: block.timestamp,
            lastVerified: block.timestamp,
            isActive: true
        });
        
        roomMembers[roomId].push(user);
        userRooms[user].push(roomId);
        rooms[roomId].memberCount++;
        totalMembers++;
    }
    
    function _removeMember(uint256 roomId, address user) internal {
        members[roomId][user].isActive = false;
        rooms[roomId].memberCount--;
    }
    
    // =============================================================
    //                      VIEW FUNCTIONS
    // =============================================================
    
    function getRoom(uint256 roomId) external view returns (Room memory) {
        return rooms[roomId];
    }
    
    function getMember(uint256 roomId, address user) external view returns (Member memory) {
        return members[roomId][user];
    }
    
    function getRoomMembers(uint256 roomId) external view returns (address[] memory) {
        return roomMembers[roomId];
    }
    
    function getUserRooms(address user) external view returns (uint256[] memory) {
        return userRooms[user];
    }
    
    function isMember(uint256 roomId, address user) external view returns (bool) {
        return members[roomId][user].isActive;
    }
    
    function canJoin(uint256 roomId, address user) external view returns (bool, string memory) {
        Room storage room = rooms[roomId];
        
        if (!room.isActive) return (false, "Room not active");
        if (room.isPrivate) return (false, "Room is private");
        if (members[roomId][user].joinTime > 0) return (false, "Already member");
        if (room.maxMembers > 0 && room.memberCount >= room.maxMembers) return (false, "Room full");
        if (!_hasRequiredBalance(user, room.gateToken, room.minBalance)) return (false, "Insufficient balance");
        
        return (true, "");
    }
    
    function getActiveRooms(uint256 limit, uint256 offset) external view returns (Room[] memory) {
        uint256 count = 0;
        uint256 found = 0;
        
        // Count active rooms
        for (uint256 i = 1; i <= roomCount && count < limit; i++) {
            if (rooms[i].isActive) {
                if (found >= offset) {
                    count++;
                }
                found++;
            }
        }
        
        // Build result
        Room[] memory result = new Room[](count);
        uint256 idx = 0;
        found = 0;
        
        for (uint256 i = 1; i <= roomCount && idx < count; i++) {
            if (rooms[i].isActive) {
                if (found >= offset) {
                    result[idx++] = rooms[i];
                }
                found++;
            }
        }
        
        return result;
    }
    
    function getRoomsByFrequency(uint256 frequency) external view returns (Room[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= roomCount; i++) {
            if (rooms[i].isActive && rooms[i].frequency == frequency) {
                count++;
            }
        }
        
        Room[] memory result = new Room[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= roomCount && idx < count; i++) {
            if (rooms[i].isActive && rooms[i].frequency == frequency) {
                result[idx++] = rooms[i];
            }
        }
        
        return result;
    }
    
    // =============================================================
    //                      ADMIN FUNCTIONS
    // =============================================================
    
    function setRoomCreationFee(uint256 newFee) external onlyOwner {
        roomCreationFee = newFee;
    }
    
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "HotboxRoom: invalid treasury");
        treasury = newTreasury;
    }
}
