# `@solana/web3-compat`

Phase 0 of a backwards‑compatible surface that lets existing `@solana/web3.js`
code run on top of Kit primitives.

This package is designed to help migrate from web3.js to Kit.

The goal of this release is **zero breaking changes** for applications that only
touch the subset of web3.js APIs listed below. There will be future releases that slowly
implement breaking changes as they move over to Kit primitives and intuitions.

## Migrating from `@solana/web3.js`

The migration process is straightforward and can be done incrementally:

### Install the compatibility package

```bash
pnpm add @solana/web3-compat
```

Make sure you also have the required Kit peer dependencies:

```bash
pnpm add @solana/kit @solana/client
```

### Update your imports

Replace your web3.js imports with the compatibility layer. Both import styles are supported:

#### Named imports (TypeScript/ES6 style)

**Before:**

```ts
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
```

**After:**

```ts
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3-compat";
```

#### Namespace imports

**Before:**

```js
const solanaWeb3 = require("@solana/web3.js");
const connection = new solanaWeb3.Connection(
  "https://api.mainnet-beta.solana.com"
);
```

**After:**

```js
const solanaWeb3 = require("@solana/web3-compat");
const connection = new solanaWeb3.Connection(
  "https://api.mainnet-beta.solana.com"
);
```

Or with ES6 modules:

```ts
import * as solanaWeb3 from "@solana/web3-compat";
```

### (Optional): Leverage Kit features

You can gradually adopt Kit primitives alongside the compatibility layer using bridge helpers:

```ts
import { toAddress, toPublicKey, toKitSigner } from "@solana/web3-compat";

// Convert between web3.js and Kit types
const web3PublicKey = new PublicKey("11111111111111111111111111111111");
const kitAddress = toAddress(web3PublicKey);

// Convert back if needed
const backToWeb3 = toPublicKey(kitAddress);
```

### Migration checklist

- [ ] Install `@solana/web3-compat` and Kit dependencies
- [ ] Update import statements from `@solana/web3.js` to `@solana/web3-compat`
- [ ] Test your application
- [ ] Keep legacy `@solana/web3.js` for any unimplemented methods (see limitations below)

## Implemented in Phase 0

- `Connection` backed by Kit with support for:
  - `getLatestBlockhash`
  - `getBalance`
  - `getAccountInfo`
  - `getProgramAccounts`
  - `getSignatureStatuses`
  - `sendRawTransaction`
  - `confirmTransaction`
  - `simulateTransaction`
- Bridge helpers re-exported from `@solana/compat`:
  - `toAddress`, `toPublicKey`, `toWeb3Instruction`, `toKitSigner`
- Programs:
  - `SystemProgram.transfer` (manual u8/u64 little‑endian encoding)
- Utilities:
  - `LAMPORTS_PER_SOL`
  - `compileFromCompat`
  - `sendAndConfirmTransaction`
- Re‑exports of all Web3 primitives (`PublicKey`, `Keypair`, `Transaction`,
  `VersionedTransaction`, `TransactionInstruction`, etc)

## Running package locally

### Building the package

```bash
# Build TypeScript definitions
pnpm --filter @solana/web3-compat build

# Or build components separately
pnpm --filter @solana/web3-compat compile:js
pnpm --filter @solana/web3-compat compile:typedefs
```

### Running tests

```bash
# Run all tests
pnpm --filter @solana/web3-compat test
```

## Known limitations & edge cases

Phase 0 does not fully replace web3.js. Notable gaps:

- Only the Connection methods listed above are implemented. Any other Web3 call
  (e.g. `getTransaction`, subscriptions, `requestAirdrop`) still needs the
  legacy connection for now
- `getProgramAccounts` currently returns just the value array even when
  `withContext: true` is supplied
- Account data is decoded from `base64` only. Other encodings such as
  `jsonParsed` or `base64+zstd` are passed through to Kit but not post‑processed
- Numeric fields are coerced to JavaScript `number`s to match Web3 behaviour,
  which means values above `Number.MAX_SAFE_INTEGER` will lose precision (which is how it
  currently works)
- The compatibility layer does not yet try to normalise websocket connection
  options or retry policies that web3.js exposes

Future phases will expand coverage and introduce intentional
breaking changes once users have an easy migration path.
