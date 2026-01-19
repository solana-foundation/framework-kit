import { afterEach, describe, expect, it, vi } from 'vitest';

import type { SolanaRpcClient } from '../rpc/createSolanaRpcClient';
import type { SolanaClientConfig } from '../types';
import { createClient } from './createClient';

type Logger = ReturnType<ReturnType<typeof createLoggerMock>>;

type Helpers = ReturnType<typeof createClientHelpersMock>;

const createActionsMock = vi.hoisted(() =>
	vi.fn(() => ({
		setCluster: vi.fn().mockResolvedValue(undefined),
		connectWallet: vi.fn(),
		disconnectWallet: vi.fn(),
		fetchAccount: vi.fn(),
		fetchBalance: vi.fn(),
		fetchLookupTable: vi.fn(),
		fetchLookupTables: vi.fn(),
		fetchNonceAccount: vi.fn(),
		requestAirdrop: vi.fn(),
		sendTransaction: vi.fn(),
	})),
);
const createWatchersMock = vi.hoisted(() =>
	vi.fn(() => ({
		watchAccount: vi.fn(),
		watchBalance: vi.fn(),
		watchSignature: vi.fn(),
	})),
);
const createClientHelpersMock = vi.hoisted(() =>
	vi.fn(() => ({
		solTransfer: { tag: 'sol-helper' },
		splToken: vi.fn(),
		stake: { tag: 'stake-helper' },
		transaction: { tag: 'transaction-helper' },
		wsol: { tag: 'wsol-helper' },
		prepareTransaction: vi.fn(),
	})),
);
const createWalletRegistryMock = vi.hoisted(() =>
	vi.fn(() => ({
		all: [{ id: 'wallet' }],
		get: vi.fn(),
	})),
);
const createLoggerMock = vi.hoisted(() => vi.fn(() => vi.fn()));
const formatErrorMock = vi.hoisted(() => vi.fn((error: unknown) => ({ formatted: error })));
const nowMock = vi.hoisted(() => vi.fn(() => 111));
const mockRpc = {
	getLatestBlockhash: vi.fn(() => ({
		send: vi.fn().mockResolvedValue({ value: { blockhash: 'test' } }),
	})),
};
const createSolanaRpcClientMock = vi.hoisted(() =>
	vi.fn(
		() =>
			({
				commitment: 'confirmed',
				endpoint: 'https://rpc.example',
				rpc: mockRpc,
				rpcSubscriptions: { tag: 'sub' },
				sendAndConfirmTransaction: vi.fn(),
				simulateTransaction: vi.fn(),
				websocketEndpoint: 'wss://rpc.example',
			}) satisfies SolanaRpcClient,
	),
);

vi.mock('../rpc/createSolanaRpcClient', () => ({
	createSolanaRpcClient: createSolanaRpcClientMock,
}));

vi.mock('../logging/logger', () => ({
	createLogger: createLoggerMock,
	formatError: formatErrorMock,
}));

vi.mock('./actions', () => ({
	createActions: createActionsMock,
}));

vi.mock('./watchers', () => ({
	createWatchers: createWatchersMock,
}));

vi.mock('./createClientHelpers', () => ({
	createClientHelpers: createClientHelpersMock,
}));

vi.mock('../wallet/registry', () => ({
	createWalletRegistry: createWalletRegistryMock,
}));

vi.mock('../utils', async (original) => {
	const actual = await original();
	return {
		...actual,
		now: nowMock,
	};
});

afterEach(() => {
	vi.clearAllMocks();
});

describe('createClient', () => {
	const config: SolanaClientConfig = {
		endpoint: 'https://rpc.example',
		commitment: 'finalized',
		walletConnectors: [
			{ id: 'wallet', name: 'Wallet', connect: vi.fn(), disconnect: vi.fn(), isSupported: () => true },
		],
	};

	it('instantiates the client with runtime wiring and helpers', async () => {
		const client = await createClient(config);

		expect(createSolanaRpcClientMock).toHaveBeenCalledWith({
			commitment: 'finalized',
			endpoint: 'https://rpc.example',
			websocketEndpoint: 'wss://rpc.example',
		});
		expect(createWalletRegistryMock).toHaveBeenCalledWith(config.walletConnectors);
		expect(createActionsMock).toHaveBeenCalled();
		expect(createWatchersMock).toHaveBeenCalled();
		expect(createClientHelpersMock).toHaveBeenCalled();

		const helpers = createClientHelpersMock.mock.results[0].value as Helpers;
		expect(client.helpers.transaction).toEqual({ tag: 'transaction-helper' });
		expect(client.solTransfer).toEqual({ tag: 'sol-helper' });
		expect(client.splToken).toBe(helpers.splToken);
		expect(client.SplToken).toBe(helpers.splToken);

		client.destroy();
		expect(client.store.getState().cluster.status).toEqual({ status: 'idle' });
	});

	it('calls walletConnectors.destroy() when destroying the client', async () => {
		const destroyWalletConnectors = vi.fn();
		const walletConnectors = Object.assign([...config.walletConnectors!], {
			destroy: destroyWalletConnectors,
		});

		const client = await createClient({
			...config,
			walletConnectors: walletConnectors as never,
		});

		client.destroy();
		expect(destroyWalletConnectors).toHaveBeenCalledTimes(1);
	});

	it('respects a provided rpcClient instance', async () => {
		const rpcClient = {
			commitment: 'processed',
			endpoint: 'https://rpc.example',
			rpc: mockRpc,
			rpcSubscriptions: { tag: 'external-sub' },
			sendAndConfirmTransaction: vi.fn(),
			simulateTransaction: vi.fn(),
			websocketEndpoint: 'wss://rpc.example',
		} satisfies SolanaRpcClient;

		await createClient({
			...config,
			commitment: 'processed',
			rpcClient,
		});

		expect(createSolanaRpcClientMock).not.toHaveBeenCalled();
	});

	it('applies initialState overrides to config', async () => {
		const state = {
			autoconnect: false,
			commitment: 'processed' as const,
			endpoint: 'https://rpc.state' as const,
			lastConnectorId: null,
			lastPublicKey: null,
			version: 1,
			websocketEndpoint: 'wss://rpc.state' as const,
		};

		const client = await createClient({
			...config,
			endpoint: 'https://rpc.config',
			initialState: state,
		});

		expect(createSolanaRpcClientMock).toHaveBeenCalledWith({
			commitment: 'processed',
			endpoint: 'https://rpc.state',
			websocketEndpoint: 'wss://rpc.state',
		});

		expect(client.config.endpoint).toBe('https://rpc.state');
		expect(client.config.commitment).toBe('processed');
	});

	it('logs warnings when cluster warmup fails', async () => {
		const logger = vi.fn();
		createLoggerMock.mockReturnValue(logger as Logger);

		const failingRpc = {
			getLatestBlockhash: vi.fn(() => ({
				send: vi.fn().mockRejectedValue(new Error('boom')),
			})),
		};

		createSolanaRpcClientMock.mockReturnValueOnce({
			commitment: 'confirmed',
			endpoint: 'https://rpc.example',
			rpc: failingRpc,
			rpcSubscriptions: { tag: 'sub' },
			sendAndConfirmTransaction: vi.fn(),
			simulateTransaction: vi.fn(),
			websocketEndpoint: 'wss://rpc.example',
		} as unknown as SolanaRpcClient);

		const client = await createClient(config);

		expect(logger).toHaveBeenCalledWith(
			expect.objectContaining({
				level: 'warn',
				message: 'cluster warmup failed',
			}),
		);

		expect(client.store.getState().cluster.status.status).toBe('error');
	});
});
