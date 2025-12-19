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
  
## Example
- [`@solana/example-vite-react`](examples/vite-react/README.md) – Vite/Tailwind demo showcasing the hooks in action.

## React quick start

```tsx
import { createClient } from "@solana/client";
import { SolanaProvider, useWalletConnection } from "@solana/react-hooks";

const client = createClient({
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
