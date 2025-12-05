---
"@solana/client": patch
"@solana/react-hooks": patch
---

Exclude JavaScript sourcemaps from npm packages to reduce bundle size

- Updated `files` field in package.json to explicitly exclude .mjs.map files
- TypeScript declaration maps (.d.ts.map) are still included for "Go to Definition" support
- Package size reduced: @solana/client 273.9KB → 85.4KB (69% reduction)
- Package size reduced: @solana/react-hooks size also reduced significantly
- Improves install times and reduces disk usage with no DX impact
