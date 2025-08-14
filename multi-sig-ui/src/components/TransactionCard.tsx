import { TransactionWithId } from '@/lib/contract';
import { ConfirmTransaction } from './ConfirmTransaction';
import { ExecuteTransaction } from './ExecuteTransaction';

interface TransactionCardProps {
    transaction: TransactionWithId;
    threshold?: number;
    onTransactionUpdated?: () => void;
}

export function TransactionCard({ transaction, threshold = 2, onTransactionUpdated }: TransactionCardProps) {
    const { id, to, formattedAmount, executed, confirmations, status } = transaction;

    const statusColor = status === 'executed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    const borderColor = status === 'executed' ? 'border-green-200' : 'border-yellow-200';

    return (
        <div className={`bg-white rounded-lg border-2 ${borderColor} p-6 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">#{id}</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Transaction #{id}</h3>
                        <p className="text-sm text-gray-500">
                            {status === 'executed' ? 'Completed' : 'Pending confirmation'}
                        </p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                    {status === 'executed' ? 'Executed' : 'Pending'}
                </span>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="text-sm font-medium text-gray-600">Recipient</label>
                    <p className="text-sm font-mono bg-gray-50 p-2 rounded border break-all">
                        {to}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">Amount</label>
                        <p className="text-lg font-semibold text-gray-900">
                            {parseFloat(formattedAmount).toLocaleString()} Tokens
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">Confirmations</label>
                        <p className="text-lg font-semibold text-gray-900">
                            {confirmations.toString()}
                        </p>
                    </div>
                </div>

                {status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center text-sm text-gray-600">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                            Waiting for confirmations to execute
                        </div>
                    </div>
                )}

                {status === 'executed' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center text-sm text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Transaction successfully executed
                        </div>
                    </div>
                )}

                {/* Confirm Transaction Component */}
                {!executed && (
                    <ConfirmTransaction
                        transactionId={id}
                        confirmations={confirmations}
                        threshold={threshold}
                        executed={executed}
                        onTransactionConfirmed={onTransactionUpdated}
                    />
                )}

                {/* Execute Transaction Component */}
                {!executed && Number(confirmations) >= threshold && (
                    <ExecuteTransaction
                        transactionId={id}
                        confirmations={confirmations}
                        threshold={threshold}
                        executed={executed}
                        onTransactionExecuted={onTransactionUpdated}
                    />
                )}
            </div>
        </div>
    );
}
