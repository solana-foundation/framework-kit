import type { Address, Lamports } from '@solana/kit';
import type React from 'react';

/**
 * Token information for display in the token list
 */
export interface TokenInfo {
	/** Token symbol (e.g., "USDC", "SOL") */
	symbol: string;
	/** Token name (e.g., "USD Coin", "Solana") */
	name?: string;
	/** Token balance */
	balance: number | string;
	/** Token icon URL or React node */
	icon?: string | React.ReactNode;
	/** Fiat value of the token balance */
	fiatValue?: number | string;
	/** Token mint address */
	mintAddress?: Address;
}

/**
 * Props for the main BalanceCard component
 */
export interface BalanceCardProps {
	/** Wallet address to display */
	walletAddress?: Address;
	/** Total balance in Lamports */
	totalBalance: Lamports;
	/** Number of decimals for the token (default: 9 for SOL) */
	tokenDecimals?: number;
	/** Whether the balance is displayed as fiat (with currency symbol) */
	isFiatBalance?: boolean;
	/** Token symbol to display after balance (e.g. "SOL"). Only used when isFiatBalance is false. */
	tokenSymbol?: string;
	/** Currency code for fiat display (default: "USD") */
	currency?: string;
	/** Number of decimal places to display (default: 2) */
	displayDecimals?: number;
	/** List of tokens to display in expandable section */
	tokens?: TokenInfo[];
	/** Whether the component is in loading state */
	isLoading?: boolean;
	/** Error message or Error object */
	error?: string | Error;
	/** Callback when retry is clicked in error state */
	onRetry?: () => void | Promise<void>;
	/** Callback when address copy button is clicked */
	onCopyAddress?: (address: Address) => void;
	/** Whether the token list is initially expanded (default: false) */
	defaultExpanded?: boolean;
	/** Controlled expanded state */
	isExpanded?: boolean;
	/** Callback when expanded state changes */
	onExpandedChange?: (expanded: boolean) => void;
	/** Size variant */
	size?: 'sm' | 'md' | 'lg';
	/** Additional CSS classes */
	className?: string;
	/** Locale for number formatting (default: "en-US") */
	locale?: string;
}

/**
 * Props for the BalanceCardSkeleton component
 */
export interface BalanceCardSkeletonProps {
	/** Size variant */
	size?: 'sm' | 'md' | 'lg';
	/** Additional CSS classes */
	className?: string;
}

/**
 * Props for the BalanceAmount component
 */
export interface BalanceAmountProps {
	/** Balance value in base units (bigint) */
	balance: bigint;
	/** Number of decimals for the token (e.g., 9 for SOL, 6 for USDC) */
	tokenDecimals?: number;
	/** Whether to display as fiat with currency symbol */
	isFiat?: boolean;
	/** Token symbol to display after balance (e.g. "SOL"). Only used when isFiat is false. */
	tokenSymbol?: string;
	/** Currency code for fiat display */
	currency?: string;
	/** Number of decimal places to display */
	displayDecimals?: number;
	/** Locale for formatting */
	locale?: string;
	/** Whether to show privacy mask */
	isPrivate?: boolean;
	/** Size variant */
	size?: 'sm' | 'md' | 'lg';
	/** Additional CSS classes */
	className?: string;
}

/**
 * Props for the TokenList component
 */
export interface TokenListProps {
	/** List of tokens to display */
	tokens: TokenInfo[];
	/** Whether the list is expanded (controlled) */
	isExpanded?: boolean;
	/** Initial expanded state for uncontrolled mode (default: false) */
	defaultExpanded?: boolean;
	/** Callback when expansion state changes */
	onExpandedChange?: (expanded: boolean) => void;
	/** Additional CSS classes */
	className?: string;
	/** Locale for number formatting */
	locale?: string;
	/** Currency code for fiat display (default: "USD") */
	currency?: string;
}

/**
 * Props for the ErrorState component
 */
export interface ErrorStateProps {
	/** Error message */
	message: string;
	/** Callback when retry is clicked */
	onRetry?: () => void | Promise<void>;
	/** Additional CSS classes */
	className?: string;
}
