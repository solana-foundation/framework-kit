import { createInitialClientState } from '../client/createClientStore';
import type { ClientStore } from '../types';
import type { ClientWithConfig } from './types';

type LifetimeInputClient = ClientWithConfig & {
	store: ClientStore;
};

/**
 * Creates a plugin that adds lifecycle management to the client.
 *
 * @returns A plugin that adds destroy() to the client.
 */
export function lifetimePlugin() {
	return <T extends LifetimeInputClient>(client: T): T & { destroy(): void } => {
		const { config, store } = client;
		const connectorsWithCleanup = config.originalConfig.walletConnectors as { destroy?: () => void } | undefined;
		const connectorCleanup = (() => {
			if (!connectorsWithCleanup) return undefined;
			const destroy = connectorsWithCleanup.destroy;
			if (typeof destroy !== 'function') return undefined;
			return () => destroy();
		})();

		const initialState = createInitialClientState({
			commitment: config.commitment,
			endpoint: config.endpoint,
			websocketEndpoint: config.websocketEndpoint,
		});

		function destroy(): void {
			connectorCleanup?.();
			store.setState(() => initialState);
		}

		return { ...client, destroy };
	};
}
