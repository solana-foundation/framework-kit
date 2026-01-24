import { Wallet } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { WalletModalTheme } from './types';

export interface NoWalletLinkProps {
	theme?: WalletModalTheme;
	href?: string;
	onClick?: () => void;
	className?: string;
}

const DEFAULT_WALLET_URL = 'https://solana.com/ecosystem/explore?categories=wallet';

export function NoWalletLink({ theme = 'dark', href = DEFAULT_WALLET_URL, onClick, className }: NoWalletLinkProps) {
	const handleClick = () => {
		if (onClick) {
			onClick();
		} else {
			window.open(href, '_blank', 'noopener,noreferrer');
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			className={cn(
				'w-full flex items-center justify-center gap-1.5 py-1 transition-opacity',
				'hover:opacity-100',
				theme === 'dark' ? 'text-[rgba(228,228,231,0.8)]' : 'text-[rgba(63,63,70,0.9)]',
				'focus:outline-none focus-visible:underline',
				className,
			)}
		>
			<Wallet size={14} />
			<span className="text-xs font-normal">I don't have a wallet</span>
		</button>
	);
}
