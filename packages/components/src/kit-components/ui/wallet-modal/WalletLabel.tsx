import { cn } from '@/lib/utils';
import type { WalletLabelType } from './types';

export interface WalletLabelProps {
	/** The label type to display */
	type: WalletLabelType;
	/** Additional class names */
	className?: string;
}

const labelText: Record<WalletLabelType, string> = {
	recent: 'Recent',
	detected: 'Detected',
	installed: 'Installed',
};

/**
 * WalletLabel - Badge component for wallet status (Recent, Detected, etc.)
 *
 * @example
 * ```tsx
 * <WalletLabel type="recent" />
 * <WalletLabel type="detected" />
 * ```
 */
export function WalletLabel({ type, className }: WalletLabelProps) {
	return (
		<span
			className={cn(
				'inline-flex items-center justify-center px-1.5 py-0.5 rounded-sm text-xs font-normal',
				'bg-muted text-muted-foreground',
				className,
			)}
		>
			{labelText[type]}
		</span>
	);
}
