# @solana/react-hooks

## 1.0.0

### Major Changes

- [#43](https://github.com/solana-foundation/framework-kit/pull/43) [`88390a3`](https://github.com/solana-foundation/framework-kit/commit/88390a3cd7e9ef645acf7ac3d89d7caf0f59eba6) Thanks [@GuiBibeau](https://github.com/GuiBibeau)! - Remove the Wallet Standard hook exports in favor of connector-driven flows. `useWalletConnection` prefers client-registered connectors and only falls back to discovery when none are configured; signing is done via connector-provided session methods instead of Wallet Standard packages.

### Minor Changes

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
