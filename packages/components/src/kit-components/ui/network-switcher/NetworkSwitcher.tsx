'use client';

import type { ClusterMoniker } from '@solana/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { NetworkDropdown } from './NetworkDropdown';
import { NetworkTrigger } from './NetworkTrigger';
import type { NetworkSwitcherProps } from './types';
import { DEFAULT_NETWORKS } from './types';

/**
 * NetworkSwitcher - A dropdown component for switching between Solana networks.
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
 * // Controlled open state
 * <NetworkSwitcher
 *   selectedNetwork={currentNetwork}
 *   onNetworkChange={handleNetworkChange}
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * />
 * ```
 */
export function NetworkSwitcher({
	selectedNetwork,
	status = 'connected',
	onNetworkChange,
	open: controlledOpen,
	onOpenChange,
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
		(network: ClusterMoniker) => {
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
		<div ref={containerRef} className={cn('relative inline-block min-w-44', isOpen && 'z-50', className)}>
			{/* Trigger is always visible */}
			<NetworkTrigger
				isOpen={isOpen}
				selectedLabel={networks.find((n) => n.id === selectedNetwork)?.label}
				status={status}
				onClick={handleToggle}
				disabled={disabled}
			/>

			{/* Dropdown appears below trigger when open */}
			{isOpen && (
				<div className="absolute top-full inset-x-0 mt-1 z-50">
					<NetworkDropdown
						selectedNetwork={selectedNetwork}
						status={status}
						networks={networks}
						onSelect={handleSelect}
					/>
				</div>
			)}
		</div>
	);
}
