---
"@solana/react-hooks": patch
---

Improve transaction hooks documentation:
- Fix useTransactionPool: add required `authority` parameter to prevent runtime errors
- Add `sendSignature` and `sendError` to useTransactionPool example
- Add comprehensive list of available properties for both hooks
- Document useSendTransaction auto-detection behavior
