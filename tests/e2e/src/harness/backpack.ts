import type { BrowserContext } from '@playwright/test';
import type { WalletHarnessConfig, WalletSelectors } from '../types';
import { BaseWalletHarness } from './base';

/**
 * Backpack wallet selectors.
 */
const BACKPACK_SELECTORS: WalletSelectors = {
	// Connection approval
	approveButton: 'button:has-text("Connect"), button:has-text("Approve")',
	rejectButton: 'button:has-text("Deny"), button:has-text("Cancel")',

	// Transaction approval
	approveTransactionButton: 'button:has-text("Approve"), button:has-text("Confirm")',
	rejectTransactionButton: 'button:has-text("Reject"), button:has-text("Cancel")',

	// Setup flow
	seedPhraseInput: 'textarea[placeholder*="phrase"], input[placeholder*="recovery"]',
	passwordInput: 'input[type="password"]',
	confirmButton: 'button:has-text("Next"), button:has-text("Import"), button:has-text("Continue")',

	// Banners to dismiss
	bannerDismiss: [
		'button[aria-label="Close"]',
		'button:has-text("Got it")',
		'button:has-text("Skip")',
		'button:has-text("Dismiss")',
	],
};

/**
 * Backpack wallet harness for E2E testing.
 */
export class BackpackHarness extends BaseWalletHarness {
	readonly type = 'backpack' as const;
	protected readonly selectors = BACKPACK_SELECTORS;

	async setup(context: BrowserContext, config: WalletHarnessConfig): Promise<void> {
		const extensionPage = await context.newPage();

		// Backpack extension URL pattern
		await extensionPage.goto('chrome-extension://aflkmfkvkplnmpjfmgmklciillbpgpfo/options.html');

		try {
			await extensionPage.waitForLoadState('domcontentloaded');
			await this.dismissBanners(extensionPage);

			// Click "Import Wallet" or similar
			const importButton = extensionPage.locator(
				'button:has-text("Import Wallet"), button:has-text("I have a wallet")',
			);
			if (await importButton.isVisible({ timeout: 5000 })) {
				await importButton.click();
			}

			// Select Solana if multi-chain
			const solanaOption = extensionPage.locator('button:has-text("Solana"), [data-testid="solana-option"]');
			if (await solanaOption.isVisible({ timeout: 3000 })) {
				await solanaOption.click();
			}

			// Select "Recovery phrase" import method
			const recoveryOption = extensionPage.locator(
				'button:has-text("Recovery phrase"), button:has-text("Secret phrase")',
			);
			if (await recoveryOption.isVisible({ timeout: 5000 })) {
				await recoveryOption.click();
			}

			// Enter seed phrase
			const seedInput = extensionPage.locator(this.selectors.seedPhraseInput);
			await seedInput.waitFor({ state: 'visible', timeout: 10000 });
			await seedInput.fill(config.seedPhrase);

			await extensionPage.click(this.selectors.confirmButton);

			// Enter password if required
			if (config.password) {
				const passwordInputs = extensionPage.locator(this.selectors.passwordInput);
				const count = await passwordInputs.count();
				if (count > 0) {
					await passwordInputs.first().fill(config.password);
					if (count > 1) {
						await passwordInputs.nth(1).fill(config.password);
					}
					await extensionPage.click(this.selectors.confirmButton);
				}
			}

			// Wait for setup to complete
			await extensionPage.waitForURL(/.*\/home.*|.*\/wallet.*/, { timeout: 30000 }).catch(() => {});
		} finally {
			await extensionPage.close();
		}
	}
}

/**
 * Create a Backpack wallet harness instance.
 */
export function createBackpackHarness(): BackpackHarness {
	return new BackpackHarness();
}
