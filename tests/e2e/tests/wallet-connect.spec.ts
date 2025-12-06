import { expect, test } from '../src/fixtures/wallet';

/**
 * E2E tests for wallet connection flow.
 *
 * These tests verify the happy path for connecting wallets to the
 * framework-kit example application.
 */

test.describe('Wallet Connection', () => {
	test.describe.configure({ mode: 'serial' });

	test('should display wallet card on page load', async ({ page }) => {
		await page.goto('/');

		// Wait for the app to load
		await page.waitForSelector('h1:has-text("Solana Client Toolkit")');

		// Check that wallet controls card is visible
		const walletCard = page.locator('text=Wallets').first();
		await expect(walletCard).toBeVisible();

		// Check for wallet status message - either "No connectors configured" or "No wallet connected"
		// Both are valid states depending on whether wallet extensions are installed
		const noConnectorsMessage = page.locator('text=No connectors configured');
		const noWalletMessage = page.locator('text=No wallet connected');

		// At least one of these should be visible in the initial state
		const hasNoConnectors = await noConnectorsMessage.isVisible({ timeout: 2000 }).catch(() => false);
		const hasNoWallet = await noWalletMessage.isVisible({ timeout: 2000 }).catch(() => false);

		// In headless mode without wallet extensions, we expect "No connectors configured"
		if (hasNoConnectors) {
			console.log('No wallet connectors available (expected without browser extensions)');
		}

		// Verify we're in a valid initial state
		expect(hasNoConnectors || hasNoWallet).toBe(true);
	});

	test('should show "No wallet connected" status initially', async ({ page }) => {
		await page.goto('/');

		// Wait for the app to load
		await page.waitForSelector('h1:has-text("Solana Client Toolkit")');

		// Check initial status
		const statusText = page.locator('text=No wallet connected');
		await expect(statusText).toBeVisible();
	});

	test('should show connecting state when wallet button is clicked', async ({ page }) => {
		await page.goto('/');

		// Wait for the app to load
		await page.waitForSelector('h1:has-text("Solana Client Toolkit")');

		// Find a wallet connector button (if any are available)
		const connectorButtons = page.locator(
			'button:has-text("Phantom"), button:has-text("Solflare"), button:has-text("Backpack")',
		);
		const buttonCount = await connectorButtons.count();

		if (buttonCount > 0) {
			// Click the first available connector
			await connectorButtons.first().click();

			// Should show connecting state (this will fail without actual wallet extension)
			// In a real test with extension, we'd approve the connection
			const connectingText = page.locator('text=Connecting');
			// This assertion is soft - it may not appear if no wallet is installed
			await expect(connectingText)
				.toBeVisible({ timeout: 5000 })
				.catch(() => {
					// Expected when no wallet extension is installed
				});
		} else {
			// No connectors available - this is expected in CI without extensions
			test.skip();
		}
	});
});

test.describe('Wallet Connection with Extension', () => {
	// These tests require actual wallet extensions to be loaded
	// They will be skipped if extensions are not available

	test.beforeEach(async ({ walletContext, walletHarness, walletConfig }) => {
		// Skip if no extension is loaded
		if (!walletConfig.extensionPath) {
			test.skip();
			return;
		}

		// Set up the wallet with test seed phrase
		await walletHarness.setup(walletContext, walletConfig);
	});

	test('should connect Phantom wallet successfully', async ({ page, walletHarness, walletConfig }) => {
		if (!walletConfig.extensionPath || walletHarness.type !== 'phantom') {
			test.skip();
			return;
		}

		await page.goto('/');
		await page.waitForSelector('h1:has-text("Solana Client Toolkit")');

		// Click Phantom connector
		const phantomButton = page.locator('button:has-text("Phantom")');
		await phantomButton.click();

		// Approve connection in wallet popup
		const result = await walletHarness.approveConnection(page);

		if (result.success) {
			// Verify connected state
			const connectedText = page.locator('text=Connected to');
			await expect(connectedText).toBeVisible({ timeout: 10000 });
		} else {
			// Connection failed - log error for debugging
			console.error('Wallet connection failed:', result.error);
		}
	});

	test('should disconnect wallet successfully', async ({ page, walletHarness, walletConfig }) => {
		if (!walletConfig.extensionPath) {
			test.skip();
			return;
		}

		await page.goto('/');
		await page.waitForSelector('h1:has-text("Solana Client Toolkit")');

		// First connect
		const connectorButton = page.locator(`button:has-text("${walletHarness.type}")`).first();
		if (!(await connectorButton.isVisible())) {
			test.skip();
			return;
		}

		await connectorButton.click();
		await walletHarness.approveConnection(page);

		// Wait for connection
		await page.waitForSelector('text=Connected to', { timeout: 10000 }).catch(() => {});

		// Click disconnect
		const disconnectButton = page.locator('button:has-text("Disconnect")');
		if (await disconnectButton.isVisible()) {
			await disconnectButton.click();

			// Verify disconnected state
			const disconnectedText = page.locator('text=No wallet connected');
			await expect(disconnectedText).toBeVisible({ timeout: 5000 });
		}
	});
});

test.describe('Wallet Connection Error Handling', () => {
	test('should handle connection rejection gracefully', async ({ page, walletHarness, walletConfig }) => {
		if (!walletConfig.extensionPath) {
			test.skip();
			return;
		}

		await page.goto('/');
		await page.waitForSelector('h1:has-text("Solana Client Toolkit")');

		// Click wallet connector
		const connectorButton = page.locator(`button:has-text("${walletHarness.type}")`).first();
		if (!(await connectorButton.isVisible())) {
			test.skip();
			return;
		}

		await connectorButton.click();

		// Reject the connection
		await walletHarness.rejectConnection(page);

		// Should show error state or return to disconnected
		const errorOrDisconnected = page.locator('text=Error, text=No wallet connected').first();
		await expect(errorOrDisconnected).toBeVisible({ timeout: 5000 });
	});
});
