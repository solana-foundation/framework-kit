import type { BrowserContext } from '@playwright/test';
import type { WalletHarnessConfig, WalletSelectors } from '../types';
import { BaseWalletHarness } from './base';

/**
 * Solflare wallet selectors.
 */
const SOLFLARE_SELECTORS: WalletSelectors = {
	// Connection approval
	approveButton: 'button:has-text("Connect"), button:has-text("Approve")',
	rejectButton: 'button:has-text("Cancel"), button:has-text("Reject")',

	// Transaction approval
	approveTransactionButton: 'button:has-text("Approve"), button:has-text("Confirm")',
	rejectTransactionButton: 'button:has-text("Reject"), button:has-text("Cancel")',

	// Setup flow
	seedPhraseInput: 'textarea[placeholder*="phrase"], input[placeholder*="word"]',
	passwordInput: 'input[type="password"]',
	confirmButton: 'button:has-text("Continue"), button:has-text("Import"), button:has-text("Next")',

	// Banners to dismiss
	bannerDismiss: [
		'button[aria-label="Close"]',
		'button:has-text("Got it")',
		'button:has-text("Skip")',
		'button:has-text("Close")',
		'[data-testid="close-button"]',
	],
};

/**
 * Solflare wallet harness for E2E testing.
 */
export class SolflareHarness extends BaseWalletHarness {
	readonly type = 'solflare' as const;
	protected readonly selectors = SOLFLARE_SELECTORS;

	async setup(context: BrowserContext, config: WalletHarnessConfig): Promise<void> {
		const extensionPage = await context.newPage();

		// Solflare extension URL pattern
		await extensionPage.goto('chrome-extension://bhhhlbepdkbapadjdnnojkbgioiodbic/onboarding.html');

		try {
			await extensionPage.waitForLoadState('domcontentloaded');
			await this.dismissBanners(extensionPage);

			// Click "I already have a wallet" or "Access existing wallet"
			const existingWalletButton = extensionPage.locator(
				'button:has-text("I already have a wallet"), button:has-text("Access existing wallet")',
			);
			if (await existingWalletButton.isVisible({ timeout: 5000 })) {
				await existingWalletButton.click();
			}

			// Select "Recovery phrase" option
			const recoveryOption = extensionPage.locator(
				'button:has-text("Recovery phrase"), button:has-text("Seed phrase")',
			);
			if (await recoveryOption.isVisible({ timeout: 5000 })) {
				await recoveryOption.click();
			}

			// Enter seed phrase - Solflare may use individual word inputs
			const seedInput = extensionPage.locator(this.selectors.seedPhraseInput);
			const inputCount = await seedInput.count();

			if (inputCount === 1) {
				// Single textarea input
				await seedInput.fill(config.seedPhrase);
			} else if (inputCount > 1) {
				// Individual word inputs
				const words = config.seedPhrase.split(' ');
				for (let i = 0; i < Math.min(words.length, inputCount); i++) {
					await seedInput.nth(i).fill(words[i]);
				}
			}

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
			await extensionPage.waitForURL(/.*dashboard.*|.*wallet.*/, { timeout: 30000 }).catch(() => {});
		} finally {
			await extensionPage.close();
		}
	}
}

/**
 * Create a Solflare wallet harness instance.
 */
export function createSolflareHarness(): SolflareHarness {
	return new SolflareHarness();
}
