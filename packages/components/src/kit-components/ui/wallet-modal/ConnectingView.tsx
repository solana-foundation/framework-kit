import { Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ModalHeader } from './ModalHeader';
import type { WalletInfo, WalletModalTheme } from './types';

export interface ConnectingViewProps {
	/** The wallet currently being connected */
	wallet: WalletInfo;
	/** Theme variant */
	theme?: WalletModalTheme;
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
export function ConnectingView({ wallet, theme = 'dark', onBack, onClose, className }: ConnectingViewProps) {
	return (
		<div className={cn('w-full flex flex-col gap-3.5 items-center', className)}>
			{/* Header with back + close */}
			<ModalHeader theme={theme} title="" showBack onBack={onBack} onClose={onClose} />

			{/* Wallet icon with spinner ring */}
			<div className="relative size-16 flex items-center justify-center">
				{/* Spinner ring */}
				<Loader2
					className={cn(
						'absolute size-16 animate-spin',
						theme === 'dark' ? 'text-[rgba(250,250,250,0.3)]' : 'text-[rgba(63,63,70,0.2)]',
					)}
					strokeWidth={1.5}
				/>
				{/* Wallet icon */}
				<div className="size-11 rounded-full overflow-hidden">
					<img src={wallet.icon} alt={`${wallet.name} logo`} className="size-full object-cover" />
				</div>
			</div>

			{/* Text content */}
			<div className="w-full flex flex-col gap-1.5 items-center text-center px-4">
				<h3 className={cn('text-lg font-medium', theme === 'dark' ? 'text-[#FAFAFA]' : 'text-[#3F3F46]')}>
					Connecting to {wallet.name}...
				</h3>
				<p
					className={cn(
						'text-sm max-w-[231px]',
						theme === 'dark' ? 'text-[rgba(228,228,231,0.8)]' : 'text-[rgba(82,82,92,0.85)]',
					)}
				>
					Check your wallet and approve the connection request.
				</p>
			</div>
		</div>
	);
}
