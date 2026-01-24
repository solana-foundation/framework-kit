import { cn } from '../../../lib/utils';
import type { WalletLabelType, WalletModalTheme } from './types';

export interface WalletLabelProps {
	/** The label type to display */
	type: WalletLabelType;
	/** Theme variant */
	theme?: WalletModalTheme;
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
 * <WalletLabel type="recent" theme="dark" />
 * <WalletLabel type="detected" theme="light" />
 * ```
 */
export function WalletLabel({ type, theme = 'dark', className }: WalletLabelProps) {
	return (
		<span
			className={cn(
				'inline-flex items-center justify-center px-1.5 py-0.5 rounded-[3px] text-xs font-normal',
				// Dark theme
				theme === 'dark' && ['bg-[rgba(82,82,92,0.6)]', 'text-[#E4E4E7] opacity-90'],
				// Light theme
				theme === 'light' && ['bg-[#F4F4F5]', 'text-[rgba(63,63,70,0.9)]'],
				className,
			)}
		>
			{labelText[type]}
		</span>
	);
}
