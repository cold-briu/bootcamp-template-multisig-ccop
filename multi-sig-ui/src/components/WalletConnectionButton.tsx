'use client';

import { useEffect, useRef } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { AccountSelector } from './AccountSelector';

export function WalletConnectionButton() {
    const {
        isConnected,
        address,
        availableAddresses,
        isConnecting,
        error,
        showAccountSelector,
        connect,
        disconnect,
        selectAccount,
        toggleAccountSelector
    } = useWallet();

    const containerRef = useRef<HTMLDivElement>(null);

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // Close account selector when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (showAccountSelector) {
                    toggleAccountSelector();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAccountSelector, toggleAccountSelector]);

    if (isConnected && address) {
        return (
            <div className="relative" ref={containerRef}>
                <div className="flex items-center space-x-2 sm:space-x-3">
                    {/* Connected Address Display - Clickable if multiple accounts */}
                    <button
                        onClick={availableAddresses.length > 1 ? toggleAccountSelector : undefined}
                        className={`bg-green-50 border border-green-200 rounded-lg px-2 py-1 sm:px-3 sm:py-2 ${availableAddresses.length > 1 ? 'hover:bg-green-100 transition-colors' : ''
                            }`}
                        disabled={availableAddresses.length <= 1}
                    >
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs sm:text-sm font-mono text-green-800">
                                <span className="hidden sm:inline">{formatAddress(address)}</span>
                                <span className="sm:hidden">{address.slice(0, 4)}...{address.slice(-2)}</span>
                            </span>
                            {availableAddresses.length > 1 && (
                                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            )}
                        </div>
                    </button>

                    {/* Disconnect Button */}
                    <button
                        onClick={disconnect}
                        className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <span className="hidden sm:inline">Disconnect</span>
                        <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>

                {/* Account Selector Dropdown */}
                {showAccountSelector && (
                    <AccountSelector
                        availableAddresses={availableAddresses}
                        currentAddress={address}
                        onSelectAccount={selectAccount}
                        onClose={toggleAccountSelector}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-end space-y-2">
            <button
                onClick={connect}
                disabled={isConnecting}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
            >
                {isConnecting ? (
                    <>
                        <div className="animate-spin w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span className="hidden sm:inline">Connecting...</span>
                        <span className="sm:hidden">...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="hidden sm:inline">Connect Wallet</span>
                        <span className="sm:hidden">Connect</span>
                    </>
                )}
            </button>

            {/* Error Message */}
            {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 max-w-48 sm:max-w-64 text-right">
                    {error}
                </div>
            )}
        </div>
    );
}
