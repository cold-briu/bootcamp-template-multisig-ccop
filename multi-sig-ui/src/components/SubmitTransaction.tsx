'use client';

import { useState } from 'react';
import { parseUnits, isAddress } from 'viem';
import { getWalletClient } from '@/lib/viem';
import { MULTISIG_CONTRACT_ADDRESS, MULTISIG_ABI } from '@/lib/contract';

interface SubmitTransactionProps {
    onTransactionSubmitted?: () => void;
}

export function SubmitTransaction({ onTransactionSubmitted }: SubmitTransactionProps) {
    const [formData, setFormData] = useState({
        recipient: '',
        amount: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const resetForm = () => {
        setFormData({ recipient: '', amount: '' });
        setError(null);
        setSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setIsSubmitting(true);

        try {
            // Validation
            if (!formData.recipient || !formData.amount) {
                throw new Error('Please fill in all fields');
            }

            if (!isAddress(formData.recipient)) {
                throw new Error('Please enter a valid Ethereum address');
            }

            const amount = parseFloat(formData.amount);
            if (isNaN(amount) || amount <= 0) {
                throw new Error('Please enter a valid amount greater than 0');
            }

            // Convert amount to wei (assuming 18 decimals)
            const amountInWei = parseUnits(formData.amount, 18);

            // Get wallet client
            const walletClient = getWalletClient();

            // Get the user's account
            const [account] = await walletClient.getAddresses();
            if (!account) {
                throw new Error('Please connect your wallet first');
            }

            // Submit transaction to the contract
            const hash = await walletClient.writeContract({
                address: MULTISIG_CONTRACT_ADDRESS,
                abi: MULTISIG_ABI,
                functionName: 'submitTransaction',
                args: [formData.recipient as `0x${string}`, amountInWei],
                account,
            });

            setSuccess(true);
            resetForm();

            // Call the callback to refresh the transactions list
            if (onTransactionSubmitted) {
                onTransactionSubmitted();
            }

            // Auto-clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);

            console.log('Transaction submitted with hash:', hash);
        } catch (err) {
            console.error('Error submitting transaction:', err);
            setError(err instanceof Error ? err.message : 'Failed to submit transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Submit New Transaction</h3>
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Success Message */}
                {success && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center text-green-800 text-sm">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Transaction submitted successfully!
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center text-red-800 text-sm">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Recipient Address */}
                    <div>
                        <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                            Recipient Address
                        </label>
                        <input
                            type="text"
                            id="recipient"
                            value={formData.recipient}
                            onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                            placeholder="0x..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                            Amount (Tokens)
                        </label>
                        <input
                            type="number"
                            id="amount"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0.0"
                            step="any"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                {/* Info Box */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p>Other owners will need to confirm this transaction before it can be executed.</p>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Submit Transaction
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
