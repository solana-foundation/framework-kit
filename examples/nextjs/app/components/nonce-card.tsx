'use client';

import { useNonceAccount } from '@solana/react-hooks';
import { useState } from 'react';

export function NonceCard() {
	const [address, setAddress] = useState('');
	const { data, isLoading, error } = useNonceAccount(address || undefined);

	return (
		<section className="card space-y-4">
			<div className="space-y-1">
				<p className="small-label">Nonce Account</p>
				<h2 className="text-xl font-semibold text-slate-900">Fetch nonce account</h2>
				<p className="text-sm text-slate-600">Uses the fetchNonceAccount helper to read durable nonce data.</p>
			</div>
			<div className="space-y-2">
				<label className="text-sm font-semibold text-slate-800" htmlFor="nonce-address">
					Nonce account address
				</label>
				<input
					id="nonce-address"
					type="text"
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					placeholder="Enter a nonce account address"
					className="input"
				/>
			</div>
			{isLoading && <p className="text-sm text-slate-600">Loading...</p>}
			{error ? (
				<p className="text-sm font-semibold text-red-600">
					{error instanceof Error ? error.message : 'Failed to fetch'}
				</p>
			) : null}
			{data && (
				<div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
					<p>
						<span className="font-semibold">Blockhash:</span> {data.blockhash}
					</p>
					<p>
						<span className="font-semibold">Authority:</span> {data.authority}
					</p>
				</div>
			)}
		</section>
	);
}
