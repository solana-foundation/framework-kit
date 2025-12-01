# @solana/react-hooks

## 1.0.0

### Patch Changes

- [#60](https://github.com/solana-foundation/framework-kit/pull/60) [`606d41b`](https://github.com/solana-foundation/framework-kit/commit/606d41b5658e7091d91f565d768bf1380bc57ed2) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Persist wallet auto-connect preference coming from `connect()` options so provider defaults no longer override per-connection settings.

- [#61](https://github.com/solana-foundation/framework-kit/pull/61) [`0db2508`](https://github.com/solana-foundation/framework-kit/commit/0db25089c490f5c8f57c56960b0169fffee4e398) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Improve docs for all hooks, add SSR-safe connector hydration in `useWalletConnection`, and document client actions with JSDoc for clearer usage.

- [`1389fc6`](https://github.com/solana-foundation/framework-kit/commit/1389fc6c931359c287cd7663ee85d33a54fc8414) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Prep next release candidate with recent docs and hydration updates.

- Updated dependencies [[`606d41b`](https://github.com/solana-foundation/framework-kit/commit/606d41b5658e7091d91f565d768bf1380bc57ed2), [`0db2508`](https://github.com/solana-foundation/framework-kit/commit/0db25089c490f5c8f57c56960b0169fffee4e398), [`1389fc6`](https://github.com/solana-foundation/framework-kit/commit/1389fc6c931359c287cd7663ee85d33a54fc8414)]:
  - @solana/client@1.0.0

## 1.0.0-rc.2

### Patch Changes

- Prep next release candidate with recent docs and hydration updates.

- Updated dependencies []:
  - @solana/client@1.0.0-rc.2

## 1.0.0-rc.1

### Patch Changes

- Persist wallet auto-connect preference coming from `connect()` options so provider defaults no longer override per-connection settings.

- Updated dependencies []:
  - @solana/client@1.0.0-rc.1

## 1.0.0-rc.0

### Major Changes

- Release candidate for v1.0: simplified client config (cluster/rpc/websocket) and React provider defaults, plus streamlined Next.js example demonstrating wallet connect, SOL transfer, and memo send with @solana/react-hooks.

### Patch Changes

- Updated dependencies []:
  - @solana/client@1.0.0-rc.0

## 0.5.1

### Patch Changes

- [#55](https://github.com/solana-foundation/framework-kit/pull/55) [`42e612f`](https://github.com/solana-foundation/framework-kit/commit/42e612ffb6a0d7f087b8e336ecab74749558a030) Thanks [@beharefe](https://github.com/beharefe)! - centralize shared dependency versions using pnpm catalogs

- Updated dependencies [[`42e612f`](https://github.com/solana-foundation/framework-kit/commit/42e612ffb6a0d7f087b8e336ecab74749558a030)]:
  - @solana/client@0.2.3

## 0.5.0

### Minor Changes

- [#50](https://github.com/solana-foundation/framework-kit/pull/50) [`6c3475b`](https://github.com/solana-foundation/framework-kit/commit/6c3475bf8b42ff1587b6f8b76b5cf7feccb1bda2) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Standardize exported type aliases for actions/hooks, align the React query defaults with SWR v2, and remove legacy deprecated alias exports to simplify the public surface.

### Patch Changes

- Updated dependencies [[`6c3475b`](https://github.com/solana-foundation/framework-kit/commit/6c3475bf8b42ff1587b6f8b76b5cf7feccb1bda2)]:
  - @solana/client@0.2.2

## 0.4.0

### Minor Changes

- [#48](https://github.com/solana-foundation/framework-kit/pull/48) [`1ae58f4`](https://github.com/solana-foundation/framework-kit/commit/1ae58f4fab5eff516f582efa3e66d4d075b3e94d) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Standardize SWR hook ergonomics: namespace SWR options under `swr`, add query key helpers, export parameter/return aliases, and align read/mutation hooks to the new patterns.

## 0.3.0

### Minor Changes

- [#43](https://github.com/solana-foundation/framework-kit/pull/43) [`88390a3`](https://github.com/solana-foundation/framework-kit/commit/88390a3cd7e9ef645acf7ac3d89d7caf0f59eba6) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Remove the Wallet Standard hook exports in favor of connector-driven flows. `useWalletConnection` prefers client-registered connectors and only falls back to discovery when none are configured; signing is done via connector-provided session methods instead of Wallet Standard packages.

- [#43](https://github.com/solana-foundation/framework-kit/pull/43) [`f602b64`](https://github.com/solana-foundation/framework-kit/commit/f602b6477250b85f9ff9ada2880a3ff49126c5f4) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Default wallet connection hooks to client-configured connectors and update examples to use connector factories.

### Patch Changes

- [#43](https://github.com/solana-foundation/framework-kit/pull/43) [`081cf6d`](https://github.com/solana-foundation/framework-kit/commit/081cf6d7f374f235222d5d18ac272c311b992d13) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Wire serializable state persistence into SolanaProvider for shared SSR hydration and auto-connect.

- Updated dependencies [[`081cf6d`](https://github.com/solana-foundation/framework-kit/commit/081cf6d7f374f235222d5d18ac272c311b992d13)]:
  - @solana/client@0.2.1

## 0.2.5

### Patch Changes

- Updated dependencies [[`d70e7d6`](https://github.com/solana-foundation/framework-kit/commit/d70e7d623e40fbfe5b82d3e08e7bd1d35d6c44d0), [`b899ca6`](https://github.com/solana-foundation/framework-kit/commit/b899ca648d7cdd8761af55986723fb1bce73f055)]:
  - @solana/client@0.2.0

## 0.2.4

### Patch Changes

- Updated dependencies [[`114c7a1`](https://github.com/solana-foundation/framework-kit/commit/114c7a16b73e11f40387e4bd10c79afc50229b46)]:
  - @solana/client@0.1.4

## 0.2.3

### Patch Changes

- Updated dependencies [[`0a4f856`](https://github.com/solana-foundation/framework-kit/commit/0a4f8564aadb0fa6f090eeb96b284b8634397d89)]:
  - @solana/client@0.1.3

## 0.2.2

### Patch Changes

- [#17](https://github.com/solana-foundation/framework-kit/pull/17) [`f71f75b`](https://github.com/solana-foundation/framework-kit/commit/f71f75be306aa86dbab3d1a1c76a00cadb4f08a0) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Add opt-in Suspense support for account, balance, and SPL token hooks via the shared query suspense preference.

- Updated dependencies [[`5fef840`](https://github.com/solana-foundation/framework-kit/commit/5fef8403efb0c41d386bae7eaa2a504707dae7ca)]:
  - @solana/client@0.1.2

## 0.2.1

### Patch Changes

- Updated dependencies [[`5efbada`](https://github.com/solana-foundation/framework-kit/commit/5efbada1dada1340632f14b87f3f0e958bc263fa)]:
  - @solana/client@0.1.1

## 0.2.0

### Minor Changes

- [#8](https://github.com/solana-foundation/framework-kit/pull/8) [`7ff0fa5`](https://github.com/solana-foundation/framework-kit/commit/7ff0fa57e2026ca8f5cdaf5e612327e1c6c30ed2) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Mark the package entry point and context providers as Client Components so Next.js always loads the client runtime.

## 0.1.0

### Minor Changes

- [`e63f7b6`](https://github.com/solana-foundation/framework-kit/commit/e63f7b600d065c14b52c6690b7ed4ada0c0ba0b5) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Upgrades to the hooks, new core transaction engine, auto-reconnect wallets

### Patch Changes

- Updated dependencies [[`e63f7b6`](https://github.com/solana-foundation/framework-kit/commit/e63f7b600d065c14b52c6690b7ed4ada0c0ba0b5)]:
  - @solana/client@0.1.0

## 0.0.2

### Patch Changes

- Updated dependencies [[`4e20e71`](https://github.com/solana-foundation/framework-kit/commit/4e20e719a1c39ac5d3d1b6c2c1a8979a777b9e56)]:
  - @solana/client@0.0.2
