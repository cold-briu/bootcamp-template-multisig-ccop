'use client';

import { useState } from 'react';
import { getWalletClient } from '@/lib/viem';
import { MULTISIG_CONTRACT_ADDRESS, MULTISIG_ABI } from '@/lib/contract';

interface ExecuteTransactionProps {
    transactionId: number;
    confirmations: bigint;
    threshold: number;
    executed: boolean;
    onTransactionExecuted?: () => void;
}

export function ExecuteTransaction({
    transactionId,
    confirmations,
    threshold,
    executed,
    onTransactionExecuted
}: ExecuteTransactionProps) {
    const [isExecuting, setIsExecuting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleExecute = async () => {
        setError(null);
        setSuccess(false);
        setIsExecuting(true);

        try {
            // Get wallet client
            const walletClient = getWalletClient();

            // Get the user's account
            const [account] = await walletClient.getAddresses();
            if (!account) {
                throw new Error('Please connect your wallet first');
            }

            // Execute transaction on the contract
            const hash = await walletClient.writeContract({
                address: MULTISIG_CONTRACT_ADDRESS,
                abi: MULTISIG_ABI,
                functionName: 'executeTransaction',
                args: [BigInt(transactionId)],
                account,
            });

            setSuccess(true);

            // Call the callback to refresh the transactions list
            if (onTransactionExecuted) {
                onTransactionExecuted();
            }

            // Auto-clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);

            console.log('Transaction executed with hash:', hash);
        } catch (err) {
            console.error('Error executing transaction:', err);
            setError(err instanceof Error ? err.message : 'Failed to execute transaction');
        } finally {
            setIsExecuting(false);
        }
    };

    // Don't show if transaction is already executed or doesn't have enough confirmations
    if (executed || Number(confirmations) < threshold) {
        return null;
    }

    return (
        <div className="mt-4 pt-4 border-t border-green-100">
            {/* Success Message */}
            {success && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-green-800 text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Transaction executed successfully!
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center text-red-800 text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            {/* Ready to Execute Status */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-sm">
                    <div className="flex items-center text-green-600">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Ready to Execute</span>
                    </div>
                    <div className="ml-4 text-gray-600">
                        Confirmations: <span className="font-semibold text-green-600">{confirmations.toString()}/{threshold}</span>
                    </div>
                </div>
            </div>

            {/* Execute Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleExecute}
                    disabled={isExecuting}
                    className="flex items-center px-6 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    {isExecuting ? (
                        <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Executing...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Execute Transaction
                        </>
                    )}
                </button>
            </div>

            {/* Info Message */}
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                    <svg className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-green-800">
                        <p className="font-medium mb-1">This transaction is ready to execute!</p>
                        <p>It has received the required number of confirmations ({threshold}) and any owner can execute it to transfer the tokens.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
