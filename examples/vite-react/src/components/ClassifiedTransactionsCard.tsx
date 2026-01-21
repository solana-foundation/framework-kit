import { useClassifiedTransactions, useWallet } from '@solana/react-hooks';
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

function formatError(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	return JSON.stringify(error);
}

export function ClassifiedTransactionsCard() {
	const wallet = useWallet();
	const [address, setAddress] = useState('');
	const [selectedTxIndex, setSelectedTxIndex] = useState<number | null>(null);

	// Track if we've auto-filled from wallet to avoid overwriting user input
	const hasAutoFilled = useRef(false);

	useEffect(() => {
		if (wallet.status === 'connected' && !hasAutoFilled.current && address === '') {
			setAddress(wallet.session.account.address.toString());
			hasAutoFilled.current = true;
		}
	}, [wallet, address]);

	const trimmedAddress = address.trim();
	const { transactions, isLoading, isError, error } = useClassifiedTransactions({
		address: trimmedAddress === '' ? undefined : trimmedAddress,
		options: {
			limit: 5,
			filterSpam: true,
		},
		swr: {
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			revalidateIfStale: false,
		},
	});

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setAddress(event.target.value);
		setSelectedTxIndex(null);
	};

	const selectedTxJson = useMemo(() => {
		if (selectedTxIndex === null || !transactions[selectedTxIndex]) {
			return null;
		}
		return JSON.stringify(transactions[selectedTxIndex], (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2);
	}, [selectedTxIndex, transactions]);

	return (
		<Card className="lg:col-span-2">
			<CardHeader>
				<div className="space-y-1.5">
					<CardTitle>Classified Transactions</CardTitle>
					<CardDescription>
						Test the <code>useClassifiedTransactions</code> hook. Fetches and classifies transactions with
						spam filtering and protocol detection.
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="space-y-5">
				<div className="space-y-2">
					<label htmlFor="tx-address">Wallet Address</label>
					<Input
						autoComplete="off"
						id="tx-address"
						onChange={handleChange}
						placeholder="Base58 address"
						value={address}
					/>
				</div>

				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<span>Status:</span>
					<span className="font-medium text-foreground">
						{isLoading ? 'Loading...' : isError ? 'Error' : `${transactions.length} transactions`}
					</span>
				</div>

				{isError && error ? (
					<span aria-live="polite" className="status-badge" data-state="error">
						{formatError(error)}
					</span>
				) : null}

				{transactions.length > 0 ? (
					<div className="space-y-3">
						{transactions.map((tx, index) => (
							<button
								type="button"
								key={String(tx.tx.signature)}
								className={`w-full cursor-pointer rounded-md border p-3 text-left text-sm transition-colors hover:bg-muted/50 ${selectedTxIndex === index ? 'border-primary bg-muted/30' : ''}`}
								onClick={() => setSelectedTxIndex(selectedTxIndex === index ? null : index)}
							>
								<div className="flex items-center justify-between">
									<span className="font-medium">{tx.classification.primaryType}</span>
									<span className="text-xs text-muted-foreground">
										{tx.classification.confidence.toFixed(2)} confidence
									</span>
								</div>
								{tx.classification.primaryAmount && (
									<div className="mt-1 text-muted-foreground">
										{tx.classification.primaryAmount.amountUi.toFixed(4)}{' '}
										{tx.classification.primaryAmount.token.symbol}
									</div>
								)}
								<div className="mt-1 font-mono text-xs text-muted-foreground">
									{String(tx.tx.signature).slice(0, 20)}...
								</div>
								{tx.tx.protocol && (
									<div className="mt-1 text-xs">
										<span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">
											{tx.tx.protocol.name}
										</span>
									</div>
								)}
							</button>
						))}
					</div>
				) : null}

				{selectedTxJson !== null ? (
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Transaction Structure</span>
							<Button variant="ghost" size="sm" onClick={() => setSelectedTxIndex(null)}>
								Close
							</Button>
						</div>
						<pre className="max-h-96 overflow-auto rounded bg-muted p-3 text-xs">{selectedTxJson}</pre>
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
