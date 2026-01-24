import { cn } from '../../../lib/utils';
import type { WalletInfo, WalletModalTheme } from './types';
import { WalletCard } from './WalletCard';

export interface WalletListProps {
	/** List of wallets to display */
	wallets: WalletInfo[];
	/** Theme variant */
	theme?: WalletModalTheme;
	/** Handler when a wallet is selected */
	onSelect?: (wallet: WalletInfo) => void;
	/** Wallet ID that is currently connecting (to disable others) */
	connectingWalletId?: string;
	/** Additional class names */
	className?: string;
}

/**
 * WalletList - Container for wallet cards with proper spacing and borders
 *
 * Features:
 * - Renders list of WalletCard components
 * - Handles position-aware border radius (first/middle/last)
 * - Disables cards when another wallet is connecting
 *
 * @example
 * ```tsx
 * <WalletList
 *   wallets={[
 *     { id: 'phantom', name: 'Phantom', icon: '/phantom.png', label: 'recent' },
 *     { id: 'solflare', name: 'Solflare', icon: '/solflare.png', label: 'detected' },
 *     { id: 'backpack', name: 'Backpack', icon: '/backpack.png' },
 *   ]}
 *   theme="dark"
 *   onSelect={(wallet) => console.log('Selected:', wallet.name)}
 * />
 * ```
 */
export function WalletList({ wallets, theme = 'dark', onSelect, connectingWalletId, className }: WalletListProps) {
	// Determine position for each wallet card
	const getPosition = (index: number): 'first' | 'middle' | 'last' | 'only' => {
		if (wallets.length === 1) return 'only';
		if (index === 0) return 'first';
		if (index === wallets.length - 1) return 'last';
		return 'middle';
	};

	if (wallets.length === 0) {
		return (
			<div
				className={cn(
					'w-full py-8 text-center rounded-[15px]',
					theme === 'dark'
						? 'bg-[rgba(82,82,92,0.2)] text-[rgba(228,228,231,0.6)]'
						: 'bg-[rgba(244,244,245,0.4)] text-[rgba(63,63,70,0.6)]',
					className,
				)}
			>
				<p className="text-sm">No wallets found</p>
			</div>
		);
	}

	return (
		<div className={cn('w-full flex flex-col rounded-[15px] overflow-hidden', className)}>
			{wallets.map((wallet, index) => (
				<WalletCard
					key={wallet.id}
					wallet={wallet}
					theme={theme}
					position={getPosition(index)}
					onSelect={onSelect}
					disabled={!!connectingWalletId && connectingWalletId !== wallet.id}
				/>
			))}
		</div>
	);
}
