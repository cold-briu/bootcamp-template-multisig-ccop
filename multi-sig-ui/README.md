This is a [Next.js](https://nextjs.org) project that provides a user interface for interacting with a multisig wallet smart contract.

## Setup Instructions

### 1. Copy Contract ABI

Before running the application, you need to copy your deployed contract's ABI:

```bash
# Copy the ABI from your contract compilation output
cp ../multi-sig/out/SimpleERC20Multisig.sol/SimpleERC20Multisig.json src/abi/SimpleERC20Multisig.json
```

The UI will use the example ABI as a fallback if you haven't copied your contract's ABI yet, but for proper functionality with your deployed contract, you should copy the actual ABI.

### 2. Update Contract Address

Update the contract address in `src/lib/contract.ts` to match your deployed contract address.

### 3. Wallet Connection

The UI includes wallet connection functionality. Users can:
- Connect their Web3 wallet (MetaMask, etc.)
- View their connected wallet address
- Disconnect when needed

Make sure you have a Web3 wallet installed in your browser before using the application.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
