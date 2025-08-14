'use client';

import { useState } from 'react';
import { getWalletClient } from '@/lib/viem';
import { MULTISIG_CONTRACT_ADDRESS, MULTISIG_ABI } from '@/lib/contract';

interface ConfirmTransactionProps {
    transactionId: number;
    confirmations: bigint;
    threshold: number;
    executed: boolean;
    onTransactionConfirmed?: () => void;
}

export function ConfirmTransaction({
    transactionId,
    confirmations,
    threshold,
    executed,
    onTransactionConfirmed
}: ConfirmTransactionProps) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleConfirm = async () => {
        setError(null);
        setSuccess(false);
        setIsConfirming(true);

        try {
            // Get wallet client
            const walletClient = getWalletClient();

            // Get the user's account
            const [account] = await walletClient.getAddresses();
            if (!account) {
                throw new Error('Please connect your wallet first');
            }

            // Confirm transaction on the contract
            const hash = await walletClient.writeContract({
                address: MULTISIG_CONTRACT_ADDRESS,
                abi: MULTISIG_ABI,
                functionName: 'confirmTransaction',
                args: [BigInt(transactionId)],
                account,
            });

            setSuccess(true);

            // Call the callback to refresh the transactions list
            if (onTransactionConfirmed) {
                onTransactionConfirmed();
            }

            // Auto-clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);

            console.log('Transaction confirmed with hash:', hash);
        } catch (err) {
            console.error('Error confirming transaction:', err);
            setError(err instanceof Error ? err.message : 'Failed to confirm transaction');
        } finally {
            setIsConfirming(false);
        }
    };

    // Don't show if transaction is already executed
    if (executed) {
        return null;
    }

    const needsMoreConfirmations = Number(confirmations) < threshold;
    const canExecute = Number(confirmations) >= threshold;

    return (
        <div className="mt-4 pt-4 border-t border-gray-100">
            {/* Success Message */}
            {success && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-green-800 text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Transaction confirmed successfully!
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

            {/* Confirmation Status */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-sm">
                    <div className="flex items-center mr-4">
                        <span className="text-gray-600">Confirmations:</span>
                        <span className="ml-1 font-semibold text-gray-900">
                            {confirmations.toString()}/{threshold}
                        </span>
                    </div>

                    {needsMoreConfirmations && (
                        <div className="flex items-center text-amber-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs">
                                Needs {threshold - Number(confirmations)} more confirmation{threshold - Number(confirmations) !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}

                    {canExecute && (
                        <div className="flex items-center text-green-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-xs">Ready to execute</span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${canExecute ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                            style={{ width: `${Math.min((Number(confirmations) / threshold) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Confirm Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isConfirming ? (
                        <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Confirming...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Confirm Transaction
                        </>
                    )}
                </button>
            </div>

            {/* Info Message */}
            {needsMoreConfirmations && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p>Once you confirm, this transaction will need {threshold - Number(confirmations) - 1} more confirmation{threshold - Number(confirmations) - 1 !== 1 ? 's' : ''} before it can be executed.</p>
                        </div>
                    </div>
                </div>
            )}

            {canExecute && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                        <svg className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <div className="text-sm text-green-800">
                            <p>This transaction has enough confirmations and can be executed by any owner.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
