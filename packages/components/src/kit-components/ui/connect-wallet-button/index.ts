/**
 * ConnectWalletButton - Solana wallet connection components
 *
 * @description
 * A composable set of components for connecting to Solana wallets.
 * All sub-components are exported for custom compositions.
 *
 * @example Integrated usage (recommended)
 * ```tsx
 * import { ConnectWalletButton } from '@framework-kit/components';
 * import { useWalletConnection, useBalance } from '@solana/react-hooks';
 *
 * const { status, wallet, currentConnector, disconnect, isReady } = useWalletConnection();
 * const { lamports } = useBalance(wallet?.address);
 *
 * <ConnectWalletButton
 *   status={status}
 *   isReady={isReady}
 *   wallet={wallet ? { address: wallet.address } : undefined}
 *   currentConnector={currentConnector}
 *   balance={lamports}
 *   onConnect={openModal}
 *   onDisconnect={disconnect}
 * />
 * ```
 *
 * @example Basic usage with raw components
 * ```tsx
 * import { WalletButton } from '@framework-kit/components';
 *
 * <WalletButton connectionState="disconnected" onClick={openModal} />
 * ```
 *
 * @example Custom composition
 * ```tsx
 * import {
 *   ButtonContent,
 *   ButtonIcon,
 *   ButtonSpinner,
 *   ChevronIcon,
 * } from '@framework-kit/components';
 *
 * <button className="custom-styles">
 *   <ButtonIcon src={walletIcon} />
 *   <ButtonContent>My Wallet</ButtonContent>
 *   <ChevronIcon direction="down" />
 * </button>
 * ```
 */

// Sub-components
export { ButtonContent } from './ButtonContent';
export { ButtonIcon } from './ButtonIcon';
export { ButtonSpinner } from './ButtonSpinner';
export { ChevronIcon } from './ChevronIcon';
export type { ConnectWalletButtonProps } from './ConnectWalletButton';
// Integrated component (recommended for most use cases)
export { ConnectWalletButton } from './ConnectWalletButton';
// Types
export type {
	ButtonContentProps,
	ButtonIconProps,
	ButtonSpinnerProps,
	ChevronIconProps,
	ConnectionState,
	Theme,
	WalletButtonProps,
	WalletConnector,
	WalletDropdownProps,
} from './types';
export type { WalletButtonFullProps } from './WalletButton';
// Main button component
export { WalletButton, walletButtonVariants } from './WalletButton';
// Dropdown component
export { WalletDropdown, WalletDropdownWrapper } from './WalletDropdown';
