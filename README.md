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

This framework is built directly on top of `@solana/kit`. We use Kit internally for all low-level primitives, but **we deliberately do not re-export them.**

### Why this architecture?

We want to avoid the "wrapper confusion" often seen in earlier libraries (like Gill), where it was unclear whether developers should use the framework's version of a type or the native version.

* **Clear Separation of Concerns:**
    * **Use Framework-kit** for high-level application logic: Wallet state management, React Context, and connection orchestration.
    * **Use `@solana/kit`** for low-level primitives: Addresses, Codecs, and Transaction construction types.
* **No Vendor Lock-in:** By importing primitives like `address` or `Signature` directly from `@solana/kit`, your core data types remain standard. This ensures that your helper functions and types remain compatible with the broader ecosystem, regardless of the framework managing your state.

### Interop Example

You will often see imports from both libraries in the same file. This is the intended usage pattern.

```typescript
// 1. Import standard primitives directly from @solana/kit
import { address, type Address } from "@solana/kit";

// 2. Import high-level logic from the framework
import { useWalletConnection } from "@solana/react-hooks";

export const UserProfile = ({ userAddress }: { userAddress: Address }) => {
   const { connect } = useWalletConnection();
   // ... component logic
}
 ``` 
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
