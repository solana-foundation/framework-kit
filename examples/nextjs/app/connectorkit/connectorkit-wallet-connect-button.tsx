'use client';

import type { SolanaClientConfig } from '@solana/client';
import { connectorKit } from '@solana/client/connectorkit';
import {
	SolanaProvider,
	useConnectWallet,
	useDisconnectWallet,
	useWallet,
	useWalletConnection,
} from '@solana/react-hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';

function formatError(error: unknown): string {
	if (error instanceof Error) return error.message;
	if (typeof error === 'string') return error;
	return JSON.stringify(error);
}

function truncate(address: string): string {
	return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

function ConnectButtonContent(
	props: Readonly<{
		bootstrapError: string | null;
		isBootstrapping: boolean;
		refresh(): Promise<void>;
	}>,
) {
	const wallet = useWallet();
	const connectWallet = useConnectWallet();
	const disconnectWallet = useDisconnectWallet();
	const { connectors, isReady } = useWalletConnection();
	const [error, setError] = useState<string | null>(null);
	const [open, setOpen] = useState(false);

	const isConnected = wallet.status === 'connected';
	const address = isConnected ? wallet.session.account.address.toString() : null;

	async function handleConnect(connectorId: string) {
		setError(null);
		try {
			await connectWallet(connectorId);
			setOpen(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unable to connect');
		}
	}

	async function handleDisconnect() {
		setError(null);
		try {
			await disconnectWallet();
			setOpen(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unable to disconnect');
		}
	}

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				className="btn btn-secondary w-full justify-between"
			>
				{address ? (
					<span className="mono max-w-[12ch] truncate">{truncate(address)}</span>
				) : (
					<span>Connect wallet</span>
				)}
				<span className="text-xs text-slate-500">{open ? '▲' : '▼'}</span>
			</button>

			{open ? (
				<div className="card absolute z-10 mt-2 w-full min-w-[240px] p-3">
					{isConnected ? (
						<div className="space-y-3">
							<div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
								<p className="small-label">Connected</p>
								<p className="mono text-sm text-slate-900 max-w-[18ch] truncate">{address}</p>
							</div>
							<button
								type="button"
								onClick={() => void handleDisconnect()}
								className="btn btn-secondary w-full"
							>
								Disconnect
							</button>
						</div>
					) : (
						<div className="space-y-2">
							<p className="small-label">ConnectorKit</p>
							<div className="space-y-1.5">
								{!isReady || props.isBootstrapping ? (
									<div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
										Loading connectors…
									</div>
								) : connectors.length === 0 ? (
									<div className="space-y-2">
										<p className="text-sm text-slate-700">
											No connectors found. Make sure a Wallet Standard wallet extension is
											installed and enabled for <code>localhost</code>.
										</p>
										<button
											type="button"
											onClick={() => void props.refresh()}
											className="btn btn-secondary w-full"
											disabled={props.isBootstrapping}
										>
											Refresh connectors
										</button>
									</div>
								) : (
									connectors.map((connector) => {
										const supported = connector.isSupported();
										return (
											<button
												key={connector.id}
												type="button"
												onClick={() => void handleConnect(connector.id)}
												className="btn btn-secondary w-full justify-between"
												disabled={!supported}
												title={connector.id}
											>
												<span className="truncate">{connector.name}</span>
												<span className="text-xs text-slate-500">
													{supported ? 'Connect' : 'Not ready'}
												</span>
											</button>
										);
									})
								)}
							</div>
						</div>
					)}

					{props.bootstrapError ? (
						<p className="mt-2 text-sm font-semibold text-red-600">{props.bootstrapError}</p>
					) : null}
					{error ? <p className="mt-2 text-sm font-semibold text-red-600">{error}</p> : null}
				</div>
			) : null}
		</div>
	);
}

export function ConnectorkitWalletConnectButton() {
	const [walletConnectors, setWalletConnectors] = useState<ReturnType<typeof connectorKit> | null>(null);
	const [bootstrapError, setBootstrapError] = useState<string | null>(null);
	const [isBootstrapping, setIsBootstrapping] = useState(false);

	const refresh = useCallback(async () => {
		setIsBootstrapping(true);
		setBootstrapError(null);

		try {
			// Avoid the Wallet Standard registry "not ready yet" race by awaiting ConnectorKit's `ready`.
			const { ready } = await import('@solana/connector/headless');
			await ready;
		} catch (error) {
			setBootstrapError(formatError(error));
		}

		try {
			setWalletConnectors(
				connectorKit({
					defaultConfig: {
						appName: 'Framework Kit • Next.js example',
						network: 'devnet',
					},
				}),
			);
		} catch (error) {
			setBootstrapError(formatError(error));
			setWalletConnectors(null);
		} finally {
			setIsBootstrapping(false);
		}
	}, []);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	const config = useMemo<SolanaClientConfig>(
		() => ({
			cluster: 'devnet',
			walletConnectors: walletConnectors ?? [],
		}),
		[walletConnectors],
	);

	return (
		<SolanaProvider config={config} walletPersistence={false}>
			<ConnectButtonContent bootstrapError={bootstrapError} isBootstrapping={isBootstrapping} refresh={refresh} />
		</SolanaProvider>
	);
}
