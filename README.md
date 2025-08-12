# bootcamp-template-multisig-ccop



## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Install and Configure Tools](#install-and-configure-tools)
3. [Project Initialization](#project-initialization)
4. [Smart Contract Development](#smart-contract-development)


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
cast wallet import my-wallet-time-lock --private-key $YOUR_PRIVATE_KEY
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

Create `src/SimplifiedERC20MultiSig.sol` and start with the basic structure:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Simple ERC20 MultiSig Wallet
 * @notice A beginner-friendly multisig wallet for ERC20 tokens
 * @dev This contract requires multiple owners to approve token transfers
 */
contract SimplifiedERC20MultiSig {
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
```

#### Step 9: Key Design Decisions

**Why no events?** 
- Keeps the contract simple for beginners
- Reduces gas costs
- External tools can still track transactions by monitoring function calls

**Why track balance internally?**
- Provides immediate balance checking without external calls
- Prevents transactions that would fail due to insufficient funds
- Makes the contract behavior more predictable

**Why use a simple threshold model?**
- Easy to understand: "X out of Y owners must approve"
- No complex role-based permissions
- Suitable for small teams or simple use cases

#### Step 10: Testing Your Contract

Create basic tests to ensure your contract works:

```solidity
// test/SimplifiedMultiSigTest.t.sol
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/SimplifiedERC20MultiSig.sol";

contract SimplifiedMultiSigTest is Test {
    // Add your tests here
}
```

#### Pro Tips

1. **Keep it Simple**: This contract prioritizes readability over advanced features
2. **Gas Efficiency**: No events and minimal storage reads keep costs low
3. **Security**: Always mark transactions as executed before external calls
4. **Flexibility**: Anyone can deposit tokens, but only owners control withdrawals

> **Next Steps**: Deploy to Alfajores testnet and test with real ERC20 tokens!
