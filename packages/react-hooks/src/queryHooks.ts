import { type AddressLike, type SolanaClient, toAddress } from '@solana/client';
import {
	type Base64EncodedWireTransaction,
	type Commitment,
	getBase64EncodedWireTransaction,
	type SendableTransaction,
	type Transaction,
} from '@solana/kit';
import { useCallback, useMemo } from 'react';

import type { SolanaQueryResult, UseSolanaRpcQueryOptions } from './query';
import { useSolanaRpcQuery } from './query';
import { getLatestBlockhashKey, getProgramAccountsKey, getSimulateTransactionKey } from './queryKeys';

type RpcInstance = SolanaClient['runtime']['rpc'];

type LatestBlockhashPlan = ReturnType<RpcInstance['getLatestBlockhash']>;
type LatestBlockhashResponse = Awaited<ReturnType<LatestBlockhashPlan['send']>>;

type ProgramAccountsPlan = ReturnType<RpcInstance['getProgramAccounts']>;
type ProgramAccountsConfig = Parameters<RpcInstance['getProgramAccounts']>[1];
type ProgramAccountsResponse = Awaited<ReturnType<ProgramAccountsPlan['send']>>;

type SimulateTransactionPlan = ReturnType<RpcInstance['simulateTransaction']>;
type SimulateTransactionConfig = Parameters<RpcInstance['simulateTransaction']>[1];
type SimulateTransactionResponse = Awaited<ReturnType<SimulateTransactionPlan['send']>>;

const DEFAULT_BLOCKHASH_REFRESH_INTERVAL = 30_000;

export type UseLatestBlockhashParameters = Readonly<{
	commitment?: Commitment;
	disabled?: boolean;
	minContextSlot?: bigint | number;
	refreshInterval?: number;
	swr?: UseSolanaRpcQueryOptions<LatestBlockhashResponse>['swr'];
}>;

export type UseLatestBlockhashReturnType = SolanaQueryResult<LatestBlockhashResponse> &
	Readonly<{
		blockhash: string | null;
		contextSlot: bigint | null | undefined;
		lastValidBlockHeight: bigint | null;
	}>;

/**
 * Fetch the current cluster blockhash and keep it warm with a configurable polling interval.
 * Falls back to the client's active commitment when one is not provided.
 *
 * @example
 * ```ts
 * const { blockhash, lastValidBlockHeight } = useLatestBlockhash({ refreshInterval: 10_000 });
 * ```
 */
export function useLatestBlockhash(options: UseLatestBlockhashParameters = {}): UseLatestBlockhashReturnType {
	const {
		commitment,
		minContextSlot,
		refreshInterval = DEFAULT_BLOCKHASH_REFRESH_INTERVAL,
		disabled = false,
		swr,
	} = options;
	const fetcher = useCallback(
		async (client: SolanaClient) => {
			const fallbackCommitment = commitment ?? client.store.getState().cluster.commitment;
			const plan = client.runtime.rpc.getLatestBlockhash({
				commitment: fallbackCommitment,
				minContextSlot: normalizeMinContextSlot(minContextSlot),
			});
			return plan.send({ abortSignal: AbortSignal.timeout(15_000) });
		},
		[commitment, minContextSlot],
	);
	const query = useSolanaRpcQuery<LatestBlockhashResponse>(
		'latestBlockhash',
		getLatestBlockhashKey(options),
		fetcher,
		{
			disabled,
			swr: {
				refreshInterval,
				...swr,
			},
		},
	);
	return {
		...query,
		blockhash: query.data?.value.blockhash ?? null,
		contextSlot: query.data?.context.slot,
		lastValidBlockHeight: query.data?.value.lastValidBlockHeight ?? null,
	};
}

export type UseProgramAccountsParameters = Readonly<{
	commitment?: Commitment;
	config?: ProgramAccountsConfig;
	disabled?: boolean;
	programAddress?: AddressLike;
	swr?: UseSolanaRpcQueryOptions<ProgramAccountsResponse>['swr'];
}>;

export type UseProgramAccountsReturnType = SolanaQueryResult<ProgramAccountsResponse> &
	Readonly<{
		accounts: ProgramAccountsResponse;
	}>;

/**
 * Fetch accounts owned by a program, keyed by the program address. The query is disabled until a
 * program address is provided, and respects both explicit and client default commitments.
 *
 * @example
 * ```ts
 * const programAccounts = useProgramAccounts(programId, { config: { dataSlice: { offset: 0, length: 0 } } });
 * ```
 */
export function useProgramAccounts(
	programAddress?: AddressLike,
	options?: UseProgramAccountsParameters,
): UseProgramAccountsReturnType {
	const { commitment, config, swr, disabled: disabledOption } = options ?? {};
	const fetcher = useCallback(
		async (client: SolanaClient) => {
			const address = programAddress ? toAddress(programAddress) : undefined;
			if (!address) {
				throw new Error('Provide a program address before querying program accounts.');
			}
			const fallbackCommitment = commitment ?? config?.commitment ?? client.store.getState().cluster.commitment;
			const mergedConfig = {
				...(config ?? {}),
				commitment: fallbackCommitment,
			} satisfies ProgramAccountsConfig;
			const plan = client.runtime.rpc.getProgramAccounts(address, mergedConfig);
			return plan.send({ abortSignal: AbortSignal.timeout(20_000) });
		},
		[commitment, config, programAddress],
	);
	const disabled = disabledOption ?? !programAddress;
	const query = useSolanaRpcQuery<ProgramAccountsResponse>(
		'programAccounts',
		getProgramAccountsKey({ programAddress, config }),
		fetcher,
		{
			disabled,
			swr,
		},
	);
	return {
		...query,
		accounts: query.data ?? [],
	};
}

export type UseSimulateTransactionParameters = Readonly<{
	commitment?: Commitment;
	config?: SimulateTransactionConfig;
	disabled?: boolean;
	refreshInterval?: number;
	swr?: UseSolanaRpcQueryOptions<SimulateTransactionResponse>['swr'];
	transaction?: SimulationInput | null;
}>;

type SimulationInput = (SendableTransaction & Transaction) | Base64EncodedWireTransaction | string;

export type UseSimulateTransactionReturnType = SolanaQueryResult<SimulateTransactionResponse> &
	Readonly<{
		logs: readonly string[];
	}>;

/**
 * Simulate a transaction or wire payload and return simulation logs/results. Disabled until a
 * transaction payload is provided; uses client commitment when not specified in options.
 *
 * @example
 * ```ts
 * const simulation = useSimulateTransaction(base64Wire, { refreshInterval: 0 });
 * console.log(simulation.logs);
 * ```
 */
export function useSimulateTransaction(
	transaction?: SimulationInput | null,
	options?: UseSimulateTransactionParameters,
): UseSimulateTransactionReturnType {
	const { commitment, config, refreshInterval, disabled: disabledOption, swr } = options ?? {};
	const wire = useMemo<Base64EncodedWireTransaction | null>(() => {
		if (!transaction) {
			return null;
		}
		if (typeof transaction === 'string') {
			return transaction as Base64EncodedWireTransaction;
		}
		return getBase64EncodedWireTransaction(transaction);
	}, [transaction]);
	const fetcher = useCallback(
		async (client: SolanaClient) => {
			if (!wire) {
				throw new Error('Provide a transaction payload before simulating.');
			}
			const resolvedConfig = {
				...(config ?? {}),
				commitment: commitment ?? config?.commitment ?? client.store.getState().cluster.commitment,
			} as SimulateTransactionConfig;
			const plan = client.runtime.rpc.simulateTransaction(wire, resolvedConfig);
			return plan.send({ abortSignal: AbortSignal.timeout(20_000) });
		},
		[commitment, config, wire],
	);
	const disabled = disabledOption ?? !wire;
	const query = useSolanaRpcQuery<SimulateTransactionResponse>(
		'simulateTransaction',
		getSimulateTransactionKey({ transaction, config }),
		fetcher,
		{
			disabled,
			swr: {
				refreshInterval,
				revalidateIfStale: false,
				revalidateOnFocus: false,
				...swr,
			},
		},
	);
	return {
		...query,
		logs: query.data?.value.logs ?? [],
	};
}

function normalizeMinContextSlot(minContextSlot?: bigint | number): bigint | undefined {
	if (minContextSlot === undefined) return undefined;
	return typeof minContextSlot === 'bigint' ? minContextSlot : BigInt(Math.floor(minContextSlot));
}
