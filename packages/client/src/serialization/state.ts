import type { SerializableSolanaState, SolanaClient, SolanaClientConfig } from '../types';

const SERIALIZABLE_STATE_VERSION = 1;

/**
 * Derive the minimal serializable state for a client based on its config.
 */
export function getInitialSerializableState(config: SolanaClientConfig): SerializableSolanaState {
	return {
		autoconnect: false,
		commitment: config.commitment,
		endpoint: config.endpoint,
		lastConnectorId: null,
		lastPublicKey: null,
		version: SERIALIZABLE_STATE_VERSION,
		websocketEndpoint: config.websocketEndpoint,
	};
}

/**
 * Applies persisted serializable state on top of a base client config.
 *
 * This is a pure helper; it does not mutate the client. Callers can use the returned
 * config object to construct a hydrated client instance.
 */
export function applySerializableState(
	config: SolanaClientConfig,
	state: SerializableSolanaState | null | undefined,
): SolanaClientConfig {
	if (!state) {
		return config;
	}
	return {
		...config,
		commitment: state.commitment ?? config.commitment,
		endpoint: state.endpoint ?? config.endpoint,
		websocketEndpoint: state.websocketEndpoint ?? config.websocketEndpoint,
	};
}

/**
 * Serializes a {@link SerializableSolanaState} to a JSON string.
 */
export function serializeSolanaState(state: SerializableSolanaState): string {
	return JSON.stringify(state);
}

/**
 * Safely deserializes persisted state into a {@link SerializableSolanaState}.
 */
export function deserializeSolanaState(json: string | null | undefined): SerializableSolanaState | null {
	if (!json) return null;
	try {
		const parsed = JSON.parse(json) as Partial<SerializableSolanaState> | unknown;
		if (typeof parsed !== 'object' || parsed === null) return null;
		const state = parsed as Partial<SerializableSolanaState>;
		return {
			autoconnect: state.autoconnect ?? false,
			commitment: state.commitment,
			endpoint: state.endpoint as SerializableSolanaState['endpoint'],
			lastConnectorId: state.lastConnectorId ?? null,
			lastPublicKey: state.lastPublicKey ?? null,
			version: state.version ?? SERIALIZABLE_STATE_VERSION,
			websocketEndpoint: state.websocketEndpoint,
		};
	} catch {
		return null;
	}
}

function getSerializableStateSnapshot(client: SolanaClient): SerializableSolanaState {
	const state = client.store.getState();
	const wallet = state.wallet as typeof state.wallet & { autoConnect?: boolean };
	const autoConnectPreference = wallet.autoConnect;
	let lastConnectorId: string | null = null;
	let lastPublicKey: string | null = null;
	if ('connectorId' in wallet) {
		lastConnectorId = wallet.connectorId ?? null;
		if (wallet.status === 'connected') {
			lastPublicKey = wallet.session.account.address.toString();
		}
	}
	return {
		autoconnect: autoConnectPreference ?? Boolean(lastConnectorId),
		commitment: state.cluster.commitment,
		endpoint: state.cluster.endpoint,
		lastConnectorId,
		lastPublicKey,
		version: SERIALIZABLE_STATE_VERSION,
		websocketEndpoint: state.cluster.websocketEndpoint,
	};
}

/**
 * Subscribes to client state changes and emits a serializable snapshot when relevant fields change.
 */
export function subscribeSolanaState(
	client: SolanaClient,
	listener: (state: SerializableSolanaState) => void,
): () => void {
	let previous = serializeSolanaState(getSerializableStateSnapshot(client));
	listener(JSON.parse(previous) as SerializableSolanaState);
	const unsubscribe = client.store.subscribe(() => {
		const snapshot = getSerializableStateSnapshot(client);
		const serialized = serializeSolanaState(snapshot);
		if (serialized === previous) {
			return;
		}
		previous = serialized;
		listener(snapshot);
	});
	return unsubscribe;
}
