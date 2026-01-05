---
"@solana/react-hooks": patch
---

Fix useAccount hook to default `fetch` and `watch` options to `true`, matching the behavior of useBalance. This ensures account data is fetched and watched automatically without requiring explicit options.
