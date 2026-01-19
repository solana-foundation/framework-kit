import { createActions } from '../client/actions';
import { createLogger } from '../logging/logger';
import type { SolanaClientRuntime } from '../rpc/types';
import type { ClientActions, ClientStore } from '../types';
import type { WalletRegistry } from '../wallet/types';
import type { ClientWithConfig } from './types';

type ActionsInputClient = ClientWithConfig & {
	connectors: WalletRegistry;
	runtime: SolanaClientRuntime;
	store: ClientStore;
};

/**
 * Creates a plugin that attaches client actions to the client.
 *
 * @returns A plugin that adds actions to the client.
 */
export function actionsPlugin() {
	return <T extends ActionsInputClient>(client: T): T & { actions: ClientActions } => {
		const { config, connectors, runtime, store } = client;
		const logger = createLogger(config.originalConfig.logger);

		const actions = createActions({
			connectors,
			logger,
			runtime,
			store,
		});

		return { ...client, actions };
	};
}
