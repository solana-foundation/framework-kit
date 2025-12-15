'use client';

import { useBalance, useConnectWallet, useDisconnectWallet, useSolTransfer, useWallet } from '@solana/react-hooks';
import { useState } from 'react';

const CONNECTORS: ReadonlyArray<{ id: string; label: string }> = [
	{ id: 'wallet-standard:phantom', label: 'Connect Phantom' },
	{ id: 'wallet-standard:solflare', label: 'Connect Solflare' },
	{ id: 'wallet-standard:backpack', label: 'Connect Backpack' },
	{ id: 'wallet-standard:metamask', label: 'Connect MetaMask' },
];

function WalletPanel() {
	const wallet = useWallet();
	const connectWallet = useConnectWallet();
	const disconnectWallet = useDisconnectWallet();
	const [error, setError] = useState<string | null>(null);
	const balance = useBalance(wallet.status === 'connected' ? wallet.session.account.address : undefined);
	const { send, isSending, signature } = useSolTransfer();

	const handleConnect = async (connectorId: string) => {
		setError(null);
		try {
			await connectWallet(connectorId, { autoConnect: true });
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unable to connect');
		}
	};

	const handleDisconnect = async () => {
		setError(null);
		try {
			await disconnectWallet();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unable to disconnect');
		}
	};

	const handleSend = async () => {
		if (wallet.status !== 'connected') {
			return;
		}
		setError(null);
		try {
			await send({
				destination: wallet.session.account.address,
				amount: 1_000_000n,
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Transfer failed');
		}
	};

	const address = wallet.status === 'connected' ? wallet.session.account.address.toString() : null;
	const lamports = balance.fetching ? 'Loading…' : (balance.lamports?.toString() ?? '0');
	const statusChipClass =
		wallet.status === 'connected'
			? 'border-emerald-200 bg-emerald-50 text-emerald-700'
			: 'border-sky-200 bg-sky-50 text-sky-800';

	return (
		<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="small-label">Wallet state</p>
					<h2 className="text-xl font-semibold text-slate-900">Connect, read balance, send</h2>
				</div>
				<span className={`chip ${statusChipClass}`}>
					{wallet.status === 'connected' ? 'Connected' : 'Disconnected'}
				</span>
			</div>

			{address ? (
				<div className="mt-4 space-y-4">
					<div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
						<p className="small-label">Address</p>
						<p className="break-all font-mono text-sm text-slate-900">{address}</p>
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
							<p className="small-label">Lamports</p>
							<p className="font-mono text-lg font-semibold text-slate-900">{lamports}</p>
						</div>
						{signature ? (
							<div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
								<p className="small-label">Last signature</p>
								<p className="break-all font-mono text-sm text-slate-900">{signature}</p>
							</div>
						) : null}
					</div>
					<div className="flex flex-wrap gap-3">
						<button type="button" onClick={handleDisconnect} className="btn btn-secondary">
							Disconnect
						</button>
						<button type="button" onClick={handleSend} disabled={isSending} className="btn btn-primary">
							{isSending ? 'Sending 0.001 SOL…' : 'Send 0.001 SOL to self'}
						</button>
					</div>
				</div>
			) : (
				<div className="mt-4 space-y-3">
					<p className="small-label">Pick a Wallet Standard connector:</p>
					<div className="flex flex-wrap gap-3">
						{CONNECTORS.map((connector) => (
							<button
								type="button"
								key={connector.id}
								onClick={() => void handleConnect(connector.id)}
								className="btn btn-primary"
							>
								{connector.label}
							</button>
						))}
					</div>
				</div>
			)}

			{error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
		</section>
	);
}

export default WalletPanel;
