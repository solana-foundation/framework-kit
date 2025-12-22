import {
	type CreateDefaultClientOptions,
	createClient,
	resolveClientConfig,
	type SolanaClient,
	type SolanaClientConfig,
} from '@solana/client';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo } from 'react';

export const SolanaClientContext = createContext<SolanaClient | null>(null);

type ProviderProps = Readonly<{
	children: ReactNode;
	client?: SolanaClient;
	config?: SolanaClientConfig | CreateDefaultClientOptions;
}>;

function normalizeConfig(config?: SolanaClientConfig | CreateDefaultClientOptions): SolanaClientConfig {
	return resolveClientConfig(config ?? {});
}

/**
 * Provides a {@link SolanaClient} instance to descendant components.
 *
 * Supply either an existing `client` or a configuration object used to lazily
 * construct an instance via {@link createClient}.
 */
export function SolanaClientProvider({ children, client: providedClient, config }: ProviderProps) {
	const normalizedConfig = useMemo(() => normalizeConfig(config), [config]);
	const client = useMemo(() => {
		if (providedClient) {
			return providedClient;
		}
		return createClient(normalizedConfig);
	}, [normalizedConfig, providedClient]);

	useEffect(() => {
		if (providedClient) {
			return;
		}
		return () => {
			client.destroy();
		};
	}, [client, providedClient]);

	return <SolanaClientContext.Provider value={client}>{children}</SolanaClientContext.Provider>;
}

/**
 * Access the {@link SolanaClient} from the nearest {@link SolanaClientProvider}.
 *
 * @throws If used outside of a provider.
 */
export function useSolanaClient(): SolanaClient {
	const client = useContext(SolanaClientContext);
	if (!client) {
		throw new Error('useSolanaClient must be used within a SolanaClientProvider.');
	}
	return client;
}

export type SolanaClientProviderProps = ProviderProps;
export type UseSolanaClientParameters = undefined;
export type UseSolanaClientReturnType = SolanaClient;
