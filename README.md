# Framework-kit

<p align="center">
  <img src=".github/assets/hero.jpg" alt="Framework-kit Hero" width="800"/>
</p>

<p align="center">
  <a href="https://codecov.io/gh/solana-foundation/framework-kit"><img src="https://codecov.io/gh/solana-foundation/framework-kit/branch/main/graph/badge.svg" alt="codecov"/></a>
</p>

<p align="center">
  <strong>@solana/client:</strong>
  <a href="https://www.npmjs.com/package/@solana/client"><img src="https://img.shields.io/npm/v/@solana/client.svg" alt="npm version"/></a>
  <a href="https://bundlephobia.com/package/@solana/client"><img src="https://img.shields.io/bundlephobia/minzip/@solana/client" alt="npm bundle size"/></a>
  <a href="https://www.npmjs.com/package/@solana/client"><img src="https://img.shields.io/npm/dm/@solana/client.svg" alt="npm downloads"/></a>
</p>

<p align="center">
  <strong>@solana/react-hooks:</strong>
  <a href="https://www.npmjs.com/package/@solana/react-hooks"><img src="https://img.shields.io/npm/v/@solana/react-hooks.svg" alt="npm version"/></a>
  <a href="https://bundlephobia.com/package/@solana/react-hooks"><img src="https://img.shields.io/bundlephobia/minzip/@solana/react-hooks" alt="npm bundle size"/></a>
  <a href="https://www.npmjs.com/package/@solana/react-hooks"><img src="https://img.shields.io/npm/dm/@solana/react-hooks.svg" alt="npm downloads"/></a>
</p>

<p align="center">
React hooks for Solana. Connect wallets, fetch balances, and send transactions with minimal setup.
</p>

## Why Framework-kit?

Building Solana dApps usually means wiring together RPC connections, wallet adapters, and state management yourself. Framework-kit handles this for you:

- **One provider, many hooks** — Wrap your app once with `SolanaProvider`, then use hooks anywhere
- **Wallet connection built-in** — `useWalletConnection` handles discovery, connection, and disconnection
- **Automatic data refresh** — Balances and account data stay in sync without manual refetching
- **Common operations simplified** — `useSolTransfer`, `useSplToken`, and `useTransactionPool` for transfers and custom transactions
- **TypeScript-first** — Full type inference out of the box

## Packages

- [`@solana/client`](packages/client/README.md) – Core library for wallet connection, transactions, and RPC. Works with any framework or standalone.
- [`@solana/react-hooks`](packages/react-hooks/README.md) – React hooks and provider. Wrap your app once, then use hooks like `useBalance` and `useSolTransfer`.
  
## Examples
- [`@solana/example-vite-react`](examples/vite-react/README.md) – Vite + Tailwind demo
- [`@solana/example-nextjs`](examples/nextjs/README.md) – Next.js (App Router) demo

## Install

```bash
npm install @solana/client @solana/react-hooks
```

## React quick start

Add this to your main App file (e.g., `App.tsx`). You'll need a Solana wallet extension like [Phantom](https://phantom.app/) installed in your browser.

```tsx
import { autoDiscover, createClient } from "@solana/client";
import { SolanaProvider, useWalletConnection } from "@solana/react-hooks";

// Create a client pointing to Solana devnet
const client = createClient({
  endpoint: "https://api.devnet.solana.com",
  walletConnectors: autoDiscover(), // Finds installed wallet extensions
});

function WalletButtons() {
  // This hook gives you everything you need for wallet connection
  const { connectors, connect, connecting } = useWalletConnection();
  return (
    <>
      {connectors.map((connector) => (
        <button
          key={connector.id}
          disabled={connecting}
          onClick={() => connect(connector.id)}
        >
          {connector.name}
        </button>
      ))}
    </>
  );
}

export function App() {
  return (
    <SolanaProvider client={client}>
      <WalletButtons />
    </SolanaProvider>
  );
}
```

Run your app and you should see buttons for each detected wallet. Click one to connect.

> **Next.js note:** Components using these hooks must be marked with `'use client'` at the top of the file.

## Learn more

- [Full hooks documentation](packages/react-hooks/README.md) — all available hooks and options
- [Client API](packages/client/README.md) — use the client without React
