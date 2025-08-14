declare global {
    interface Window {
        ethereum?: unknown;
    }
}

import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { celoAlfajores } from 'viem/chains'

function getTransport() {
    // Always use HTTP transport for reliability
    return http('https://alfajores-forno.celo-testnet.org');
}

function getWalletTransport() {
    if (typeof window === 'undefined') {
        throw new Error('Wallet client must be run in browser');
    }
    if (!window.ethereum) {
        throw new Error('No injected wallet found');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return custom(window.ethereum as any);
}

export const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: getTransport(),
})

// Create wallet client lazily to avoid SSR issues
export function getWalletClient() {
    return createWalletClient({
        chain: celoAlfajores,
        transport: getWalletTransport(),
    });
}
