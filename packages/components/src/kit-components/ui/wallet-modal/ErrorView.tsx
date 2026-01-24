import { cn } from '../../../lib/utils';
import errorIcon from './assets/error.png';
import { ModalHeader } from './ModalHeader';
import type { WalletModalTheme } from './types';

export interface ErrorViewProps {
	/** Error title to display */
	title?: string;
	/** Error message/description */
	message?: string;
	/** Theme variant */
	theme?: WalletModalTheme;
	/** Handler for retry button */
	onRetry?: () => void;
	/** Handler for close button */
	onClose?: () => void;
	/** Additional class names */
	className?: string;
}

/**
 * ErrorView - Error state shown when wallet connection fails
 *
 * Features:
 * - Red error icon in circle
 * - "Connection failed" title
 * - Error message subtitle
 * - Retry button
 * - Close button
 */
export function ErrorView({
	title = 'Connection failed',
	message = 'Unable to connect. Please try again.',
	theme = 'dark',
	onRetry,
	onClose,
	className,
}: ErrorViewProps) {
	return (
		<div className={cn('w-full flex flex-col gap-4 items-center px-4 pb-4', className)}>
			{/* Header with close only (no back) */}
			<div className="w-full flex justify-end">
				<ModalHeader theme={theme} title="" onClose={onClose} />
			</div>

			{/* Error icon */}
			<div className="size-16 flex items-center justify-center mt-2">
				<img src={errorIcon} alt="Error" className="size-16 object-contain" />
			</div>

			{/* Text content */}
			<div className="w-full flex flex-col gap-1.5 items-center text-center">
				<h3 className={cn('text-lg font-medium', theme === 'dark' ? 'text-[#FAFAFA]' : 'text-[#3F3F46]')}>
					{title}
				</h3>
				<p
					className={cn(
						'text-sm max-w-[231px]',
						theme === 'dark' ? 'text-[rgba(228,228,231,0.8)]' : 'text-[rgba(82,82,92,0.85)]',
					)}
				>
					{message}
				</p>
			</div>

			{/* Retry button - pill shaped outlined button */}
			<button
				type="button"
				onClick={onRetry}
				className={cn(
					'px-10 py-2 rounded-full text-sm font-medium',
					'border flex items-center justify-center',
					'transition-colors cursor-pointer',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
					theme === 'dark' && [
						'border-white/60',
						'text-white',
						'hover:bg-white/10',
						'active:bg-white/15',
						'focus-visible:ring-white/30',
					],
					theme === 'light' && [
						'border-zinc-700/40',
						'text-zinc-700',
						'hover:bg-zinc-700/10',
						'active:bg-zinc-700/15',
						'focus-visible:ring-zinc-400',
					],
				)}
			>
				Retry
			</button>
		</div>
	);
}
