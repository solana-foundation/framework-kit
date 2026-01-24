'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import { cn } from '../../../lib/utils';
import { ButtonContent } from './ButtonContent';
import { ButtonIcon } from './ButtonIcon';
import { ButtonSpinner } from './ButtonSpinner';
import { ChevronIcon } from './ChevronIcon';
import type { WalletButtonProps } from './types';

/**
 * Button variants using class-variance-authority.
 * Figma specs (nodes 23:32, 23:33, 23:37, 23:42, 23:44, 23:46, 23:98):
 * - Disconnected: h=37px, px=15px, py=10px, rounded=18px
 *   - Dark: bg=#3F3F46, hover=#52525C, text=#FAFAFA
 *   - Light: bg=transparent, hover=#E4E4E7, text=#3F3F46
 * - Loading: h=37px, px=20px, py=10px, rounded=18px
 *   - Dark: bg=#52525C
 *   - Light: bg=#F4F4F5
 *   - Spinner: 24px
 * - Connected: h=37px, px=15px, py=10px, rounded=9px, gap=10px
 *   - bg=#3F3F46, icon=20px, chevron=16px
 */
const walletButtonVariants = cva(
	// Base styles - Figma: text 14px, font-medium
	[
		'inline-flex items-center justify-center',
		'font-medium text-[14px] leading-[17px]',
		'transition-all duration-200 ease-in-out',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
		'disabled:pointer-events-none disabled:opacity-50',
		'cursor-pointer',
	],
	{
		variants: {
			variant: {
				/** Outlined button - Light theme disconnected state
				 * Figma (23:42, 23:44): bg=transparent, hover=#E4E4E7, text=#3F3F46, rounded=18px
				 */
				outline: [
					'border border-zinc-200',
					'bg-white hover:bg-[#E4E4E7]',
					'text-[#3F3F46]',
					'focus-visible:ring-zinc-400',
					'gap-2 rounded-[18px]',
				],
				/** Filled button - Dark theme disconnected state
				 * Figma (23:33): bg=#3F3F46, hover=#52525C, text=#FAFAFA, rounded=18px
				 */
				filled: [
					'border border-transparent',
					'bg-[#3F3F46] hover:bg-[#52525C]',
					'text-[#FAFAFA]',
					'focus-visible:ring-zinc-500',
					'gap-2 rounded-[18px]',
				],
				/** Loading state - Dark theme
				 * Figma (23:32, 23:37): bg=#52525C, rounded=18px
				 */
				loading: [
					'border border-transparent',
					'bg-[#52525C]',
					'text-[#FAFAFA]',
					'focus-visible:ring-zinc-500',
					'rounded-[18px]',
				],
				/** Loading state - Light theme
				 * Figma (23:46): bg=#F4F4F5, rounded=18px
				 */
				loadingLight: [
					'border border-transparent',
					'bg-[#F4F4F5]',
					'text-[#3F3F46]',
					'focus-visible:ring-zinc-400',
					'rounded-[18px]',
				],
				/** Connected state - Dark theme
				 * Figma (23:98): bg=#3F3F46, rounded=9px, gap=10px
				 */
				connected: [
					'border border-transparent',
					'bg-[#3F3F46] hover:bg-[#52525C]',
					'text-white',
					'focus-visible:ring-zinc-500',
					'gap-2.5 rounded-[9px]',
				],
				/** Connected state - Light theme */
				connectedLight: [
					'border border-zinc-200',
					'bg-white hover:bg-[#E4E4E7]',
					'text-[#3F3F46]',
					'focus-visible:ring-zinc-400',
					'gap-2.5 rounded-[9px]',
				],
			},
			size: {
				/** Default size - Figma: h=37px, px=15px, py=10px */
				default: 'h-[37px] px-[15px] py-[10px]',
				sm: 'h-8 px-3 py-1.5 text-xs',
				lg: 'h-12 px-6 py-3 text-base',
				/** Loading size - Figma: h=37px, px=20px, py=10px (wider padding) */
				loading: 'h-[37px] px-[20px] py-[10px]',
				/** Connected size - Figma: h=37px, px=15px, py=10px */
				connected: 'h-[37px] px-[15px] py-[10px]',
			},
		},
		defaultVariants: {
			variant: 'filled',
			size: 'default',
		},
	},
);

export type WalletButtonVariantProps = VariantProps<typeof walletButtonVariants>;

export interface WalletButtonFullProps extends WalletButtonProps, WalletButtonVariantProps {
	/** Button variant style */
	variant?: 'outline' | 'filled' | 'loading' | 'loadingLight' | 'connected' | 'connectedLight';
	/** Button size */
	size?: 'default' | 'sm' | 'lg' | 'loading' | 'connected';
	/** Theme for the button */
	theme?: 'dark' | 'light';
}

/**
 * WalletButton - Main button component for wallet connection.
 * Handles disconnected, connecting, and connected states with appropriate UI.
 *
 * @example
 * ```tsx
 * // Disconnected state
 * <WalletButton connectionState="disconnected" onClick={openModal} />
 *
 * // Connecting state
 * <WalletButton connectionState="connecting" disabled />
 *
 * // Connected state
 * <WalletButton
 *   connectionState="connected"
 *   wallet={connectedWallet}
 *   isExpanded={isOpen}
 *   onClick={toggleDropdown}
 * />
 * ```
 */
export const WalletButton = forwardRef<HTMLButtonElement, WalletButtonFullProps>(
	(
		{
			connectionState,
			wallet,
			isExpanded = false,
			animate = false,
			variant,
			size,
			theme = 'dark',
			className,
			disabled,
			children,
			...props
		},
		ref,
	) => {
		// Determine variant based on connection state and theme
		const resolvedVariant = (() => {
			if (variant) return variant;
			if (connectionState === 'connected') {
				return theme === 'light' ? 'connectedLight' : 'connected';
			}
			if (connectionState === 'connecting') {
				return theme === 'light' ? 'loadingLight' : 'loading';
			}
			// Disconnected state
			return theme === 'light' ? 'outline' : 'filled';
		})();

		// Determine size based on connection state
		const resolvedSize = (() => {
			if (size) return size;
			if (connectionState === 'connected') return 'connected';
			if (connectionState === 'connecting') return 'loading';
			return 'default';
		})();

		// Render content based on connection state
		const renderContent = () => {
			switch (connectionState) {
				case 'connecting':
					// Figma: spinner 24px
					return <ButtonSpinner size={24} className="text-current" />;

				case 'connected':
					// Figma: wallet icon 20px, chevron 16px
					return (
						<>
							<ButtonIcon
								src={wallet?.icon}
								alt={wallet?.name ?? 'Connected wallet'}
								size={20}
								className="rounded-[20px]"
							/>
							<ChevronIcon direction={isExpanded ? 'up' : 'down'} animate={animate} />
						</>
					);
				default:
					return <ButtonContent>{children ?? 'Connect Wallet'}</ButtonContent>;
			}
		};

		const buttonClasses = cn(walletButtonVariants({ variant: resolvedVariant, size: resolvedSize }), className);

		// Use motion.button for animated variant
		if (animate) {
			return (
				<motion.button
					ref={ref}
					className={buttonClasses}
					disabled={disabled || connectionState === 'connecting'}
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					transition={{ duration: 0.15 }}
					aria-busy={connectionState === 'connecting'}
					aria-expanded={connectionState === 'connected' ? isExpanded : undefined}
					aria-label={
						connectionState === 'connecting'
							? 'Connecting wallet...'
							: connectionState === 'connected'
								? `${wallet?.name ?? 'Wallet'} ${isExpanded ? 'menu open' : 'menu closed'}`
								: 'Connect wallet'
					}
				>
					{renderContent()}
				</motion.button>
			);
		}

		return (
			<button
				ref={ref}
				type="button"
				className={buttonClasses}
				disabled={disabled || connectionState === 'connecting'}
				aria-busy={connectionState === 'connecting'}
				aria-expanded={connectionState === 'connected' ? isExpanded : undefined}
				aria-label={
					connectionState === 'connecting'
						? 'Connecting wallet...'
						: connectionState === 'connected'
							? `${wallet?.name ?? 'Wallet'} ${isExpanded ? 'menu open' : 'menu closed'}`
							: 'Connect wallet'
				}
				{...props}
			>
				{renderContent()}
			</button>
		);
	},
);

WalletButton.displayName = 'WalletButton';

export { walletButtonVariants };
