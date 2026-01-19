import { createClientStore, createInitialClientState } from '../client/createClientStore';
import type { ClientStore } from '../types';
import type { ClientWithConfig, StorePluginOptions } from './types';

/**
 * Creates a plugin that attaches a Zustand store to the client.
 *
 * @param options - Optional configuration including an existing store to reuse.
 * @returns A plugin that adds the store to the client.
 */
export function storePlugin(options?: StorePluginOptions) {
	return <T extends ClientWithConfig>(client: T): T & { store: ClientStore } => {
		const { config } = client;
		const originalConfig = config.originalConfig;

		const store: ClientStore =
			options?.existingStore ??
			(originalConfig.createStore
				? originalConfig.createStore(
						createInitialClientState({
							commitment: config.commitment,
							endpoint: config.endpoint,
							websocketEndpoint: config.websocketEndpoint,
						}),
					)
				: createClientStore(
						createInitialClientState({
							commitment: config.commitment,
							endpoint: config.endpoint,
							websocketEndpoint: config.websocketEndpoint,
						}),
					));

		return { ...client, store };
	};
}
