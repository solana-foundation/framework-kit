import { cn } from '@/lib/utils';
import errorIcon from './assets/error-icon.svg';
import { ModalHeader } from './ModalHeader';

export interface ErrorViewProps {
	/** Error title to display */
	title?: string;
	/** Error message/description */
	message?: string;
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
	onRetry,
	onClose,
	className,
}: ErrorViewProps) {
	return (
		<div className={cn('w-full flex flex-col gap-4 items-center px-4 pb-4', className)}>
			{/* Header with close only (no back) */}
			<div className="w-full flex justify-end">
				<ModalHeader title="" onClose={onClose} />
			</div>

			{/* Error icon */}
			<div className="size-16 flex items-center justify-center mt-2">
				<img src={errorIcon} alt="Error" className="size-16 object-contain" />
			</div>

			{/* Text content */}
			<div className="w-full flex flex-col gap-1.5 items-center text-center">
				<h3 className="text-lg font-medium text-card-foreground">{title}</h3>
				<p className="text-sm max-w-60 text-muted-foreground">{message}</p>
			</div>

			{/* Retry button - pill shaped outlined button */}
			<button
				type="button"
				onClick={onRetry}
				className={cn(
					'px-10 py-2 rounded-full text-sm font-medium',
					'border border-border flex items-center justify-center',
					'transition-colors cursor-pointer',
					'text-card-foreground',
					'hover:bg-accent',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring',
				)}
			>
				Retry
			</button>
		</div>
	);
}
