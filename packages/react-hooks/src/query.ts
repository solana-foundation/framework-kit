import type { SolanaClient } from '@solana/client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR, { type BareFetcher, type SWRConfiguration, type SWRResponse } from 'swr';

import { useSolanaClient } from './context';
import { useQuerySuspensePreference } from './querySuspenseContext';
import { useClientStore } from './useClientStore';

const QUERY_NAMESPACE = '@solana/react-hooks';

export type QueryStatus = 'error' | 'idle' | 'loading' | 'success';

export type UseSolanaRpcQueryOptions<Data> = Readonly<{
	disabled?: boolean;
	swr?: Omit<SWRConfiguration<Data, unknown, BareFetcher<Data>>, 'fallback' | 'suspense'>;
}>;

export type SolanaQueryResult<Data> = Readonly<{
	data: Data | undefined;
	dataUpdatedAt?: number;
	error: unknown;
	isError: boolean;
	isLoading: boolean;
	isSuccess: boolean;
	isValidating: boolean;
	mutate: SWRResponse<Data>['mutate'];
	refresh(): Promise<Data | undefined>;
	status: QueryStatus;
}>;

/**
 * Low-level RPC query helper that scopes SWR keys to the active cluster and exposes a Solana-friendly
 * status shape. Prefer this when you need custom fetch logic beyond the built-in hooks.
 *
 * @param scope - Namespace label for the query key (for debugging and cache clarity).
 * @param args - Additional key params that uniquely identify the query (e.g. signature, address).
 * @param fetcher - Async function that receives the current {@link SolanaClient} and returns data.
 * @param options - Optional flags to disable the query or pass through SWR configuration.
 * @example
 * ```ts
 * const slotQuery = useSolanaRpcQuery(
 *   'slot',
 *   ['slot'],
 *   (client) => client.runtime.rpc.getLatestBlockhash().send().then((r) => r.context.slot),
 * );
 * ```
 */
export function useSolanaRpcQuery<Data>(
	scope: string,
	args: readonly unknown[],
	fetcher: (client: SolanaClient) => Promise<Data>,
	options: UseSolanaRpcQueryOptions<Data> = {},
): SolanaQueryResult<Data> {
	const client = useSolanaClient();
	const cluster = useClientStore((state) => state.cluster);
	const { disabled = false, swr } = options;
	const providerSuspensePreference = useQuerySuspensePreference();
	const suspenseEnabled = !disabled && Boolean(providerSuspensePreference);
	const swrOptions: SWRConfiguration<Data, unknown, BareFetcher<Data>> = {
		...(swr ?? {}),
		suspense: suspenseEnabled,
	};

	const key = useMemo(() => {
		if (disabled) {
			return null;
		}
		return [QUERY_NAMESPACE, scope, cluster.endpoint, cluster.commitment, ...args] as const;
	}, [cluster.commitment, cluster.endpoint, args, scope, disabled]);

	const swrResponse = useSWR<Data>(key, () => fetcher(client), swrOptions);
	const [dataUpdatedAt, setDataUpdatedAt] = useState<number | undefined>(() =>
		swrResponse.data !== undefined ? Date.now() : undefined,
	);

	useEffect(() => {
		if (swrResponse.data !== undefined) {
			setDataUpdatedAt(Date.now());
		}
	}, [swrResponse.data]);

	const status: QueryStatus = swrResponse.error
		? 'error'
		: swrResponse.isLoading
			? 'loading'
			: swrResponse.data !== undefined
				? 'success'
				: 'idle';

	const refresh = useCallback(() => swrResponse.mutate(undefined, { revalidate: true }), [swrResponse.mutate]);

	return {
		data: swrResponse.data,
		dataUpdatedAt,
		error: swrResponse.error ?? null,
		isError: status === 'error',
		isLoading: swrResponse.isLoading,
		isSuccess: status === 'success',
		isValidating: swrResponse.isValidating,
		mutate: swrResponse.mutate,
		refresh,
		status,
	};
}
