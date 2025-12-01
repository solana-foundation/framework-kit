# Framework-kit

Framework for Solana dApps: evolving multi-framework client core (React-first today) that orchestrates wallets, transactions, and reactive freshness-aware data flows out of the box.

## Packages

- [`@solana/client`](packages/client/README.md) – headless Solana client with transaction helpers and wallet orchestration.
- [`@solana/react-hooks`](packages/react-hooks/README.md) – React bindings, providers, and UI helpers powered by the client.
  
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
