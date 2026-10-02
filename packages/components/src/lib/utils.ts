import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for merging Tailwind CSS classes with proper precedence.
 * Combines clsx for conditional classes and tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

/**
 * Truncates a wallet address for display.
 * @param address - Full wallet address string
 * @param startChars - Number of characters to show at start (default: 4)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Truncated address like "6DMh...1DkK"
 */
export function truncateAddress(address: string, startChars = 4, endChars = 4): string {
	if (!address) return '';
	if (address.length <= startChars + endChars) return address;
	return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Formats SOL balance for display with proper truncation for large values.
 * @param lamports - Balance in lamports (1 SOL = 1e9 lamports)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string like "1.12", "1.2K", "3.5M", "2.1B"
 */
export function formatSolBalance(lamports: number | bigint, decimals = 2): string {
	const sol = Number(lamports) / 1e9;

	// Large number formatting
	if (sol >= 1_000_000_000) {
		return `${(sol / 1_000_000_000).toFixed(1)}B`;
	}
	if (sol >= 1_000_000) {
		return `${(sol / 1_000_000).toFixed(1)}M`;
	}
	if (sol >= 10_000) {
		return `${(sol / 1_000).toFixed(1)}K`;
	}
	if (sol >= 1_000) {
		// Add comma formatting for thousands
		return sol.toLocaleString('en-US', {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
		});
	}

	return sol.toFixed(decimals);
}
