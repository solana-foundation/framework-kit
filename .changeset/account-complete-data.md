---
"@solana/client": minor
---

Add `owner` and `executable` fields to `AccountCacheEntry` type. The `useAccount` hook and account watchers now populate these fields from the RPC response, providing complete account metadata.
