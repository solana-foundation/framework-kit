import { ChevronUp } from 'lucide-react';
import type React from 'react';
import { useId, useState } from 'react';
import { cn } from '@/lib/utils';
import type { TokenInfo, TokenListProps } from './types';

/**
 * Formats a number as currency
 */
function formatCurrency(value: number | string, currency: string, locale: string): string {
	const num = typeof value === 'string' ? Number.parseFloat(value) : value;
	if (Number.isNaN(num)) return String(value);

	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(num);
}

/**
 * Token row component for displaying individual token info
 */
const TokenRow: React.FC<{
	token: TokenInfo;
	locale?: string;
	currency?: string;
}> = ({ token, locale = 'en-US', currency = 'USD' }) => {
	const displayBalance = token.fiatValue
		? formatCurrency(token.fiatValue, currency, locale)
		: typeof token.balance === 'number'
			? token.balance.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
			: token.balance;

	return (
		<div className="flex items-center justify-between py-2 px-1 hover:bg-accent rounded transition-colors">
			<span className="text-sm text-card-foreground">{token.symbol}</span>
			<span className="text-sm text-card-foreground">{displayBalance}</span>
		</div>
	);
};

/**
 * Expandable token list component showing all tokens in a wallet
 */
export const TokenList: React.FC<TokenListProps> = ({
	tokens,
	isExpanded: controlledExpanded,
	defaultExpanded = false,
	onExpandedChange,
	className = '',
	locale = 'en-US',
	currency = 'USD',
}) => {
	const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
	const contentId = useId();

	const isControlled = controlledExpanded !== undefined;
	const isExpanded = isControlled ? controlledExpanded : internalExpanded;

	const handleToggle = () => {
		const newExpanded = !isExpanded;
		if (!isControlled) {
			setInternalExpanded(newExpanded);
		}
		onExpandedChange?.(newExpanded);
	};

	return (
		<div className={cn('border-t border-border', className)}>
			{/* Toggle header */}
			<button
				type="button"
				onClick={handleToggle}
				className="flex items-center justify-between w-full py-3 text-muted-foreground rounded focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
				aria-expanded={isExpanded}
				aria-controls={contentId}
			>
				<span className="text-sm">View all tokens</span>
				<ChevronUp
					size={20}
					className={cn(
						'text-card-foreground transition-transform duration-200',
						!isExpanded && 'rotate-180',
					)}
				/>
			</button>

			{/* Expandable content */}
			<div
				id={contentId}
				className={cn(
					'overflow-hidden transition-all duration-200',
					isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
				)}
			>
				{/* Table header */}
				<div className="flex items-center justify-between py-2 px-1 text-xs text-muted-foreground border-b border-border">
					<span>Token</span>
					<span>Balance</span>
				</div>

				{/* Token rows */}
				{tokens.length === 0 ? (
					<div className="py-4 text-center text-sm text-muted-foreground">No tokens yet</div>
				) : (
					<div className="py-1">
						{tokens.map((token) => (
							<TokenRow
								key={token.mintAddress || token.symbol}
								token={token}
								locale={locale}
								currency={currency}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
