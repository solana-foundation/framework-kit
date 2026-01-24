'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../../lib/utils';
import type { Theme } from './types';
import { WalletButton } from './WalletButton';
import { WalletDropdown, WalletDropdownWrapper } from './WalletDropdown';

/**
 * Props for the ConnectWalletButton component.
 */
export interface ConnectWalletButtonProps {
	/** Theme for the button and dropdown */
	theme?: Theme;
	/** Enable Framer Motion animations */
	animate?: boolean;
	/** Additional className for the container */
	className?: string;
	/** Custom labels */
	labels?: {
		connect?: string;
		connecting?: string;
		disconnect?: string;
	};
	// === Wallet Connection Props (from useWalletConnection) ===
	/** Current connection status */
	status: 'disconnected' | 'connecting' | 'connected' | 'error';
	/** Whether the hook has hydrated (for SSR) */
	isReady?: boolean;
	/** Connected wallet session */
	wallet?: {
		address: string;
		publicKey?: { toBase58(): string };
	};
	/** Current wallet connector info */
	currentConnector?: {
		id: string;
		name: string;
		icon?: string;
	};
	/** Wallet balance in lamports */
	balance?: bigint | null;
	/** Whether balance is still loading */
	balanceLoading?: boolean;
	/** Callback when connect button is clicked (opens wallet modal) */
	onConnect?: () => void;
	/** Callback to disconnect wallet */
	onDisconnect?: () => Promise<void> | void;
}

/**
 * ConnectWalletButton - Fully functional wallet connection button.
 *
 * This component handles all wallet connection states and integrates with
 * the framework-kit hooks. Use this as the main entry point for wallet UIs.
 *
 * @example
 * ```tsx
 * // With useWalletConnection hook
 * const { status, wallet, currentConnector, disconnect, isReady } = useWalletConnection();
 * const { lamports } = useBalance(wallet?.address);
 * const modal = useWalletModalState();
 *
 * <ConnectWalletButton
 *   status={status}
 *   isReady={isReady}
 *   wallet={wallet ? { address: wallet.address } : undefined}
 *   currentConnector={currentConnector}
 *   balance={lamports}
 *   onConnect={modal.open}
 *   onDisconnect={disconnect}
 * />
 * ```
 */
export function ConnectWalletButton({
	theme = 'dark',
	animate = true,
	className,
	labels,
	status,
	isReady = true,
	wallet,
	currentConnector,
	balance,
	balanceLoading = false,
	onConnect,
	onDisconnect,
}: ConnectWalletButtonProps) {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [balanceVisible, setBalanceVisible] = useState(true);
	const containerRef = useRef<HTMLDivElement>(null);

	// Map external status to internal connection state
	const connectionState = (() => {
		if (!isReady) return 'disconnected'; // Show disconnected during SSR
		if (status === 'connecting') return 'connecting';
		if (status === 'connected' && wallet) return 'connected';
		return 'disconnected';
	})();

	// Format wallet address for display
	const walletAddress = wallet?.address ?? wallet?.publicKey?.toBase58() ?? '';

	// Handle button click based on state
	const handleButtonClick = useCallback(() => {
		if (connectionState === 'connected') {
			setIsDropdownOpen((prev) => !prev);
		} else if (connectionState === 'disconnected') {
			onConnect?.();
		}
	}, [connectionState, onConnect]);

	// Handle disconnect
	const handleDisconnect = useCallback(async () => {
		setIsDropdownOpen(false);
		await onDisconnect?.();
	}, [onDisconnect]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};

		if (isDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}
	}, [isDropdownOpen]);

	// Close dropdown on escape key
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsDropdownOpen(false);
			}
		};

		if (isDropdownOpen) {
			document.addEventListener('keydown', handleEscape);
			return () => document.removeEventListener('keydown', handleEscape);
		}
	}, [isDropdownOpen]);

	// Build wallet info for UI components
	const walletInfo = currentConnector
		? {
				id: currentConnector.id,
				name: currentConnector.name,
				icon: currentConnector.icon,
			}
		: undefined;

	return (
		<div ref={containerRef} className={cn('relative inline-block', className)}>
			<WalletButton
				connectionState={connectionState}
				wallet={walletInfo}
				isExpanded={isDropdownOpen}
				animate={animate}
				theme={theme}
				onClick={handleButtonClick}
				disabled={!isReady || status === 'connecting'}
				aria-haspopup={connectionState === 'connected' ? 'menu' : undefined}
				aria-expanded={connectionState === 'connected' ? isDropdownOpen : undefined}
			>
				{connectionState === 'disconnected' && (labels?.connect ?? 'Connect Wallet')}
			</WalletButton>

			{connectionState === 'connected' && walletInfo && (
				<WalletDropdownWrapper isOpen={isDropdownOpen}>
					<WalletDropdown
						wallet={walletInfo}
						address={walletAddress}
						balance={balance ?? undefined}
						balanceVisible={balanceVisible}
						balanceLoading={balanceLoading}
						theme={theme}
						animate={animate}
						onToggleBalance={() => setBalanceVisible((prev) => !prev)}
						onDisconnect={handleDisconnect}
						labels={{
							disconnect: labels?.disconnect,
						}}
					/>
				</WalletDropdownWrapper>
			)}
		</div>
	);
}

export default ConnectWalletButton;
