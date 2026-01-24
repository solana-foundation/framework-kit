import { ArrowLeft, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { WalletModalTheme } from './types';

export interface ModalHeaderProps {
	/** Title text to display */
	title: string;
	/** Theme variant */
	theme?: WalletModalTheme;
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
 * - Theme-aware colors
 *
 * @example
 * ```tsx
 * // Wallet list view (no back button)
 * <ModalHeader
 *   title="Connect Wallet"
 *   theme="dark"
 *   onClose={() => setOpen(false)}
 * />
 *
 * // Connecting view (with back button)
 * <ModalHeader
 *   title=""
 *   showBack
 *   theme="dark"
 *   onBack={() => setView('list')}
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */
export function ModalHeader({ title, theme = 'dark', showBack = false, onClose, onBack, className }: ModalHeaderProps) {
	const iconColor = theme === 'dark' ? 'text-[#FAFAFA]' : 'text-[#3F3F46]';
	const iconHover = theme === 'dark' ? 'hover:text-white' : 'hover:text-zinc-600';

	return (
		<div className={cn('w-full flex items-center justify-between', className)}>
			{/* Left side: Back button or title */}
			{showBack ? (
				<button
					type="button"
					onClick={onBack}
					className={cn(
						'size-6 flex items-center justify-center rounded transition-colors',
						iconColor,
						iconHover,
						'focus:outline-none focus-visible:ring-2',
						theme === 'dark' ? 'focus-visible:ring-white/30' : 'focus-visible:ring-zinc-400',
					)}
					aria-label="Go back"
				>
					<ArrowLeft size={24} />
				</button>
			) : (
				<h2 className={cn('text-lg font-semibold', theme === 'dark' ? 'text-[#FAFAFA]' : 'text-[#3F3F46]')}>
					{title}
				</h2>
			)}

			{/* Right side: Close button */}
			<button
				type="button"
				onClick={onClose}
				className={cn(
					'size-6 flex items-center justify-center rounded transition-colors',
					iconColor,
					iconHover,
					'focus:outline-none focus-visible:ring-2',
					theme === 'dark' ? 'focus-visible:ring-white/30' : 'focus-visible:ring-zinc-400',
				)}
				aria-label="Close modal"
			>
				<X size={24} />
			</button>
		</div>
	);
}
