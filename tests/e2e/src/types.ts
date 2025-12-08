import type { BrowserContext, Page } from '@playwright/test';

/**
 * Supported wallet types for E2E testing.
 */
export type WalletType = 'phantom' | 'solflare' | 'backpack';

/**
 * Configuration for wallet harness initialization.
 */
export interface WalletHarnessConfig {
	/** Path to the wallet extension directory (unpacked CRX). */
	extensionPath: string;
	/** Seed phrase for wallet recovery. */
	seedPhrase: string;
	/** Optional password for wallet unlock. */
	password?: string;
}

/**
 * Result of a wallet connection attempt.
 */
export interface WalletConnectionResult {
	/** Whether the connection was successful. */
	success: boolean;
	/** The connected wallet address, if successful. */
	address?: string;
	/** Error message, if connection failed. */
	error?: string;
}

/**
 * Abstract interface for wallet interactions.
 * Implementations should be resilient to UI changes.
 */
export interface WalletHarness {
	/** Wallet type identifier. */
	readonly type: WalletType;

	/**
	 * Set up the wallet extension in the browser context.
	 * This includes importing seed phrase and initial configuration.
	 */
	setup(context: BrowserContext, config: WalletHarnessConfig): Promise<void>;

	/**
	 * Approve a connection request from the dApp.
	 * Called after the dApp initiates a wallet connection.
	 */
	approveConnection(page: Page): Promise<WalletConnectionResult>;

	/**
	 * Reject a connection request from the dApp.
	 */
	rejectConnection(page: Page): Promise<void>;

	/**
	 * Approve a transaction signing request.
	 */
	approveTransaction(page: Page): Promise<void>;

	/**
	 * Reject a transaction signing request.
	 */
	rejectTransaction(page: Page): Promise<void>;

	/**
	 * Get the extension popup page.
	 * Useful for direct wallet interactions.
	 */
	getPopupPage(context: BrowserContext): Promise<Page | null>;

	/**
	 * Dismiss any promotional banners or modals.
	 * Wallets often show these on first launch.
	 */
	dismissBanners(page: Page): Promise<void>;
}

/**
 * Selectors configuration for a wallet.
 * Using data-testid and aria-labels for resilience.
 */
export interface WalletSelectors {
	/** Selector for the connect/approve button. */
	approveButton: string;
	/** Selector for the reject/cancel button. */
	rejectButton: string;
	/** Selector for transaction approve button. */
	approveTransactionButton: string;
	/** Selector for transaction reject button. */
	rejectTransactionButton: string;
	/** Selector for seed phrase input. */
	seedPhraseInput: string;
	/** Selector for password input. */
	passwordInput: string;
	/** Selector for confirm/continue button during setup. */
	confirmButton: string;
	/** Selectors for common promotional banners to dismiss. */
	bannerDismiss: string[];
}
