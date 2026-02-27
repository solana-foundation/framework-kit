'use client';

import { ChevronRight, Network } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusIndicator } from './StatusIndicator';
import type { NetworkTriggerProps } from './types';

/**
 * NetworkTrigger - Trigger button showing the selected network with status indicator.
 */
export function NetworkTrigger({
	isOpen = false,
	selectedLabel,
	status,
	onClick,
	className,
	disabled = false,
}: NetworkTriggerProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				'w-full min-w-44 min-h-10 flex items-center justify-between',
				'px-4 py-2.5 rounded-lg',
				'border-b border-solid',
				"font-['Inter',sans-serif] font-medium text-sm leading-normal",
				'cursor-pointer transition-colors',
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
				'disabled:opacity-50 disabled:cursor-not-allowed',
				'bg-secondary',
				'text-card-foreground',
				'border-border',
				className,
			)}
			aria-expanded={isOpen}
			aria-haspopup="listbox"
		>
			<div className="flex items-center gap-2">
				<Network size={16} className="shrink-0" />
				<span>{selectedLabel ?? 'Network'}</span>
				{status && <StatusIndicator status={status} />}
			</div>
			<ChevronRight
				size={16}
				className={cn('shrink-0 transition-transform duration-200', isOpen && 'rotate-90')}
			/>
		</button>
	);
}
