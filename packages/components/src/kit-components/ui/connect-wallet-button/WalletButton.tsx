'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ButtonContent } from './ButtonContent';
import { ButtonIcon } from './ButtonIcon';
import { ButtonSpinner } from './ButtonSpinner';
import { ChevronIcon } from './ChevronIcon';
import type { WalletButtonProps } from './types';

/**
 * Button variants using class-variance-authority.
 * Uses semantic CSS variable tokens for theming.
 */
const walletButtonVariants = cva(
	[
		'inline-flex items-center justify-center',
		'font-medium text-sm leading-4',
		'transition-all duration-200 ease-in-out',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring',
		'disabled:pointer-events-none disabled:opacity-50',
		'cursor-pointer',
	],
	{
		variants: {
			variant: {
				/** Filled button - Disconnected state */
				filled: [
					'border border-border',
					'bg-primary hover:bg-primary/90',
					'text-primary-foreground',
					'gap-2 rounded-2xl',
				],
				/** Loading state */
				loading: ['border border-transparent', 'bg-secondary', 'text-card-foreground', 'rounded-2xl'],
				/** Connected state */
				connected: [
					'border border-border',
					'bg-card hover:bg-secondary',
					'text-card-foreground',
					'gap-2.5 rounded-lg',
				],
			},
			size: {
				/** Default size */
				default: 'min-h-9 px-4 py-2.5',
				sm: 'h-8 px-3 py-1.5 text-xs',
				lg: 'h-12 px-6 py-3 text-base',
				/** Loading size (wider horizontal padding) */
				loading: 'min-h-9 px-5 py-2.5',
				/** Connected size */
				connected: 'min-h-9 px-4 py-2.5',
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
	variant?: 'filled' | 'loading' | 'connected';
	/** Button size */
	size?: 'default' | 'sm' | 'lg' | 'loading' | 'connected';
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
	({ connectionState, wallet, isExpanded = false, variant, size, className, disabled, children, ...props }, ref) => {
		// Determine variant based on connection state
		const resolvedVariant = (() => {
			if (variant) return variant;
			if (connectionState === 'connected') return 'connected';
			if (connectionState === 'connecting') return 'loading';
			return 'filled';
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
					return <ButtonSpinner size={24} className="text-current" />;

				case 'connected':
					return (
						<>
							<ButtonIcon
								src={wallet?.icon}
								alt={wallet?.name ?? 'Connected wallet'}
								size={20}
								className="rounded-full"
							/>
							<ChevronIcon direction={isExpanded ? 'up' : 'down'} />
						</>
					);
				default:
					return <ButtonContent>{children ?? 'Connect Wallet'}</ButtonContent>;
			}
		};

		const buttonClasses = cn(walletButtonVariants({ variant: resolvedVariant, size: resolvedSize }), className);

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
