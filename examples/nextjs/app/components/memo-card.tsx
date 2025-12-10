'use client';

import { address } from '@solana/kit';
import { useSendTransaction, useWalletSession } from '@solana/react-hooks';
import { useState } from 'react';

const MEMO_PROGRAM = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';

export function MemoCard() {
	const session = useWalletSession();
	const { send, isSending, signature } = useSendTransaction();
	const [memoText, setMemoText] = useState('');
	const [error, setError] = useState<string | null>(null);

	async function sendMemo() {
		if (!session) {
			setError('Connect a wallet first.');
			return;
		}
		const trimmed = memoText.trim();
		if (!trimmed) {
			setError('Enter a memo message.');
			return;
		}
		setError(null);
		try {
			await send({
				authority: session,
				feePayer: session.account.address,
				instructions: [
					{
						accounts: [],
						data: new TextEncoder().encode(trimmed),
						programAddress: address(MEMO_PROGRAM),
					},
				],
			});
			setMemoText('');
		} catch (err) {
			// @ts-expect-error unknown error shape
			console.error('Memo transaction failed', err?.cause ?? err);
			setError(err instanceof Error ? err.message : 'Failed to send memo');
		}
	}

	return (
		<section className="card space-y-4">
			<div className="space-y-1">
				<p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Memo</p>
				<h2 className="text-xl font-semibold text-slate-900">Send a memo transaction</h2>
				<p className="text-sm text-slate-600">
					Uses the Memo program and the connected wallet as the fee payer.
				</p>
			</div>
			<div className="space-y-2">
				<label className="text-sm font-semibold text-slate-800" htmlFor="memo-text">
					Memo message
				</label>
				<textarea
					id="memo-text"
					value={memoText}
					onChange={(event) => setMemoText(event.target.value)}
					placeholder="Hello from Next.js + @solana/react-hooks"
					maxLength={180}
					className="input min-h-[100px]"
				/>
			</div>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-sm text-slate-600">Status: {session ? 'Wallet connected' : 'Wallet disconnected'}</p>
				<button
					type="button"
					onClick={() => void sendMemo()}
					disabled={!session || isSending}
					className="btn btn-primary"
				>
					{isSending ? 'Sending…' : 'Send memo'}
				</button>
			</div>
			{signature ? (
				<div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
					<p className="font-semibold">Memo sent</p>
					<a
						className="text-sky-700 underline"
						href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
						target="_blank"
						rel="noreferrer"
					>
						View on Solana Explorer →
					</a>
				</div>
			) : null}
			{error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
		</section>
	);
}
