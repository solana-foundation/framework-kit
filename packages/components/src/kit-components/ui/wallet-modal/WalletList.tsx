import type { WalletConnectorMetadata } from '@solana/client';
import { cn } from '@/lib/utils';
import { WalletCard } from './WalletCard';

export interface WalletListProps {
	/** List of wallets to display */
	wallets: WalletConnectorMetadata[];
	/** Handler when a wallet is selected */
	onSelect?: (wallet: WalletConnectorMetadata) => void;
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
 *   onSelect={(wallet) => console.log('Selected:', wallet.name)}
 * />
 * ```
 */
export function WalletList({ wallets, onSelect, connectingWalletId, className }: WalletListProps) {
	// Determine position for each wallet card
	const getPosition = (index: number): 'first' | 'middle' | 'last' | 'only' => {
		if (wallets.length === 1) return 'only';
		if (index === 0) return 'first';
		if (index === wallets.length - 1) return 'last';
		return 'middle';
	};

	if (wallets.length === 0) {
		return (
			<div className={cn('w-full py-8 text-center rounded-2xl', 'bg-muted text-muted-foreground', className)}>
				<p className="text-sm">No wallets found</p>
			</div>
		);
	}

	return (
		<div className={cn('w-full flex flex-col rounded-2xl overflow-hidden', className)}>
			{wallets.map((wallet, index) => (
				<WalletCard
					key={wallet.id}
					wallet={wallet}
					position={getPosition(index)}
					onSelect={onSelect}
					disabled={!!connectingWalletId && connectingWalletId !== wallet.id}
				/>
			))}
		</div>
	);
}
