import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NoWalletLinkProps {
	href?: string;
	className?: string;
}

const DEFAULT_WALLET_URL = 'https://solana.com/ecosystem/explore?categories=wallet';

export function NoWalletLink({ href = DEFAULT_WALLET_URL, className }: NoWalletLinkProps) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				'w-full flex items-center justify-center gap-1.5 py-1 transition-opacity',
				'hover:opacity-100',
				'text-muted-foreground',
				'focus:outline-none focus-visible:underline',
				className,
			)}
		>
			<Wallet size={14} />
			<span className="text-xs font-normal">I don&apos;t have a wallet</span>
		</a>
	);
}
