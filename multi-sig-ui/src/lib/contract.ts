// Contract configuration
export const MULTISIG_CONTRACT_ADDRESS = "0x5168f18e89fdd2e88114870d2837c0e31170564a" as const;

// Import ABI from local file with fallback
// Users need to copy their compiled ABI to src/abi/SimpleERC20Multisig.json
let MULTISIG_ABI;

try {
    // Try to import the user's ABI file
    MULTISIG_ABI = require('@/abi/SimpleERC20Multisig.json');
} catch (error) {
    // Fallback to example ABI if user hasn't copied their file yet
    console.warn('SimpleERC20Multisig.json not found. Using example ABI. Please copy your contract ABI to src/abi/SimpleERC20Multisig.json');
    MULTISIG_ABI = require('@/abi/SimpleERC20Multisig.example.json');
}

export { MULTISIG_ABI };

// Transaction structure matching the contract
export interface Transaction {
    to: string;
    amount: bigint;
    executed: boolean;
    confirmations: bigint;
}

// Enhanced transaction data with additional UI info
export interface TransactionWithId extends Transaction {
    id: number;
    status: 'pending' | 'executed';
    formattedAmount: string;
}
