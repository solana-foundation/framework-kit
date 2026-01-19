import { createLogger, formatError } from '../logging/logger';
import type { SolanaClientRuntime } from '../rpc/types';
import type { ClientStore } from '../types';
import { now } from '../utils';
import type { ClientWithConfig } from './types';

type WarmupInputClient = ClientWithConfig & {
	runtime: SolanaClientRuntime;
	store: ClientStore;
};

/**
 * Creates an async plugin that warms up the cluster connection.
 * This sets the cluster status to 'connecting' and then performs a warmup RPC call.
 *
 * @returns An async plugin that validates cluster connectivity on init.
 */
export function clusterWarmupPlugin() {
	return async <T extends WarmupInputClient>(client: T): Promise<T> => {
		const { config, runtime, store } = client;
		const logger = createLogger(config.originalConfig.logger);

		store.setState((state) => ({
			...state,
			cluster: {
				...state.cluster,
				status: { status: 'connecting' },
			},
			lastUpdatedAt: now(),
		}));

		try {
			const start = now();
			await runtime.rpc.getLatestBlockhash({ commitment: config.commitment }).send({
				abortSignal: AbortSignal.timeout(10_000),
			});
			const latencyMs = now() - start;

			store.setState((state) => ({
				...state,
				cluster: {
					commitment: config.commitment,
					endpoint: config.endpoint,
					status: { latencyMs, status: 'ready' },
					websocketEndpoint: config.websocketEndpoint,
				},
				lastUpdatedAt: now(),
			}));
		} catch (error) {
			store.setState((state) => ({
				...state,
				cluster: {
					commitment: config.commitment,
					endpoint: config.endpoint,
					status: { error, status: 'error' },
					websocketEndpoint: config.websocketEndpoint,
				},
				lastUpdatedAt: now(),
			}));
			logger({
				data: { endpoint: config.endpoint, ...formatError(error) },
				level: 'warn',
				message: 'cluster warmup failed',
			});
		}

		return client;
	};
}
