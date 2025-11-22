import { useSplToken, useWalletSession } from '@solana/react-hooks';
import { type FormEvent, useState } from 'react';

import { computeSplAmountStep, formatSplBalanceStatus, formatSplTransferStatus } from './demoUi';
import { UsdcFaucetButton } from './UsdcFaucetButton';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

const DEVNET_USDC_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

export function SplTokenPanel() {
	const session = useWalletSession();
	const defaultAmount = '0.01';
	const [destinationOwner, setDestinationOwner] = useState('');
	const [amount, setAmount] = useState(defaultAmount);
	const {
		balance,
		error,
		isFetching,
		isSending,
		owner,
		refresh,
		refreshing,
		resetSend,
		send,
		sendError,
		sendSignature,
		sendStatus,
		status,
	} = useSplToken(DEVNET_USDC_MINT);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!session) {
			return;
		}
		const destination = destinationOwner.trim();
		const amountInput = amount.trim();
		if (!destination || !amountInput) {
			return;
		}
		await send({
			amount: amountInput,
			destinationOwner: destination,
		});
		setAmount(defaultAmount);
	};

	const balanceStatus = formatSplBalanceStatus({
		balance,
		error,
		isFetching,
		owner,
		status,
	});
	const transferStatus = formatSplTransferStatus({
		error: sendError,
		isSending,
		owner,
		signature: sendSignature,
		status: sendStatus,
	});

	const isWalletConnected = Boolean(owner);

	const amountStep = computeSplAmountStep(balance?.decimals);

	return (
		<Card aria-disabled={!isWalletConnected}>
			<CardHeader>
				<div className="space-y-1.5">
					<CardTitle>USDC (Devnet)</CardTitle>
					<CardDescription>
						Inspect the balance helper and send SPL transfers using the <code>useSplToken</code> hook.
						<UsdcFaucetButton className="mt-4" />
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-2 text-sm text-muted-foreground">
					<div>
						<span className="font-medium text-foreground">Mint:</span>{' '}
						<code className="break-all">{DEVNET_USDC_MINT}</code>
					</div>
					<div>
						<span className="font-medium text-foreground">Owner:</span>{' '}
						{owner ? <code className="break-all">{owner}</code> : 'Connect a wallet'}
					</div>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button
						disabled={!isWalletConnected || refreshing}
						onClick={() => void refresh()}
						type="button"
						variant="secondary"
					>
						{refreshing ? 'Refreshing…' : 'Refresh Balance'}
					</Button>
				</div>
				<div aria-live="polite" className="log-panel">
					{balanceStatus}
				</div>
				<form className="grid gap-4" onSubmit={handleSubmit}>
					<fieldset className="grid gap-4" disabled={!isWalletConnected}>
						<div className="space-y-2">
							<label htmlFor="spl-destination">Destination Owner</label>
							<Input
								autoComplete="off"
								disabled={!owner}
								id="spl-destination"
								onChange={(event) => setDestinationOwner(event.target.value)}
								placeholder="Base58 address"
								value={destinationOwner}
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="spl-amount">Amount (UI)</label>
							<Input
								autoComplete="off"
								id="spl-amount"
								min="0"
								onChange={(event) => setAmount(event.target.value)}
								placeholder={defaultAmount}
								step={amountStep}
								type="number"
								value={amount}
							/>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button disabled={!owner || isSending} type="submit">
								{isSending ? 'Sending…' : 'Send USDC'}
							</Button>
							<Button disabled={sendStatus === 'idle'} onClick={resetSend} type="button" variant="ghost">
								Reset
							</Button>
						</div>
					</fieldset>
				</form>
			</CardContent>
			<CardFooter>
				<div aria-live="polite" className="log-panel w-full">
					{transferStatus}
				</div>
			</CardFooter>
		</Card>
	);
}
