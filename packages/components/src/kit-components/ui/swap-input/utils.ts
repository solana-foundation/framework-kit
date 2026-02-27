/**
 * Validates and sanitizes a numeric input string for token amounts.
 * Allows only digits and a single decimal point.
 * Returns the sanitized string, or null if the input is completely invalid.
 *
 * @param value - Raw input string from the user
 * @returns Sanitized numeric string, or null
 */
export function sanitizeAmountInput(value: string): string | null {
	if (value === '') return '';

	const pattern = /^\d*\.?\d*$/;
	if (!pattern.test(value)) return null;

	// Don't allow multiple leading zeros like "007" but allow "0.07"
	if (value.length > 1 && value[0] === '0' && value[1] !== '.') {
		return value.slice(1);
	}

	return value;
}

/**
 * Checks whether the pay amount exceeds the available balance.
 *
 * @param payAmount - The amount the user wants to pay (as a string)
 * @param balance - The user's token balance (as a string)
 * @returns true if payAmount exceeds balance
 */
export function isInsufficientBalance(payAmount: string, balance: string | undefined): boolean {
	if (!balance || !payAmount) return false;

	const pay = Number.parseFloat(payAmount);
	const bal = Number.parseFloat(balance);

	if (Number.isNaN(pay) || Number.isNaN(bal)) return false;

	return pay > bal;
}
