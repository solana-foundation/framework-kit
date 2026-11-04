import { TriangleAlert } from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';
import type { ErrorStateProps } from './types';

/**
 * Error state component for displaying error messages with optional retry
 */
export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, className = '' }) => {
	return (
		<div className={cn('flex items-center gap-2', className)} role="alert" aria-live="assertive">
			<TriangleAlert size={16} className="text-destructive" />
			<span className="text-sm text-destructive">{message}</span>
			{onRetry && (
				<button
					type="button"
					onClick={onRetry}
					className="text-sm underline text-destructive hover:text-destructive/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-destructive rounded"
				>
					Try again
				</button>
			)}
		</div>
	);
};
