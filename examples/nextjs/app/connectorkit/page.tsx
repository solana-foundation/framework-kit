import { connectorKit } from '@solana/client/connectorkit';

import { ConnectorkitWalletConnectButton } from './connectorkit-wallet-connect-button';

export default function ConnectorKitPage() {
	// SSR smoke test: should not construct a ConnectorClient and should return an empty list.
	const ssrConnectors = connectorKit({
		defaultConfig: {
			appName: 'Framework Kit • Next.js example',
			network: 'devnet',
		},
	});

	return (
		<main className="shell">
			<header className="space-y-3">
				<p className="small-label">@solana/client/connectorkit</p>
				<h1 className="text-3xl font-bold text-slate-900">ConnectorKit wallet connect</h1>
				<p className="max-w-3xl text-base text-slate-700">
					This route wires ConnectorKit connectors into <code>@solana/client</code> and uses the same dropdown
					pattern as the example <code>WalletConnectButton</code>, but backed by ConnectorKit discovery.
				</p>
			</header>

			<section className="card space-y-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-1">
						<p className="small-label">Wallet</p>
						<p className="text-sm text-slate-700">Pick a ConnectorKit connector.</p>
					</div>
					<div className="sm:min-w-[260px]">
						<ConnectorkitWalletConnectButton />
					</div>
				</div>
				<p className="text-xs text-slate-500">
					SSR safety: <span className="mono">{ssrConnectors.length}</span> connectors on the server (expected{' '}
					<span className="mono">0</span>).
				</p>
			</section>
		</main>
	);
}
