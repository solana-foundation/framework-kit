'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChevronIconProps } from './types';

/**
 * ChevronIcon - Chevron indicator for dropdown state.
 * Points down when collapsed, up when expanded.
 * Uses ChevronDown from lucide-react for consistent iconography.
 *
 * @example
 * ```tsx
 * <ChevronIcon direction="down" />
 * ```
 */
export function ChevronIcon({ direction, className }: ChevronIconProps): React.ReactElement {
	const rotation = direction === 'up' ? 180 : 0;

	return (
		<div
			className={cn('text-current transition-transform duration-200', className)}
			style={{ transform: `rotate(${rotation}deg)` }}
		>
			<ChevronDown size={16} aria-hidden="true" />
		</div>
	);
}
