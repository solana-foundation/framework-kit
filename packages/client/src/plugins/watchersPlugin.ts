import { createWatchers } from '../client/watchers';
import { createLogger } from '../logging/logger';
import type { SolanaClientRuntime } from '../rpc/types';
import type { ClientStore, ClientWatchers } from '../types';
import type { ClientWithConfig } from './types';

type WatchersInputClient = ClientWithConfig & {
	runtime: SolanaClientRuntime;
	store: ClientStore;
};

/**
 * Creates a plugin that attaches watchers to the client.
 *
 * @returns A plugin that adds watchers to the client.
 */
export function watchersPlugin() {
	return <T extends WatchersInputClient>(client: T): T & { watchers: ClientWatchers } => {
		const { config, runtime, store } = client;
		const logger = createLogger(config.originalConfig.logger);

		const watchers = createWatchers({
			logger,
			runtime,
			store,
		});

		return { ...client, watchers };
	};
}
