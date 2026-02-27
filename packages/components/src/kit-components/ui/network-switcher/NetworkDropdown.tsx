'use client';

import { cn } from '@/lib/utils';
import { NetworkOption } from './NetworkOption';
import type { NetworkDropdownProps } from './types';

/**
 * NetworkDropdown - Expanded dropdown showing all network options.
 */
export function NetworkDropdown({
	selectedNetwork,
	status = 'connected',
	networks,
	onSelect,
	className,
}: NetworkDropdownProps) {
	return (
		<div
			className={cn('w-full min-w-44 flex flex-col gap-1 p-2 rounded-lg', 'bg-secondary', className)}
			role="listbox"
			aria-label="Select network"
		>
			{networks.map((network) => (
				<NetworkOption
					key={network.id}
					network={network}
					isSelected={network.id === selectedNetwork}
					status={network.id === selectedNetwork ? status : undefined}
					onClick={() => onSelect?.(network.id)}
				/>
			))}
		</div>
	);
}
