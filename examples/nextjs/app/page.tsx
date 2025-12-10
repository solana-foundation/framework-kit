import { LookupTableCard } from './components/lookup-table-card';
import { MemoCard } from './components/memo-card';
import { NonceCard } from './components/nonce-card';
import { WalletConnectButton } from './components/wallet-connect-button';

export default function HomePage() {
	return (
		<main className="shell">
			<header className="space-y-3">
				<p className="small-label">@solana/react-hooks + Next.js</p>
				<h1 className="text-3xl font-bold text-slate-900">Solana wallet + memo</h1>
				<p className="max-w-3xl text-base text-slate-700">
					Connect a Wallet Standard wallet and send a Memo transaction using the connected signer.
				</p>
			</header>
			<section className="card space-y-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-1">
						<p className="small-label">Wallet</p>
						<p className="text-sm text-slate-700">Pick a Wallet Standard connector.</p>
					</div>
					<div className="sm:min-w-[260px]">
						<WalletConnectButton />
					</div>
				</div>
			</section>
			<MemoCard />
			<NonceCard />
			<LookupTableCard />
		</main>
	);
}
