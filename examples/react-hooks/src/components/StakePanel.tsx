import { useStake, useWallet } from '@solana/react-hooks';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

/**
 * Example component demonstrating the useStake hook for native SOL staking.
 * This component allows users to stake SOL to a validator.
 */
export function StakePanel() {
	// Example validator ID (Helius validator)
	const [validatorId, setValidatorId] = useState('he1iusunGwqrNtafDtLdhsUQDFvo13z9sUa36PauBtk');
	const [amount, setAmount] = useState('1');

	const wallet = useWallet();
	const {
		stake,
		signature,
		status,
		error,
		isStaking,
		reset,
		validatorId: currentValidatorId,
	} = useStake(validatorId);

	const handleStake = async () => {
		try {
			// Convert SOL to lamports (1 SOL = 1_000_000_000 lamports)
			const lamports = BigInt(Math.floor(parseFloat(amount) * 1_000_000_000));

			const sig = await stake({
				amount: lamports,
			});

			console.log('Stake transaction signature:', sig);
		} catch (err) {
			console.error('Stake failed:', err);
		}
	};

	const isConnected = wallet.status === 'connected';

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Stake Native SOL</CardTitle>
				<CardDescription>
					Stake your SOL tokens to a validator to earn rewards. This uses the useStake hook.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<label htmlFor="validator" className="text-sm font-medium">
						Validator ID
					</label>
					<Input
						id="validator"
						type="text"
						value={validatorId}
						onChange={(e) => setValidatorId(e.target.value)}
						placeholder="Enter validator public key"
						disabled={isStaking}
						className="font-mono text-sm"
					/>
					<p className="text-xs text-muted-foreground">
						Current: {currentValidatorId.slice(0, 8)}...{currentValidatorId.slice(-8)}
					</p>
				</div>

				<div className="space-y-2">
					<label htmlFor="amount" className="text-sm font-medium">
						Amount (SOL)
					</label>
					<Input
						id="amount"
						type="number"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						placeholder="0.0"
						step="0.1"
						min="0"
						disabled={isStaking || !isConnected}
					/>
				</div>

				<div className="flex gap-2">
					<Button
						onClick={handleStake}
						disabled={!isConnected || isStaking || !validatorId || !amount || parseFloat(amount) <= 0}
						className="flex-1"
					>
						{isStaking ? 'Staking...' : 'Stake SOL'}
					</Button>
					{signature && (
						<Button onClick={reset} variant="outline">
							Reset
						</Button>
					)}
				</div>

				{!isConnected && <p className="text-sm text-muted-foreground">Connect your wallet to stake SOL</p>}

				{status === 'success' && signature && (
					<div className="p-3 bg-green-50 dark:bg-green-950 rounded-md">
						<p className="text-sm font-medium text-green-900 dark:text-green-100">Stake Successful!</p>
						<p className="text-xs text-green-700 dark:text-green-300 font-mono mt-1 break-all">
							Signature: {signature}
						</p>
					</div>
				)}

				{status === 'error' && error && (
					<div className="p-3 bg-red-50 dark:bg-red-950 rounded-md">
						<p className="text-sm font-medium text-red-900 dark:text-red-100">Error</p>
						<p className="text-xs text-red-700 dark:text-red-300 mt-1">
							{String(error instanceof Error ? error.message : error)}
						</p>
					</div>
				)}

				{status === 'loading' && (
					<div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
						<p className="text-sm text-blue-900 dark:text-blue-100">Processing stake transaction...</p>
					</div>
				)}

				<div className="text-xs text-muted-foreground space-y-1">
					<p>
						<strong>Status:</strong> {status}
					</p>
					<p>
						<strong>Is Staking:</strong> {isStaking ? 'Yes' : 'No'}
					</p>
					{signature && (
						<p>
							<strong>Last Signature:</strong> {signature.slice(0, 20)}...
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
