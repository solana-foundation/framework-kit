'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { ButtonSpinnerProps } from './types';

/**
 * ButtonSpinner - Animated loading spinner for wallet button.
 * Shows during wallet connection attempts.
 * Uses Loader2 from lucide-react for consistent iconography.
 *
 * @example
 * ```tsx
 * <ButtonSpinner size={20} className="text-white" />
 * ```
 */
export function ButtonSpinner({ size = 20, className }: ButtonSpinnerProps): React.ReactElement {
	return <Loader2 className={cn('animate-spin', className)} size={size} aria-hidden="true" />;
}
