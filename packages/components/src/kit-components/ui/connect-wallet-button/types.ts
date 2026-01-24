/**
 * ConnectWalletButton Component Types
 * @description Type definitions for the connect wallet button and its sub-components
 */

import type React from 'react';

/** Theme variants for the component */
export type Theme = 'dark' | 'light';

/** Wallet connector information from the provider */
export interface WalletConnector {
	/** Unique identifier for the wallet */
	id: string;
	/** Display name of the wallet */
	name: string;
	/** Wallet icon URL or base64 data URI */
	icon?: string;
	/** Whether the wallet extension is installed */
	installed?: boolean;
	/** URL to install the wallet extension */
	installUrl?: string;
}

/** Connection states for the wallet button */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected';

/** Props for the main WalletButton component */
export interface WalletButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	/** Current connection state */
	connectionState: ConnectionState;
	/** Connected wallet info (required when connected) */
	wallet?: WalletConnector | null;
	/** Whether the dropdown is expanded (connected state) */
	isExpanded?: boolean;
	/** Enable animations */
	animate?: boolean;
	/** Theme variant (dark/light) */
	theme?: Theme;
	/** Custom class name */
	className?: string;
}

/** Props for the ButtonContent sub-component */
export interface ButtonContentProps {
	/** Text content to display */
	children: React.ReactNode;
	/** Custom class name */
	className?: string;
}

/** Props for the ButtonSpinner sub-component */
export interface ButtonSpinnerProps {
	/** Spinner size in pixels */
	size?: number;
	/** Custom class name */
	className?: string;
}

/** Props for the ButtonIcon sub-component */
export interface ButtonIconProps {
	/** Icon source URL or base64 data */
	src?: string;
	/** Alt text for accessibility */
	alt?: string;
	/** Icon size in pixels */
	size?: number;
	/** Custom class name */
	className?: string;
}

/** Props for the ChevronIcon sub-component */
export interface ChevronIconProps {
	/** Direction of the chevron */
	direction: 'up' | 'down';
	/** Enable rotation animation */
	animate?: boolean;
	/** Custom class name */
	className?: string;
}

/** Props for the connected dropdown */
export interface WalletDropdownProps {
	/** Connected wallet info */
	wallet: WalletConnector;
	/** Wallet address */
	address: string;
	/** Balance in lamports */
	balance?: number | bigint;
	/** Whether balance is visible or hidden */
	balanceVisible?: boolean;
	/** Whether balance is still loading */
	balanceLoading?: boolean;
	/** Callback when balance visibility toggles */
	onToggleBalance?: () => void;
	/** Callback when disconnect is clicked */
	onDisconnect?: () => void;
	/** Callback when address is copied */
	onCopyAddress?: () => void;
	/** Enable animations */
	animate?: boolean;
	/** Theme variant (dark/light) */
	theme?: Theme;
	/** Custom class name */
	className?: string;
	/** Custom labels */
	labels?: {
		disconnect?: string;
	};
}
