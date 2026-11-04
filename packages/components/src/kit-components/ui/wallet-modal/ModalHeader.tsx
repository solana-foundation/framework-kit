import { ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalHeaderProps {
	/** Title text to display */
	title: string;
	/** ID for the title element (used for aria-labelledby) */
	titleId?: string;
	/** Whether to show the back button */
	showBack?: boolean;
	/** Handler for close button */
	onClose?: () => void;
	/** Handler for back button */
	onBack?: () => void;
	/** Additional class names */
	className?: string;
}

/**
 * ModalHeader - Header component with title, back, and close icons
 *
 * Features:
 * - Optional back arrow (for connecting/error views)
 * - Close X button (always visible)
 *
 * @example
 * ```tsx
 * // Wallet list view (no back button)
 * <ModalHeader
 *   title="Connect Wallet"
 *   onClose={() => setOpen(false)}
 * />
 *
 * // Connecting view (with back button)
 * <ModalHeader
 *   title=""
 *   showBack
 *   onBack={() => setView('list')}
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */
export function ModalHeader({ title, titleId, showBack = false, onClose, onBack, className }: ModalHeaderProps) {
	return (
		<div className={cn('w-full flex items-center justify-between', className)}>
			{/* Left side: Back button or title */}
			{showBack ? (
				<button
					type="button"
					onClick={onBack}
					className={cn(
						'size-6 flex items-center justify-center rounded transition-colors',
						'text-card-foreground hover:text-muted-foreground',
						'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
					)}
					aria-label="Go back"
				>
					<ArrowLeft size={24} />
				</button>
			) : (
				<h2 id={titleId} className="text-lg font-semibold text-card-foreground">
					{title}
				</h2>
			)}

			{/* Right side: Close button */}
			<button
				type="button"
				onClick={onClose}
				className={cn(
					'size-6 flex items-center justify-center rounded transition-colors',
					'text-card-foreground hover:text-muted-foreground',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
				)}
				aria-label="Close modal"
			>
				<X size={24} />
			</button>
		</div>
	);
}
