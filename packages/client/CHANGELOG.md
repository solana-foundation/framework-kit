# @solana/client

## 0.2.1

### Patch Changes

- [#43](https://github.com/solana-foundation/framework-kit/pull/43) [`081cf6d`](https://github.com/solana-foundation/framework-kit/commit/081cf6d7f374f235222d5d18ac272c311b992d13) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Wire serializable state persistence into SolanaProvider for shared SSR hydration and auto-connect.

## 0.2.0

### Minor Changes

- [#42](https://github.com/solana-foundation/framework-kit/pull/42) [`d70e7d6`](https://github.com/solana-foundation/framework-kit/commit/d70e7d623e40fbfe5b82d3e08e7bd1d35d6c44d0) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Add typed Parameters/ReturnType aliases and client-first wrapper exports for all public actions.

### Patch Changes

- [#40](https://github.com/solana-foundation/framework-kit/pull/40) [`b899ca6`](https://github.com/solana-foundation/framework-kit/commit/b899ca648d7cdd8761af55986723fb1bce73f055) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Add Wallet Standard connector factories (`autoDiscover`, `injected`, `phantom/solflare/backpack`), expose them via `@solana/client/connectors`, and cover metadata/dedup with tests.

## 0.1.4

### Patch Changes

- [#36](https://github.com/solana-foundation/framework-kit/pull/36) [`114c7a1`](https://github.com/solana-foundation/framework-kit/commit/114c7a16b73e11f40387e4bd10c79afc50229b46) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Add SerializableSolanaState wiring: createClient accepts initialState, serialization helpers (serialize/deserialize/subscribe), and tests for hydration/persistence snapshots.

## 0.1.3

### Patch Changes

- [#32](https://github.com/solana-foundation/framework-kit/pull/32) [`0a4f856`](https://github.com/solana-foundation/framework-kit/commit/0a4f8564aadb0fa6f090eeb96b284b8634397d89) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Harden Wallet Standard connectors: add a `kind` field, stable `wallet-standard:<name>` ids, optional `ready` metadata, and tests for metadata/deduplication.

## 0.1.2

### Patch Changes

- [`5fef840`](https://github.com/solana-foundation/framework-kit/commit/5fef8403efb0c41d386bae7eaa2a504707dae7ca) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Add SerializableSolanaState helpers for hydration/persistence and include an optional ready flag on WalletConnector metadata (set for Wallet Standard connectors).

## 0.1.1

### Patch Changes

- [#10](https://github.com/solana-foundation/framework-kit/pull/10) [`5efbada`](https://github.com/solana-foundation/framework-kit/commit/5efbada1dada1340632f14b87f3f0e958bc263fa) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Stop logging cluster connection details when the client marks a cluster as ready.

## 0.1.0

### Minor Changes

- [`e63f7b6`](https://github.com/solana-foundation/framework-kit/commit/e63f7b600d065c14b52c6690b7ed4ada0c0ba0b5) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Upgrades to the hooks, new core transaction engine, auto-reconnect wallets

## 0.0.2

### Patch Changes

- [`4e20e71`](https://github.com/solana-foundation/framework-kit/commit/4e20e719a1c39ac5d3d1b6c2c1a8979a777b9e56) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - initial publishing
