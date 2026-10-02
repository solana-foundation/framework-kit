import type React from 'react';
import { cn } from '@/lib/utils';
import type { BalanceCardSkeletonProps } from './types';

/**
 * Skeleton loading state for the BalanceCard component
 */
export const BalanceCardSkeleton: React.FC<BalanceCardSkeletonProps> = ({ size = 'md', className = '' }) => {
	const paddingStyles = {
		sm: 'p-3',
		md: 'p-4',
		lg: 'p-6',
	}[size];

	return (
		<output
			className={cn('block rounded-xl border border-border bg-card', paddingStyles, className)}
			aria-label="Loading balance"
		>
			{/* Header skeleton - address area */}
			<div className="flex items-center gap-2 mb-4">
				<div className="w-5 h-5 rounded bg-secondary animate-pulse" />
				<div className="h-4 w-24 rounded bg-secondary animate-pulse" />
				<div className="w-4 h-4 rounded bg-secondary animate-pulse" />
			</div>

			{/* Label skeleton */}
			<div className="h-3 w-20 rounded bg-secondary animate-pulse mb-2" />

			{/* Balance skeleton */}
			<div className="h-8 w-32 rounded bg-secondary animate-pulse mb-4" />

			{/* View all tokens skeleton */}
			<div className="flex items-center justify-between pt-3 border-t border-border">
				<div className="h-4 w-24 rounded bg-secondary animate-pulse" />
				<div className="w-5 h-5 rounded bg-secondary animate-pulse" />
			</div>
		</output>
	);
};
