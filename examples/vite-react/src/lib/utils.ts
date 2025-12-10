import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

/**
 * Formats account data for display purposes.
 * Handles Uint8Array, bigint, and complex objects with special formatting.
 *
 * @param data - The account data to format
 * @returns A formatted string representation of the data
 */
export function formatAccountData(data: unknown): string {
	if (!data) {
		return 'No account data fetched yet.';
	}

	try {
		if (data instanceof Uint8Array) {
			return `Uint8Array(${data.length} bytes):\n${Array.from(data.slice(0, 100))
				.map((byte) => byte.toString(16).padStart(2, '0'))
				.join(' ')}${data.length > 100 ? '\n... (truncated)' : ''}`;
		}

		return JSON.stringify(
			data,
			(_, value) => {
				if (typeof value === 'bigint') {
					return value.toString();
				}
				if (value instanceof Uint8Array) {
					return `Uint8Array(${value.length})`;
				}
				return value;
			},
			2,
		);
	} catch {
		if (typeof data === 'object' && data !== null) {
			return `[Complex Object]\nType: ${data.constructor?.name || 'Unknown'}\nKeys: ${Object.keys(data).join(', ')}`;
		}
		return String(data);
	}
}
