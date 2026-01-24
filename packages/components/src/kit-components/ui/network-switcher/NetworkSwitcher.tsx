'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../../lib/utils';
import { NetworkDropdown } from './NetworkDropdown';
import { NetworkTrigger } from './NetworkTrigger';
import type { NetworkId, NetworkSwitcherProps } from './types';
import { DEFAULT_NETWORKS } from './types';

/**
 * NetworkSwitcher - A dropdown component for switching between Solana networks.
 *
 * Can be used standalone or embedded in other components (like ConnectWalletButton).
 *
 * @example
 * ```tsx
 * // Standalone usage
 * <NetworkSwitcher
 *   selectedNetwork="mainnet-beta"
 *   status="connected"
 *   onNetworkChange={(network) => console.log('Switched to:', network)}
 * />
 *
 * // Embedded in wallet dropdown
 * <NetworkSwitcher
 *   selectedNetwork={currentNetwork}
 *   onNetworkChange={handleNetworkChange}
 *   theme="dark"
 * />
 * ```
 */
export function NetworkSwitcher({
	selectedNetwork,
	status = 'connected',
	onNetworkChange,
	open: controlledOpen,
	onOpenChange,
	theme = 'dark',
	networks = DEFAULT_NETWORKS,
	className,
	disabled = false,
}: NetworkSwitcherProps) {
	// Internal state for uncontrolled mode
	const [internalOpen, setInternalOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Use controlled state if provided, otherwise internal
	const isOpen = controlledOpen ?? internalOpen;

	const handleOpenChange = useCallback(
		(newOpen: boolean) => {
			if (controlledOpen === undefined) {
				setInternalOpen(newOpen);
			}
			onOpenChange?.(newOpen);
		},
		[controlledOpen, onOpenChange],
	);

	const handleToggle = useCallback(() => {
		if (!disabled) {
			handleOpenChange(!isOpen);
		}
	}, [disabled, isOpen, handleOpenChange]);

	const handleSelect = useCallback(
		(network: NetworkId) => {
			onNetworkChange?.(network);
			handleOpenChange(false);
		},
		[onNetworkChange, handleOpenChange],
	);

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				handleOpenChange(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}
	}, [isOpen, handleOpenChange]);

	// Close on Escape
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && isOpen) {
				handleOpenChange(false);
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, handleOpenChange]);

	return (
		<div ref={containerRef} className={cn('relative inline-block', className)}>
			{isOpen ? (
				<NetworkDropdown
					selectedNetwork={selectedNetwork}
					status={status}
					networks={networks}
					onSelect={handleSelect}
					theme={theme}
				/>
			) : (
				<NetworkTrigger isOpen={isOpen} theme={theme} onClick={handleToggle} disabled={disabled} />
			)}
		</div>
	);
}
