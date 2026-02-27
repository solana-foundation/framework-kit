import type { Address } from '@solana/kit';

/**
 * Size variant for the SwapInput component.
 */
export type SwapInputSize = 'sm' | 'md' | 'lg';

/**
 * Token information for display in the swap token selector
 */
export interface SwapTokenInfo {
	/** Token symbol (e.g., "USDC", "SOL") */
	symbol: string;
	/** Token name (e.g., "USD Coin", "Solana") */
	name?: string;
	/** Token logo URL (e.g., from token registry or tx-indexer logoURI) */
	logoURI?: string;
	/** Token mint address */
	mintAddress?: Address;
	/** Number of decimals for the token (e.g., 9 for SOL, 6 for USDC) */
	decimals?: number;
}

/**
 * Props for the TokenInput sub-component (one input card — Pay or Receive).
 * Can be used standalone (e.g. send / stake / deposit flows) or composed inside SwapInput.
 */
export interface TokenInputProps {
	/** Label displayed above the input (e.g., "Pay", "Receive") */
	label: string;
	/** Current amount value (string to support controlled input) */
	amount: string;
	/** Callback when the amount changes */
	onAmountChange?: (value: string) => void;
	/** Currently selected token */
	token?: SwapTokenInfo;
	/** List of tokens available in the dropdown. If omitted or empty the selector is display-only. */
	tokens?: SwapTokenInfo[];
	/** Callback when a token is selected from the dropdown */
	onTokenChange?: (token: SwapTokenInfo) => void;
	/** User's balance for the selected token (display string, e.g. "4.32") */
	balance?: string;
	/** Whether the input is read-only (for the "Receive" side when computed) */
	readOnly?: boolean;
	/** Whether the component is in loading/skeleton state */
	isLoading?: boolean;
	/** Error message to display (e.g., "Insufficient balance") */
	error?: string;
	/** Size variant */
	size?: SwapInputSize;
	/** Additional CSS classes */
	className?: string;
	/** Placeholder text for the input (default: "0.00") */
	placeholder?: string;
}

/**
 * Props for the main SwapInput composite component
 */
export interface SwapInputProps {
	/** Amount the user wants to pay (controlled) */
	payAmount: string;
	/** Callback when pay amount changes */
	onPayAmountChange?: (value: string) => void;
	/** Amount the user will receive (controlled, typically computed externally) */
	receiveAmount: string;
	/** Callback when receive amount changes (if editable) */
	onReceiveAmountChange?: (value: string) => void;
	/** Token selected for the "Pay" side */
	payToken?: SwapTokenInfo;
	/** Available tokens for the pay dropdown */
	payTokens?: SwapTokenInfo[];
	/** Callback when the pay token is changed via dropdown */
	onPayTokenChange?: (token: SwapTokenInfo) => void;
	/** Token selected for the "Receive" side */
	receiveToken?: SwapTokenInfo;
	/** Available tokens for the receive dropdown */
	receiveTokens?: SwapTokenInfo[];
	/** Callback when the receive token is changed via dropdown */
	onReceiveTokenChange?: (token: SwapTokenInfo) => void;
	/** Callback when the swap direction button is pressed (swaps pay/receive tokens) */
	onSwapDirection?: () => void;
	/** User's balance for the pay token (display string, e.g. "4.32") */
	payBalance?: string;
	/** Whether the receive input is read-only (default: true) */
	receiveReadOnly?: boolean;
	/** Whether the component is in a loading state */
	isLoading?: boolean;
	/** Whether the swap is currently executing */
	isSwapping?: boolean;
	/** Size variant */
	size?: SwapInputSize;
	/** Additional CSS classes for the outer wrapper */
	className?: string;
	/** Disable all interactions */
	disabled?: boolean;
}

/**
 * Props for the SwapInputSkeleton component
 */
export interface SwapInputSkeletonProps {
	/** Size variant */
	size?: SwapInputSize;
	/** Additional CSS classes */
	className?: string;
}
