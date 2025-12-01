import { cn } from '../lib/utils';
import { DollarIcon } from './icons/DollarIcon';

interface UsdcFaucetLinkProps {
	className?: string;
}

export function UsdcFaucetButton({ className }: UsdcFaucetLinkProps) {
	return (
		<div className={cn('flex items-center justify-start gap-2', className)}>
			<span className="text-sm text-muted-foreground">Need test USDC?</span>
			<a
				href="https://faucet.circle.com/"
				target="_blank"
				rel="noopener noreferrer"
				className="inline-flex items-center gap-1.5 rounded bg-[#2775CA] px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[#1e5ba8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2775CA] focus-visible:ring-offset-1"
			>
				<DollarIcon className="h-3 w-3" />
				Get from Faucet
			</a>
		</div>
	);
}
