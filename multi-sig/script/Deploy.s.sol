// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/SimpleERC20Multisig.sol";

/**
 * @title Deploy Script for SimpleERC20Multisig
 * @notice Deployment script with hardcoded local configuration
 * @dev Uses locally defined owners, threshold, and token address
 */
contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        // Get configuration from local hardcoded values
        address[] memory owners = getOwners();
        uint256 threshold = getThreshold();
        address tokenAddress = getTokenAddress();

        // Validate configuration
        require(owners.length > 0, "At least one owner required");
        require(
            threshold > 0 && threshold <= owners.length,
            "Invalid threshold"
        );
        require(tokenAddress != address(0), "Token address required");

        // Deploy the multisig contract
        SimpleERC20Multisig multisig = new SimpleERC20Multisig(
            owners,
            threshold,
            tokenAddress
        );

        // Log deployment information
        console.log("=== SimpleERC20Multisig Deployment Complete ===");
        console.log("Contract Address:", address(multisig));
        console.log("Token Address:", tokenAddress);
        console.log("Threshold:", threshold);
        console.log("Number of Owners:", owners.length);

        console.log("Owners:");
        for (uint256 i = 0; i < owners.length; i++) {
            console.log("  [%d] %s", i + 1, owners[i]);
        }
        console.log("===============================================");

        vm.stopBroadcast();
    }

    /**
     * @notice Get owner addresses (hardcoded for local deployment)
     */
    function getOwners() internal pure returns (address[] memory) {
        // Use hardcoded owner addresses for local deployment
        console.log("Using locally configured owner addresses");
        address[] memory owners = new address[](3);
        owners[0] = 0x896dBbBb4fA252216b6D4e1EB00E56CF201A9bb7;
        owners[1] = 0x4166BdD8a03859578e331210D7db5d1a565fD77E;
        owners[2] = 0x7B2FaEAB431f1C9B21e9ACcDFF05f2CCd40c8992;
        return owners;
    }

    /**
     * @notice Get threshold (hardcoded for local deployment)
     */
    function getThreshold() internal pure returns (uint256) {
        // Use hardcoded threshold for local deployment
        console.log("Using locally configured threshold: 2");
        return 2;
    }

    /**
     * @notice Get token address (hardcoded for local deployment)
     */
    function getTokenAddress() internal pure returns (address) {
        // Use hardcoded token address for local deployment (cUSD on Alfajores)
        console.log("Using locally configured token: cUSD on Alfajores");
        return 0xe6A57340f0df6E020c1c0a80bC6E13048601f0d4;
    }
}
