/**
 * ConnectWalletButton Component Types
 * @description Type definitions for the connect wallet button and its sub-components
 */

import type { ClusterMoniker, WalletConnectorMetadata, WalletStatus } from '@solana/client';
import type { Address, Lamports } from '@solana/kit';
import type React from 'react';

/** Props for the main WalletButton component */
export interface WalletButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	/** Current connection state */
	connectionState: WalletStatus['status'];
	/** Connected wallet info (required when connected) */
	wallet?: WalletConnectorMetadata | null;
	/** Whether the dropdown is expanded (connected state) */
	isExpanded?: boolean;
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
	/** Custom class name */
	className?: string;
}

/** Props for the connected dropdown */
export interface WalletDropdownProps {
	/** Connected wallet info */
	wallet: WalletConnectorMetadata;
	/** Wallet address (typed as Address for proper Solana integration) */
	address: Address;
	/** Balance in lamports */
	balance?: Lamports;
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
	// === Network Props ===
	/** Currently selected network */
	selectedNetwork?: ClusterMoniker;
	/** Network connection status */
	networkStatus?: WalletStatus['status'];
	/** Callback when network is changed */
	onNetworkChange?: (network: ClusterMoniker) => void;
	/** Custom class name */
	className?: string;
	/** Custom label for the disconnect button */
	disconnectLabel?: string;
}
