---
"@solana/react-hooks": patch
---

Fix useBalance and useAccount hooks to handle invalid addresses gracefully instead of crashing. Invalid addresses now return an error state and log a warning to the console, improving developer experience when handling untrusted address inputs.
