import type { BrowserContext } from '@playwright/test';
import type { WalletHarnessConfig, WalletSelectors } from '../types';
import { BaseWalletHarness } from './base';

/**
 * Phantom wallet selectors.
 * Using data-testid attributes where available for resilience.
 */
const PHANTOM_SELECTORS: WalletSelectors = {
	// Connection approval
	approveButton: '[data-testid="primary-button"], button:has-text("Connect")',
	rejectButton: '[data-testid="secondary-button"], button:has-text("Cancel")',

	// Transaction approval
	approveTransactionButton: '[data-testid="primary-button"], button:has-text("Approve")',
	rejectTransactionButton: '[data-testid="secondary-button"], button:has-text("Reject")',

	// Setup flow
	seedPhraseInput: '[data-testid="secret-recovery-phrase-input"], textarea[placeholder*="phrase"]',
	passwordInput: '[data-testid="password-input"], input[type="password"]',
	confirmButton: '[data-testid="primary-button"], button:has-text("Continue"), button:has-text("Import")',

	// Banners to dismiss
	bannerDismiss: [
		'[data-testid="dismiss-button"]',
		'button[aria-label="Close"]',
		'button:has-text("Got it")',
		'button:has-text("Skip")',
		'button:has-text("Maybe later")',
	],
};

/**
 * Phantom wallet harness for E2E testing.
 */
export class PhantomHarness extends BaseWalletHarness {
	readonly type = 'phantom' as const;
	protected readonly selectors = PHANTOM_SELECTORS;

	async setup(context: BrowserContext, config: WalletHarnessConfig): Promise<void> {
		// Open extension page
		const extensionPage = await context.newPage();

		// Phantom extension URL pattern
		// The actual extension ID will vary based on installation
		await extensionPage.goto('chrome-extension://bfnaelmomeimhlpmgjnjophhpkkoljpa/onboarding.html');

		try {
			// Wait for onboarding page to load
			await extensionPage.waitForLoadState('domcontentloaded');

			// Dismiss any initial banners
			await this.dismissBanners(extensionPage);

			// Click "I already have a wallet" or similar
			const importButton = extensionPage.locator('button:has-text("I already have a wallet")');
			if (await importButton.isVisible({ timeout: 5000 })) {
				await importButton.click();
			}

			// Click "Import Secret Recovery Phrase"
			const importPhraseButton = extensionPage.locator('button:has-text("Import Secret Recovery Phrase")');
			if (await importPhraseButton.isVisible({ timeout: 5000 })) {
				await importPhraseButton.click();
			}

			// Enter seed phrase
			const seedInput = extensionPage.locator(this.selectors.seedPhraseInput);
			await seedInput.waitFor({ state: 'visible', timeout: 10000 });
			await seedInput.fill(config.seedPhrase);

			// Click continue/import
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
 * Create a Phantom wallet harness instance.
 */
export function createPhantomHarness(): PhantomHarness {
	return new PhantomHarness();
}
