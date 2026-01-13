---
"@solana/client": minor
"@solana/react-hooks": minor
---

Add Token 2022 (Token Extensions) program support to SPL token helper.

- New `tokenProgram: 'auto'` option to auto-detect mint program ownership
- Explicit Token 2022 program address support via `tokenProgram` config
- Export `TOKEN_2022_PROGRAM_ADDRESS` and `detectTokenProgram` utility
- Backwards compatible - existing code continues to work unchanged
