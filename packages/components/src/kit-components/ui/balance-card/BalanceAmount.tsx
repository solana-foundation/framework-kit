import type React from 'react';
import { cn } from '@/lib/utils';
import type { BalanceAmountProps } from './types';
import { formatBalance, formatFiatValue } from './utils';

/**
 * Displays a formatted balance amount with optional fiat formatting
 */
export const BalanceAmount: React.FC<BalanceAmountProps> = ({
	balance,
	tokenDecimals = 9,
	isFiat = false,
	currency = 'USD',
	displayDecimals = 2,
	locale = 'en-US',
	isPrivate = false,
	size = 'md',
	className = '',
	tokenSymbol,
}) => {
	const sizeStyles = {
		sm: 'text-xl font-semibold',
		md: 'text-2xl font-bold',
		lg: 'text-4xl font-bold',
	}[size];

	const formattedBalance = isPrivate
		? '••••••'
		: isFiat
			? formatFiatValue(balance, currency, locale, tokenDecimals)
			: tokenSymbol
				? `${formatBalance(balance, { tokenDecimals, displayDecimals, locale })} ${tokenSymbol}`
				: formatBalance(balance, { tokenDecimals, displayDecimals, locale });

	return (
		<div className={cn(sizeStyles, 'text-card-foreground', className)} aria-live="polite">
			{formattedBalance}
		</div>
	);
};
