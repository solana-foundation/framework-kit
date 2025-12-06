import * as path from 'node:path';
import { type BrowserContext, test as base, chromium } from '@playwright/test';
import { createWalletHarness } from '../harness';
import type { WalletHarness, WalletHarnessConfig, WalletType } from '../types';

/**
 * Test seed phrase for E2E testing.
 * WARNING: Never use this for real funds. This is a well-known test phrase.
 */
const TEST_SEED_PHRASE =
	'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

/**
 * Default password for test wallets.
 */
const TEST_PASSWORD = 'TestPassword123!';

/**
 * Extended test fixtures for wallet E2E testing.
 */
export interface WalletTestFixtures {
	/** Browser context with wallet extension loaded. */
	walletContext: BrowserContext;
	/** Wallet harness for the current test. */
	walletHarness: WalletHarness;
	/** Configuration used for wallet setup. */
	walletConfig: WalletHarnessConfig;
}

/**
 * Options for wallet test configuration.
 */
export interface WalletTestOptions {
	/** Which wallet to test. */
	walletType: WalletType;
	/** Path to wallet extension directory. */
	extensionPath: string;
}

/**
 * Create Playwright test with wallet fixtures.
 */
export const test = base.extend<WalletTestFixtures, WalletTestOptions>({
	// Worker-scoped options
	walletType: ['phantom', { option: true, scope: 'worker' }],
	extensionPath: ['', { option: true, scope: 'worker' }],

	// Test-scoped fixtures
	walletConfig: async ({ extensionPath }, use) => {
		const config: WalletHarnessConfig = {
			extensionPath,
			seedPhrase: TEST_SEED_PHRASE,
			password: TEST_PASSWORD,
		};
		await use(config);
	},

	walletHarness: async ({ walletType }, use) => {
		const harness = createWalletHarness(walletType);
		await use(harness);
	},

	walletContext: async ({ walletType, extensionPath }, use) => {
		// Skip if no extension path provided
		if (!extensionPath) {
			console.warn(`No extension path provided for ${walletType}, skipping wallet context setup`);
			const context = await chromium.launchPersistentContext('', {});
			await use(context);
			await context.close();
			return;
		}

		// Launch browser with extension
		const context = await chromium.launchPersistentContext('', {
			headless: false, // Extensions require headed mode
			args: [
				`--disable-extensions-except=${extensionPath}`,
				`--load-extension=${extensionPath}`,
				'--no-first-run',
				'--disable-default-apps',
			],
		});

		await use(context);
		await context.close();
	},
});

export { expect } from '@playwright/test';

/**
 * Get the extension path for a wallet type.
 * Extensions should be downloaded to tests/e2e/extensions/{wallet}/
 */
export function getExtensionPath(walletType: WalletType): string {
	const extensionsDir = path.resolve(__dirname, '../../extensions');
	return path.join(extensionsDir, walletType);
}
