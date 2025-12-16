import { autoDiscover, backpack, createClient, metamask, phantom, solflare } from '@solana/client';
import { SolanaProvider } from '@solana/react-hooks';
import { Suspense } from 'react';

import { AccountInspectorCard } from './components/AccountInspectorCard.tsx';
import { AirdropCard } from './components/AirdropCard.tsx';
import { BalanceCard } from './components/BalanceCard.tsx';
import { ClusterStatusCard } from './components/ClusterStatusCard.tsx';
import { LatestBlockhashCard } from './components/LatestBlockhashCard.tsx';
import { ProgramAccountsCard } from './components/ProgramAccountsCard.tsx';
import { SendTransactionCard } from './components/SendTransactionCard.tsx';
import { SignatureWatcherCard } from './components/SignatureWatcherCard.tsx';
import { SimulateTransactionCard } from './components/SimulateTransactionCard.tsx';
import { SolTransferForm } from './components/SolTransferForm.tsx';
import { SplTokenPanel } from './components/SplTokenPanel.tsx';
import { StakePanel } from './components/StakePanel.tsx';
import { StoreInspectorCard } from './components/StoreInspectorCard.tsx';
import { TransactionPoolPanel } from './components/TransactionPoolPanel.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs.tsx';
import { WalletControls } from './components/WalletControls.tsx';

const walletConnectors = [...phantom(), ...solflare(), ...backpack(), ...metamask(), ...autoDiscover()];
const client = createClient({
	commitment: 'confirmed',
	cluster: 'devnet',
	walletConnectors,
});

export default function App() {
	return (
		<SolanaProvider client={client} query={{ suspense: true }}>
			<DemoApp />
		</SolanaProvider>
	);
}

function DemoApp() {
	return (
		<div className="relative min-h-screen">
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
				<div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
			</div>
			<div className="container mx-auto max-w-6xl space-y-8 py-12">
				<header className="space-y-4 text-center sm:text-left">
					<span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-xs">
						React Hooks
					</span>
					<h1>Solana Client Toolkit</h1>
					<p>
						This example wraps the headless <code>@solana/client</code> with a React context provider and
						showcases the hooks exposed by <code>@solana/react-hooks</code>. Explore state, transactions,
						and query helpers via the tabs below.
					</p>
				</header>
				<Tabs defaultValue="state">
					<TabsList>
						<TabsTrigger value="state">Wallet &amp; State</TabsTrigger>
						<TabsTrigger value="transactions">Transfers &amp; Transactions</TabsTrigger>
						<TabsTrigger value="queries">Queries &amp; Diagnostics</TabsTrigger>
					</TabsList>
					<TabsContent value="state">
						<Suspense
							fallback={
								<div className="log-panel text-sm text-muted-foreground">Loading wallet and state…</div>
							}
						>
							<div className="grid gap-6 lg:grid-cols-2">
								<ClusterStatusCard />
								<WalletControls />
								<BalanceCard />
								<AccountInspectorCard />
								<AirdropCard />
								<StoreInspectorCard />
							</div>
						</Suspense>
					</TabsContent>
					<TabsContent value="transactions">
						<Suspense
							fallback={<div className="log-panel text-sm text-muted-foreground">Loading transfers…</div>}
						>
							<div className="grid gap-6 lg:grid-cols-2">
								<SolTransferForm />
								<SendTransactionCard />
								<SplTokenPanel />
								<StakePanel />
								<TransactionPoolPanel />
							</div>
						</Suspense>
					</TabsContent>
					<TabsContent value="queries">
						<Suspense
							fallback={<div className="log-panel text-sm text-muted-foreground">Loading queries…</div>}
						>
							<div className="grid gap-6 lg:grid-cols-2">
								<LatestBlockhashCard />
								<ProgramAccountsCard />
								<SimulateTransactionCard />
								<SignatureWatcherCard />
							</div>
						</Suspense>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
