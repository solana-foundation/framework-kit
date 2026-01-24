'use client';

import { cn } from '../../../lib/utils';
import { StatusIndicator } from './StatusIndicator';
import type { NetworkOptionProps, Theme } from './types';

/** Theme-specific styles */
const themeStyles: Record<Theme, { selected: string; unselected: string }> = {
	dark: {
		selected: 'bg-[#52525c] text-[#fafafa]',
		unselected: 'text-[rgba(250,250,250,0.7)] hover:bg-[#52525c]/50',
	},
	light: {
		selected: 'bg-[rgba(228,228,231,0.4)] text-[#3f3f46]',
		unselected: 'text-[#3f3f46] hover:bg-[rgba(228,228,231,0.3)]',
	},
};

/**
 * NetworkOption - A single network option in the dropdown.
 * Dimensions from Figma: 175px (auto from container) x 29px
 */
export function NetworkOption({
	network,
	isSelected = false,
	status,
	theme = 'dark',
	onClick,
	className,
}: NetworkOptionProps) {
	const styles = themeStyles[theme];

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'w-full h-[29px] flex items-center justify-between p-[6px] rounded-[3px]',
				'transition-colors cursor-pointer',
				"font-['Inter',sans-serif] font-normal text-[14px] leading-normal",
				'focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30',
				isSelected ? styles.selected : styles.unselected,
				className,
			)}
			aria-selected={isSelected}
			role="option"
		>
			<span>{network.label}</span>
			{isSelected && status && <StatusIndicator status={status} />}
		</button>
	);
}
