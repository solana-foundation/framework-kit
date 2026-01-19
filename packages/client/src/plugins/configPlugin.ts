import type { SolanaClientConfig } from '../types';
import { resolveCluster } from '../utils/cluster';
import type { ResolvedConfig } from './types';

/**
 * Creates a plugin that resolves and attaches configuration to the client.
 *
 * @param inputConfig - The raw client configuration provided by the user.
 * @returns A plugin that adds resolved config to the client.
 */
export function configPlugin(inputConfig: SolanaClientConfig) {
	return <T extends object>(client: T): T & { config: ResolvedConfig } => {
		const resolvedCluster = resolveCluster({
			endpoint: inputConfig.rpc ?? inputConfig.endpoint,
			moniker: inputConfig.cluster,
			websocketEndpoint: inputConfig.websocket ?? inputConfig.websocketEndpoint,
		});

		const commitment = inputConfig.commitment ?? 'confirmed';

		const config: ResolvedConfig = {
			commitment,
			endpoint: resolvedCluster.endpoint,
			originalConfig: inputConfig,
			websocketEndpoint: resolvedCluster.websocketEndpoint,
		};

		return { ...client, config };
	};
}
