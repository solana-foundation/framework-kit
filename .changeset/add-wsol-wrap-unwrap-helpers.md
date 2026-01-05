---
"@solana/client": minor
"@solana/react-hooks": minor
---

Add wrapSol/unwrapSol helpers for wSOL operations

Adds helper functions to easily wrap native SOL into Wrapped SOL (wSOL) and unwrap it back:

**@solana/client:**
- `createWsolHelper(runtime)` - Factory function to create wSOL helpers
- `WsolHelper.sendWrap({ amount, authority })` - Wrap SOL to wSOL
- `WsolHelper.sendUnwrap({ authority })` - Unwrap wSOL back to SOL (closes the account)
- `WsolHelper.fetchWsolBalance(owner)` - Get wSOL balance
- `WsolHelper.deriveWsolAddress(owner)` - Derive the wSOL ATA address
- `WRAPPED_SOL_MINT` - The wSOL mint address constant
- `createWsolController()` - Controller for React integration

**@solana/react-hooks:**
- `useWrapSol()` - Hook for wrapping/unwrapping SOL with status tracking

Example usage:
```ts
// Using the client helper
const wsol = client.wsol;
await wsol.sendWrap({ amount: 1_000_000_000n, authority: session });
await wsol.sendUnwrap({ authority: session });

// Using the React hook
const { wrap, unwrap, balance, isWrapping, isUnwrapping } = useWrapSol();
await wrap({ amount: 1_000_000_000n });
await unwrap({});
```
