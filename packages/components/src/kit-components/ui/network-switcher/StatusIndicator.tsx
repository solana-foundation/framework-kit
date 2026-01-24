'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { StatusIndicatorProps } from './types';

/**
 * StatusIndicator - Shows network connection status as colored dot or spinner.
 *
 * - Connected: green dot
 * - Error: red dot
 * - Connecting: spinning loader
 */
export function StatusIndicator({ status, className }: StatusIndicatorProps) {
	if (status === 'connecting') {
		return <Loader2 size={14} className={cn('animate-spin text-zinc-400', className)} aria-label="Connecting" />;
	}

	return (
		<output
			className={cn(
				'size-[8px] rounded-full shrink-0',
				status === 'connected' && 'bg-green-500',
				status === 'error' && 'bg-red-500',
				className,
			)}
			aria-label={status === 'connected' ? 'Connected' : 'Connection error'}
		/>
	);
}
