# @solana/client

## 1.1.3

### Patch Changes

- [#83](https://github.com/solana-foundation/framework-kit/pull/83) [`c6c8955`](https://github.com/solana-foundation/framework-kit/commit/c6c8955345d5f3a334b9324fb224abbb95880e3d) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Optimize bundle size and switch to ESM-only distribution

  - Remove all CommonJS builds, ship ESM-only with .mjs extensions
  - Enable minification for browser and React Native builds (51% size reduction)
  - Browser bundles reduced: @solana/client 128KB → 62.5KB, @solana/react-hooks 41KB → 20KB
  - Keep Node.js builds unminified for easier debugging
  - Externalize sourcemaps and exclude from npm packages
  - Add size-limit for bundle size tracking and CI enforcement
  - Update TypeScript configuration to use bundler module resolution for ESM compatibility

## 1.1.2

### Patch Changes

- [#80](https://github.com/solana-foundation/framework-kit/pull/80) [`bf7ef1d`](https://github.com/solana-foundation/framework-kit/commit/bf7ef1d49ec1c47ec437217139bff3446021c37c) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Add test coverage reporting, optimize CI performance, and enhance README with hero image and badges. Includes Codecov integration, GitHub Actions cache for Turbo, and centered badge layout showcasing npm versions, bundle sizes, and download counts for both packages.

## 1.1.1

### Patch Changes

- [#78](https://github.com/solana-foundation/framework-kit/pull/78) [`56f50bf`](https://github.com/solana-foundation/framework-kit/commit/56f50bfac04fdce5ad37cf81d1d9c28fc2b5ab56) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Fix typecheck to rebuild dependencies first, preventing stale type definition errors

## 1.1.0

### Minor Changes

- [#73](https://github.com/solana-foundation/framework-kit/pull/73) [`870616b`](https://github.com/solana-foundation/framework-kit/commit/870616bb9a1f658f96f427d63f239b094a71cb92) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - - Staking helpers and hooks from @leandrogavidia
  - getAddressLookupTable and getNonce from @meowyx
  - fix autoconnect bug reported in documentation
  - Fix a few types to get typechecks in CI.
  - Enable typecheck in CI/CD

## 1.0.1

### Patch Changes

- [#67](https://github.com/solana-foundation/framework-kit/pull/67) [`19a98ee`](https://github.com/solana-foundation/framework-kit/commit/19a98eee8497d1f527119d9403d5140a6f2d89b0) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Refresh README to mirror react-hooks structure with quickstart, copy/paste flows, and updated notes/scripts.

## 1.0.0

### Patch Changes

- [#60](https://github.com/solana-foundation/framework-kit/pull/60) [`606d41b`](https://github.com/solana-foundation/framework-kit/commit/606d41b5658e7091d91f565d768bf1380bc57ed2) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Persist wallet auto-connect preference coming from `connect()` options so provider defaults no longer override per-connection settings.

- [#61](https://github.com/solana-foundation/framework-kit/pull/61) [`0db2508`](https://github.com/solana-foundation/framework-kit/commit/0db25089c490f5c8f57c56960b0169fffee4e398) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Improve docs for all hooks, add SSR-safe connector hydration in `useWalletConnection`, and document client actions with JSDoc for clearer usage.

- [`1389fc6`](https://github.com/solana-foundation/framework-kit/commit/1389fc6c931359c287cd7663ee85d33a54fc8414) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Prep next release candidate with recent docs and hydration updates.

## 1.0.0-rc.2

### Patch Changes

- Prep next release candidate with recent docs and hydration updates.

## 1.0.0-rc.1

### Patch Changes

- Persist wallet auto-connect preference coming from `connect()` options so provider defaults no longer override per-connection settings.

## 1.0.0-rc.0

### Major Changes

- Release candidate for v1.0: simplified client config (cluster/rpc/websocket) and React provider defaults, plus streamlined Next.js example demonstrating wallet connect, SOL transfer, and memo send with @solana/react-hooks.

## 0.2.3

### Patch Changes

- [#55](https://github.com/solana-foundation/framework-kit/pull/55) [`42e612f`](https://github.com/solana-foundation/framework-kit/commit/42e612ffb6a0d7f087b8e336ecab74749558a030) Thanks [@beharefe](https://github.com/beharefe)! - centralize shared dependency versions using pnpm catalogs

## 0.2.2

### Patch Changes

- [#50](https://github.com/solana-foundation/framework-kit/pull/50) [`6c3475b`](https://github.com/solana-foundation/framework-kit/commit/6c3475bf8b42ff1587b6f8b76b5cf7feccb1bda2) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Standardize exported type aliases for actions/hooks, align the React query defaults with SWR v2, and remove legacy deprecated alias exports to simplify the public surface.

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
