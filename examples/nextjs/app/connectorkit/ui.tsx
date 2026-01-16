'use client';

import { connectorKit } from '@solana/client/connectorkit';
import { SolanaProvider, useClientStore, useWalletConnection } from '@solana/react-hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';

function formatError(error: unknown): string {
	if (error instanceof Error) return error.message;
	if (typeof error === 'string') return error;
	return JSON.stringify(error);
}

function ConnectorKitPanel() {
	const {
		connect,
		connected,
		connecting,
		connectorId,
		connectors,
		currentConnector,
		disconnect,
		error,
		isReady,
		wallet,
	} = useWalletConnection();
	const walletState = useClientStore((state) => state.wallet);
	const [customConnectorId, setCustomConnectorId] = useState('phantom');
	const [localError, setLocalError] = useState<string | null>(null);

	const handleConnect = useCallback(
		async (id: string) => {
			setLocalError(null);
			try {
				await connect(id, { autoConnect: true });
			} catch (e) {
				setLocalError(formatError(e));
			}
		},
		[connect],
	);

	const handleDisconnect = useCallback(async () => {
		setLocalError(null);
		try {
			await disconnect();
		} catch (e) {
			setLocalError(formatError(e));
		}
	}, [disconnect]);

	const activeAddress = wallet?.account.address.toString() ?? null;
	const canonicalConnectorId =
		walletState.status === 'connected' || walletState.status === 'connecting' || walletState.status === 'error'
			? walletState.connectorId
			: null;

	return (
		<section className="card space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="space-y-1">
					<p className="small-label">ConnectorKit</p>
					<p className="text-sm text-slate-700">
						Hydrated: <span className="mono">{String(isReady)}</span> · Connectors:{' '}
						<span className="mono">{connectors.length}</span>
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					{connected ? (
						<button type="button" onClick={() => void handleDisconnect()} className="btn btn-secondary">
							Disconnect
						</button>
					) : null}
				</div>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				<div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
					<p className="small-label">Active</p>
					<p className="mt-1 text-sm text-slate-800">
						status:{' '}
						<span className="mono">{connecting ? 'connecting' : connected ? 'connected' : 'idle'}</span>
					</p>
					<p className="mt-1 text-sm text-slate-800">
						canonical connectorId: <span className="mono">{canonicalConnectorId ?? '(none)'}</span>
					</p>
					<p className="mt-1 text-sm text-slate-800">
						current connector:{' '}
						<span className="mono">{currentConnector?.id ?? connectorId ?? '(none)'}</span>
					</p>
					<p className="mt-1 text-sm text-slate-800">
						address: <span className="mono">{activeAddress ?? '(none)'}</span>
					</p>
				</div>

				<div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
					<p className="small-label">Try an alias</p>
					<p className="mt-1 text-sm text-slate-700">
						Type <code>phantom</code> (or any bare id) to test registry fallback and canonical persistence.
					</p>
					<div className="mt-3 flex gap-2">
						<input
							className="input"
							value={customConnectorId}
							onChange={(e) => setCustomConnectorId(e.target.value)}
							placeholder="phantom"
						/>
						<button
							type="button"
							onClick={() => void handleConnect(customConnectorId)}
							disabled={!customConnectorId || connecting}
							className="btn btn-primary"
						>
							Connect
						</button>
					</div>
				</div>
			</div>

			<div className="space-y-2">
				<p className="small-label">Available connectors</p>
				{!isReady ? (
					<p className="text-sm text-slate-700">Hydrating…</p>
				) : connectors.length === 0 ? (
					<p className="text-sm text-slate-700">
						No connectors found. Make sure you have a Wallet Standard wallet installed or a ConnectorKit
						source enabled.
					</p>
				) : (
					<ul className="space-y-2">
						{connectors.map((c) => {
							const isActive = connected && connectorId === c.id;
							const isBusy = connecting && connectorId === c.id;
							const supported = c.isSupported();
							return (
								<li
									key={c.id}
									className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
								>
									<div className="min-w-0">
										<p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
										<p className="truncate text-xs text-slate-600">
											<span className="mono">{c.id}</span>
											{'ready' in c ? ` · ready: ${String(c.ready)}` : ''}
											{'kind' in c ? ` · kind: ${String(c.kind ?? 'n/a')}` : ''}
										</p>
									</div>
									<div className="flex items-center gap-2">
										<span
											className={`chip ${supported ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
										>
											{supported ? 'supported' : 'not ready'}
										</span>
										<button
											type="button"
											className="btn btn-secondary"
											disabled={!supported || isActive || isBusy}
											onClick={() => void handleConnect(c.id)}
										>
											{isActive ? 'Connected' : isBusy ? 'Connecting…' : 'Connect'}
										</button>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</div>

			{error ? <p className="text-sm font-semibold text-red-600">Wallet error: {formatError(error)}</p> : null}
			{localError ? <p className="text-sm font-semibold text-red-600">{localError}</p> : null}
		</section>
	);
}

export function ConnectorkitClient() {
	const [walletConnectors, setWalletConnectors] = useState<ReturnType<typeof connectorKit> | null>(null);
	const [bootstrapError, setBootstrapError] = useState<string | null>(null);
	const [isBootstrapping, setIsBootstrapping] = useState(true);
	const [walletStandardCount, setWalletStandardCount] = useState<number | null>(null);
	const [hasNavigatorWallets, setHasNavigatorWallets] = useState(false);

	const refreshConnectors = useCallback(async () => {
		setIsBootstrapping(true);
		setBootstrapError(null);

		const nav = globalThis.navigator as Navigator & { wallets?: { get?: () => readonly unknown[] } };
		setHasNavigatorWallets(Boolean(nav.wallets));
		try {
			setWalletStandardCount(nav.wallets?.get?.()?.length ?? null);
		} catch {
			setWalletStandardCount(null);
		}

		try {
			// Avoid the Wallet Standard "registry not ready yet" race by awaiting ConnectorKit's ready promise
			// before materializing the connector list.
			const { ready } = await import('@solana/connector/headless');
			await ready;
		} catch (e) {
			// If this fails, ConnectorKit still resolves `ready` internally in most cases, but surface the error.
			setBootstrapError(formatError(e));
		}

		try {
			try {
				setWalletStandardCount(nav.wallets?.get?.()?.length ?? null);
			} catch {
				setWalletStandardCount(null);
			}

			const connectors = connectorKit({
				defaultConfig: {
					appName: 'Framework Kit • Next.js example',
					network: 'devnet',
				},
			});
			setWalletConnectors(connectors);
		} catch (e) {
			setBootstrapError(formatError(e));
			setWalletConnectors(null);
		} finally {
			setIsBootstrapping(false);
		}
	}, []);

	useEffect(() => {
		void refreshConnectors();
	}, [refreshConnectors]);

	const config = useMemo(
		() => ({
			cluster: 'devnet' as const,
			walletConnectors: walletConnectors ?? [],
		}),
		[walletConnectors],
	);

	return (
		<div className="space-y-6">
			<section className="card space-y-3">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="space-y-1">
						<p className="small-label">Bootstrap</p>
						<p className="text-sm text-slate-700">
							status: <span className="mono">{isBootstrapping ? 'loading' : 'ready'}</span> ·
							navigator.wallets: <span className="mono">{String(hasNavigatorWallets)}</span> · wallets:{' '}
							<span className="mono">{walletStandardCount ?? 'unknown'}</span>
						</p>
					</div>
					<button
						type="button"
						onClick={() => void refreshConnectors()}
						disabled={isBootstrapping}
						className="btn btn-secondary"
					>
						Refresh connectors
					</button>
				</div>
				{bootstrapError ? (
					<p className="text-sm font-semibold text-red-600">Bootstrap error: {bootstrapError}</p>
				) : null}
				<p className="text-sm text-slate-700">
					If you expect Phantom/Solflare/etc to show up, make sure a Wallet Standard wallet extension is
					installed and enabled for <code>localhost</code> (and not blocked by an incognito profile).
				</p>
			</section>

			<SolanaProvider config={config} walletPersistence={false}>
				<ConnectorKitPanel />
			</SolanaProvider>
		</div>
	);
}
