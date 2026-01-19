import { createSolanaRpcClient } from '../rpc/createSolanaRpcClient';
import type { SolanaClientRuntime } from '../rpc/types';
import type { ClientWithConfig } from './types';

/**
 * Creates a plugin that attaches the RPC runtime to the client.
 *
 * @returns A plugin that adds RPC runtime to the client.
 */
export function runtimePlugin() {
	return <T extends ClientWithConfig>(client: T): T & { runtime: SolanaClientRuntime } => {
		const { config } = client;
		const originalConfig = config.originalConfig;

		const rpcClient =
			originalConfig.rpcClient ??
			createSolanaRpcClient({
				commitment: config.commitment,
				endpoint: config.endpoint,
				websocketEndpoint: config.websocketEndpoint,
			});

		const runtime: SolanaClientRuntime = {
			rpc: rpcClient.rpc,
			rpcSubscriptions: rpcClient.rpcSubscriptions,
		};

		return { ...client, runtime };
	};
}
