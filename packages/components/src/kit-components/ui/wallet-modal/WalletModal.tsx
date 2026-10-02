import type { WalletConnectorMetadata } from '@solana/client';
import { cn } from '@/lib/utils';
import { ConnectingView } from './ConnectingView';
import { ErrorView } from './ErrorView';
import { ModalHeader } from './ModalHeader';
import { NoWalletLink } from './NoWalletLink';
import type { ModalView } from './types';
import { WalletList } from './WalletList';

export interface WalletModalProps {
	/** List of available wallets */
	wallets: WalletConnectorMetadata[];
	/** Current view state */
	view?: ModalView;
	/** Wallet currently being connected (for connecting view) */
	connectingWallet?: WalletConnectorMetadata | null;
	/** Error info (for error view) */
	error?: { title?: string; message?: string } | null;
	/** Handler when a wallet is selected */
	onSelectWallet?: (wallet: WalletConnectorMetadata) => void;
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
			className={cn('w-full max-w-sm p-6 rounded-2xl flex flex-col gap-5', 'bg-card', className)}
			role="dialog"
			aria-modal="true"
			aria-labelledby={view === 'list' ? 'wallet-modal-title' : undefined}
			aria-label={view !== 'list' ? 'Wallet connection' : undefined}
		>
			{/* List View */}
			{view === 'list' && (
				<>
					<ModalHeader title="Connect Wallet" titleId="wallet-modal-title" onClose={onClose} />
					<WalletList wallets={wallets} onSelect={onSelectWallet} />
					{showNoWalletLink && <NoWalletLink href={walletGuideUrl} />}
				</>
			)}

			{/* Connecting View */}
			{view === 'connecting' && connectingWallet && (
				<ConnectingView wallet={connectingWallet} onBack={onBack} onClose={onClose} />
			)}

			{/* Error View */}
			{view === 'error' && (
				<ErrorView title={error?.title} message={error?.message} onRetry={onRetry} onClose={onClose} />
			)}
		</div>
	);
}
