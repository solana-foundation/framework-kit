import { useProgramAccounts } from '@solana/react-hooks';
import { type ChangeEvent, Suspense, useMemo, useState } from 'react';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

const DEFAULT_PROGRAM = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';

export function ProgramAccountsCard() {
	const [program, setProgram] = useState(DEFAULT_PROGRAM);
	const normalizedProgram = program.trim() === '' ? undefined : program.trim();

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setProgram(event.target.value);
	};

	return (
		<Suspense
			fallback={
				<ProgramAccountsCardShell
					logPanel={
						normalizedProgram ? 'Fetching program accounts…' : 'Enter a program address to fetch accounts.'
					}
					onProgramChange={handleChange}
					program={program}
					refreshDisabled
					statusLabel={normalizedProgram ? 'loading' : 'idle'}
				/>
			}
		>
			<ProgramAccountsCardContent
				normalizedProgram={normalizedProgram}
				onProgramChange={handleChange}
				program={program}
			/>
		</Suspense>
	);
}

type ProgramAccountsCardContentProps = Readonly<{
	normalizedProgram?: string;
	onProgramChange(event: ChangeEvent<HTMLInputElement>): void;
	program: string;
}>;

function ProgramAccountsCardContent({ normalizedProgram, onProgramChange, program }: ProgramAccountsCardContentProps) {
	const query = useProgramAccounts(normalizedProgram, {
		config: { commitment: 'confirmed', encoding: 'base64', filters: [] },
		disabled: !normalizedProgram,
	});

	const logPanel = useMemo(() => {
		if (!normalizedProgram) {
			return 'Enter a program address to fetch accounts.';
		}
		if (query.status === 'error' && query.error) {
			return `Error fetching accounts: ${formatError(query.error)}`;
		}
		if (!query.accounts.length) {
			return 'No accounts fetched yet.';
		}
		return query.accounts
			.slice(0, 5)
			.map((account) => `${account.pubkey.toString()} · ${account.account.data.length} bytes`)
			.join('\n');
	}, [normalizedProgram, query.accounts, query.error, query.status]);

	const refreshDisabled = !normalizedProgram;
	const statusLabel = query.status === 'idle' && !normalizedProgram ? 'idle' : query.status;

	return (
		<ProgramAccountsCardShell
			logPanel={logPanel}
			onProgramChange={onProgramChange}
			onRefresh={!refreshDisabled ? () => query.refresh() : undefined}
			program={program}
			refreshDisabled={refreshDisabled}
			statusLabel={statusLabel}
		/>
	);
}

type ProgramAccountsCardShellProps = Readonly<{
	logPanel: string;
	onProgramChange(event: ChangeEvent<HTMLInputElement>): void;
	onRefresh?: () => void;
	program: string;
	refreshDisabled: boolean;
	statusLabel: string;
}>;

function ProgramAccountsCardShell({
	logPanel,
	onProgramChange,
	onRefresh,
	program,
	refreshDisabled,
	statusLabel,
}: ProgramAccountsCardShellProps) {
	return (
		<Card>
			<CardHeader>
				<div className="space-y-1.5">
					<CardTitle>Program Accounts</CardTitle>
					<CardDescription>
						Call <code>useProgramAccounts</code> to hydrate GPA results and manually refresh the dataset.
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<label htmlFor="program-address">Program Address</label>
					<Input
						autoComplete="off"
						id="program-address"
						onChange={onProgramChange}
						placeholder="Program public key"
						value={program}
					/>
				</div>
				<div className="log-panel max-h-48 overflow-auto whitespace-pre-wrap" aria-live="polite">
					{logPanel}
				</div>
			</CardContent>
			<CardFooter className="flex flex-wrap gap-2">
				<Button disabled={refreshDisabled || !onRefresh} onClick={onRefresh} type="button" variant="secondary">
					Refresh
				</Button>
				<span className="text-xs text-muted-foreground">
					Status: <span className="font-medium text-foreground">{statusLabel}</span>
				</span>
			</CardFooter>
		</Card>
	);
}

function formatError(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	return JSON.stringify(error);
}
