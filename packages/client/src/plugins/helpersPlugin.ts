import { createClientHelpers } from '../client/createClientHelpers';
import type { SolanaClientRuntime } from '../rpc/types';
import type { ClientHelpers, ClientStore } from '../types';

type HelpersInputClient = {
	runtime: SolanaClientRuntime;
	store: ClientStore;
};

/**
 * Creates a plugin that attaches helpers to the client.
 *
 * @returns A plugin that adds helpers to the client.
 */
export function helpersPlugin() {
	return <T extends HelpersInputClient>(client: T): T & { helpers: ClientHelpers } => {
		const { runtime, store } = client;
		const helpers = createClientHelpers(runtime, store);

		return { ...client, helpers };
	};
}
