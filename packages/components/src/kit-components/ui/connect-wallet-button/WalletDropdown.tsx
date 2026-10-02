'use client';

import { LogOut } from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn, formatSolBalance } from '@/lib/utils';
import { AddressDisplay } from '../address-display/AddressDisplay';
import { NetworkDropdown } from '../network-switcher/NetworkDropdown';
import { NetworkHeader } from '../network-switcher/NetworkHeader';
import { NetworkTrigger } from '../network-switcher/NetworkTrigger';
import { DEFAULT_NETWORKS } from '../network-switcher/types';
import { ButtonIcon } from './ButtonIcon';
import type { WalletDropdownProps } from './types';

export function WalletDropdown({
	wallet,
	address,
	balance,
	balanceVisible: controlledBalanceVisible,
	balanceLoading = false,
	onToggleBalance,
	onDisconnect,
	onCopyAddress,
	selectedNetwork = 'mainnet-beta',
	networkStatus = 'connected',
	onNetworkChange,
	className,
	disconnectLabel = 'Disconnect',
}: WalletDropdownProps): React.ReactElement {
	// View state: 'wallet' (default) or 'network' (swaps in-place per Figma)
	const [view, setView] = useState<'wallet' | 'network'>('wallet');
	const [internalBalanceVisible, setInternalBalanceVisible] = useState(true);

	const balanceVisible = controlledBalanceVisible ?? internalBalanceVisible;
	const networks = DEFAULT_NETWORKS;

	// ── Handlers ──────────────────────────────────────────────
	const handleToggleBalance = useCallback(() => {
		if (onToggleBalance) {
			onToggleBalance();
		} else {
			setInternalBalanceVisible((prev) => !prev);
		}
	}, [onToggleBalance]);

	const handleNetworkSelect = useCallback(
		(network: Parameters<NonNullable<typeof onNetworkChange>>[0]) => {
			onNetworkChange?.(network);
			setView('wallet');
		},
		[onNetworkChange],
	);

	// ── Derived ───────────────────────────────────────────────
	const formattedBalance = balance !== undefined ? `SOL ${formatSolBalance(balance)}` : null;
	const balanceText = (() => {
		if (balanceLoading) return 'Loading...';
		if (!balanceVisible) return '******';
		return formattedBalance;
	})();

	const rowPx = 'px-4 py-2.5';
	const containerCn = cn('min-w-full w-max max-w-sm rounded-lg overflow-hidden', 'bg-card', 'shadow-lg', className);

	// ═══════════════════════════════════════════════════════════
	// VIEW 2: Network selection (replaces wallet dropdown in-place)
	// Figma node 210:711 / 210:851
	// Composes NetworkHeader + NetworkDropdown sub-components
	// (exported building blocks — the consumer API for custom layouts)
	// ═══════════════════════════════════════════════════════════
	if (view === 'network') {
		return (
			<div className={containerCn} role="menu" aria-label="Select network">
				<div className="flex flex-col gap-1 p-2">
					{/* Header: "Network" + chevron-up → click goes back to wallet view */}
					<NetworkHeader isOpen onClick={() => setView('wallet')} />

					{/* Network options — className strips the default container styles */}
					<NetworkDropdown
						selectedNetwork={selectedNetwork}
						status={networkStatus}
						networks={networks}
						onSelect={handleNetworkSelect}
						className="w-full! p-0! rounded-none! bg-transparent!"
					/>
				</div>
			</div>
		);
	}

	// ═══════════════════════════════════════════════════════════
	// VIEW 1: Wallet info (default)
	// Figma node 210:630 / 210:775
	// ═══════════════════════════════════════════════════════════
	return (
		<div className={containerCn} role="menu" aria-label="Wallet options">
			{/* ── Row 1: Address + Balance ── */}
			<div className={cn(rowPx, 'border-b', 'border-border')}>
				<div className="flex items-center gap-2.5">
					<ButtonIcon src={wallet.icon} alt={wallet.name} size={32} className="shrink-0 rounded-4xl" />

					<div className="flex flex-col items-start justify-center gap-0.5">
						<AddressDisplay
							address={address}
							showExplorerLink={false}
							showTooltip={false}
							network={selectedNetwork}
							onCopy={onCopyAddress}
							className="text-sm font-medium [&>span]:bg-transparent! [&>span]:p-0! [&>span]:rounded-none!"
						/>

						{(formattedBalance || balanceLoading) && (
							<button
								type="button"
								onClick={handleToggleBalance}
								disabled={balanceLoading}
								className={cn(
									'text-left text-sm font-light',
									'text-muted-foreground',
									'transition-colors duration-200',
									balanceLoading ? 'cursor-default opacity-60' : 'cursor-pointer hover:opacity-70',
								)}
								aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
							>
								{balanceText}
							</button>
						)}
					</div>
				</div>
			</div>

			{/* ── Row 2: Network trigger → swaps to network view ── */}
			<div className={cn(onDisconnect && 'border-b', onDisconnect && 'border-border')}>
				<NetworkTrigger
					onClick={() => setView('network')}
					className={cn(
						'w-full! min-w-0! bg-transparent! border-0! rounded-none!',
						'text-card-foreground',
						'hover:bg-accent',
						'transition-colors duration-200',
					)}
				/>
			</div>

			{/* ── Row 3: Disconnect (only when onDisconnect is provided) ── */}
			{onDisconnect && (
				<button
					type="button"
					onClick={onDisconnect}
					className={cn(
						'w-full flex items-center gap-2.5',
						rowPx,
						'text-sm font-medium',
						'text-card-foreground',
						'hover:bg-accent',
						'transition-colors duration-200 cursor-pointer',
					)}
					role="menuitem"
				>
					<LogOut size={16} className="shrink-0" />
					<span>{disconnectLabel}</span>
				</button>
			)}
		</div>
	);
}

/**
 * WalletDropdownWrapper - Wrapper component for positioning dropdown relative to button.
 */
export function WalletDropdownWrapper({
	isOpen,
	children,
	className,
}: {
	isOpen: boolean;
	children: React.ReactNode;
	className?: string;
}): React.ReactElement | null {
	if (!isOpen) return null;

	return <div className={cn('absolute top-full right-0 mt-2 z-50', className)}>{children}</div>;
}
