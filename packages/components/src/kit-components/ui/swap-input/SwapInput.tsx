import { ArrowDownUp } from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';
import { SwapInputSkeleton } from './SwapInputSkeleton';
import { TokenInput } from './TokenInput';
import type { SwapInputProps } from './types';
import { isInsufficientBalance } from './utils';

/**
 * A swap input widget for exchanging tokens on Solana.
 * Composes two TokenInput cards (Pay and Receive) with a swap direction
 * button between them. Handles "insufficient balance" validation automatically.
 *
 * @example
 * ```tsx
 * <SwapInput
 *   payAmount={payAmount}
 *   onPayAmountChange={setPayAmount}
 *   receiveAmount={receiveAmount}
 *   payToken={{ symbol: 'SOL', icon: solIcon }}
 *   receiveToken={{ symbol: 'USDC', icon: usdcIcon }}
 *   onSwapDirection={handleSwap}
 *   payBalance="4.32"
 * />
 * ```
 */
export const SwapInput: React.FC<SwapInputProps> = ({
	payAmount,
	onPayAmountChange,
	receiveAmount,
	onReceiveAmountChange,
	payToken,
	payTokens,
	onPayTokenChange,
	receiveToken,
	receiveTokens,
	onReceiveTokenChange,
	onSwapDirection,
	payBalance,
	receiveReadOnly = true,
	isLoading = false,
	isSwapping = false,
	size = 'md',
	className,
	disabled = false,
}) => {
	if (isLoading) {
		return <SwapInputSkeleton size={size} className={className} />;
	}

	const insufficientBalance = isInsufficientBalance(payAmount, payBalance);
	const payError = insufficientBalance ? 'Insufficient balance' : undefined;

	return (
		<section className={cn('relative', className)} aria-label="Swap input">
			<div className="relative flex flex-col gap-1">
				{/* Pay card */}
				<TokenInput
					label="Pay"
					amount={payAmount}
					onAmountChange={disabled ? undefined : onPayAmountChange}
					token={payToken}
					tokens={disabled ? undefined : payTokens}
					onTokenChange={disabled ? undefined : onPayTokenChange}
					balance={payBalance}
					readOnly={disabled}
					error={payError}
					size={size}
				/>

				{/* Swap direction button */}
				<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
					<button
						type="button"
						onClick={onSwapDirection}
						disabled={disabled || isSwapping}
						className={cn(
							'flex items-center justify-center w-9 h-9 rounded-full border-4 transition-colors',
							'bg-secondary hover:bg-accent',
							'border-background',
							'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring ring-offset-background',
							(disabled || isSwapping) && 'opacity-50 cursor-not-allowed',
						)}
						aria-label="Swap pay and receive tokens"
					>
						<ArrowDownUp size={16} className="text-muted-foreground" aria-hidden="true" />
					</button>
				</div>

				{/* Receive card */}
				<TokenInput
					label="Receive"
					amount={receiveAmount}
					onAmountChange={disabled ? undefined : onReceiveAmountChange}
					token={receiveToken}
					tokens={disabled ? undefined : receiveTokens}
					onTokenChange={disabled ? undefined : onReceiveTokenChange}
					readOnly={receiveReadOnly}
					size={size}
				/>
			</div>
		</section>
	);
};
