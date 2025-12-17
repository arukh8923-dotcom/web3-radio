// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title IRadioToken
 * @notice Interface for the $RADIO token wrapper contract
 * @dev Wraps Clanker-deployed token with additional functionality
 */
interface IRadioToken {
    // Events
    event Tipped(address indexed from, address indexed to, uint256 amount, uint256 stationFrequency);
    event Subscribed(address indexed subscriber, uint256 indexed stationFrequency, uint256 expiry);
    event Voted(address indexed voter, uint256 indexed proposalId, bool support, uint256 weight);

    /**
     * @notice Tip a DJ with $RADIO tokens
     * @param to The DJ's address
     * @param amount Amount of tokens to tip
     * @param stationFrequency The station frequency
     */
    function tip(address to, uint256 amount, uint256 stationFrequency) external;

    /**
     * @notice Subscribe to a premium station
     * @param stationFrequency The station frequency
     * @param duration Subscription duration in seconds
     */
    function subscribe(uint256 stationFrequency, uint256 duration) external;

    /**
     * @notice Vote on a governance proposal
     * @param proposalId The proposal ID
     * @param support True for yes, false for no
     */
    function vote(uint256 proposalId, bool support) external;

    /**
     * @notice Get subscription expiry for a user
     * @param subscriber The subscriber's address
     * @param stationFrequency The station frequency
     * @return expiry The expiry timestamp
     */
    function getSubscriptionExpiry(
        address subscriber,
        uint256 stationFrequency
    ) external view returns (uint256 expiry);

    /**
     * @notice Check if subscription is active
     * @param subscriber The subscriber's address
     * @param stationFrequency The station frequency
     * @return isActive True if subscription is active
     */
    function isSubscriptionActive(
        address subscriber,
        uint256 stationFrequency
    ) external view returns (bool isActive);
}
