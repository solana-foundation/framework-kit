'use client';

import type { JSX, ReactNode } from 'react';
import { useMemo, useRef } from 'react';
import { type Cache, SWRConfig, type SWRConfiguration } from 'swr';

import { QuerySuspenseContext } from './querySuspenseContext';
import { useClientStore } from './useClientStore';

const createCache = (): Cache => new Map<string, unknown>() as Cache;

const DEFAULT_QUERY_CONFIG: SWRConfiguration = Object.freeze({
	dedupingInterval: 2_000,
	focusThrottleInterval: 5_000,
	provider: () => createCache(),
	revalidateIfStale: true,
	revalidateOnFocus: true,
	revalidateOnReconnect: true,
});

type SolanaQueryProviderProps = Readonly<{
	children: ReactNode;
	config?: SWRConfiguration;
	resetOnClusterChange?: boolean;
	suspense?: boolean;
}>;

export function SolanaQueryProvider({
	children,
	config,
	resetOnClusterChange = true,
	suspense,
}: SolanaQueryProviderProps): JSX.Element {
	const cluster = useClientStore((state) => state.cluster);
	const cacheRegistryRef = useRef<Map<string, Cache>>(new Map());
	const cacheKey = resetOnClusterChange ? `${cluster.endpoint}|${cluster.commitment}` : 'global';
	const cache = useMemo<Cache>(() => {
		const registry = cacheRegistryRef.current;
		if (!resetOnClusterChange) {
			const existing = registry.get('global');
			if (existing) {
				return existing;
			}
			const next = createCache();
			registry.set('global', next);
			return next;
		}
		const next = createCache();
		registry.set(cacheKey, next);
		return next;
	}, [cacheKey, resetOnClusterChange]);

	const value = useMemo<SWRConfiguration>(() => {
		const base = {
			...DEFAULT_QUERY_CONFIG,
			...config,
		};
		if (!config?.provider) {
			base.provider = () => cache;
		}
		if (base.suspense === undefined && suspense !== undefined) {
			base.suspense = suspense;
		}
		return base;
	}, [cache, config, suspense]);

	return (
		<QuerySuspenseContext.Provider value={suspense}>
			<SWRConfig value={value}>{children}</SWRConfig>
		</QuerySuspenseContext.Provider>
	);
}
