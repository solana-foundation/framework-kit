# @solana/client

Framework-agnostic building blocks for Solana RPC, subscriptions, wallets, and transactions. Works
in any runtime (React, Svelte, API routes, workers, etc.).

> **Status:** Experimental – expect rapid iteration.

## Install

```bash
npm install @solana/client
```

## Quickstart

1. Choose Wallet Standard connectors (auto-discovery is the fastest way to start).
2. Create a Solana client.
3. Call actions, watchers, and helpers anywhere in your app (React, APIs, workers, etc.).

```ts
import { autoDiscover, createClient } from "@solana/client";

const client = createClient({
  endpoint: "https://api.devnet.solana.com",
  websocketEndpoint: "wss://api.devnet.solana.com",
  walletConnectors: autoDiscover(),
});

// Connect Wallet Standard apps via their connector ids.
await client.actions.connectWallet("phantom");

// Fetch an account once.
const wallet = client.store.getState().wallet;
if (wallet.status === "connected") {
  const account = await client.actions.fetchAccount(wallet.session.account.address);
  console.log(account.lamports?.toString());
}
```

## Common Solana flows (copy/paste)

### Connect, disconnect, and inspect wallet state

```ts
const connectors = client.connectors.all; // Wallet Standard-aware connectors

await client.actions.connectWallet(connectors[0].id);

const wallet = client.store.getState().wallet;
if (wallet.status === "connected") {
  console.log(wallet.session.account.address.toString());
}

await client.actions.disconnectWallet();
```

### Fetch and watch lamports

```ts
import { toAddress } from "@solana/client";

const address = toAddress("Fg6PaFpoGXkYsidMpWFKfwtz6DhFVyG4dL1x8kj7ZJup");

const lamports = await client.actions.fetchBalance(address);
console.log(`Lamports: ${lamports.toString()}`);

const watcher = client.watchers.watchBalance({ address }, (nextLamports) => {
  console.log("Updated balance:", nextLamports.toString());
});

// Later…
watcher.abort();
```

### Request an airdrop (devnet/testnet)

```ts
const signature = await client.actions.requestAirdrop(address, 1_000_000_000n); // 1 SOL
console.log(signature.toString());
```

### Send SOL

```ts
const wallet = client.store.getState().wallet;
if (wallet.status !== "connected") throw new Error("Connect wallet first");

const signature = await client.solTransfer.sendTransfer({
  amount: 100_000_000n, // 0.1 SOL
  authority: wallet.session, // Wallet Standard session
  destination: "Ff34MXWdgNsEJ1kJFj9cXmrEe7y2P93b95mGu5CJjBQJ",
});
console.log(signature.toString());
```

### SPL token balance + transfer

```ts
const wallet = client.store.getState().wallet;
if (wallet.status !== "connected") throw new Error("Connect wallet first");

const usdc = client.splToken({ mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" }); // USDC

const balance = await usdc.fetchBalance(wallet.session.account.address);
console.log(`Balance: ${balance.uiAmount}`);

const signature = await usdc.sendTransfer({
  amount: 1n,
  authority: wallet.session,
  destinationOwner: "Ff34MXWdgNsEJ1kJFj9cXmrEe7y2P93b95mGu5CJjBQJ",
});
console.log(signature.toString());
```

### Build and send arbitrary transactions

```ts
import { getTransferSolInstruction } from "@solana-program/system";

const wallet = client.store.getState().wallet;
if (wallet.status !== "connected") throw new Error("Connect wallet first");

const prepared = await client.transaction.prepare({
  authority: wallet.session,
  instructions: [
    getTransferSolInstruction({
      destination: "Ff34MXWdgNsEJ1kJFj9cXmrEe7y2P93b95mGu5CJjBQJ",
      lamports: 10_000n,
      source: wallet.session.account.address,
    }),
  ],
  version: "auto", // defaults to 0 when lookups exist, otherwise 'legacy'
});

// Inspect or serialize first.
const wire = await client.transaction.toWire(prepared);

// Submit.
const signature = await client.transaction.send(prepared);
console.log(signature.toString());
```

### Watch signature confirmations

```ts
const watcher = client.watchers.watchSignature(
  { signature, commitment: "confirmed" },
  (notification) => console.log("Signature update:", notification),
);

// Later…
watcher.abort();
```

## Notes and defaults

- Wallet connectors: `autoDiscover()` picks up Wallet Standard injectables; compose `phantom()`, `solflare()`, `backpack()`, or `injected()` when you need explicit control.
- Store: built on Zustand; pass `createStore` to `createClient` for custom persistence or server-side stores. `serializeSolanaState` / `deserializeSolanaState` help save and restore cluster + wallet metadata.
- Actions: `fetchAccount`, `fetchBalance`, `setCluster`, `requestAirdrop`, `sendTransaction`, and wallet connect/disconnect keep the store in sync.
- Watchers: `watchAccount`, `watchBalance`, and `watchSignature` stream updates into the store and return an `abort()` handle for cleanup.
- Helpers: `solTransfer`, `splToken`, and `transaction` cover common transfers plus low-level `prepare`/`sign`/`toWire` flows. Transaction versions default to `0` when any instruction references address lookup tables, otherwise `legacy`; override with `version` when needed.

## Scripts

- `pnpm build` – compile JS and type definitions
- `pnpm test:typecheck` – strict type-checking
- `pnpm lint` / `pnpm format` – Biome-powered linting and formatting

## More resources

- Playground: `examples/vite-react` (run with `pnpm install && pnpm dev`).
- Next.js reference app: `examples/nextjs`.
- Client APIs live in `src/actions.ts`, `src/watchers`, and `src/features/*` for helper internals.
