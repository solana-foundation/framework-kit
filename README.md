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
Framework for Solana dApps: evolving multi-framework client core (React-first today) that orchestrates wallets, transactions, and reactive freshness-aware data flows out of the box.
</p>

## Packages

- [`@solana/client`](packages/client/README.md) – headless Solana client with transaction helpers, moniker-based endpoint helpers, and wallet orchestration.
- [`@solana/react-hooks`](packages/react-hooks/README.md) – React bindings, providers, and UI helpers powered by the client.

## Relationship with `@solana/kit`

This framework is built directly on top of @solana/kit. We use Kit internally for all low-level primitives, but we deliberately do not re-export them.


### Why this architecture?

Framework-kit sits on top of @solana/kit and uses its primitives directly. This keeps each layer focused on its role while maintaining full type compatibility.


* **Clear Separation of Concerns:**
    * **Framework-kit** focuses on application-level behavior: wallet and session state, React context, connection flow, and transaction orchestration.
    * **`@solana/kit`** provides the foundational Solana pieces: addresses, codecs, instruction builders, and core types.

* **No Type Shadowing:**
    * **Framework-kit** purposely avoids re-exporting @solana/kit  primitives to prevent confusion.
    * There is one source of truth: **`@solana/kit`**.
    
    
### Interoperability Example

You will often see imports from both libraries in the same file. This is the intended usage pattern.

```typescript
// kit primitives
import { address, type Address, getTransferTokenInstruction } from "@solana/kit";

// framework-kit: client + hooks
import { createSolanaClient } from "@solana/client";
import { SolanaProvider, useWalletConnection, useSendTransaction } from "@solana/react-hooks";

export function App() {
  const client = createSolanaClient({ endpoint: "https://api.devnet.solana.com" });

  return (
    <SolanaProvider client={client}>
      <SendTokenButton />
    </SolanaProvider>
  );
}

function SendTokenButton() {
  const { account } = useWalletConnection();      // wallet from framework-kit
  const sendTx = useSendTransaction();            // transaction sending hook

  const sendToken = async () => {
    if (!account) return;

    const mint: Address = address("TOKEN_MINT_ADDRESS");          // kit type
    const source: Address = address(account.address);             // wallet address from framework-kit
    const destination: Address = address("DESTINATION_ADDRESS");  // recipient

    // build instruction with kit primitive
    const ix = getTransferTokenInstruction({
      mint,
      source,
      destination,
      amount: 100n,
    });

    // send using framework-kit transaction orchestration
    await sendTx([ix]);
    console.log("SPL token transfer instruction sent!");
  };

  return <button onClick={sendToken} disabled={!account}>Send 100 Tokens</button>;
}

```

### Summary:

- **Kit primitives** (`address`, `getTransferTokenInstruction`) are used directly.

- **Framework-kit hooks** (`useWalletConnection`, `useSendTransaction`) orchestrate wallet state and transaction sending.

- **Types converge**: `account.address` from framework-kit is compatible with `Address` from kit.





 
## Example
- [`@solana/example-vite-react`](examples/vite-react/README.md) – Vite/Tailwind demo showcasing the hooks in action.

## React quick start

```tsx
import { createSolanaClient } from "@solana/client";
import { SolanaProvider, useWalletConnection } from "@solana/react-hooks";

const client = createSolanaClient({
  endpoint: "https://api.devnet.solana.com",
});

function WalletButtons() {
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
