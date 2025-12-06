# E2E Testing Package

End-to-end testing suite for framework-kit wallet connections using Playwright.

## Overview

This package provides E2E tests for verifying wallet connection flows with real browser extensions (Phantom, Solflare, Backpack). It includes:

- **Wallet Harness Abstraction**: Resilient interface for wallet interactions that handles UI changes
- **Playwright Fixtures**: Custom test fixtures for wallet-enabled browser contexts
- **Happy Path Tests**: Core wallet connection and disconnection flows

## Prerequisites

- Node.js ≥ 24
- pnpm ≥ 10.20.0
- Chrome/Chromium browser
- Wallet browser extensions (for full E2E tests)

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Install Playwright browsers:

```bash
pnpm exec playwright install chromium
```

3. (Optional) Set up wallet extensions for full E2E testing:

```bash
pnpm download-extensions
```

Follow the instructions to manually copy extension files.

## Running Tests

### Basic Tests (No Extensions Required)

These tests verify the UI without actual wallet connections:

```bash
pnpm test
```

### Full E2E Tests (Extensions Required)

With wallet extensions set up:

```bash
pnpm test:headed
```

### Debug Mode

```bash
pnpm test:debug
```

### UI Mode

```bash
pnpm test:ui
```

## Project Structure

```
tests/e2e/
├── src/
│   ├── types.ts              # TypeScript types
│   ├── index.ts              # Public exports
│   ├── harness/              # Wallet harness implementations
│   │   ├── base.ts           # Base harness class
│   │   ├── phantom.ts        # Phantom-specific harness
│   │   ├── solflare.ts       # Solflare-specific harness
│   │   ├── backpack.ts       # Backpack-specific harness
│   │   └── index.ts          # Harness exports
│   └── fixtures/
│       └── wallet.ts         # Playwright test fixtures
├── tests/
│   └── wallet-connect.spec.ts  # Wallet connection tests
├── extensions/               # Downloaded wallet extensions (gitignored)
├── scripts/
│   └── download-extensions.ts  # Extension download helper
├── playwright.config.ts      # Playwright configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Writing Tests

### Using Wallet Fixtures

```typescript
import { test, expect } from '../src/fixtures/wallet';

test('should connect wallet', async ({ page, walletHarness, walletConfig }) => {
    await page.goto('/');
    
    // Click connect button in your app
    await page.click('button:has-text("Connect Wallet")');
    
    // Approve connection in wallet popup
    const result = await walletHarness.approveConnection(page);
    
    expect(result.success).toBe(true);
});
```

### Handling Wallet UI Changes

The harness abstraction uses resilient selectors (data-testid, aria-labels) and includes banner dismissal logic. If a wallet updates its UI:

1. Update the selectors in the corresponding harness file
2. Add new banner dismiss selectors if needed
3. Test with the updated extension

## CI Integration

E2E tests run in CI with the following considerations:

- Basic UI tests run without extensions
- Full wallet tests are skipped in CI unless extensions are available
- Tests use `--headed` mode (required for extensions)

## Troubleshooting

### Extension Not Loading

- Ensure the extension directory contains `manifest.json` at the root
- Check that the extension version is compatible with your Chrome version
- Try updating the extension to the latest version

### Popup Not Appearing

- Wallet popups may be blocked; check browser settings
- Increase timeout values in the harness configuration
- Use `test:debug` mode to step through the test

### Selectors Not Working

- Wallet UIs change frequently; update selectors in harness files
- Use Playwright's inspector to find new selectors
- Consider contributing selector updates back to the project

## Contributing

When adding new wallet support:

1. Create a new harness in `src/harness/`
2. Add the wallet type to `src/types.ts`
3. Update `src/harness/index.ts` with the new harness
4. Add tests for the new wallet
5. Update this README with setup instructions
