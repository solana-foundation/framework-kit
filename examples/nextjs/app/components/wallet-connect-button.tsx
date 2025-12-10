'use client';

import { useConnectWallet, useDisconnectWallet, useWallet } from '@solana/react-hooks';
import { useState } from 'react';

const CONNECTORS: ReadonlyArray<{ id: string; label: string }> = [
	{ id: 'wallet-standard:phantom', label: 'Phantom' },
	{ id: 'wallet-standard:solflare', label: 'Solflare' },
	{ id: 'wallet-standard:backpack', label: 'Backpack' },
];

function truncate(address: string): string {
	return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function WalletConnectButton() {
	const wallet = useWallet();
	const connectWallet = useConnectWallet();
	const disconnectWallet = useDisconnectWallet();
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
							<p className="small-label">Wallet Standard</p>
							<div className="space-y-1.5">
								{CONNECTORS.map((connector) => (
									<button
										key={connector.id}
										type="button"
										onClick={() => void handleConnect(connector.id)}
										className="btn btn-secondary w-full justify-between"
									>
										<span>{connector.label}</span>
										<span className="text-xs text-slate-500">Connect</span>
									</button>
								))}
							</div>
						</div>
					)}
					{error ? <p className="mt-2 text-sm font-semibold text-red-600">{error}</p> : null}
				</div>
			) : null}
		</div>
	);
}
