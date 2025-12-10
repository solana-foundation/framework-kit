# @solana/react-hooks

React hooks for `@solana/client`. Wrap your app once and reach for hooks instead of wiring RPC, wallets, and stores by hand.

## Install

```bash
npm install @solana/client @solana/react-hooks
```

## Quickstart

1. Choose wallet connectors (auto-discovery is the fastest way to start).
2. Create a Solana client.
3. Wrap your tree with `SolanaProvider` and use the hooks.

```tsx
import { autoDiscover, createClient } from "@solana/client";
import {
  SolanaProvider,
  useBalance,
  useWalletConnection,
} from "@solana/react-hooks";

const client = createClient({
  endpoint: "https://api.devnet.solana.com",
  walletConnectors: autoDiscover(),
});

export function App() {
  return (
    <SolanaProvider client={client}>
      {/* your components that call hooks go here */}
    </SolanaProvider>
  );
}
```

> **Next.js / RSC:** Components that call these hooks must be marked with `'use client'`.

## Common Solana flows (copy/paste)

These snippets assume a parent already handled wallet connection and can pass an address where needed.

### Connect, disconnect, and show balance

```tsx
function WalletPanel() {
  const { connectors, connect, disconnect, wallet, status } =
    useWalletConnection();
  const address = wallet?.account.address;
  const balance = useBalance(address);

  if (status === "connected") {
    return (
      <div>
        <p>{address?.toString()}</p>
        <p>Lamports: {balance.lamports?.toString() ?? "loading…"}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return connectors.map((c) => (
    <button key={c.id} onClick={() => connect(c.id)}>
      Connect {c.name}
    </button>
  ));
}
```

### Read lamport balance (auto fetch + watch)

```tsx
import { useBalance } from "@solana/react-hooks";

function BalanceCard({ address }: { address: string }) {
  const { lamports, fetching, slot } = useBalance(address);
  if (fetching) return <p>Loading…</p>;
  return (
    <p>
      Lamports: {lamports?.toString() ?? "0"} (slot {slot?.toString() ?? "—"})
    </p>
  );
}
```

### Send SOL

```tsx
import { useSolTransfer } from "@solana/react-hooks";

function SendSol({ destination }: { destination: string }) {
  const { send, isSending, status, signature, error } = useSolTransfer(); // expects a connected wallet
  return (
    <div>
      <button
        disabled={isSending}
        onClick={() =>
          send({ destination, lamports: 100_000_000n /* 0.1 SOL */ })
        }
      >
        {isSending ? "Sending…" : "Send 0.1 SOL"}
      </button>
      <p>Status: {status}</p>
      {signature ? <p>Signature: {signature}</p> : null}
      {error ? <p role="alert">Error: {String(error)}</p> : null}
    </div>
  );
}
```

### SPL token balance + transfer

```tsx
import { useSplToken } from "@solana/react-hooks";

function TokenPanel({
  mint,
  destinationOwner,
}: {
  mint: string;
  destinationOwner: string;
}) {
  const { balance, send, isSending, owner } = useSplToken(mint);
  return (
    <div>
      <p>Owner: {owner ?? "Connect wallet"}</p>
      <p>Balance: {balance?.uiAmount ?? "0"}</p>
      <button
        disabled={isSending || !owner}
        onClick={() => send({ amount: 1n, destinationOwner })}
      >
        {isSending ? "Sending…" : "Send 1 token"}
      </button>
    </div>
  );
}
```

### Fetch address lookup tables

```tsx
import { useLookupTable } from "@solana/react-hooks";

function LookupTableInfo({ address }: { address: string }) {
  const { data, isLoading, error } = useLookupTable(address);
  if (isLoading) return <p>Loading…</p>;
  if (error) return <p role="alert">Error loading LUT</p>;
  return (
    <div>
      <p>Addresses in LUT: {data?.addresses.length ?? 0}</p>
      <p>Authority: {data?.authority ?? "None"}</p>
    </div>
  );
}
```

### Fetch nonce accounts

```tsx
import { useNonceAccount } from "@solana/react-hooks";

function NonceInfo({ address }: { address: string }) {
  const { data, isLoading, error } = useNonceAccount(address);
  if (isLoading) return <p>Loading…</p>;
  if (error) return <p role="alert">Error loading nonce</p>;
  return (
    <div>
      <p>Nonce: {data?.blockhash}</p>
      <p>Authority: {data?.authority}</p>
    </div>
  );
}
```

### Build and send arbitrary transactions

```tsx
import type { TransactionInstructionInput } from "@solana/client";
import { useTransactionPool } from "@solana/react-hooks";

function TransactionFlow({ ix }: { ix: TransactionInstructionInput }) {
  const pool = useTransactionPool();
  return (
    <div>
      <button onClick={() => pool.addInstruction(ix)}>Add instruction</button>
      <button disabled={pool.isSending} onClick={() => pool.prepareAndSend()}>
        {pool.isSending ? "Sending…" : "Prepare & Send"}
      </button>
      <p>Blockhash: {pool.latestBlockhash.blockhash ?? "loading…"}</p>
    </div>
  );
}
```

### Simple mutation helper (when you already have instructions)

```tsx
import { useSendTransaction } from "@solana/react-hooks";

function SendPrepared({ instructions }) {
  const { send, isSending, signature, error } = useSendTransaction();
  return (
    <div>
      <button disabled={isSending} onClick={() => send({ instructions })}>
        {isSending ? "Submitting…" : "Send transaction"}
      </button>
      {signature ? <p>Signature: {signature}</p> : null}
      {error ? <p role="alert">{String(error)}</p> : null}
    </div>
  );
}
```

### Track confirmations for a signature

```tsx
import { useWaitForSignature } from "@solana/react-hooks";

function SignatureWatcher({ signature }: { signature: string }) {
  const wait = useWaitForSignature(signature, { commitment: "finalized" });
  if (wait.waitStatus === "error") return <p role="alert">Failed</p>;
  if (wait.waitStatus === "success") return <p>Finalized ✅</p>;
  if (wait.waitStatus === "waiting") return <p>Waiting…</p>;
  return <p>Provide a signature</p>;
}
```

### Query program accounts

```tsx
import { SolanaQueryProvider, useProgramAccounts } from "@solana/react-hooks";

function ProgramAccounts({ program }: { program: string }) {
  const query = useProgramAccounts(program);
  if (query.isLoading) return <p>Loading…</p>;
  if (query.isError) return <p role="alert">RPC error</p>;
  return (
    <div>
      <button onClick={() => query.refresh()}>Refresh</button>
      <ul>
        {query.accounts.map(({ pubkey }) => (
          <li key={pubkey.toString()}>{pubkey.toString()}</li>
        ))}
      </ul>
    </div>
  );
}

function ProgramAccountsSection({ program }: { program: string }) {
  return (
    <SolanaQueryProvider>
      <ProgramAccounts program={program} />
    </SolanaQueryProvider>
  );
}
```

### Simulate a transaction

```tsx
import { useSimulateTransaction } from "@solana/react-hooks";

function Simulation({ wire }: { wire: string }) {
  const sim = useSimulateTransaction(wire);
  if (sim.isLoading) return <p>Simulating…</p>;
  if (sim.isError) return <p role="alert">Simulation failed</p>;
  return (
    <div>
      <button onClick={() => sim.refresh()}>Re-run</button>
      <pre>{JSON.stringify(sim.logs, null, 2)}</pre>
    </div>
  );
}
```

## Using Suspense (opt-in)

Enable Suspense per subtree by setting `suspense` on `SolanaQueryProvider` and wrapping content in a React `<Suspense>` boundary. This keeps the rest of the UI non-blocking.

```tsx
import { SolanaQueryProvider, useBalance } from "@solana/react-hooks";
import { Suspense } from "react";

function BalanceDetails({ address }: { address: string }) {
  const balance = useBalance(address);
  return <p>Lamports: {balance.lamports?.toString() ?? "0"}</p>;
}

export function WalletPanel({ address }: { address: string }) {
  return (
    <SolanaQueryProvider suspense>
      <Suspense fallback={<p>Loading balance…</p>}>
        <BalanceDetails address={address} />
      </Suspense>
    </SolanaQueryProvider>
  );
}
```

## Provider SWR config (optional)

```tsx
export function App() {
  return (
    <SolanaProvider
      client={client}
      query={{
        config: {
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          refreshInterval: 30_000,
        },
      }}
    >
      <WalletPanel />
    </SolanaProvider>
  );
}
```

Defaults when you omit `query.config`:
- `revalidateOnFocus` / `revalidateOnReconnect` / `revalidateIfStale`: `true`
- `dedupingInterval`: `2000ms`
- `focusThrottleInterval`: `5000ms`

SWR background: stale-while-revalidate (RFC 5861): https://datatracker.ietf.org/doc/html/rfc5861

### Work with the client store directly

```tsx
import { useClientStore } from "@solana/react-hooks";

function ClusterBadge() {
  const cluster = useClientStore((s) => s.cluster);
  return <p>Endpoint: {cluster.endpoint}</p>;
}
```

## Notes and defaults

- Wallet connectors: use `autoDiscover()` to pick up Wallet Standard injectables; or explicitly compose `phantom()`, `solflare()`, `backpack()`, etc.
- Queries: all RPC query hooks accept `swr` options under `swr` and `disabled` flags. Suspense is opt-in via `SolanaQueryProvider`’s `suspense` prop.
- Authorities: transaction helpers default to the connected wallet session when `authority` is omitted.
- Types: every hook exports `UseHookNameParameters` / `UseHookNameReturnType` aliases.

## More resources

- Playground: `examples/vite-react` (run with `pnpm install && pnpm dev`).
- Next.js reference app: `examples/nextjs`.
- Hook JSDoc lives in `src/hooks.ts`, `src/queryHooks.ts`, `src/ui.tsx`.
