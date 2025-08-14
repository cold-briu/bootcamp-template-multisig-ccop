'use client';

interface AccountSelectorProps {
    availableAddresses: string[];
    currentAddress: string | null;
    onSelectAccount: (address: string) => void;
    onClose: () => void;
}

export function AccountSelector({
    availableAddresses,
    currentAddress,
    onSelectAccount,
    onClose
}: AccountSelectorProps) {
    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const formatFullAddress = (addr: string) => {
        return `${addr.slice(0, 10)}...${addr.slice(-6)}`;
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Select Account</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-2">
                    {availableAddresses.map((address, index) => (
                        <button
                            key={address}
                            onClick={() => onSelectAccount(address)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${currentAddress === address
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${currentAddress === address ? 'bg-blue-500' : 'bg-gray-400'
                                            }`}></div>
                                        <span className="text-sm font-medium text-gray-900">
                                            Account {index + 1}
                                        </span>
                                    </div>
                                    <div className="mt-1">
                                        <span className="text-xs font-mono text-gray-600 hidden sm:inline">
                                            {formatFullAddress(address)}
                                        </span>
                                        <span className="text-xs font-mono text-gray-600 sm:hidden">
                                            {formatAddress(address)}
                                        </span>
                                    </div>
                                </div>
                                {currentAddress === address && (
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        {availableAddresses.length} account{availableAddresses.length !== 1 ? 's' : ''} available
                    </p>
                </div>
            </div>
        </div>
    );
}
