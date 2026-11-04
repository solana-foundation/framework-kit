import type React from 'react';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '../skeleton/Skeleton';
import type { TransactionTableSkeletonProps } from './types';

function toCssSize(size: NonNullable<TransactionTableSkeletonProps['size']>) {
	switch (size) {
		case 'sm':
			return {
				row: 'py-2 px-4',
				icon: 'size-4',
				token: 'size-5',
				label: 'h-3 w-16',
				time: 'h-3 w-24',
				address: 'h-3 w-28',
				amountMain: 'h-3 w-16',
				amountFiat: 'h-2.5 w-12',
			};
		case 'lg':
			return {
				row: 'py-3.5 px-5',
				icon: 'size-5',
				token: 'size-7',
				label: 'h-5 w-24',
				time: 'h-5 w-32',
				address: 'h-5 w-36',
				amountMain: 'h-4 w-24',
				amountFiat: 'h-3.5 w-16',
			};
		default:
			return {
				row: 'py-2.5 px-4',
				icon: 'size-4',
				token: 'size-6',
				label: 'h-4 w-20',
				time: 'h-4 w-28',
				address: 'h-4 w-32',
				amountMain: 'h-3.5 w-20',
				amountFiat: 'h-3 w-14',
			};
	}
}

/**
 * Skeleton loading state for the TransactionTable component.
 *
 * @example
 * ```tsx
 * <TransactionTableSkeleton rowCount={5} />
 * ```
 */
export const TransactionTableSkeleton: React.FC<TransactionTableSkeletonProps> = ({
	size = 'md',
	rowCount = 4,
	className,
}) => {
	const css = toCssSize(size);
	const keysRef = useRef<string[]>([]);
	if (keysRef.current.length !== rowCount) {
		const next: string[] = [];
		for (let i = 0; i < rowCount; i++) {
			next.push(
				keysRef.current[i] ?? globalThis.crypto?.randomUUID?.() ?? `row-${Math.random().toString(36).slice(2)}`,
			);
		}
		keysRef.current = next;
	}

	return (
		<output className={cn('divide-y divide-border', className)} aria-label="Loading transactions">
			{keysRef.current.map((key) => (
				<div key={key} className={cn('grid grid-cols-4 items-center gap-6', css.row)}>
					{/* Type */}
					<div className="flex items-center gap-3 min-w-0">
						<Skeleton className={cn(css.icon, 'rounded-full')} />
						<Skeleton className={css.label} />
					</div>
					{/* Time */}
					<Skeleton className={css.time} />
					{/* Address */}
					<Skeleton className={css.address} />
					{/* Amount */}
					<div className="flex items-center gap-2 min-w-0">
						<Skeleton className={cn(css.token, 'rounded-full')} />
						<div className="min-w-0">
							<Skeleton className={css.amountMain} />
							<Skeleton className={cn('mt-1.5', css.amountFiat)} />
						</div>
					</div>
				</div>
			))}
		</output>
	);
};
