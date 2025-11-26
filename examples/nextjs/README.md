# @solana/example-nextjs

Minimal Next.js (App Router) example for `@solana/react-hooks` using Tailwind CSS v4 (config-less).
It wires the Wallet Standard connectors (Phantom, Solflare, Backpack + auto-discovery) and shows a
memo-sending flow: connect a wallet, type a memo, and submit a Memo program transaction with the
connected signer.

## Quickstart

```bash
pnpm install
pnpm --filter @solana/example-nextjs dev
```

Open http://localhost:3000 and pick a wallet. The app runs against Devnet by default.

## Configuration

- `NEXT_PUBLIC_SOLANA_RPC` – RPC endpoint (default: `https://api.devnet.solana.com`)
- `NEXT_PUBLIC_SOLANA_WS` – WebSocket endpoint (default inferred from RPC)

`next.config.mjs` enables `transpilePackages` for the `@solana/*` packages so the hooks work with the
Next.js bundler. Tailwind CSS v4 is declared inside `app/globals.css` with `@import "tailwindcss";`
and `@source "./app/**/*.{ts,tsx}"` for class detection.

## Other scripts

```bash
pnpm --filter @solana/example-nextjs build      # next build
pnpm --filter @solana/example-nextjs start      # next start
pnpm --filter @solana/example-nextjs typecheck  # tsc --noEmit
pnpm --filter @solana/example-nextjs lint       # biome check app
```
