---
"@solana/react-hooks": minor
---

Add `isReady` flag to `useWalletConnection` hook for SSR hydration support. This flag indicates when client-side hydration is complete and wallet data is available, allowing consumers to show a placeholder until the hook is ready and prevent hydration mismatches.
