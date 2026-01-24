import { cn } from '../../../lib/utils';
import type { WalletInfo, WalletModalTheme } from './types';
import { WalletLabel } from './WalletLabel';

export interface WalletCardProps {
	/** Wallet information to display */
	wallet: WalletInfo;
	/** Theme variant */
	theme?: WalletModalTheme;
	/** Position in the list for border radius */
	position?: 'first' | 'middle' | 'last' | 'only';
	/** Whether this card is currently hovered/focused */
	isHovered?: boolean;
	/** Click handler when wallet is selected */
	onSelect?: (wallet: WalletInfo) => void;
	/** Whether the card is disabled (e.g., during connection) */
	disabled?: boolean;
	/** Additional class names */
	className?: string;
}

/**
 * WalletCard - Individual wallet row in the wallet selection list
 *
 * Features:
 * - Wallet icon (32x32, rounded)
 * - Wallet name
 * - Optional label (Recent, Detected)
 * - Hover state with background change
 * - Position-aware border radius (first/middle/last)
 *
 * @example
 * ```tsx
 * <WalletCard
 *   wallet={{ id: 'phantom', name: 'Phantom', icon: '/phantom.png', label: 'recent' }}
 *   theme="dark"
 *   position="first"
 *   onSelect={(w) => console.log('Selected:', w.name)}
 * />
 * ```
 */
export function WalletCard({
	wallet,
	theme = 'dark',
	position = 'middle',
	isHovered = false,
	onSelect,
	disabled = false,
	className,
}: WalletCardProps) {
	// Border radius based on position
	const positionClasses = {
		first: 'rounded-t-[15px]',
		middle: '',
		last: 'rounded-b-[15px]',
		only: 'rounded-[15px]',
	};

	// Border classes for middle items
	const borderClasses =
		position === 'middle'
			? theme === 'dark'
				? 'border-y-[0.5px] border-[rgba(228,228,231,0.2)]'
				: 'border-y-[0.5px] border-[rgba(228,228,231,0.8)]'
			: '';

	return (
		<button
			type="button"
			onClick={() => onSelect?.(wallet)}
			disabled={disabled}
			className={cn(
				// Base styles
				'w-full flex items-center justify-between px-4 py-3 transition-colors',
				// Position-based border radius
				positionClasses[position],
				// Border for middle items
				borderClasses,
				// Dark theme
				theme === 'dark' && [
					isHovered ? 'bg-[rgba(82,82,92,0.6)]' : 'bg-[rgba(82,82,92,0.2)]',
					'hover:bg-[rgba(82,82,92,0.6)]',
				],
				// Light theme
				theme === 'light' && [
					isHovered ? 'bg-[rgba(228,228,231,0.3)]' : 'bg-[rgba(244,244,245,0.4)]',
					'hover:bg-[rgba(228,228,231,0.3)]',
				],
				// Disabled state
				disabled && 'opacity-50 cursor-not-allowed',
				// Focus styles
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
				theme === 'dark' ? 'focus-visible:ring-white/30' : 'focus-visible:ring-zinc-400',
				className,
			)}
		>
			{/* Wallet identity: icon + name */}
			<div className="flex items-center gap-2.5">
				{/* Wallet icon */}
				<div className="size-8 rounded-full overflow-hidden shrink-0">
					<img src={wallet.icon} alt={`${wallet.name} logo`} className="size-full object-cover" />
				</div>

				{/* Wallet name */}
				<span className={cn('text-base font-medium', theme === 'dark' ? 'text-[#FAFAFA]' : 'text-[#3F3F46]')}>
					{wallet.name}
				</span>
			</div>

			{/* Label (Recent, Detected) */}
			{wallet.label && <WalletLabel type={wallet.label} theme={theme} />}
		</button>
	);
}
