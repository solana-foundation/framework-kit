import { createWalletRegistry } from '../wallet/registry';
import type { WalletConnector, WalletRegistry } from '../wallet/types';

/**
 * Creates a plugin that attaches wallet connectors to the client.
 *
 * @param connectors - Optional array of wallet connectors.
 * @returns A plugin that adds the wallet registry to the client.
 */
export function connectorsPlugin(connectors?: readonly WalletConnector[]) {
	return <T extends object>(client: T): T & { connectors: WalletRegistry } => {
		const registry: WalletRegistry = createWalletRegistry(connectors ?? []);
		return { ...client, connectors: registry };
	};
}
