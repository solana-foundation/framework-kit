'use client';

import { Wallet } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { ButtonIconProps } from './types';

/**
 * ButtonIcon - Displays the wallet icon in the button.
 * Shows the connected wallet's logo/icon.
 * Falls back to Wallet icon from lucide-react if no src provided.
 *
 * @example
 * ```tsx
 * <ButtonIcon src={wallet.icon} alt={wallet.name} size={24} />
 * ```
 */
export function ButtonIcon({ src, alt = 'Wallet icon', size = 24, className }: ButtonIconProps): React.ReactElement {
	// Fallback to Wallet icon from lucide-react if no src provided
	if (!src) {
		return (
			<div
				className={cn('flex items-center justify-center rounded-full bg-zinc-700', className)}
				style={{ width: size, height: size }}
				aria-hidden="true"
			>
				<Wallet size={size * 0.6} className="text-zinc-400" />
			</div>
		);
	}

	return (
		<img src={src} alt={alt} width={size} height={size} className={cn('rounded-full object-contain', className)} />
	);
}
