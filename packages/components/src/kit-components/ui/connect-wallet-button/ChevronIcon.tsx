'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { ChevronIconProps } from './types';

/**
 * ChevronIcon - Animated chevron indicator for dropdown state.
 * Points down when collapsed, up when expanded.
 * Uses ChevronDown from lucide-react for consistent iconography.
 *
 * @example
 * ```tsx
 * <ChevronIcon direction="down" animate />
 * ```
 */
export function ChevronIcon({ direction, animate = false, className }: ChevronIconProps): React.ReactElement {
	const rotation = direction === 'up' ? 180 : 0;

	if (animate) {
		return (
			<motion.div
				className={cn('text-current', className)}
				animate={{ rotate: rotation }}
				transition={{ duration: 0.2, ease: 'easeInOut' }}
			>
				<ChevronDown size={16} aria-hidden="true" />
			</motion.div>
		);
	}

	return (
		<div
			className={cn('text-current transition-transform duration-200', className)}
			style={{ transform: `rotate(${rotation}deg)` }}
		>
			<ChevronDown size={16} aria-hidden="true" />
		</div>
	);
}
