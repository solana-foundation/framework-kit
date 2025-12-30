import { createLogger, formatError } from '../logging/logger';
import { createSolanaRpcClient } from '../rpc/createSolanaRpcClient';
import type { SolanaClientRuntime } from '../rpc/types';
import { applySerializableState } from '../serialization/state';
import type { ClientStore, SolanaClient, SolanaClientConfig } from '../types';
import { now } from '../utils';
import { resolveCluster } from '../utils/cluster';
import { createWalletRegistry } from '../wallet/registry';
import { createActions } from './actions';
import { createClientHelpers } from './createClientHelpers';
import { createClientStore, createInitialClientState } from './createClientStore';
import { createWatchers } from './watchers';

/**
 * Creates a Solana client instance using the provided configuration.
 *
 * @param config - High-level configuration supplied by integrators.
 * @returns Fully initialized {@link SolanaClient} instance.
 */
export function createClient(config: SolanaClientConfig): SolanaClient {
	const hydratedConfig = config.initialState ? applySerializableState(config, config.initialState) : config;
	const resolvedCluster = resolveCluster({
		endpoint: hydratedConfig.rpc ?? hydratedConfig.endpoint,
		moniker: hydratedConfig.cluster,
		websocketEndpoint: hydratedConfig.websocket ?? hydratedConfig.websocketEndpoint,
	});
	const commitment = hydratedConfig.commitment ?? 'confirmed';
	const initialState = createInitialClientState({
		commitment,
		endpoint: resolvedCluster.endpoint,
		websocketEndpoint: resolvedCluster.websocketEndpoint,
	});
	const store: ClientStore = config.createStore ? config.createStore(initialState) : createClientStore(initialState);
	const rpcClient =
		hydratedConfig.rpcClient ??
		createSolanaRpcClient({
			commitment,
			endpoint: resolvedCluster.endpoint,
			websocketEndpoint: resolvedCluster.websocketEndpoint,
		});
	const runtime: SolanaClientRuntime = {
		rpc: rpcClient.rpc,
		rpcSubscriptions: rpcClient.rpcSubscriptions,
	};
	const connectors = createWalletRegistry(hydratedConfig.walletConnectors ?? []);
	const logger = createLogger(hydratedConfig.logger);
	const actions = createActions({ connectors, logger, runtime, store });
	const watchers = createWatchers({ logger, runtime, store });
	const helpers = createClientHelpers(runtime, store);
	store.setState((state) => ({
		...state,
		cluster: {
			...state.cluster,
			status: { status: 'connecting' },
		},
		lastUpdatedAt: now(),
	}));
	actions
		.setCluster(resolvedCluster.endpoint, {
			commitment,
			websocketEndpoint: resolvedCluster.websocketEndpoint,
		})
		.catch((error) =>
			logger({
				data: formatError(error),
				level: 'error',
				message: 'initial cluster setup failed',
			}),
		);
	/**
	 * Resets the client's store back to its initial state.
	 *
	 * @returns Nothing; resets store contents.
	 */
	function destroy(): void {
		store.setState(() => initialState);
	}
	return {
		actions,
		config,
		connectors,
		destroy,
		get helpers() {
			return helpers;
		},
		runtime,
		store,
		get solTransfer() {
			return helpers.solTransfer;
		},
		get SolTransfer() {
			return helpers.solTransfer;
		},
		splToken: helpers.splToken,
		SplToken: helpers.splToken,
		SplHelper: helpers.splToken,
		get stake() {
			return helpers.stake;
		},
		get transaction() {
			return helpers.transaction;
		},
		prepareTransaction: helpers.prepareTransaction,
		watchers,
	};
}
