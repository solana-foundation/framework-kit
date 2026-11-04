import type React from 'react';
import { cn } from '@/lib/utils';
import { AddressDisplay } from '../address-display/AddressDisplay';
import walletIcon from './assets/wallet-icon-dark.png';
import { BalanceAmount } from './BalanceAmount';
import { BalanceCardSkeleton } from './BalanceCardSkeleton';
import { ErrorState } from './ErrorState';
import { TokenList } from './TokenList';
import type { BalanceCardProps } from './types';

const EMPTY_TOKENS: BalanceCardProps['tokens'] = [];

/**
 * A comprehensive balance card component for displaying wallet balances
 * with support for token lists, loading states, and error handling.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <BalanceCard
 *   walletAddress="6DMh...1DkK"
 *   totalBalance={34.81}
 *   isFiatBalance
 * />
 *
 * // With token list
 * <BalanceCard
 *   walletAddress="6DMh...1DkK"
 *   totalBalance={34.81}
 *   isFiatBalance
 *   tokens={[
 *     { symbol: 'USDC', balance: 15.50, fiatValue: 15.50 },
 *     { symbol: 'USDT', balance: 10.18, fiatValue: 10.18 },
 *   ]}
 * />
 * ```
 */
export const BalanceCard: React.FC<BalanceCardProps> = ({
	walletAddress,
	totalBalance,
	tokenDecimals = 9,
	isFiatBalance = false,
	tokenSymbol,
	currency = 'USD',
	displayDecimals = 2,
	tokens = EMPTY_TOKENS,
	isLoading = false,
	error,
	onRetry,
	onCopyAddress,
	defaultExpanded = false,
	isExpanded: controlledExpanded,
	onExpandedChange,
	size = 'md',
	className = '',
	locale = 'en-US',
}) => {
	// Show skeleton during loading
	if (isLoading) {
		return <BalanceCardSkeleton size={size} className={className} />;
	}

	const paddingStyles = {
		sm: 'p-3',
		md: 'p-4',
		lg: 'p-6',
	}[size];

	const errorMessage = error ? (typeof error === 'string' ? error : error.message || 'An error occurred') : null;

	return (
		<section
			className={cn('rounded-xl border border-border bg-card text-card-foreground', paddingStyles, className)}
			aria-label={walletAddress ? `Wallet balance for ${walletAddress}` : 'Wallet balance'}
		>
			{/* Wallet address */}
			{walletAddress && (
				<div className="flex items-center gap-2 mb-4">
					<img src={walletIcon} alt="" className="w-5 h-5" aria-hidden="true" />
					<AddressDisplay
						address={walletAddress}
						onCopy={onCopyAddress ? () => onCopyAddress(walletAddress) : undefined}
						showExplorerLink={false}
						className="[&>span]:bg-transparent! [&>span]:p-0! [&>span]:rounded-none!"
					/>
				</div>
			)}

			{/* Balance label */}
			<div className="text-xs text-muted-foreground mb-1">Total balance</div>

			{/* Balance amount */}
			<BalanceAmount
				balance={totalBalance}
				tokenDecimals={tokenDecimals}
				isFiat={isFiatBalance}
				tokenSymbol={tokenSymbol}
				currency={currency}
				displayDecimals={displayDecimals}
				locale={locale}
				size={size}
				className="mb-3"
			/>

			{/* Error state */}
			{errorMessage && <ErrorState message={errorMessage} onRetry={onRetry} className="mb-3" />}

			{/* Token list */}
			<TokenList
				tokens={tokens}
				isExpanded={controlledExpanded}
				defaultExpanded={defaultExpanded}
				onExpandedChange={onExpandedChange}
				locale={locale}
				currency={currency}
			/>
		</section>
	);
};
