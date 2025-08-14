# bootcamp-template-multisig-ccop



## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Install and Configure Tools](#install-and-configure-tools)
3. [Project Initialization](#project-initialization)
4. [Smart Contract Development](#smart-contract-development)
5. [Testing Contract](#testing-contract)
6. [Contract Deployment](#contract-deployment)


## Prerequisites

- Foundry CLI (forge, cast, anvil, chisel)
- Node.js & npm
- Celo CLI (`celocli`)
- Celo Alfajores testnet account (with test CELO)
- Access to https://alfajores-forno.celo-testnet.org

---

## 2. Install and Configure Tools

### 2.1 Install Foundry

#### Context
Install and configure Foundry CLI tools for contract development.

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
foundryup -i nightly
```

Install open zeppelin

```
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-foundry-upgrades
forge install OpenZeppelin/openzeppelin-contracts-upgradeable
```

### 2.2 Install Celo CLI

#### Context
Install Celo command-line interface for interacting with the network.

```bash
npm install -g @celo/celocli
```

### 2.3 Configure Celo CLI

#### Context
Set your CLI node URL to Alfajores.

```bash
celocli config:set --node=https://alfajores-forno.celo-testnet.org
celocli config:get
```

### 2.4 Wallet Setup

#### Context
Create your wallet and set environment variables.

```bash
celocli account:new
```

Export your private key and address:

```bash
export YOUR_PRIVATE_KEY=<your_private_key>
export YOUR_ADDRESS=<your_address>
```

Encrypt and import your private key into Foundry's keystore:

```bash
cast wallet import my-wallet-multisig --private-key $YOUR_PRIVATE_KEY
```

> **⚠️ Important:** Choose a secure password; Foundry will decrypt at runtime.

Create your `.env` file for public config:

```bash
# .env
CELO_ACCOUNT_ADDRESS=$YOUR_ADDRESS
CELO_NODE_URL=https://alfajores-forno.celo-testnet.org
RPC_URL=$CELO_NODE_URL
```

> **⚠️ Warning:** Never commit `.env`. Add `.env` to your `.gitignore`.

---

## 3. Project Initialization

#### Context
Set up a new Foundry project for your multisig contract.

```bash
forge init multisig-wallet
cd multisig-wallet
rm -rf src test script
mkdir src test script
```

> **Pro Tip:** Clean up default directories to start with a fresh structure.

---

## 4. Smart Contract Development

### 4.1 Building a Simple ERC20 MultiSig Wallet

#### Context
Create a beginner-friendly multisig wallet that requires multiple owners to approve ERC20 token transfers. This tutorial will guide you through building the contract step by step.

#### Step 1: Set Up the Contract Structure

Create `src/SimpleERC20Multisig.sol` and start with the basic structure:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Simple ERC20 MultiSig Wallet
 * @notice A beginner-friendly multisig wallet for ERC20 tokens
 * @dev This contract requires multiple owners to approve token transfers
 */
contract SimpleERC20Multisig {
    // We'll add state variables here
}
```

#### Step 2: Define State Variables

Add the core state variables that track owners, approvals, and transactions:

```solidity
// --- State Variables ---
address[] public owners; // List of wallet owners
mapping(address => bool) public isOwner; // Quick owner lookup
uint256 public threshold; // How many approvals needed
address public token; // Which ERC20 token we manage
uint256 public tokenBalance; // Track our token balance
```

#### Step 3: Create the Transaction Structure

Define how transactions are stored:

```solidity
// --- Transaction Structure ---
struct Transaction {
    address to; // Where to send tokens
    uint256 amount; // How many tokens to send
    bool executed; // Has this been executed?
    uint256 confirmations; // How many owners approved this
}

Transaction[] public transactions;

// Track which owners confirmed which transactions
// Format: transactionId => owner => hasConfirmed
mapping(uint256 => mapping(address => bool)) public hasConfirmed;
```

#### Step 4: Implement the Constructor

Set up the multisig with initial owners and threshold:

```solidity
constructor(address[] memory _owners, uint256 _threshold, address _token) {
    // Basic validation
    require(_owners.length > 0, "Need at least one owner");
    require(
        _threshold > 0 && _threshold <= _owners.length,
        "Invalid threshold"
    );
    require(_token != address(0), "Token address cannot be zero");

    // Set up owners
    for (uint256 i = 0; i < _owners.length; i++) {
        address owner = _owners[i];
        require(owner != address(0), "Owner cannot be zero address");
        require(!isOwner[owner], "Duplicate owner");

        isOwner[owner] = true;
        owners.push(owner);
    }

    threshold = _threshold;
    token = _token;
}
```

#### Step 5: Add Token Deposit Functionality

Allow users to deposit tokens into the multisig:

```solidity
/**
 * @notice Deposit tokens into the multisig wallet
 * @param amount Amount of tokens to deposit
 */
function depositTokens(uint256 amount) external {
    require(amount > 0, "Amount must be greater than zero");
    
    // Transfer tokens from sender to this contract
    IERC20(token).transferFrom(msg.sender, address(this), amount);
    tokenBalance += amount;
}
```

#### Step 6: Implement Transaction Submission

Allow owners to propose new transactions:

```solidity
/**
 * @notice Submit a new transaction proposal
 * @param to Address to send tokens to
 * @param amount Amount of tokens to send
 * @return txId The ID of the created transaction
 */
function submitTransaction(
    address to,
    uint256 amount
) external returns (uint256 txId) {
    // Only owners can submit transactions
    require(isOwner[msg.sender], "Only owners can submit transactions");
    require(to != address(0), "Cannot send to zero address");

    // Create new transaction
    transactions.push(
        Transaction({
            to: to,
            amount: amount,
            executed: false,
            confirmations: 0
        })
    );

    txId = transactions.length - 1;
}
```

#### Step 7: Add Transaction Confirmation

Allow owners to approve pending transactions:

```solidity
/**
 * @notice Confirm a pending transaction
 * @param txId ID of the transaction to confirm
 */
function confirmTransaction(uint256 txId) external {
    // Basic checks
    require(isOwner[msg.sender], "Only owners can confirm");
    require(txId < transactions.length, "Transaction does not exist");
    require(!transactions[txId].executed, "Transaction already executed");
    require(
        !hasConfirmed[txId][msg.sender],
        "Already confirmed by this owner"
    );

    // Record the confirmation
    hasConfirmed[txId][msg.sender] = true;
    transactions[txId].confirmations += 1;
}
```

#### Step 8: Implement Transaction Execution

Execute transactions that have enough confirmations:

```solidity
/**
 * @notice Execute a transaction if it has enough confirmations
 * @param txId ID of the transaction to execute
 */
function executeTransaction(uint256 txId) external {
    // Basic checks
    require(isOwner[msg.sender], "Only owners can execute");
    require(txId < transactions.length, "Transaction does not exist");
    require(!transactions[txId].executed, "Transaction already executed");
    require(
        transactions[txId].confirmations >= threshold,
        "Not enough confirmations"
    );

    // Check if we have enough tokens
    Transaction memory txn = transactions[txId];
    require(tokenBalance >= txn.amount, "Insufficient token balance");

    // Mark as executed first (prevents reentrancy)
    transactions[txId].executed = true;

    // Send the tokens and update balance
    IERC20(token).transfer(txn.to, txn.amount);
    tokenBalance -= txn.amount;
}

---

## 5. Testing Contract

### 5.1 Understanding Test Structure

#### Context
Learn how to thoroughly test your multisig contract using Foundry's testing framework. This section walks you through building comprehensive tests that verify every aspect of your contract's functionality.

#### Step 1: Set Up the Test Environment

Create `test/SimpleERC20MultisigTest.t.sol` and establish the testing foundation:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {SimpleERC20Multisig} from "../src/SimpleERC20Multisig.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract SimpleERC20MultisigTest is Test {
    // We'll add test variables here
}
```

> **Pro Tip:** The `.t.sol` extension tells Foundry this is a test file.

#### Step 2: Define Test Variables and Addresses

Set up the core testing infrastructure with mock addresses and configurations:

```solidity
// --- Test Infrastructure ---
SimpleERC20Multisig public multisig; // Our contract under test
ERC20Mock public token; // Mock ERC20 for isolated testing

// Test addresses - using simple addresses for clarity
address public owner1 = address(0x1);
address public owner2 = address(0x2);
address public owner3 = address(0x3);
address public recipient = address(0x5);

// Configuration
address[] public owners;
uint256 public threshold = 2; // Require 2 out of 3 approvals
```

#### Step 3: Implement the setUp Function

Configure the test environment before each test runs:

```solidity
function setUp() public {
    // 1. Create mock ERC20 token for testing
    token = new ERC20Mock();

    // 2. Set up owners array
    owners = [owner1, owner2, owner3];

    // 3. Deploy our multisig contract
    multisig = new SimpleERC20Multisig(owners, threshold, address(token));

    // 4. Give tokens to owner1 for testing deposits
    token.mint(owner1, 1000 ether);

    // 5. Approve multisig to spend owner1's tokens
    vm.prank(owner1);
    token.approve(address(multisig), 1000 ether);
}
```

> **⚠️ Important:** `vm.prank(address)` makes the next call appear to come from that address.

#### Step 4: Build the Complete Workflow Test

Test the entire multisig process from deposit to execution:

```solidity
/// @notice Test the complete happy path workflow of the multisig
function testHappyPathWorkflow() public {
    uint256 depositAmount = 200 ether;
    uint256 transferAmount = 50 ether;

    // We'll implement the test steps here
}
```

#### Step 5: Implement Token Deposit Testing

Verify that tokens can be successfully deposited into the multisig:

```solidity
// 1. Deposit tokens into the multisig
vm.prank(owner1);
multisig.depositTokens(depositAmount);

// Verify deposit was successful
assertEq(multisig.tokenBalance(), depositAmount);
assertEq(token.balanceOf(address(multisig)), depositAmount);
```

#### Step 6: Test Transaction Submission

Verify that owners can propose new transactions:

```solidity
// 2. Submit a transaction proposal
vm.prank(owner1);
uint256 txId = multisig.submitTransaction(recipient, transferAmount);

// Verify transaction was created correctly
(
    address to,
    uint256 amount,
    bool executed,
    uint256 confirmations
) = multisig.transactions(txId);

assertEq(to, recipient);
assertEq(amount, transferAmount);
assertFalse(executed);
assertEq(confirmations, 0);
```

#### Step 7: Test the Confirmation Process

Verify that multiple owners can confirm transactions and reach threshold:

```solidity
// 3. First owner confirms the transaction
vm.prank(owner1);
multisig.confirmTransaction(txId);

// Verify first confirmation
assertTrue(multisig.hasConfirmed(txId, owner1));
(, , , confirmations) = multisig.transactions(txId);
assertEq(confirmations, 1);

// 4. Second owner confirms (reaches threshold of 2)
vm.prank(owner2);
multisig.confirmTransaction(txId);

// Verify second confirmation
assertTrue(multisig.hasConfirmed(txId, owner2));
(, , , confirmations) = multisig.transactions(txId);
assertEq(confirmations, 2);
```

#### Step 8: Test Transaction Execution

Verify that transactions execute correctly when threshold is met:

```solidity
// 5. Execute the transaction
uint256 recipientBalanceBefore = token.balanceOf(recipient);

vm.prank(owner1);
multisig.executeTransaction(txId);

// 6. Verify final state - all balances and transaction status
(, , executed, ) = multisig.transactions(txId);
assertTrue(executed);
assertEq(multisig.tokenBalance(), depositAmount - transferAmount);
assertEq(
    token.balanceOf(recipient),
    recipientBalanceBefore + transferAmount
);
assertEq(
    token.balanceOf(address(multisig)),
    depositAmount - transferAmount
);

// Optional: Log results for debugging
console.log("Happy path test completed successfully!");
console.log("Multisig balance:", multisig.tokenBalance());
console.log("Recipient balance:", token.balanceOf(recipient));
```

### 5.2 Running Your Tests

#### Context
Execute your tests using Foundry's powerful testing commands to verify your contract works correctly.

```bash
# Navigate to your project directory
cd multisig-wallet

# Run all tests
forge test

# Run with verbose output to see console.log statements
forge test -vv

# Run specific test function
forge test --match-test testHappyPathWorkflow

# Run with detailed gas reporting
forge test --gas-report

# Run with maximum verbosity (shows all calls and events)
forge test -vvvv
```

> **Pro Tip:** Use `-vv` to see your `console.log` outputs during testing.

### 5.3 Understanding Test Results

#### Context
Learn to interpret test output and debug any issues that arise during testing.

**Successful Test Output:**
```
Running 1 test for test/SimpleERC20MultisigTest.t.sol:SimpleERC20MultisigTest
[PASS] testHappyPathWorkflow() (gas: 234567)

Test result: ok. 1 passed; 0 failed; finished in 2.34ms
```

**Key Metrics:**
- **PASS/FAIL status**: Whether each test succeeded
- **Gas usage**: How much gas the test consumed
- **Execution time**: How long tests took to run
- **Console logs**: Your debugging output (with `-vv`)

> **⚠️ Debugging:** If tests fail, use `-vvvv` to see exactly where the failure occurred.

---

## 6. Contract Deployment

### 6.1 Deployment Overview

#### Context
Deploy your SimpleERC20Multisig contract to the Celo Alfajores testnet using Foundry. This section covers both simple deployment for quick testing and advanced deployment with configurable parameters.

### 6.2 Prepare for Deployment

#### Step 1: Import Your Wallet

First, make sure you have imported your wallet using the keystore method:

```bash
# Import your private key into Foundry's keystore (done during initial setup)
cast wallet import my-wallet-time-lock --private-key $YOUR_PRIVATE_KEY
```

> **💡 Note:** This step should already be completed from the initial setup section.

#### Step 2: Set Up Environment Variables

Create a `.env` file in your `multi-sig` directory with the following configuration:

```bash
# .env file for deployment
CELO_NODE_URL=https://alfajores-forno.celo-testnet.org
```

> **⚠️ Security Warning:** Never commit your private key. Add `.env` to your `.gitignore` file.
> **📝 Note:** Multisig parameters (owners, threshold, token) are now configured directly in the deploy script.

#### Step 3: Fund Your Deployment Account

Ensure your deployment account has sufficient CELO for gas fees:

```bash
# Check your balance
cast balance $YOUR_ADDRESS --rpc-url $CELO_NODE_URL

# Get test CELO from the faucet if needed
# Visit: https://faucet.celo.org/alfajores
```

### 6.3 Simple Deployment

#### Context
Quick deployment with predefined parameters for testing purposes.

#### Step 1: Review and Update Deploy Script

Edit `script/Deploy.s.sol` to set your actual owner addresses. The deploy script now uses hardcoded values for owners, threshold, and token address:

- **Owners**: Edit the owner addresses in the `getOwners()` function
- **Threshold**: Modify the threshold value in the `getThreshold()` function  
- **Token**: Update the token address in the `getTokenAddress()` function (defaults to cUSD on Alfajores)

> **💡 Tip:** This approach ensures consistent deployments and eliminates environment variable dependencies.

#### Step 2: Deploy the Contract

```bash
# Navigate to the multi-sig directory
cd multi-sig

# Deploy using the deploy script
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $CELO_NODE_URL \
  --broadcast \
  --account my-wallet-time-lock
```

### 6.4 Customizing Deployment Configuration

#### Context
Customize the deployment parameters by editing the deploy script directly for production use.

#### Step 1: Edit Deploy Script Configuration

Modify the configuration values in `script/Deploy.s.sol`:

```solidity
// In getOwners() function - replace with your actual addresses
owners[0] = 0xYourActualAddress1;
owners[1] = 0xYourActualAddress2; 
owners[2] = 0xYourActualAddress3;

// In getThreshold() function - set your required confirmations
return 2; // or your desired threshold

// In getTokenAddress() function - set your token contract
return 0x765DE816845861e75A25fCA122bb6898B8B1282a; // or your token address
```

#### Step 2: Deploy with Custom Configuration

```bash
# Deploy using the deploy script with your custom configuration
forge script ./script/Deploy.s.sol \
  --rpc-url $CELO_NODE_URL \
  --broadcast \
  --account my-wallet-multisig
```

### 6.5 Verify Deployment

#### Step 1: Get Deployment Information

```bash
# Extract contract address from deployment logs
export MULTISIG_ADDRESS=$(forge script script/Deploy.s.sol:Deploy --rpc-url $CELO_NODE_URL --account my-wallet-time-lock | grep "Contract Address:" | cut -d' ' -f3)

echo "Multisig deployed at: $MULTISIG_ADDRESS"
```

#### Step 2: Verify Contract State

```bash
# Check owners
cast call $MULTISIG_ADDRESS "owners(uint256)" 0 --rpc-url $CELO_NODE_URL
cast call $MULTISIG_ADDRESS "owners(uint256)" 1 --rpc-url $CELO_NODE_URL
cast call $MULTISIG_ADDRESS "owners(uint256)" 2 --rpc-url $CELO_NODE_URL

# Check threshold
cast call $MULTISIG_ADDRESS "threshold()" --rpc-url $CELO_NODE_URL

# Check token address
cast call $MULTISIG_ADDRESS "token()" --rpc-url $CELO_NODE_URL

# Check token balance
cast call $MULTISIG_ADDRESS "tokenBalance()" --rpc-url $CELO_NODE_URL
```

### 6.6 Contract Verification (Optional)

#### Context
Verify your contract source code on Celoscan for transparency and easier interaction.

```bash
# Verify the contract (you'll need a Celoscan API key)
forge verify-contract \
  --chain-id 44787 \
  --num-of-optimizations 200 \
  --compiler-version v0.8.26 \
  $MULTISIG_ADDRESS \
  src/SimpleERC20Multisig.sol:SimpleERC20Multisig \
  --etherscan-api-key $CELOSCAN_API_KEY
```

### 6.7 Post-Deployment Testing

#### Context
Test your deployed contract with real transactions to ensure everything works correctly.

#### Step 1: Deposit Test Tokens

```bash
# First, get some test tokens (if using cUSD)
# You can get test cUSD from the Celo faucet

# Approve the multisig to spend your tokens
cast send $TOKEN_ADDRESS "approve(address,uint256)" $MULTISIG_ADDRESS 1000000000000000000 \
  --rpc-url $CELO_NODE_URL \
  --account my-wallet-time-lock

# Deposit tokens into the multisig
cast send $MULTISIG_ADDRESS "depositTokens(uint256)" 100000000000000000 \
  --rpc-url $CELO_NODE_URL \
  --account my-wallet-time-lock
```

#### Step 2: Test Transaction Flow

```bash
# Submit a transaction proposal
cast send $MULTISIG_ADDRESS "submitTransaction(address,uint256)" 0xRecipientAddress 50000000000000000 \
  --rpc-url $CELO_NODE_URL \
  --account my-wallet-time-lock

# Confirm the transaction (repeat with different owners)
cast send $MULTISIG_ADDRESS "confirmTransaction(uint256)" 0 \
  --rpc-url $CELO_NODE_URL \
  --account my-wallet-time-lock

# Execute the transaction (once threshold is met)
cast send $MULTISIG_ADDRESS "executeTransaction(uint256)" 0 \
  --rpc-url $CELO_NODE_URL \
  --account my-wallet-time-lock
```

### 6.8 Common Token Addresses on Alfajores

#### Context
List of common ERC20 tokens available for testing on Celo Alfajores testnet.

| Token | Symbol | Contract Address |
|-------|--------|------------------|
| Celo Dollar | cUSD | `0x765DE816845861e75A25fCA122bb6898B8B1282a` |
| Celo Euro | cEUR | `0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F` |
| Celo Brazilian Real | cREAL | `0xE4D517785D091D3c54818832dB6094bcc2744545` |

> **💡 Tip:** Use cUSD for testing as it's the most widely supported test token on Alfajores.

### 6.9 Troubleshooting Deployment

#### Common Issues and Solutions

**Issue: "Insufficient funds for gas"**
```bash
# Solution: Get more test CELO from the faucet
# Visit: https://faucet.celo.org/alfajores
```

**Issue: "Invalid threshold" error**
```bash
# Solution: Ensure threshold > 0 and threshold <= number of owners
# Check your MULTISIG_THRESHOLD environment variable
```

**Issue: "Token address cannot be zero"**
```bash
# Solution: Verify your TOKEN_ADDRESS is set correctly
echo $TOKEN_ADDRESS
```

**Issue: Deployment succeeds but contract calls fail**
```bash
# Solution: Wait a few blocks for deployment to finalize
cast block-number --rpc-url $CELO_NODE_URL
```

> **⚠️ Important:** Always test on Alfajores before deploying to Celo mainnet.

---
