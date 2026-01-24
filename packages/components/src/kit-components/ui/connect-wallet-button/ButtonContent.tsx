'use client';

import { cn } from '../../../lib/utils';
import type { ButtonContentProps } from './types';

/**
 * ButtonContent - Text content wrapper for wallet button.
 * Provides consistent typography styling.
 *
 * @example
 * ```tsx
 * <ButtonContent>Connect Wallet</ButtonContent>
 * ```
 */
export function ButtonContent({ children, className }: ButtonContentProps): React.ReactElement {
	return <span className={cn('text-sm font-medium leading-none select-none', className)}>{children}</span>;
}
