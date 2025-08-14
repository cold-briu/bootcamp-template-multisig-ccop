'use client';

import { useState, useEffect } from 'react';
import { getWalletClient } from '@/lib/viem';

export interface WalletState {
    isConnected: boolean;
    address: string | null;
    availableAddresses: string[];
    isConnecting: boolean;
    error: string | null;
    showAccountSelector: boolean;
}

export function useWallet() {
    const [walletState, setWalletState] = useState<WalletState>({
        isConnected: false,
        address: null,
        availableAddresses: [],
        isConnecting: false,
        error: null,
        showAccountSelector: false,
    });

    const checkConnection = async () => {
        try {
            if (typeof window === 'undefined' || !window.ethereum) {
                return;
            }

            const walletClient = getWalletClient();
            const addresses = await walletClient.getAddresses();

            if (addresses.length > 0) {
                setWalletState(prev => ({
                    ...prev,
                    isConnected: true,
                    address: prev.address || addresses[0], // Keep current address if available
                    availableAddresses: addresses,
                    isConnecting: false,
                    error: null,
                }));
            } else {
                setWalletState(prev => ({
                    ...prev,
                    isConnected: false,
                    address: null,
                    availableAddresses: [],
                    isConnecting: false,
                    error: null,
                }));
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
            setWalletState({
                isConnected: false,
                address: null,
                availableAddresses: [],
                isConnecting: false,
                error: error instanceof Error ? error.message : 'Failed to check wallet connection',
                showAccountSelector: false,
            });
        }
    };

    const connect = async () => {
        try {
            setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

            if (typeof window === 'undefined') {
                throw new Error('Wallet connection must be initiated in browser');
            }

            if (!window.ethereum) {
                throw new Error('No wallet found. Please install MetaMask or another Web3 wallet.');
            }

            // Force MetaMask to show account selection popup by requesting permissions first
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ethereum = window.ethereum as any;

            // Clear any existing permissions/connections to force popup
            try {
                await ethereum.request({
                    method: 'wallet_requestPermissions',
                    params: [{ eth_accounts: {} }]
                });
            } catch (permError) {
                // If wallet_requestPermissions fails, fall back to eth_requestAccounts
                // but first try to disconnect any existing connection
                console.log('Falling back to eth_requestAccounts');
            }

            // Request account access - this should now show the popup
            const accounts = await ethereum.request({
                method: 'eth_requestAccounts',
            });

            if (accounts && accounts.length > 0) {
                // Check connection after requesting accounts
                await checkConnection();
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            setWalletState(prev => ({
                ...prev,
                isConnecting: false,
                error: error instanceof Error ? error.message : 'Failed to connect wallet',
            }));
        }
    };

    const disconnect = () => {
        // Clear the wallet state
        setWalletState({
            isConnected: false,
            address: null,
            availableAddresses: [],
            isConnecting: false,
            error: null,
            showAccountSelector: false,
        });

        // Additional cleanup to ensure fresh connection next time
        if (typeof window !== 'undefined' && window.ethereum) {
            // Note: We can't actually disconnect from MetaMask programmatically
            // but clearing our state ensures the UI reflects disconnected state
            console.log('Wallet disconnected - next connect will show MetaMask popup');
        }
    };

    const selectAccount = (address: string) => {
        setWalletState(prev => ({
            ...prev,
            address,
            showAccountSelector: false,
        }));
    };

    const toggleAccountSelector = () => {
        setWalletState(prev => ({
            ...prev,
            showAccountSelector: !prev.showAccountSelector,
        }));
    };

    // Check connection on mount and when accounts change
    useEffect(() => {
        checkConnection();

        if (typeof window !== 'undefined' && window.ethereum) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ethereum = window.ethereum as any;

            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length === 0) {
                    disconnect();
                } else {
                    setWalletState(prev => ({
                        ...prev,
                        isConnected: true,
                        address: accounts[0],
                        availableAddresses: accounts,
                        error: null,
                    }));
                }
            };

            const handleChainChanged = () => {
                // Reload the page when chain changes
                window.location.reload();
            };

            ethereum.on('accountsChanged', handleAccountsChanged);
            ethereum.on('chainChanged', handleChainChanged);

            return () => {
                ethereum.removeListener('accountsChanged', handleAccountsChanged);
                ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, []);

    return {
        ...walletState,
        connect,
        disconnect,
        checkConnection,
        selectAccount,
        toggleAccountSelector,
    };
}
