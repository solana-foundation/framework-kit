import { ChevronDown } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '../skeleton/Skeleton';
import type { SwapTokenInfo, TokenInputProps } from './types';
import { sanitizeAmountInput } from './utils';

function toCssSize(size: NonNullable<TokenInputProps['size']>) {
	switch (size) {
		case 'sm':
			return { padding: 'p-3', inputText: 'text-xl', tokenIcon: 'size-5' };
		case 'lg':
			return { padding: 'p-5', inputText: 'text-3xl', tokenIcon: 'size-7' };
		default:
			return { padding: 'p-4', inputText: 'text-2xl', tokenIcon: 'size-6' };
	}
}

function TokenLogo({ token, className }: { token: SwapTokenInfo; className?: string }) {
	return token.logoURI ? (
		<img src={token.logoURI} alt={`${token.symbol} token`} className={cn(className, 'shrink-0 rounded-full')} />
	) : (
		<div className={cn(className, 'shrink-0 rounded-full', 'bg-accent')} aria-hidden="true" />
	);
}

/**
 * A single token input card for either the "Pay" or "Receive" side of a swap,
 * or as a standalone input for send/stake/deposit flows.
 *
 * When a `tokens` list is provided, clicking the token button opens an inline
 * dropdown to pick a different token. Without `tokens` the button is display-only.
 *
 * @example
 * ```tsx
 * <TokenInput
 *   label="Pay"
 *   amount="1.21"
 *   onAmountChange={setAmount}
 *   token={{ symbol: 'SOL', logoURI: 'https://...' }}
 *   tokens={tokenList}
 *   onTokenChange={setSelectedToken}
 *   balance="4.32"
 * />
 * ```
 */
export const TokenInput: React.FC<TokenInputProps> = ({
	label,
	amount,
	onAmountChange,
	token,
	tokens,
	onTokenChange,
	balance,
	readOnly = false,
	isLoading = false,
	error,
	size = 'md',
	className,
	placeholder = '0.00',
}) => {
	const css = toCssSize(size);

	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const hasDropdown = tokens && tokens.length > 0 && onTokenChange;

	// Close dropdown on click outside
	useEffect(() => {
		if (!isOpen) return;
		function handleClickOutside(e: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen]);

	const handleAmountChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const sanitized = sanitizeAmountInput(e.target.value);
			if (sanitized !== null && onAmountChange) {
				onAmountChange(sanitized);
			}
		},
		[onAmountChange],
	);

	const handleTokenSelect = useCallback(
		(t: SwapTokenInfo) => {
			onTokenChange?.(t);
			setIsOpen(false);
		},
		[onTokenChange],
	);

	const cardStyles = cn('rounded-xl border', 'bg-card border-border', css.padding, className);

	return (
		<div className={cardStyles}>
			{/* Label */}
			<div className={cn('text-xs font-medium mb-2', 'text-muted-foreground')}>{label}</div>

			{/* Input + token selector row */}
			<div className="flex items-center justify-between gap-3">
				{/* Amount input or skeleton */}
				{isLoading ? (
					<Skeleton className="h-8 w-32" />
				) : (
					<input
						type="text"
						inputMode="decimal"
						value={amount}
						onChange={handleAmountChange}
						readOnly={readOnly}
						placeholder={placeholder}
						className={cn(
							'bg-transparent border-none outline-none w-full min-w-0 font-semibold',
							css.inputText,
							'text-card-foreground',
							readOnly && 'cursor-default',
							'placeholder:text-muted-foreground',
						)}
						aria-label={`${label} amount`}
					/>
				)}

				{/* Token selector button + dropdown */}
				{isLoading ? (
					<Skeleton className="h-9 w-24 rounded-lg" />
				) : (
					<div className="relative" ref={dropdownRef}>
						{token ? (
							<button
								type="button"
								onClick={hasDropdown ? () => setIsOpen((o) => !o) : undefined}
								className={cn(
									'flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors shrink-0',
									'bg-secondary',
									hasDropdown && 'hover:bg-accent cursor-pointer',
									!hasDropdown && 'cursor-default',
									'text-card-foreground',
									'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring ring-offset-background',
								)}
								aria-label={`Select ${label.toLowerCase()} token, currently ${token.symbol}`}
								aria-expanded={hasDropdown ? isOpen : undefined}
								aria-haspopup={hasDropdown ? 'listbox' : undefined}
							>
								<TokenLogo token={token} className={css.tokenIcon} />
								<span className="text-sm font-medium">{token.symbol}</span>
								{hasDropdown && (
									<ChevronDown
										size={16}
										className={cn(
											'shrink-0',
											'text-muted-foreground',
											isOpen && 'rotate-180 transition-transform',
										)}
										aria-hidden="true"
									/>
								)}
							</button>
						) : (
							<button
								type="button"
								onClick={hasDropdown ? () => setIsOpen((o) => !o) : undefined}
								className={cn(
									'flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors shrink-0',
									'bg-secondary',
									hasDropdown && 'hover:bg-accent cursor-pointer',
									!hasDropdown && 'cursor-default',
									'text-card-foreground',
									'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring ring-offset-background',
								)}
								aria-label={`Select ${label.toLowerCase()} token`}
								aria-expanded={hasDropdown ? isOpen : undefined}
								aria-haspopup={hasDropdown ? 'listbox' : undefined}
							>
								<span className="text-sm font-medium">Select token</span>
								{hasDropdown && (
									<ChevronDown
										size={16}
										className={cn(
											'shrink-0',
											'text-muted-foreground',
											isOpen && 'rotate-180 transition-transform',
										)}
										aria-hidden="true"
									/>
								)}
							</button>
						)}

						{/* Dropdown */}
						{isOpen && hasDropdown && (
							<div
								role="listbox"
								aria-label={`${label} token list`}
								className={cn(
									'absolute right-0 top-full mt-1 z-20',
									'bg-card border border-border rounded-lg shadow-lg',
									'overflow-y-auto max-h-52 w-48',
								)}
							>
								{tokens.map((t) => {
									const isSelected =
										token?.symbol === t.symbol && token?.mintAddress === t.mintAddress;
									return (
										<button
											type="button"
											key={t.mintAddress ?? t.symbol}
											role="option"
											aria-selected={isSelected}
											onClick={() => handleTokenSelect(t)}
											className={cn(
												'flex w-full items-center gap-2 px-3 py-2 text-left transition-colors',
												'hover:bg-accent',
												isSelected && 'bg-accent',
											)}
										>
											<TokenLogo token={t} className="size-5" />
											<div className="flex flex-col min-w-0">
												<span className="text-sm font-medium text-card-foreground">
													{t.symbol}
												</span>
												{t.name && (
													<span className="text-xs text-muted-foreground truncate">
														{t.name}
													</span>
												)}
											</div>
										</button>
									);
								})}
							</div>
						)}
					</div>
				)}
			</div>

			{/* Balance + error row */}
			{(balance !== undefined || error) && (
				<div className="flex items-center justify-between mt-2">
					{balance !== undefined ? (
						<span className="text-xs">
							<span className="text-muted-foreground">Balance </span>
							<span className="text-card-foreground">{balance}</span>
						</span>
					) : (
						<span />
					)}

					{error && (
						<span className={cn('text-xs', 'text-destructive')} role="alert">
							{error}
						</span>
					)}
				</div>
			)}
		</div>
	);
};
