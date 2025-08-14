'use client';

import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import { publicClient } from '@/lib/viem';
import { MULTISIG_CONTRACT_ADDRESS, MULTISIG_ABI } from '@/lib/contract';

export function MultisigBalance() {
    const [balance, setBalance] = useState<string | null>(null);
    const [tokenAddress, setTokenAddress] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchBalance() {
            try {
                setLoading(true);
                setError(null);

                // Wait a bit to ensure client is ready (helps with SSR issues)
                if (typeof window === 'undefined') {
                    return; // Skip on server side
                }

                await new Promise(resolve => setTimeout(resolve, 100));

                // Fetch token balance and token address sequentially to avoid race conditions
                const tokenBalanceResult = await publicClient.readContract({
                    address: MULTISIG_CONTRACT_ADDRESS,
                    abi: MULTISIG_ABI,
                    functionName: 'tokenBalance',
                });

                const tokenAddressResult = await publicClient.readContract({
                    address: MULTISIG_CONTRACT_ADDRESS,
                    abi: MULTISIG_ABI,
                    functionName: 'token',
                });

                if (isMounted) {
                    const formattedBalance = formatUnits(tokenBalanceResult as bigint, 18);
                    setBalance(formattedBalance);
                    setTokenAddress(tokenAddressResult as string);
                }
            } catch (err) {
                console.error('Error fetching balance:', err);
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch balance');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        // Initial fetch with a small delay to ensure component is mounted
        const initialTimeout = setTimeout(fetchBalance, 200);

        // Set up polling for balance updates every 10 seconds
        const interval = setInterval(fetchBalance, 10000);

        return () => {
            isMounted = false;
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, []);

    const refetch = () => {
        setLoading(true);
        setError(null);
    };

    if (loading) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Multisig Balance</h3>
                    <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
                <div className="mt-4">
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-100 rounded mt-2 w-2/3 animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Multisig Balance</h3>
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="text-red-600 text-sm mb-3">{error}</div>
                <button
                    onClick={refetch}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Multisig Balance</h3>
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8.5v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>

            <div className="space-y-3">
                {/* Balance Display */}
                <div>
                    <div className="text-3xl font-bold text-gray-900">
                        {parseFloat(balance || '0').toLocaleString()}
                        <span className="text-lg font-normal text-gray-600 ml-2">Tokens</span>
                    </div>
                </div>

                {/* Token Address */}
                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Token Contract
                    </label>
                    <div className="mt-1 text-sm font-mono text-gray-700 bg-gray-50 px-3 py-2 rounded border break-all">
                        {tokenAddress}
                    </div>
                </div>

                {/* Balance Status Indicator */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {balance && parseFloat(balance) > 0 ? 'Funds Available' : 'No Funds'}
                    </div>
                    <div className="text-xs text-gray-500">
                        Auto-updates every 10s
                    </div>
                </div>
            </div>
        </div>
    );
}
