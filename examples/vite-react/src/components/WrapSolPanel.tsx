import { WRAPPED_SOL_MINT } from '@solana/client';
import { useWalletSession, useWrapSol } from '@solana/react-hooks';
import { type FormEvent, useState } from 'react';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
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

function formatWsolBalance(balance: { amount: bigint; exists: boolean } | null, owner: string | null): string {
	if (!owner) {
		return 'Connect a wallet to see your wSOL balance.';
	}
	if (!balance) {
		return 'Loading balance...';
	}
	if (!balance.exists) {
		return '0 wSOL (no token account)';
	}
	const solAmount = Number(balance.amount) / 1_000_000_000;
	return `${solAmount.toFixed(9)} wSOL (${balance.amount.toString()} lamports)`;
}

export function WrapSolPanel() {
	const session = useWalletSession();
	const [wrapAmount, setWrapAmount] = useState('0.1');
	const {
		balance,
		error,
		isFetching,
		isUnwrapping,
		isWrapping,
		owner,
		refresh,
		refreshing,
		resetUnwrap,
		resetWrap,
		unwrap,
		unwrapError,
		unwrapSignature,
		unwrapStatus,
		wrap,
		wrapError,
		wrapSignature,
		wrapStatus,
		status,
	} = useWrapSol();

	const handleWrap = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!session) {
			return;
		}
		const amountStr = wrapAmount.trim();
		if (!amountStr) {
			return;
		}
		const solAmount = parseFloat(amountStr);
		if (Number.isNaN(solAmount) || solAmount <= 0) {
			return;
		}
		// Convert SOL to lamports
		const lamports = BigInt(Math.floor(solAmount * 1_000_000_000));
		await wrap({ amount: lamports });
		await refresh();
	};

	const handleUnwrap = async () => {
		if (!session) {
			return;
		}
		await unwrap({});
		await refresh();
	};

	const isWalletConnected = Boolean(owner);
	const hasWsolBalance = balance?.exists && balance.amount > 0n;

	const getWrapStatus = (): string => {
		if (!owner) {
			return 'Connect a wallet to wrap SOL.';
		}
		if (isWrapping || wrapStatus === 'loading') {
			return 'Wrapping SOL...';
		}
		if (wrapStatus === 'success' && wrapSignature) {
			return `Wrap successful! Signature: ${String(wrapSignature)}`;
		}
		if (wrapStatus === 'error' && wrapError) {
			return `Wrap failed: ${formatError(wrapError)}`;
		}
		return 'Enter an amount and click Wrap to convert SOL to wSOL.';
	};

	const getUnwrapStatus = (): string => {
		if (!owner) {
			return '';
		}
		if (isUnwrapping || unwrapStatus === 'loading') {
			return 'Unwrapping wSOL...';
		}
		if (unwrapStatus === 'success' && unwrapSignature) {
			return `Unwrap successful! Signature: ${String(unwrapSignature)}`;
		}
		if (unwrapStatus === 'error' && unwrapError) {
			return `Unwrap failed: ${formatError(unwrapError)}`;
		}
		if (!hasWsolBalance) {
			return 'No wSOL to unwrap.';
		}
		return 'Click Unwrap to convert all wSOL back to SOL.';
	};

	return (
		<Card aria-disabled={!isWalletConnected}>
			<CardHeader>
				<div className="space-y-1.5">
					<CardTitle>Wrapped SOL (wSOL)</CardTitle>
					<CardDescription>
						Wrap native SOL into wSOL and unwrap it back using the <code>useWrapSol</code> hook.
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-2 text-sm text-muted-foreground">
					<div>
						<span className="font-medium text-foreground">Mint:</span>{' '}
						<code className="break-all">{WRAPPED_SOL_MINT}</code>
					</div>
					<div>
						<span className="font-medium text-foreground">Owner:</span>{' '}
						{owner ? <code className="break-all">{owner}</code> : 'Connect a wallet'}
					</div>
				</div>

				{/* Balance Section */}
				<div className="space-y-2">
					<div className="flex flex-wrap gap-2">
						<Button
							disabled={!isWalletConnected || refreshing || isFetching}
							onClick={() => void refresh()}
							type="button"
							variant="secondary"
						>
							{refreshing || isFetching ? 'Refreshing...' : 'Refresh Balance'}
						</Button>
					</div>
					<div aria-live="polite" className="log-panel">
						{status === 'error' && error
							? `Error: ${formatError(error)}`
							: formatWsolBalance(balance, owner)}
					</div>
				</div>

				{/* Wrap Form */}
				<form className="grid gap-4" onSubmit={handleWrap}>
					<fieldset className="grid gap-4" disabled={!isWalletConnected}>
						<div className="space-y-2">
							<label htmlFor="wrap-amount">Amount (SOL)</label>
							<Input
								autoComplete="off"
								disabled={!owner}
								id="wrap-amount"
								min="0"
								onChange={(event) => setWrapAmount(event.target.value)}
								placeholder="0.1"
								step="0.000000001"
								type="number"
								value={wrapAmount}
							/>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button disabled={!owner || isWrapping} type="submit">
								{isWrapping ? 'Wrapping...' : 'Wrap SOL'}
							</Button>
							<Button disabled={wrapStatus === 'idle'} onClick={resetWrap} type="button" variant="ghost">
								Reset
							</Button>
						</div>
					</fieldset>
				</form>
				<div aria-live="polite" className="log-panel">
					{getWrapStatus()}
				</div>

				{/* Unwrap Section */}
				<div className="space-y-2 border-t pt-4">
					<h4 className="font-medium">Unwrap wSOL</h4>
					<p className="text-sm text-muted-foreground">
						Unwrapping closes your wSOL token account and returns all SOL to your wallet.
					</p>
					<div className="flex flex-wrap gap-2">
						<Button
							disabled={!owner || isUnwrapping || !hasWsolBalance}
							onClick={() => void handleUnwrap()}
							type="button"
							variant="destructive"
						>
							{isUnwrapping ? 'Unwrapping...' : 'Unwrap All wSOL'}
						</Button>
						<Button disabled={unwrapStatus === 'idle'} onClick={resetUnwrap} type="button" variant="ghost">
							Reset
						</Button>
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<div aria-live="polite" className="log-panel w-full">
					{getUnwrapStatus()}
				</div>
			</CardFooter>
		</Card>
	);
}
