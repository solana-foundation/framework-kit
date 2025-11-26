# @solana/react-hooks

React hooks for `@solana/client`. Drop in the provider and call hooks instead of juggling RPC
clients, wallets, and stores yourself.

> **Status:** Experimental – breaking changes may land often.

## Install

```bash
pnpm add @solana/react-hooks
```

## Minimal example

Build connectors first, create a client, and hand it to the combined provider.

```tsx
import { autoDiscover, backpack, createClient, phantom, solflare } from '@solana/client';
import { SolanaProvider, useBalance, useConnectWallet, useWallet } from '@solana/react-hooks';

const walletConnectors = [...phantom(), ...solflare(), ...backpack(), ...autoDiscover()];
const client = createClient({
    endpoint: 'https://api.devnet.solana.com',
    websocketEndpoint: 'wss://api.devnet.solana.com',
    walletConnectors,
});

function WalletButton() {
    const connectWallet = useConnectWallet();
    return <button onClick={() => connectWallet('phantom')}>Connect Phantom</button>;
}

function WalletBalance() {
    const wallet = useWallet();
    const balance = useBalance(wallet.status === 'connected' ? wallet.session.account.address : undefined);

    if (wallet.status !== 'connected') return <p>Connect a wallet</p>;
    if (balance.fetching) return <p>Loading…</p>;

    return <p>Lamports: {balance.lamports?.toString() ?? '0'}</p>;
}

export function App() {
    return (
        <SolanaProvider client={client} query={{ suspense: true }}>
            <WalletButton />
            <WalletBalance />
        </SolanaProvider>
    );
}
```

`SolanaProvider` composes `SolanaClientProvider` and `SolanaQueryProvider` with SWR v2-aligned defaults
(`revalidateOnFocus`/`revalidateOnReconnect`/`revalidateIfStale` are `true`, `dedupingInterval` is `2000`,
`focusThrottleInterval` is `5000`). Override them via the `query.config` prop or per-hook `swr` options.
Prefer passing a `client`; `config`-based setup on `SolanaClientProvider` is still available for bespoke
composition.

Every hook exposes `UseHookNameParameters` / `UseHookNameReturnType` aliases so wrapper components stay in
sync with the public API.

## Hooks at a glance

- `useWallet`, `useConnectWallet`, `useDisconnectWallet` – read or update the current wallet session.
- `useBalance` / `useAccount` – fetch lamports once or keep account data in sync.
- `useSolTransfer`, `useSplToken`, `useTransactionPool` – helper-driven flows for SOL, SPL, and
  general transactions.
- `useSendTransaction` – prepare and submit arbitrary instructions with shared mutation state.
- `useSignatureStatus`, `useWaitForSignature` – declarative helpers for tracking confirmations.
- `useClientStore` – access the underlying Zustand store if you need low-level state.

### Wallet helpers

Read the current wallet session and expose connect/disconnect buttons.

```tsx
const WalletActions = () => {
    const wallet = useWallet();
    const connect = useConnectWallet();
    const disconnect = useDisconnectWallet();

    if (wallet.status === 'connected') {
        return (
            <div>
                <p>{wallet.session.account.address.toString()}</p>
                <button onClick={() => disconnect()}>Disconnect</button>
            </div>
        );
    }

    return <button onClick={() => connect('phantom')}>Connect Phantom</button>;
};
```

### Balance watcher

Read lamports (cached plus live updates) for any address.

```tsx
import { useBalance } from '@solana/react-hooks';

function BalanceCard({ address }) {
    const { lamports, fetching, slot } = useBalance(address);
    if (fetching) return <p>Loading…</p>;
    return (
        <div>
            <p>Lamports: {lamports?.toString() ?? '0'}</p>
            <small>Last slot: {slot?.toString() ?? 'unknown'}</small>
        </div>
    );
}
```

### Account cache

Fetch account data and optionally keep it in sync via subscriptions.

```tsx
import { useAccount } from '@solana/react-hooks';

function AccountInspector({ address }) {
    const account = useAccount(address, { watch: true });

    if (!account) return <p>Loading…</p>;
    if (account.error) return <p>Error loading account</p>;

    return <pre>{JSON.stringify(account.data, null, 2)}</pre>;
}
```

### SOL transfers

Trigger SOL transfers with built-in status tracking.

```tsx
import { useSolTransfer } from '@solana/react-hooks';

const SendSolButton = ({ destination, amount }) => {
    const { send, isSending } = useSolTransfer();

    return (
        <button
            disabled={isSending}
            onClick={() =>
                send({
                    destination,
                    lamports: amount,
                })
            }
        >
            {isSending ? 'Sending…' : 'Send SOL'}
        </button>
    );
};
```

### SPL tokens

Scope SPL helpers by mint and reuse the same API for balances and transfers.

```tsx
const SplBalance = ({ mint }) => {
    const { balance, send, isSending } = useSplToken(mint);

    return (
        <div>
            <p>Amount: {balance?.uiAmount ?? '0'}</p>
            <button
                disabled={isSending}
                onClick={() =>
                    send({
                        amount: 1n,
                        destinationOwner: 'Destination111111111111111111111111',
                    })
                }
            >
                Send 1 token
            </button>
        </div>
    );
};
```

### Transaction pool

Compose instructions, refresh blockhashes automatically, and send transactions from one hook.

```tsx
import type { TransactionInstructionInput } from '@solana/client';

const useMemoizedInstruction = (): TransactionInstructionInput => ({
    accounts: [],
    data: new Uint8Array(),
    programAddress: 'Example1111111111111111111111111111111111',
});

const TransactionFlow = () => {
    const instruction = useMemoizedInstruction();
    const {
        addInstruction,
        prepareAndSend,
        sendStatus,
        latestBlockhash,
    } = useTransactionPool();

    return (
        <div>
            <button onClick={() => addInstruction(instruction)}>Add instruction</button>
            <button disabled={sendStatus === 'loading'} onClick={() => prepareAndSend()}>
                {sendStatus === 'loading' ? 'Sending…' : 'Prepare & Send'}
            </button>
            <p>Recent blockhash: {latestBlockhash.blockhash ?? 'loading…'}</p>
        </div>
    );
};
```

### Client store access

Drop down to the underlying Zustand store when you need bespoke selectors.

```tsx
import { useClientStore } from '@solana/react-hooks';

function ClusterStatus() {
    const cluster = useClientStore((state) => state.cluster);
    return <p>Cluster: {cluster.status.status}</p>;
}
```

### General transaction sender

Use `useSendTransaction` when you already have instructions/messages and just need a mutation helper
that exposes `{ send, sendPrepared, status, error, signature }`. When no authority is supplied, it
will use the currently connected wallet session by default.

```tsx
import { useSendTransaction } from '@solana/react-hooks';

function SendAnythingButton({ instructions }) {
    const { send, isSending, signature, error } = useSendTransaction();

    return (
        <div>
            <button disabled={isSending} onClick={() => send({ instructions })}>
                {isSending ? 'Submitting…' : 'Send transaction'}
            </button>
            {signature ? <p>Signature: {signature}</p> : null}
            {error ? <p role="alert">Failed to send: {String(error)}</p> : null}
        </div>
    );
}
```

### Signature helpers

Poll RPC for signature metadata or wait for a confirmation level without writing loops.

```tsx
import { useSignatureStatus, useWaitForSignature } from '@solana/react-hooks';

function SignatureStatusCard({ signature }) {
    const status = useSignatureStatus(signature);

    if (status.isLoading) return <p>Loading…</p>;
    if (status.isError) return <p>RPC error.</p>;

    return (
        <div>
            <p>Confirmation: {status.confirmationStatus ?? 'pending'}</p>
            <button onClick={() => status.refresh()}>Refresh</button>
        </div>
    );
}

function WaitForSignature({ signature }) {
    const wait = useWaitForSignature(signature, { commitment: 'finalized' });

    if (wait.waitStatus === 'error') return <p role="alert">Failed: {JSON.stringify(wait.waitError)}</p>;
    if (wait.waitStatus === 'success') return <p>Finalized!</p>;
    if (wait.waitStatus === 'waiting') return <p>Waiting for confirmation…</p>;
    return <p>Provide a signature</p>;
}
```

## Query hooks

Wrap a subtree with `<SolanaQueryProvider>` and call hooks like `useLatestBlockhash`,
`useProgramAccounts`, `useSignatureStatus`, or `useSimulateTransaction`. Every hook returns
`{ data, status, refresh }` so you can read the current value and trigger a refetch. Want to lean on React
Suspense later? Pass `suspense` to `SolanaQueryProvider` and wrap just the section that should pause in a
local `<Suspense>` boundary—no hook changes required:

The query provider ships SWR v2-aligned defaults: `revalidateOnFocus`/`revalidateOnReconnect`/`revalidateIfStale`
are `true`, `dedupingInterval` is `2000`, and `focusThrottleInterval` is `5000`. Override them per-provider via the
`query.config` prop or per-hook via the `swr` option.

```tsx
import { SolanaQueryProvider, useBalance } from '@solana/react-hooks';
import { Suspense } from 'react';

function BalanceDetails({ address }: { address: string }) {
    const balance = useBalance(address);
    return <p>Lamports: {balance.lamports?.toString() ?? '0'}</p>;
}

export function WalletPanel({ address }: { address: string }) {
    return (
        <SolanaQueryProvider suspense>
            {/* Only this block suspends while balance loads */}
            <Suspense fallback={<p>Loading balance…</p>}>
                <BalanceDetails address={address} />
            </Suspense>
        </SolanaQueryProvider>
    );
}
```

### Latest blockhash

Poll or refetch the cluster's latest blockhash.

```tsx
import { SolanaQueryProvider, useLatestBlockhash } from '@solana/react-hooks';

function BlockhashTicker() {
    const latest = useLatestBlockhash({ swr: { refreshInterval: 20_000 } });
    if (latest.status === 'loading') return <p>Fetching blockhash…</p>;
    if (latest.status === 'error') return <p role="alert">Failed to fetch blockhash.</p>;

    return (
        <div>
            <button onClick={() => latest.refresh()}>Refresh</button>
            <p>Status: {latest.status}</p>
            <p>Blockhash: {latest.blockhash ?? 'unknown'}</p>
        </div>
    );
}

export function BlockhashCard() {
    return (
        <SolanaQueryProvider>
            <BlockhashTicker />
        </SolanaQueryProvider>
    );
}
```

### Program accounts

```tsx
import { autoDiscover, backpack, createClient, phantom, solflare } from '@solana/client';
import { SolanaProvider, SolanaQueryProvider, useProgramAccounts } from '@solana/react-hooks';

const walletConnectors = [...phantom(), ...solflare(), ...backpack(), ...autoDiscover()];
const client = createClient({
    endpoint: 'https://api.devnet.solana.com',
    websocketEndpoint: 'wss://api.devnet.solana.com',
    walletConnectors,
});

function ProgramAccountsList({ programAddress }) {
    const query = useProgramAccounts(programAddress);
    if (query.status === 'loading') return <p>Loading accounts…</p>;
    if (query.status === 'error') return <p role="alert">Retry later.</p>;

    return (
        <div>
            <button onClick={() => query.refresh()}>Refresh</button>
            <p>Status: {query.status}</p>
            <ul>
                {query.accounts?.map(({ pubkey }) => (
                    <li key={pubkey.toString()}>{pubkey.toString()}</li>
                ))}
            </ul>
        </div>
    );
}

export function QueryDemo({ programAddress }) {
    return (
        <SolanaProvider client={client}>
            <SolanaQueryProvider>
                <ProgramAccountsList programAddress={programAddress} />
            </SolanaQueryProvider>
        </SolanaProvider>
    );
}
```

### Transaction simulation

Simulate any transaction payload (wire string or object) and read RPC logs.

```tsx
import { useSimulateTransaction } from '@solana/react-hooks';

function SimulationLogs({ transaction }) {
    const query = useSimulateTransaction(transaction);
    if (query.status === 'loading') return <p>Simulating…</p>;
    if (query.status === 'error') return <p role="alert">Simulation failed.</p>;
    return (
        <div>
            <button onClick={() => query.refresh()}>Re-run</button>
            <p>Status: {query.status}</p>
            <pre>{JSON.stringify(query.logs, null, 2)}</pre>
        </div>
    );
}
```

## Going further

- Wallet connection UI: `useWalletConnection` gives you the current wallet, connect/disconnect
  helpers, and the connector list from `client.connectors` (or an explicit override). Pair it with
  your preferred UI, or `WalletConnectionManager` for a simple modal state helper.
- Signing helpers: the wallet session returned by `useWallet` exposes `signMessage`,
  `signTransaction`, and `sendTransaction` when supported by the connector. These connector methods
  replace the deprecated Wallet Standard shims.
- Query hooks keep SWR options under `swr` for consistency (for example,
  `useProgramAccounts(address, { swr: { revalidateOnFocus: false } })`) and expose typed parameter
  and return aliases across all hooks.
- Type helpers: use `UseHookNameParameters` / `UseHookNameReturnType` for public hooks.
- Looking for examples? See `examples/vite-react` for a ready-to-run, tabbed playground that wires
  the provider, hooks, and mock UIs together across wallet/state, transaction, and query demos.

## Scripts

- `pnpm build` – run both JS compilation and type definition emit
- `pnpm test:typecheck` – strict type-checking without emit
- `pnpm lint` / `pnpm format` – Biome-powered linting and formatting
