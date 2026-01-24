'use client';

import { ChevronUp } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { NetworkHeaderProps, Theme } from './types';

/** Theme-specific styles */
const themeStyles: Record<Theme, string> = {
	dark: 'text-[#fafafa]',
	light: 'text-[#3f3f46]',
};

/**
 * NetworkHeader - Header row inside dropdown with "Network" label and chevron.
 * Dimensions from Figma: 175px (auto from container) x 29px
 */
export function NetworkHeader({ isOpen = true, theme = 'dark', onClick, className }: NetworkHeaderProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'w-full h-[29px] flex items-center justify-between p-[6px] rounded-[3px]',
				"font-['Inter',sans-serif] font-medium text-[14px] leading-normal",
				'cursor-pointer transition-colors',
				'focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30',
				themeStyles[theme],
				className,
			)}
			aria-expanded={isOpen}
		>
			<span>Network</span>
			<ChevronUp size={16} className={cn('transition-transform duration-200', !isOpen && 'rotate-180')} />
		</button>
	);
}
