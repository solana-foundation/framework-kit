import type { WalletConnectorMetadata } from '@solana/client';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalHeader } from './ModalHeader';

export interface ConnectingViewProps {
	/** The wallet currently being connected */
	wallet: WalletConnectorMetadata;
	/** Handler for back button */
	onBack?: () => void;
	/** Handler for close button */
	onClose?: () => void;
	/** Additional class names */
	className?: string;
}

/**
 * ConnectingView - Loading state shown while wallet is connecting
 *
 * Features:
 * - Wallet icon with animated spinner ring
 * - "Connecting to {wallet}..." title
 * - Instructional subtitle
 * - Back and close buttons
 */
export function ConnectingView({ wallet, onBack, onClose, className }: ConnectingViewProps) {
	return (
		<div className={cn('w-full flex flex-col gap-3.5 items-center', className)}>
			{/* Header with back + close */}
			<ModalHeader title="" showBack onBack={onBack} onClose={onClose} />

			{/* Wallet icon with spinner ring */}
			<div className="relative size-16 flex items-center justify-center">
				{/* Spinner ring */}
				<Loader2 className="absolute size-16 animate-spin text-muted-foreground" strokeWidth={1.5} />
				{/* Wallet icon */}
				<div className="size-11 rounded-full overflow-hidden bg-muted flex items-center justify-center">
					<img
						src={wallet.icon}
						alt={`${wallet.name} logo`}
						className="size-full object-cover"
						onError={(e) => {
							e.currentTarget.style.display = 'none';
						}}
					/>
				</div>
			</div>

			{/* Text content */}
			<div className="w-full flex flex-col gap-1.5 items-center text-center px-4">
				<h3 className="text-lg font-medium text-card-foreground">Connecting to {wallet.name}...</h3>
				<p className="text-sm max-w-60 text-muted-foreground">
					Check your wallet and approve the connection request.
				</p>
			</div>
		</div>
	);
}
