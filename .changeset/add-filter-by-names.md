---
"@solana/client": minor
---

Add `filterByNames` helper for wallet filtering with autoDiscover

- Added `filterByNames(...names: string[])` function that creates a filter for `autoDiscover()`
- Allows filtering wallet connectors by name without using wallet-specific connector functions
- Supports Wallet Standard's wallet-agnostic discovery pattern

Example usage:
```ts
import { autoDiscover, filterByNames } from '@solana/client';

// Filter to only specific wallets
const connectors = autoDiscover({
  filter: filterByNames('phantom', 'solflare', 'backpack')
});
```
