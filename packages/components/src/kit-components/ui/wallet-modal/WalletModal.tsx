import { cn } from '../../../lib/utils';
import { ConnectingView } from './ConnectingView';
import { ErrorView } from './ErrorView';
import { ModalHeader } from './ModalHeader';
import { NoWalletLink } from './NoWalletLink';
import type { ModalView, WalletInfo, WalletModalTheme } from './types';
import { WalletList } from './WalletList';

export interface WalletModalProps {
	/** List of available wallets */
	wallets: WalletInfo[];
	/** Current view state */
	view?: ModalView;
	/** Wallet currently being connected (for connecting view) */
	connectingWallet?: WalletInfo | null;
	/** Error info (for error view) */
	error?: { title?: string; message?: string } | null;
	/** Theme variant */
	theme?: WalletModalTheme;
	/** Handler when a wallet is selected */
	onSelectWallet?: (wallet: WalletInfo) => void;
	/** Handler for back button (connecting/error views) */
	onBack?: () => void;
	/** Handler for close button */
	onClose?: () => void;
	/** Handler for retry button (error view) */
	onRetry?: () => void;
	/** Whether to show the "I don't have a wallet" link */
	showNoWalletLink?: boolean;
	/** Custom URL for wallet guide */
	walletGuideUrl?: string;
	/** Additional class names */
	className?: string;
}

/**
 * WalletModal - Main modal component for wallet selection and connection
 *
 * Views:
 * - list: Shows available wallets for selection
 * - connecting: Shows loading state while connecting
 * - error: Shows error state with retry option
 *
 * @example
 * ```tsx
 * <WalletModal
 *   wallets={detectedWallets}
 *   view="list"
 *   theme="dark"
 *   onSelectWallet={(w) => connect(w)}
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */
export function WalletModal({
	wallets,
	view = 'list',
	connectingWallet,
	error,
	theme = 'dark',
	onSelectWallet,
	onBack,
	onClose,
	onRetry,
	showNoWalletLink = true,
	walletGuideUrl,
	className,
}: WalletModalProps) {
	return (
		<div
			className={cn(
				'w-[361px] p-6 rounded-[15px] flex flex-col gap-5',
				theme === 'dark' ? 'bg-[#3F3F46]' : 'bg-[#FAFAFA]',
				className,
			)}
			role="dialog"
			aria-modal="true"
			aria-labelledby="wallet-modal-title"
		>
			{/* List View */}
			{view === 'list' && (
				<>
					<ModalHeader title="Connect Wallet" theme={theme} onClose={onClose} />
					<WalletList wallets={wallets} theme={theme} onSelect={onSelectWallet} />
					{showNoWalletLink && <NoWalletLink theme={theme} href={walletGuideUrl} />}
				</>
			)}

			{/* Connecting View */}
			{view === 'connecting' && connectingWallet && (
				<ConnectingView wallet={connectingWallet} theme={theme} onBack={onBack} onClose={onClose} />
			)}

			{/* Error View */}
			{view === 'error' && (
				<ErrorView
					title={error?.title}
					message={error?.message}
					theme={theme}
					onRetry={onRetry}
					onClose={onClose}
				/>
			)}
		</div>
	);
}
