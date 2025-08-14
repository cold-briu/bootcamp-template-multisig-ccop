'use client';

import { TransactionsList } from '@/components/TransactionsList';
import { WalletConnectionButton } from '@/components/WalletConnectionButton';
import { MULTISIG_CONTRACT_ADDRESS } from '@/lib/contract';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Multisig Wallet</h1>
              <p className="mt-1 text-sm text-gray-600">
                Monitor and manage your multisig transactions
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
              {/* Contract Address */}
              <div className="text-left sm:text-right">
                <p className="text-xs text-gray-500 font-mono">Contract Address</p>
                <p className="text-xs font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded break-all">
                  {MULTISIG_CONTRACT_ADDRESS}
                </p>
              </div>
              {/* Wallet Connection */}
              <div className="self-start sm:self-auto">
                <WalletConnectionButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TransactionsList />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Multisig Wallet Interface - Built with Next.js and Viem
          </p>
        </div>
      </footer>
    </div>
  );
}
