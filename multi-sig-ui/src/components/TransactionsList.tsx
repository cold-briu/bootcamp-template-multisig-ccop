import { useTransactions } from '@/hooks/useTransactions';
import { TransactionCard } from './TransactionCard';
import { SubmitTransaction } from './SubmitTransaction';
import { MultisigBalance } from './MultisigBalance';
import { DepositTokens } from './DepositTokens';

// Reusable button component
function ActionButton({
    onClick,
    variant = 'primary',
    children,
    className = ''
}: {
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    children: React.ReactNode;
    className?: string;
}) {
    const baseClasses = "px-4 py-2 rounded-lg transition-colors";
    const variantClasses = variant === 'primary'
        ? "bg-blue-500 text-white hover:bg-blue-600"
        : "text-blue-600 border border-blue-200 hover:bg-blue-50";

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${variantClasses} ${className}`}
        >
            {children}
        </button>
    );
}

// Reusable state display component
function StateDisplay({
    icon,
    title,
    description,
    action
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="text-center py-12">
            <div className="mb-4">
                {icon}
                <p className="text-lg font-semibold text-gray-900 mb-2">{title}</p>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
            {action}
        </div>
    );
}

export function TransactionsList() {
    const { transactions, threshold, loading, error, refetch } = useTransactions();

    const renderTransactionsContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-3">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <span className="text-gray-600">Loading transactions...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <StateDisplay
                    icon={
                        <svg className="w-12 h-12 mx-auto mb-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    title="Error loading transactions"
                    description={error}
                    action={<ActionButton onClick={refetch}>Try Again</ActionButton>}
                />
            );
        }

        if (transactions.length === 0) {
            return (
                <StateDisplay
                    icon={
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                    title="No transactions found"
                    description="Submit your first transaction above to get started."
                    action={<ActionButton onClick={refetch}>Refresh</ActionButton>}
                />
            );
        }

        return (
            <>
                {/* Transactions Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Multisig Transactions ({transactions.length})
                    </h2>
                    <ActionButton
                        onClick={refetch}
                        variant="secondary"
                        className="flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Refresh</span>
                    </ActionButton>
                </div>

                {/* Transactions List */}
                <div className="grid gap-6">
                    {transactions.map((transaction) => (
                        <TransactionCard
                            key={transaction.id}
                            transaction={transaction}
                            threshold={threshold}
                            onTransactionUpdated={refetch}
                        />
                    ))}
                </div>
            </>
        );
    };

    return (
        <div className="space-y-6">
            {/* Top Row: Balance Display */}
            <MultisigBalance />

            {/* Middle Row: Deposit and Submit Transaction */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DepositTokens onTokensDeposited={refetch} />
                <SubmitTransaction onTransactionSubmitted={refetch} />
            </div>

            {/* Transactions Content - Depends on loading state */}
            {renderTransactionsContent()}
        </div>
    );
}
