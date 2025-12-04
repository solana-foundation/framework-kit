// @vitest-environment jsdom

import type { ClusterUrl, SerializableSolanaState, WalletConnector } from '@solana/client';
import { serializeSolanaState } from '@solana/client';
import type { Address } from '@solana/kit';
import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockSolanaClient } from '../test/mocks';
import { useConnectWallet, useWallet } from './hooks';
import { SolanaProvider } from './SolanaProvider';

const PHANTOM_CONNECTOR: WalletConnector = {
	canAutoConnect: true,
	connect: vi.fn(),
	disconnect: vi.fn(),
	id: 'phantom',
	isSupported: () => true,
	name: 'Phantom',
};

vi.mock('./hooks', async () => {
	const actual = await vi.importActual<typeof import('./hooks')>('./hooks');
	return {
		...actual,
		useConnectWallet: vi.fn(),
		useWallet: vi.fn(),
	};
});

const useWalletMock = useWallet as unknown as vi.Mock;
const useConnectWalletMock = useConnectWallet as unknown as vi.Mock;

describe('SolanaProvider wallet persistence', () => {
	beforeEach(() => {
		useWalletMock.mockReset();
		useConnectWalletMock.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('persists serializable state when the wallet is connected', async () => {
		const storage = createStorage();
		useWalletMock.mockReturnValue({
			connectorId: 'phantom',
			session: {},
			status: 'connected',
		});
		useConnectWalletMock.mockReturnValue(vi.fn());
		const client = createMockSolanaClient({
			connectors: [PHANTOM_CONNECTOR],
			state: {
				cluster: {
					commitment: 'confirmed',
					endpoint: 'https://rpc.test' as ClusterUrl,
					status: { status: 'ready' },
					websocketEndpoint: 'wss://rpc.test' as ClusterUrl,
				},
				wallet: {
					connectorId: 'phantom',
					session: {
						account: {
							address: 'address' as Address,
							publicKey: new Uint8Array(),
						},
						connector: { id: 'phantom', name: 'Phantom' },
						disconnect: async () => undefined,
					},
					status: 'connected',
				},
			},
		});

		render(
			<SolanaProvider client={client} query={false} walletPersistence={{ storage }}>
				<div />
			</SolanaProvider>,
		);

		await waitFor(() => expect(storage.setItem).toHaveBeenCalled());
		const [, serialized] = storage.setItem.mock.calls.at(-1) ?? [];
		const state = JSON.parse(serialized) as SerializableSolanaState;
		expect(state.lastConnectorId).toBe('phantom');
		expect(state.autoconnect).toBe(true);
	});

	it('updates persisted state when the wallet disconnects after storing an id', async () => {
		const storage = createStorage();
		useWalletMock.mockReturnValue({
			status: 'connected',
		});
		useConnectWalletMock.mockReturnValue(vi.fn());
		const client = createMockSolanaClient({
			connectors: [PHANTOM_CONNECTOR],
			state: {
				cluster: {
					commitment: 'confirmed',
					endpoint: 'https://rpc.test' as ClusterUrl,
					status: { status: 'ready' },
					websocketEndpoint: 'wss://rpc.test' as ClusterUrl,
				},
				wallet: {
					connectorId: 'phantom',
					session: {
						account: {
							address: 'address' as Address,
							publicKey: new Uint8Array(),
						},
						connector: { id: 'phantom', name: 'Phantom' },
						disconnect: async () => undefined,
					},
					status: 'connected',
				},
			},
		});

		render(
			<SolanaProvider client={client} query={false} walletPersistence={{ storage }}>
				<div />
			</SolanaProvider>,
		);

		await waitFor(() => expect(storage.setItem).toHaveBeenCalled());
		client.store.setState((prev) => ({
			...prev,
			wallet: { status: 'disconnected' },
		}));

		await waitFor(() => expect(storage.setItem).toHaveBeenCalledTimes(2));
		const [, serialized] = storage.setItem.mock.calls.at(-1) ?? [];
		const state = JSON.parse(serialized) as SerializableSolanaState;
		expect(state.lastConnectorId).toBeNull();
		expect(state.autoconnect).toBe(false);
	});

	it('auto-connects using serialized state by default', async () => {
		const storage = createStorage();
		const serialized = serializeSolanaState({
			autoconnect: true,
			commitment: 'confirmed',
			endpoint: 'https://rpc.test' as ClusterUrl,
			lastConnectorId: 'phantom',
			lastPublicKey: null,
			version: 1,
			websocketEndpoint: 'wss://rpc.test' as ClusterUrl,
		});
		storage.getItem.mockReturnValue(serialized);
		const connect = vi.fn().mockResolvedValue(undefined);
		useConnectWalletMock.mockReturnValue(connect);
		useWalletMock.mockReturnValue({
			status: 'disconnected',
		});

		render(
			<SolanaProvider
				client={createMockSolanaClient({ connectors: [PHANTOM_CONNECTOR] })}
				query={false}
				walletPersistence={{ storage }}
			>
				<div />
			</SolanaProvider>,
		);

		await waitFor(() =>
			expect(connect).toHaveBeenCalledWith('phantom', { autoConnect: true, allowInteractiveFallback: false }),
		);
	});

	it('auto-connects using config initialState when provided', async () => {
		const storage = createStorage();
		const connect = vi.fn().mockResolvedValue(undefined);
		useConnectWalletMock.mockReturnValue(connect);
		useWalletMock.mockReturnValue({
			status: 'disconnected',
		});
		const initialState: SerializableSolanaState = {
			autoconnect: true,
			commitment: 'confirmed',
			endpoint: 'https://rpc.test' as ClusterUrl,
			lastConnectorId: 'phantom',
			lastPublicKey: null,
			version: 1,
			websocketEndpoint: 'wss://rpc.test' as ClusterUrl,
		};

		render(
			<SolanaProvider
				client={createMockSolanaClient({ connectors: [PHANTOM_CONNECTOR] })}
				config={{ endpoint: 'https://rpc.test' as ClusterUrl, initialState }}
				query={false}
				walletPersistence={{ storage }}
			>
				<div />
			</SolanaProvider>,
		);

		await waitFor(() =>
			expect(connect).toHaveBeenCalledWith('phantom', { autoConnect: true, allowInteractiveFallback: false }),
		);
	});

	it('retries auto-connect when a new client with registered connectors is provided', async () => {
		const storage = createStorage();
		const serialized = serializeSolanaState({
			autoconnect: true,
			commitment: 'confirmed',
			endpoint: 'https://rpc.test' as ClusterUrl,
			lastConnectorId: 'phantom',
			lastPublicKey: null,
			version: 1,
			websocketEndpoint: 'wss://rpc.test' as ClusterUrl,
		});
		storage.getItem.mockReturnValue(serialized);
		const connect = vi.fn().mockResolvedValue(undefined);
		useConnectWalletMock.mockReturnValue(connect);
		useWalletMock.mockReturnValue({
			status: 'disconnected',
		});

		const initialClient = createMockSolanaClient({ connectors: [] });
		const nextClient = createMockSolanaClient({ connectors: [PHANTOM_CONNECTOR] });

		const { rerender } = render(
			<SolanaProvider client={initialClient} query={false} walletPersistence={{ storage }}>
				<div />
			</SolanaProvider>,
		);

		expect(connect).not.toHaveBeenCalled();

		rerender(
			<SolanaProvider client={nextClient} query={false} walletPersistence={{ storage }}>
				<div />
			</SolanaProvider>,
		);

		await waitFor(() =>
			expect(connect).toHaveBeenCalledWith('phantom', { autoConnect: true, allowInteractiveFallback: false }),
		);
	});

	it('skips auto-connect when disabled via configuration', async () => {
		const storage = createStorage();
		const serialized = serializeSolanaState({
			autoconnect: false,
			commitment: 'confirmed',
			endpoint: 'https://rpc.test' as ClusterUrl,
			lastConnectorId: 'phantom',
			lastPublicKey: null,
			version: 1,
			websocketEndpoint: 'wss://rpc.test' as ClusterUrl,
		});
		storage.getItem.mockReturnValue(serialized);
		const connect = vi.fn();
		useConnectWalletMock.mockReturnValue(connect);
		useWalletMock.mockReturnValue({
			status: 'disconnected',
		});

		render(
			<SolanaProvider
				client={createMockSolanaClient({ connectors: [PHANTOM_CONNECTOR] })}
				query={false}
				walletPersistence={{ autoConnect: false, storage }}
			>
				<div />
			</SolanaProvider>,
		);

		await waitFor(() => expect(connect).not.toHaveBeenCalled());
	});
});

function createStorage() {
	return {
		getItem: vi.fn().mockReturnValue(null),
		removeItem: vi.fn(),
		setItem: vi.fn(),
	};
}
