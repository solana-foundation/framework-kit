# @solana/web3-compat

Drop-in replacement for `@solana/web3.js`. Same API, powered by `@solana/kit`.

## Install

```bash
npm install @solana/web3-compat
```

## Quickstart

Swap the import:

```ts
// Before
import { Connection, PublicKey, Keypair } from "@solana/web3.js";

// After
import { Connection, PublicKey, Keypair } from "@solana/web3-compat";
```

That's it. Your existing code works as-is.

## Common Solana flows (copy/paste)

### Get balance

```ts
import { Connection, PublicKey } from "@solana/web3-compat";

const connection = new Connection("https://api.devnet.solana.com");
const balance = await connection.getBalance(
  new PublicKey("Fg6PaFpoGXkYsidMpWFKfwtz6DhFVyG4dL1x8kj7ZJup")
);
console.log(`Balance: ${balance / 1e9} SOL`);
```

### Get account info

```ts
const accountInfo = await connection.getAccountInfo(publicKey);
if (accountInfo) {
  console.log("Lamports:", accountInfo.lamports);
  console.log("Owner:", accountInfo.owner.toBase58());
  console.log("Data length:", accountInfo.data.length);
}
```

### Get latest blockhash

```ts
const { blockhash, lastValidBlockHeight } =
  await connection.getLatestBlockhash();
console.log("Blockhash:", blockhash);
```

### Send transaction

```ts
import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3-compat";

const connection = new Connection("https://api.devnet.solana.com");
const sender = Keypair.generate();
const recipient = Keypair.generate();

const { blockhash } = await connection.getLatestBlockhash();

const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: sender.publicKey,
    toPubkey: recipient.publicKey,
    lamports: 100_000_000, // 0.1 SOL
  })
);
transaction.recentBlockhash = blockhash;
transaction.feePayer = sender.publicKey;
transaction.sign(sender);

const signature = await connection.sendRawTransaction(transaction.serialize());
console.log("Signature:", signature);
```

### Confirm transaction

```ts
// Simple confirmation
const result = await connection.confirmTransaction(signature, "confirmed");
console.log("Confirmed:", result.value?.err === null);

// With blockhash strategy
const result = await connection.confirmTransaction(
  { signature, blockhash, lastValidBlockHeight },
  "confirmed"
);
```

### Get program accounts

```ts
const TOKEN_PROGRAM = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

const accounts = await connection.getProgramAccounts(TOKEN_PROGRAM, {
  filters: [{ dataSize: 165 }], // Token account size
});

accounts.forEach(({ pubkey, account }) => {
  console.log("Address:", pubkey.toBase58());
  console.log("Lamports:", account.lamports);
});
```

### Request airdrop

```ts
const signature = await connection.requestAirdrop(
  publicKey,
  1_000_000_000 // 1 SOL
);
await connection.confirmTransaction(signature);
console.log("Airdrop confirmed");
```

### Simulate transaction

```ts
const simulation = await connection.simulateTransaction(transaction);
console.log("Logs:", simulation.value.logs);
console.log("Error:", simulation.value.err);
```

### Get token accounts

```ts
const tokenAccounts = await connection.getTokenAccountsByOwner(ownerPublicKey, {
  programId: TOKEN_PROGRAM,
});

tokenAccounts.value.forEach(({ pubkey, account }) => {
  console.log("Token account:", pubkey.toBase58());
});
```

### WebSocket subscriptions

```ts
// Watch account changes
const subscriptionId = connection.onAccountChange(publicKey, (accountInfo) => {
  console.log("Account updated:", accountInfo.lamports);
});

// Later: unsubscribe
await connection.removeAccountChangeListener(subscriptionId);

// Watch slot changes
const slotSubscription = connection.onSlotChange((slotInfo) => {
  console.log("New slot:", slotInfo.slot);
});
```

## Migration to @solana/client

Access the underlying `SolanaClient` for gradual migration:

```ts
import { Connection } from "@solana/web3-compat";

const connection = new Connection("https://api.devnet.solana.com");

// Get the SolanaClient instance
const client = connection.client;

// Use @solana/client features
await client.actions.connectWallet("phantom");
const wallet = client.store.getState().wallet;
if (wallet.status === "connected") {
  console.log("Connected:", wallet.session.account.address);
}
```

## Bridge helpers

Convert between web3.js and Kit types:

```ts
import {
  toAddress,
  toPublicKey,
  toKitSigner,
  toWeb3Instruction,
} from "@solana/web3-compat";

// web3.js PublicKey → Kit Address
const address = toAddress(publicKey);

// Kit Address → web3.js PublicKey
const pubkey = toPublicKey(address);

// web3.js Keypair → Kit Signer
const signer = toKitSigner(keypair);

// Kit Instruction → web3.js TransactionInstruction
const instruction = toWeb3Instruction(kitInstruction);
```

## Notes

- Re-exports all `@solana/web3.js` types (`PublicKey`, `Keypair`, `Transaction`, etc.)
- Numeric fields coerced to `number` to match web3.js behavior
- `LAMPORTS_PER_SOL` and `sendAndConfirmTransaction` available as utilities

> **Future direction:** This package provides a migration path from `@solana/web3.js` to `@solana/kit`. Over time, more APIs will be deprecated in favor of Kit-native implementations. Use `connection.client` to gradually adopt `@solana/client` features.
