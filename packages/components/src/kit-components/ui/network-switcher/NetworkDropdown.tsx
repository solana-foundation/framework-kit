'use client';

import { cn } from '../../../lib/utils';
import { NetworkHeader } from './NetworkHeader';
import { NetworkOption } from './NetworkOption';
import type { NetworkDropdownProps, Theme } from './types';

/** Theme-specific container styles */
const containerStyles: Record<Theme, string> = {
	dark: 'bg-[#3f3f46]',
	light: 'bg-[#fafafa]',
};

/**
 * NetworkDropdown - Expanded dropdown showing all network options.
 * Dimensions from Figma: 191px x auto (based on items)
 */
export function NetworkDropdown({
	selectedNetwork,
	status = 'connected',
	networks,
	onSelect,
	theme = 'dark',
	className,
}: NetworkDropdownProps) {
	return (
		<div
			className={cn(
				'w-[191px] flex flex-col gap-[4px] p-[8px] rounded-[10px]',
				containerStyles[theme],
				className,
			)}
			role="listbox"
			aria-label="Select network"
		>
			<NetworkHeader isOpen theme={theme} />

			{networks.map((network) => (
				<NetworkOption
					key={network.id}
					network={network}
					isSelected={network.id === selectedNetwork}
					status={network.id === selectedNetwork ? status : undefined}
					theme={theme}
					onClick={() => onSelect?.(network.id)}
				/>
			))}
		</div>
	);
}
