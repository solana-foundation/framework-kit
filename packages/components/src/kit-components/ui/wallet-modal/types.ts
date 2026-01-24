/**
 * Shared types for the WalletModal component
 */

/** Theme variants for the wallet modal */
export type WalletModalTheme = 'dark' | 'light';

/** Wallet label types */
export type WalletLabelType = 'recent' | 'detected' | 'installed';

/** Wallet information for display */
export interface WalletInfo {
	/** Unique identifier for the wallet */
	id: string;
	/** Display name of the wallet */
	name: string;
	/** URL to the wallet icon/logo */
	icon: string;
	/** Whether the wallet is installed/detected */
	installed?: boolean;
	/** Label to show (Recent, Detected, etc.) */
	label?: WalletLabelType;
	/** URL to install the wallet if not installed */
	installUrl?: string;
}

/** Modal view states */
export type ModalView = 'list' | 'connecting' | 'error';

/** Connection error types */
export interface ConnectionError {
	/** Error message to display */
	message: string;
	/** Original error for debugging */
	cause?: unknown;
}
