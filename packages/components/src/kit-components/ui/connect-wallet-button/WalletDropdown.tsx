'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, LogOut } from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn, formatSolBalance, truncateAddress } from '../../../lib/utils';
import { ButtonIcon } from './ButtonIcon';
import type { WalletDropdownProps } from './types';

/**
 * Figma design specs (node 23:98):
 * - Dropdown width: 191px
 * - Background: #3F3F46
 * - Border radius: 9px
 * - Padding: 15px horizontal, 10px vertical
 * - Border bottom: 0.5px solid rgba(228,228,231,0.2)
 * - Wallet icon in dropdown: 32px
 * - Address text: 14px, font-weight medium, color #E4E4E7
 * - Copy icon: 16px
 * - Balance text: 14px, font-weight light, opacity 80%
 * - Disconnect icon: 16px
 * - Gap: 10px
 */

/** Theme-specific color classes */
const themeClasses = {
	dark: {
		container: 'bg-[#3F3F46]',
		border: 'border-[rgba(228,228,231,0.2)]',
		shadow: 'shadow-black/25',
		text: 'text-[#E4E4E7]',
		textSecondary: 'text-[#E4E4E7]/80',
		textHover: 'hover:text-white',
		buttonHover: 'hover:bg-zinc-600/60 active:bg-zinc-500',
		disconnectText: 'text-[#E4E4E7]',
		disconnectHover: 'hover:bg-zinc-600/50 active:bg-zinc-600',
		divider: 'bg-[rgba(228,228,231,0.2)]',
	},
	light: {
		container: 'bg-white',
		border: 'border-zinc-200',
		shadow: 'shadow-zinc-200/50',
		text: 'text-zinc-900',
		textSecondary: 'text-zinc-500',
		textHover: 'hover:text-zinc-700',
		buttonHover: 'hover:bg-zinc-100 active:bg-zinc-200',
		disconnectText: 'text-zinc-600',
		disconnectHover: 'hover:bg-zinc-100 active:bg-zinc-200',
		divider: 'bg-zinc-200',
	},
} as const;

/**
 * WalletDropdown - Connected wallet dropdown showing address, balance, and disconnect.
 *
 * Features:
 * - Truncated address with copy functionality
 * - Balance display with show/hide toggle (click to toggle)
 * - Disconnect button
 * - Optional animations via Framer Motion
 * - Responsive design with mobile-first approach
 * - Dark/light theme support
 *
 * @example
 * ```tsx
 * <WalletDropdown
 *   wallet={connectedWallet}
 *   address="6DMh7gJwvuT..."
 *   balance={1120000000n}
 *   onDisconnect={() => disconnect()}
 *   theme="dark"
 *   animate
 * />
 * ```
 */
export function WalletDropdown({
	wallet,
	address,
	balance,
	balanceVisible: controlledBalanceVisible,
	balanceLoading = false,
	onToggleBalance,
	onDisconnect,
	onCopyAddress,
	animate = false,
	theme = 'dark',
	className,
	labels,
}: WalletDropdownProps): React.ReactElement {
	// Internal state for balance visibility (uncontrolled mode)
	const [internalBalanceVisible, setInternalBalanceVisible] = useState(true);
	const [copied, setCopied] = useState(false);

	// Use controlled or uncontrolled balance visibility
	const balanceVisible = controlledBalanceVisible ?? internalBalanceVisible;

	// Get theme-specific classes
	const colors = themeClasses[theme];

	const handleToggleBalance = useCallback(() => {
		if (onToggleBalance) {
			onToggleBalance();
		} else {
			setInternalBalanceVisible((prev) => !prev);
		}
	}, [onToggleBalance]);

	const handleCopyAddress = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(address);
			setCopied(true);
			onCopyAddress?.();
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy address:', err);
		}
	}, [address, onCopyAddress]);

	const formattedBalance = balance !== undefined ? `SOL ${formatSolBalance(balance)}` : null;

	/** Display text for balance section */
	const balanceDisplayText = (() => {
		if (balanceLoading) return 'Loading...';
		if (!balanceVisible) return '******';
		if (formattedBalance) return formattedBalance;
		return null;
	})();

	/** Disconnect button label */
	const disconnectLabel = labels?.disconnect ?? 'Disconnect';

	const dropdownVariants = {
		hidden: { opacity: 0, y: -8, scale: 0.95 },
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: { duration: 0.15, ease: 'easeOut' as const },
		},
		exit: {
			opacity: 0,
			y: -8,
			scale: 0.95,
			transition: { duration: 0.1, ease: 'easeIn' as const },
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, x: -8 },
		visible: (i: number) => ({
			opacity: 1,
			x: 0,
			transition: { delay: i * 0.05, duration: 0.15 },
		}),
	};

	/** Shared dropdown container classes - Figma specs + theme */
	const dropdownClasses = cn(
		// Figma: width=191px
		'w-[191px]',
		// Figma: border-radius=9px
		'rounded-[9px]',
		// Theme-aware background
		colors.container,
		// Shadow for depth (theme-aware)
		'shadow-lg',
		colors.shadow,
		// Overflow handling
		'overflow-hidden',
		className,
	);

	/** Figma: padding 15px horizontal, 10px vertical */
	const contentPaddingClasses = 'px-[15px] py-[10px]';

	const content = (
		<div className={dropdownClasses} role="menu" aria-label="Wallet options">
			{/* Wallet info section - Figma: px-15 py-10, border-bottom 0.5px */}
			<div className={cn(contentPaddingClasses, 'border-b-[0.5px]', colors.border, 'rounded-t-[9px]')}>
				{/* Figma: gap-10px between icon and text content */}
				<div className="flex items-center gap-2.5">
					{/* Figma: wallet icon 32px in dropdown */}
					<ButtonIcon src={wallet.icon} alt={wallet.name} size={32} className="shrink-0 rounded-[20px]" />
					{/* Text content column */}
					<div className="flex flex-col items-start justify-center">
						{/* Address row with copy icon - Figma: gap-10px */}
						<div className="flex items-end gap-2.5">
							{/* Figma: 14px, font-weight medium, color #E4E4E7 */}
							<span className={cn('text-[14px] font-medium', colors.text)}>
								{truncateAddress(address)}
							</span>
							{/* Copy button - Figma: 16px */}
							<button
								type="button"
								onClick={handleCopyAddress}
								className={cn(
									'transition-all duration-200',
									colors.textSecondary,
									colors.textHover,
									copied && 'text-green-500 hover:text-green-500',
								)}
								aria-label={copied ? 'Copied!' : 'Copy address'}
							>
								{copied ? <Check size={16} /> : <Copy size={16} />}
							</button>
						</div>

						{/* Balance row - Figma: 14px, font-weight light, opacity 80% */}
						{(formattedBalance || balanceLoading) && (
							<button
								type="button"
								onClick={handleToggleBalance}
								disabled={balanceLoading}
								className={cn(
									'text-left',
									// Figma: 14px text, font-light
									'text-[14px] font-light',
									colors.textSecondary,
									!balanceLoading && colors.textHover,
									'transition-colors duration-200',
									balanceLoading ? 'cursor-default opacity-60' : 'cursor-pointer',
								)}
								aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
							>
								{balanceDisplayText}
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Disconnect button - Figma: px-15 py-10, gap-10px */}
			<button
				type="button"
				onClick={onDisconnect}
				className={cn(
					'w-full flex items-center gap-2.5',
					// Figma: padding 15px horizontal, 10px vertical
					contentPaddingClasses,
					// Figma: 14px text, font-medium
					'text-[14px] font-medium',
					colors.disconnectText,
					colors.disconnectHover,
					'transition-colors duration-200',
					// Figma: rounded bottom corners
					'rounded-b-[9px]',
				)}
				role="menuitem"
			>
				{/* Figma: disconnect icon 16px */}
				<LogOut size={16} className="shrink-0" />
				<span>{disconnectLabel}</span>
			</button>
		</div>
	);

	// Wrap with animation if enabled
	if (animate) {
		return (
			<motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
				<div className={dropdownClasses} role="menu" aria-label="Wallet options">
					{/* Wallet info section - Figma: px-15 py-10, border-bottom 0.5px */}
					<div className={cn(contentPaddingClasses, 'border-b-[0.5px]', colors.border, 'rounded-t-[9px]')}>
						{/* Figma: gap-10px between icon and text content */}
						<motion.div className="flex items-center gap-2.5" variants={itemVariants} custom={0}>
							{/* Figma: wallet icon 32px in dropdown */}
							<ButtonIcon
								src={wallet.icon}
								alt={wallet.name}
								size={32}
								className="shrink-0 rounded-[20px]"
							/>
							{/* Text content column */}
							<div className="flex flex-col items-start justify-center">
								{/* Address row with copy icon - Figma: gap-10px */}
								<div className="flex items-end gap-2.5">
									{/* Figma: 14px, font-weight medium, color #E4E4E7 */}
									<span className={cn('text-[14px] font-medium', colors.text)}>
										{truncateAddress(address)}
									</span>
									{/* Copy button - Figma: 16px */}
									<button
										type="button"
										onClick={handleCopyAddress}
										className={cn(
											'transition-all duration-200',
											colors.textSecondary,
											colors.textHover,
											copied && 'text-green-500 hover:text-green-500',
										)}
										aria-label={copied ? 'Copied!' : 'Copy address'}
									>
										{copied ? <Check size={16} /> : <Copy size={16} />}
									</button>
								</div>

								{/* Balance row - Figma: 14px, font-weight light, opacity 80% */}
								{(formattedBalance || balanceLoading) && (
									<motion.button
										type="button"
										onClick={handleToggleBalance}
										disabled={balanceLoading}
										className={cn(
											'text-left',
											// Figma: 14px text, font-light
											'text-[14px] font-light',
											colors.textSecondary,
											!balanceLoading && colors.textHover,
											'transition-colors duration-200',
											balanceLoading ? 'cursor-default opacity-60' : 'cursor-pointer',
										)}
										aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
										variants={itemVariants}
										custom={1}
									>
										{balanceDisplayText}
									</motion.button>
								)}
							</div>
						</motion.div>
					</div>

					{/* Disconnect button - Figma: px-15 py-10, gap-10px */}
					<motion.button
						type="button"
						onClick={onDisconnect}
						className={cn(
							'w-full flex items-center gap-2.5',
							// Figma: padding 15px horizontal, 10px vertical
							contentPaddingClasses,
							// Figma: 14px text, font-medium
							'text-[14px] font-medium',
							colors.disconnectText,
							colors.disconnectHover,
							'transition-colors duration-200',
							// Figma: rounded bottom corners
							'rounded-b-[9px]',
						)}
						role="menuitem"
						variants={itemVariants}
						custom={2}
						whileHover={{ x: 2 }}
						whileTap={{ scale: 0.98 }}
					>
						{/* Figma: disconnect icon 16px */}
						<LogOut size={16} className="shrink-0" />
						<span>{disconnectLabel}</span>
					</motion.button>
				</div>
			</motion.div>
		);
	}

	return content;
}

/**
 * WalletDropdownWrapper - Wrapper component for positioning dropdown relative to button.
 * Handles AnimatePresence for enter/exit animations.
 */
export function WalletDropdownWrapper({
	isOpen,
	children,
	className,
}: {
	isOpen: boolean;
	children: React.ReactNode;
	className?: string;
}): React.ReactElement {
	return (
		<AnimatePresence>
			{isOpen && <div className={cn('absolute top-full right-0 mt-2 z-50', className)}>{children}</div>}
		</AnimatePresence>
	);
}
