'use client';

import { cn } from '@/lib/utils';
import { StatusIndicator } from './StatusIndicator';
import type { NetworkOptionProps } from './types';

/**
 * NetworkOption - A single network option in the dropdown.
 */
export function NetworkOption({ network, isSelected = false, status, onClick, className }: NetworkOptionProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'w-full min-h-7 flex items-center justify-between px-1.5 py-1 rounded-sm',
				'transition-colors cursor-pointer',
				"font-['Inter',sans-serif] font-normal text-sm leading-normal",
				'focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
				isSelected ? 'bg-accent text-card-foreground' : 'text-muted-foreground hover:bg-accent',
				className,
			)}
			aria-selected={isSelected}
			role="option"
		>
			<span>{network.label}</span>
			{isSelected && status && <StatusIndicator status={status} />}
		</button>
	);
}
