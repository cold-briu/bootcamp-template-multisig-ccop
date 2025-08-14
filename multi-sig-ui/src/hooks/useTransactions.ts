import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import { publicClient } from '@/lib/viem';
import { MULTISIG_CONTRACT_ADDRESS, MULTISIG_ABI, TransactionWithId } from '@/lib/contract';

export function useTransactions() {
    const [transactions, setTransactions] = useState<TransactionWithId[]>([]);
    const [threshold, setThreshold] = useState<number>(2);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchTransactions() {
            try {
                setLoading(true);
                setError(null);

                // Fetch threshold first
                const thresholdResult = await publicClient.readContract({
                    address: MULTISIG_CONTRACT_ADDRESS,
                    abi: MULTISIG_ABI,
                    functionName: 'threshold',
                });

                if (isMounted) {
                    setThreshold(Number(thresholdResult));
                }

                // First, get the total number of transactions by trying to read until we get an error
                let transactionCount = 0;
                const maxTransactions = 100; // Safety limit

                // Find the transaction count by reading transactions until we get an error
                for (let i = 0; i < maxTransactions; i++) {
                    try {
                        await publicClient.readContract({
                            address: MULTISIG_CONTRACT_ADDRESS,
                            abi: MULTISIG_ABI,
                            functionName: 'transactions',
                            args: [BigInt(i)],
                        });
                        transactionCount = i + 1;
                    } catch {
                        break;
                    }
                }

                if (!isMounted) return;

                // Fetch all transactions
                const fetchedTransactions: TransactionWithId[] = [];

                for (let i = 0; i < transactionCount; i++) {
                    try {
                        const transaction = await publicClient.readContract({
                            address: MULTISIG_CONTRACT_ADDRESS,
                            abi: MULTISIG_ABI,
                            functionName: 'transactions',
                            args: [BigInt(i)],
                        }) as [string, bigint, boolean, bigint];

                        const [to, amount, executed, confirmations] = transaction;

                        fetchedTransactions.push({
                            id: i,
                            to,
                            amount,
                            executed,
                            confirmations,
                            status: executed ? 'executed' : 'pending',
                            formattedAmount: formatUnits(amount, 18), // Assuming 18 decimals for ERC20 token
                        });
                    } catch (err) {
                        console.error(`Error fetching transaction ${i}:`, err);
                    }
                }

                if (isMounted) {
                    // Sort transactions by ID (newest first)
                    setTransactions(fetchedTransactions.reverse());
                }
            } catch (err) {
                console.error('Error fetching transactions:', err);
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        // Initial fetch
        fetchTransactions();

        // Set up polling for new transactions every 10 seconds
        const interval = setInterval(fetchTransactions, 10000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const refetch = () => {
        setLoading(true);
        // Trigger a re-fetch by clearing the current state
        setTransactions([]);
    };

    return {
        transactions,
        threshold,
        loading,
        error,
        refetch,
    };
}
