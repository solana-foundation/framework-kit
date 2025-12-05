---
"@solana/client": patch
"@solana/react-hooks": patch
---

Optimize bundle size and switch to ESM-only distribution

- Remove all CommonJS builds, ship ESM-only with .mjs extensions
- Enable minification for browser and React Native builds (51% size reduction)
- Browser bundles reduced: @solana/client 128KB → 62.5KB, @solana/react-hooks 41KB → 20KB
- Keep Node.js builds unminified for easier debugging
- Externalize sourcemaps and exclude from npm packages
- Add size-limit for bundle size tracking and CI enforcement
- Update TypeScript configuration to use bundler module resolution for ESM compatibility
