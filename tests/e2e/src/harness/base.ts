import type { BrowserContext, Page } from '@playwright/test';
import type { WalletConnectionResult, WalletHarness, WalletHarnessConfig, WalletSelectors, WalletType } from '../types';

/**
 * Default timeout for wallet UI interactions (ms).
 */
const DEFAULT_TIMEOUT = 30_000;

/**
 * Base implementation of WalletHarness with common functionality.
 * Wallet-specific implementations should extend this class.
 */
export abstract class BaseWalletHarness implements WalletHarness {
	abstract readonly type: WalletType;
	protected abstract readonly selectors: WalletSelectors;
	protected extensionId: string | null = null;

	abstract setup(context: BrowserContext, config: WalletHarnessConfig): Promise<void>;

	async approveConnection(page: Page): Promise<WalletConnectionResult> {
		try {
			const popup = await this.waitForPopup(page);
			if (!popup) {
				return { success: false, error: 'Wallet popup not found' };
			}

			await this.dismissBanners(popup);
			await popup.click(this.selectors.approveButton, { timeout: DEFAULT_TIMEOUT });

			// Wait for popup to close
			await popup.waitForEvent('close', { timeout: DEFAULT_TIMEOUT }).catch(() => {});

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error during connection approval',
			};
		}
	}

	async rejectConnection(page: Page): Promise<void> {
		const popup = await this.waitForPopup(page);
		if (!popup) {
			throw new Error('Wallet popup not found');
		}

		await this.dismissBanners(popup);
		await popup.click(this.selectors.rejectButton, { timeout: DEFAULT_TIMEOUT });
	}

	async approveTransaction(page: Page): Promise<void> {
		const popup = await this.waitForPopup(page);
		if (!popup) {
			throw new Error('Wallet popup not found');
		}

		await this.dismissBanners(popup);
		await popup.click(this.selectors.approveTransactionButton, { timeout: DEFAULT_TIMEOUT });
	}

	async rejectTransaction(page: Page): Promise<void> {
		const popup = await this.waitForPopup(page);
		if (!popup) {
			throw new Error('Wallet popup not found');
		}

		await this.dismissBanners(popup);
		await popup.click(this.selectors.rejectTransactionButton, { timeout: DEFAULT_TIMEOUT });
	}

	async getPopupPage(context: BrowserContext): Promise<Page | null> {
		if (!this.extensionId) {
			return null;
		}

		const pages = context.pages();
		const extensionId = this.extensionId;
		return pages.find((page) => extensionId && page.url().includes(extensionId)) ?? null;
	}

	async dismissBanners(page: Page): Promise<void> {
		for (const selector of this.selectors.bannerDismiss) {
			try {
				const element = page.locator(selector);
				if (await element.isVisible({ timeout: 2000 })) {
					await element.click();
				}
			} catch {
				// Banner not present, continue
			}
		}
	}

	/**
	 * Wait for a wallet popup window to appear.
	 */
	protected async waitForPopup(page: Page): Promise<Page | null> {
		const context = page.context();

		// Check if popup already exists
		const existingPopup = await this.getPopupPage(context);
		if (existingPopup) {
			return existingPopup;
		}

		// Wait for new popup
		try {
			const popup = await context.waitForEvent('page', { timeout: DEFAULT_TIMEOUT });
			await popup.waitForLoadState('domcontentloaded');
			return popup;
		} catch {
			return null;
		}
	}

	/**
	 * Get the extension ID from the browser context.
	 * Must be called after extension is loaded.
	 */
	protected async detectExtensionId(context: BrowserContext, _extensionName: string): Promise<string | null> {
		// Navigate to chrome://extensions to find the ID
		const page = await context.newPage();
		await page.goto('chrome://extensions');

		// This is a simplified approach - in practice you may need to
		// parse the extensions page or use a known extension ID
		await page.close();

		return null;
	}
}
