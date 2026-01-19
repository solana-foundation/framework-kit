import { type AsyncClient, type Client, createEmptyClient } from '@solana/plugin-core';

import { actionsPlugin } from '../plugins/actionsPlugin';
import { aliasesPlugin } from '../plugins/aliasesPlugin';
import { clusterWarmupPlugin } from '../plugins/clusterWarmupPlugin';
import { configPlugin } from '../plugins/configPlugin';
import { connectorsPlugin } from '../plugins/connectorsPlugin';
import { helpersPlugin } from '../plugins/helpersPlugin';
import { lifetimePlugin } from '../plugins/lifetimePlugin';
import { runtimePlugin } from '../plugins/runtimePlugin';
import { storePlugin } from '../plugins/storePlugin';
import { watchersPlugin } from '../plugins/watchersPlugin';
import { applySerializableState } from '../serialization/state';
import type { SolanaClient, SolanaClientConfig } from '../types';

/**
 * The full SolanaClient type after all plugins are applied.
 * This is the resolved type that users receive after awaiting createClient().
 */
export type FullSolanaClient = Client<SolanaClient>;

/**
 * Creates a Solana client instance using the provided configuration.
 * Returns an AsyncClient that can be awaited to get the fully initialized client.
 *
 * @param config - High-level configuration supplied by integrators.
 * @returns An AsyncClient that resolves to a fully initialized {@link SolanaClient} instance.
 *
 * @example Basic usage
 * ```ts
 * const client = await createClient({ endpoint: 'https://api.devnet.solana.com' });
 * const balance = await client.actions.fetchBalance(address);
 * ```
 *
 * @example With wallet connectors
 * ```ts
 * const client = await createClient({
 *   endpoint: 'https://api.mainnet-beta.solana.com',
 *   walletConnectors: [...phantom(), ...solflare()],
 * });
 * ```
 */
export function createClient(config: SolanaClientConfig): AsyncClient<SolanaClient> {
	const hydratedConfig = config.initialState ? applySerializableState(config, config.initialState) : config;

	return createEmptyClient()
		.use(configPlugin(hydratedConfig))
		.use(storePlugin())
		.use(connectorsPlugin(hydratedConfig.walletConnectors))
		.use(runtimePlugin())
		.use(actionsPlugin())
		.use(watchersPlugin())
		.use(helpersPlugin())
		.use(aliasesPlugin())
		.use(lifetimePlugin())
		.use(clusterWarmupPlugin()) as AsyncClient<SolanaClient>;
}

/**
 * Creates a minimal client without aliases or cluster warmup.
 * Useful for server-side use cases where wallet support is not needed.
 *
 * @param config - High-level configuration supplied by integrators.
 * @returns A sync Client without helper aliases and cluster warmup.
 */
export function createMinimalClient(config: SolanaClientConfig) {
	const hydratedConfig = config.initialState ? applySerializableState(config, config.initialState) : config;

	return createEmptyClient()
		.use(configPlugin(hydratedConfig))
		.use(storePlugin())
		.use(connectorsPlugin(hydratedConfig.walletConnectors))
		.use(runtimePlugin())
		.use(actionsPlugin())
		.use(watchersPlugin())
		.use(helpersPlugin())
		.use(lifetimePlugin());
}

export { type AsyncClient, type Client, createEmptyClient } from '@solana/plugin-core';
