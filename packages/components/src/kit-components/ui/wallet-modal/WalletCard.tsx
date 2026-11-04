import type { WalletConnectorMetadata } from '@solana/client';
import { cn } from '@/lib/utils';
import type { WalletLabelType } from './types';
import { WalletLabel } from './WalletLabel';

export interface WalletCardProps {
	/** Wallet information to display */
	wallet: WalletConnectorMetadata;
	/** Optional label to show (Recent, Detected, Installed) */
	label?: WalletLabelType;
	/** Position in the list for border radius */
	position?: 'first' | 'middle' | 'last' | 'only';
	/** Whether this card is currently hovered/focused */
	isHovered?: boolean;
	/** Click handler when wallet is selected */
	onSelect?: (wallet: WalletConnectorMetadata) => void;
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
 *   position="first"
 *   onSelect={(w) => console.log('Selected:', w.name)}
 * />
 * ```
 */
export function WalletCard({
	wallet,
	label,
	position = 'middle',
	isHovered = false,
	onSelect,
	disabled = false,
	className,
}: WalletCardProps) {
	// Border radius based on position
	const positionClasses = {
		first: 'rounded-t-2xl',
		middle: '',
		last: 'rounded-b-2xl',
		only: 'rounded-2xl',
	};

	// Border classes for middle items
	const borderClasses = position === 'middle' ? 'border-y border-border' : '';

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
				// Background
				isHovered ? 'bg-accent' : 'bg-secondary',
				'hover:bg-accent',
				// Disabled state
				disabled && 'opacity-50 cursor-not-allowed',
				// Focus styles
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-ring',
				className,
			)}
		>
			{/* Wallet identity: icon + name */}
			<div className="flex items-center gap-2.5">
				{/* Wallet icon */}
				<div className="size-8 rounded-full overflow-hidden shrink-0 bg-muted flex items-center justify-center">
					<img
						src={wallet.icon}
						alt={`${wallet.name} logo`}
						className="size-full object-cover"
						onError={(e) => {
							e.currentTarget.style.display = 'none';
						}}
					/>
				</div>

				{/* Wallet name */}
				<span className="text-base font-medium text-card-foreground">{wallet.name}</span>
			</div>

			{/* Label (Recent, Detected) */}
			{label && <WalletLabel type={label} />}
		</button>
	);
}
