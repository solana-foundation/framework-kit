import { afterEach, beforeEach, describe, vi } from 'vitest';

export type RpcCall = {
	method: string;
	params: unknown;
};

export type ProviderContext = {
	connection: {
		getLatestBlockhash: (...args: unknown[]) => Promise<unknown>;
		getBalance: (...args: unknown[]) => Promise<unknown>;
		getAccountInfo: (...args: unknown[]) => Promise<unknown>;
		getProgramAccounts: (...args: unknown[]) => Promise<unknown>;
		getSignatureStatuses: (...args: unknown[]) => Promise<unknown>;
		sendRawTransaction: (...args: unknown[]) => Promise<unknown>;
		confirmTransaction: (...args: unknown[]) => Promise<unknown>;
		simulateTransaction: (...args: unknown[]) => Promise<unknown>;
	};
	PublicKey: typeof import('@solana/web3.js').PublicKey;
	Keypair: typeof import('@solana/web3.js').Keypair;
	Transaction: typeof import('@solana/web3.js').Transaction;
	TransactionInstruction: typeof import('@solana/web3.js').TransactionInstruction;
	TransactionMessage?: typeof import('@solana/web3.js').TransactionMessage;
	VersionedTransaction: typeof import('@solana/web3.js').VersionedTransaction;
	requests: RpcCall[];
	cleanup?: () => void | Promise<void>;
};

export type Provider = {
	name: string;
	setup: () => Promise<ProviderContext>;
};

export const DUMMY_HTTP_ENDPOINT = 'http://rpc.test';
export const DUMMY_WS_ENDPOINT = 'ws://rpc.test';

export const FIXTURES = {
	latestBlockhash: {
		blockhash: 'CktRuQ2mttgRGkXJtyksdKHjUdc2C4TgDzyB98oEzy8',
		lastValidBlockHeight: 999n,
		slot: 101n,
	},
	balance: {
		lamports: 5_000n,
		slot: 55n,
	},
	accountInfo: {
		lamports: 1_234n,
		owner: '7bVpdrLoxaofxmB7VQgF3ZgHAKSYF2zDR7WuLB4QWozB',
		data: Buffer.from('mock-data'),
		executable: false,
		rentEpoch: 88n,
		slot: 77n,
	},
	programAccount: {
		pubkey: 'CqZyUMg8VvDQVDuTQK17C8S2JjxHBnnd2aqqChHVAv7V',
		owner: '9LbhSQ7vFHG2sPHZJPLviCY1tJ8wb7NpPg86bNPXL6KE',
		data: Buffer.from('program-data'),
		lamports: 5_678n,
		executable: true,
		rentEpoch: 99n,
	},
	signatureStatus: {
		err: null,
		confirmations: 2n,
		confirmationStatus: 'confirmed',
		slot: 333n,
		contextSlot: 444n,
	},
	signature: '2AXDGYSE4f2sz7tvMMzyHvUfcoJmxudvdhBcmiUSo6ijwfYmfZYsKRxboQMPh3R4kUhXRVdtSXFXMheka4Rc4P2',
	simulation: {
		logs: ['Program log: mock'],
		slot: 22n,
	},
};

const clientCoreMocks = vi.hoisted(() => ({
	createSolanaRpcClient: vi.fn(),
}));

vi.mock('@solana/client', () => clientCoreMocks);

function parseRpcRequest(init?: RequestInit): { id: unknown; method: string; params: unknown[] } {
	const rawBody = init?.body;
	const body =
		typeof rawBody === 'string'
			? rawBody
			: rawBody instanceof Uint8Array
				? Buffer.from(rawBody).toString('utf8')
				: (rawBody?.toString?.() ?? '');
	const parsed = body ? JSON.parse(body) : {};
	return { id: parsed.id, method: parsed.method, params: parsed.params ?? [] };
}

export function createWeb3FetchStub(requests: RpcCall[]) {
	return vi.fn(async (_url: string, init?: RequestInit) => {
		const { id, method, params } = parseRpcRequest(init);
		requests.push({ method, params });
		let result: unknown;
		switch (method) {
			case 'getLatestBlockhash':
				result = {
					context: { slot: Number(FIXTURES.latestBlockhash.slot) },
					value: {
						blockhash: FIXTURES.latestBlockhash.blockhash,
						lastValidBlockHeight: Number(FIXTURES.latestBlockhash.lastValidBlockHeight),
					},
				};
				break;
			case 'getBalance':
				result = {
					context: { slot: Number(FIXTURES.balance.slot) },
					value: Number(FIXTURES.balance.lamports),
				};
				break;
			case 'getAccountInfo':
				result = {
					context: { slot: Number(FIXTURES.accountInfo.slot) },
					value: {
						data: [FIXTURES.accountInfo.data.toString('base64'), 'base64'],
						executable: FIXTURES.accountInfo.executable,
						lamports: Number(FIXTURES.accountInfo.lamports),
						owner: FIXTURES.accountInfo.owner,
						rentEpoch: Number(FIXTURES.accountInfo.rentEpoch),
					},
				};
				break;
			case 'getProgramAccounts':
				result = [
					{
						pubkey: FIXTURES.programAccount.pubkey,
						account: {
							data: [FIXTURES.programAccount.data.toString('base64'), 'base64'],
							executable: FIXTURES.programAccount.executable,
							lamports: Number(FIXTURES.programAccount.lamports),
							owner: FIXTURES.programAccount.owner,
							rentEpoch: Number(FIXTURES.programAccount.rentEpoch),
						},
					},
				];
				break;
			case 'getSignatureStatuses':
				result = {
					context: { slot: Number(FIXTURES.signatureStatus.contextSlot) },
					value: [
						{
							err: FIXTURES.signatureStatus.err,
							confirmations: Number(FIXTURES.signatureStatus.confirmations),
							confirmationStatus: FIXTURES.signatureStatus.confirmationStatus,
							slot: Number(FIXTURES.signatureStatus.slot),
						},
					],
				};
				break;
			case 'sendTransaction':
				result = FIXTURES.signature;
				break;
			case 'simulateTransaction':
				result = {
					context: { slot: Number(FIXTURES.simulation.slot) },
					value: {
						err: null,
						logs: FIXTURES.simulation.logs,
					},
				};
				break;
			default:
				throw new Error(`Unexpected RPC method in test stub: ${method}`);
		}
		return new Response(
			JSON.stringify({
				jsonrpc: '2.0',
				id,
				result,
			}),
			{
				status: 200,
				headers: { 'content-type': 'application/json' },
			},
		);
	});
}

export function createPlan<T>(value: T) {
	return {
		send: vi.fn().mockResolvedValue(value),
	};
}

export function createCompatRpcMock(requests: RpcCall[]) {
	return {
		getLatestBlockhash: vi.fn((params?: unknown) => {
			requests.push({ method: 'getLatestBlockhash', params });
			return createPlan({
				context: { slot: FIXTURES.latestBlockhash.slot },
				value: {
					blockhash: FIXTURES.latestBlockhash.blockhash,
					lastValidBlockHeight: FIXTURES.latestBlockhash.lastValidBlockHeight,
				},
			});
		}),
		getBalance: vi.fn((address: string, options?: unknown) => {
			requests.push({ method: 'getBalance', params: [address, options] });
			return createPlan({
				context: { slot: FIXTURES.balance.slot },
				value: FIXTURES.balance.lamports,
			});
		}),
		getAccountInfo: vi.fn((address: string, options?: unknown) => {
			requests.push({ method: 'getAccountInfo', params: [address, options] });
			return createPlan({
				context: { slot: FIXTURES.accountInfo.slot },
				value: {
					data: [FIXTURES.accountInfo.data.toString('base64'), 'base64'] as const,
					executable: FIXTURES.accountInfo.executable,
					lamports: FIXTURES.accountInfo.lamports,
					owner: FIXTURES.accountInfo.owner,
					rentEpoch: FIXTURES.accountInfo.rentEpoch,
				},
			});
		}),
		getProgramAccounts: vi.fn((programId: string, options?: unknown) => {
			requests.push({ method: 'getProgramAccounts', params: [programId, options] });
			return createPlan([
				{
					pubkey: FIXTURES.programAccount.pubkey,
					account: {
						data: [FIXTURES.programAccount.data.toString('base64'), 'base64'] as const,
						executable: FIXTURES.programAccount.executable,
						lamports: FIXTURES.programAccount.lamports,
						owner: FIXTURES.programAccount.owner,
						rentEpoch: FIXTURES.programAccount.rentEpoch,
					},
				},
			]);
		}),
		getSignatureStatuses: vi.fn((signatures: string[], options?: unknown) => {
			requests.push({ method: 'getSignatureStatuses', params: [signatures, options] });
			return createPlan({
				context: { slot: FIXTURES.signatureStatus.contextSlot },
				value: [
					{
						err: FIXTURES.signatureStatus.err,
						confirmations: FIXTURES.signatureStatus.confirmations,
						confirmationStatus: FIXTURES.signatureStatus.confirmationStatus,
						slot: FIXTURES.signatureStatus.slot,
					},
				],
			});
		}),
		sendTransaction: vi.fn((payload: string, options?: unknown) => {
			requests.push({ method: 'sendTransaction', params: [payload, options] });
			return createPlan(FIXTURES.signature);
		}),
		simulateTransaction: vi.fn((payload: string, options?: unknown) => {
			requests.push({ method: 'simulateTransaction', params: [payload, options] });
			return createPlan({
				context: { slot: FIXTURES.simulation.slot },
				value: {
					err: null,
					logs: FIXTURES.simulation.logs,
				},
			});
		}),
	};
}

export function createProviders(): Provider[] {
	return [
		{
			name: '@solana/web3.js',
			setup: async () => {
				const web3 = await import('@solana/web3.js');
				const requests: RpcCall[] = [];
				const fetchStub = createWeb3FetchStub(requests);
				const connection = new web3.Connection(DUMMY_HTTP_ENDPOINT, {
					commitment: 'confirmed',
					fetch: fetchStub,
					wsEndpoint: DUMMY_WS_ENDPOINT,
				});
				const subscriptionStateChange = vi.fn((_id: number, cb: (state: string) => void) => {
					setTimeout(() => cb('subscribed'), 0);
					return () => {};
				});
				const onSignature = vi.fn(
					(_signature: string, callback: (result: unknown, context: { slot: number }) => void) => {
						setTimeout(() => {
							callback(
								{
									err: FIXTURES.signatureStatus.err,
									confirmations: Number(FIXTURES.signatureStatus.confirmations),
									confirmationStatus: FIXTURES.signatureStatus.confirmationStatus,
									slot: Number(FIXTURES.signatureStatus.slot),
								},
								{ slot: Number(FIXTURES.signatureStatus.contextSlot) },
							);
						}, 0);
						return 1;
					},
				);
				const removeSignatureListener = vi.fn(async () => {});
				(connection as unknown as { onSignature: typeof onSignature }).onSignature = onSignature;
				(
					connection as unknown as { _onSubscriptionStateChange: typeof subscriptionStateChange }
				)._onSubscriptionStateChange = subscriptionStateChange;
				(
					connection as unknown as { removeSignatureListener: typeof removeSignatureListener }
				).removeSignatureListener = removeSignatureListener;
				return {
					connection,
					Keypair: web3.Keypair,
					PublicKey: web3.PublicKey,
					Transaction: web3.Transaction,
					TransactionInstruction: web3.TransactionInstruction,
					TransactionMessage: web3.TransactionMessage,
					VersionedTransaction: web3.VersionedTransaction,
					requests,
					cleanup: () => {
						vi.resetAllMocks();
						vi.resetModules();
					},
				};
			},
		},
		{
			name: '@solana/web3-compat',
			setup: async () => {
				const requests: RpcCall[] = [];
				const rpc = createCompatRpcMock(requests);
				clientCoreMocks.createSolanaRpcClient.mockReturnValue({
					commitment: 'confirmed',
					endpoint: DUMMY_HTTP_ENDPOINT,
					websocketEndpoint: DUMMY_WS_ENDPOINT,
					rpc,
					rpcSubscriptions: {},
					sendAndConfirmTransaction: vi.fn(),
					simulateTransaction: vi.fn(),
				});
				const compat = await import('@solana/web3-compat');
				const connection = new compat.Connection(DUMMY_HTTP_ENDPOINT, 'confirmed');
				return {
					connection,
					Keypair: compat.Keypair,
					PublicKey: compat.PublicKey,
					Transaction: compat.Transaction,
					TransactionInstruction: compat.TransactionInstruction,
					TransactionMessage: undefined,
					VersionedTransaction: compat.VersionedTransaction,
					requests,
					cleanup: () => {
						clientCoreMocks.createSolanaRpcClient.mockReset();
						vi.resetAllMocks();
						vi.resetModules();
					},
				};
			},
		},
	];
}

export function withProviders(title: string, register: (getCtx: () => ProviderContext) => void) {
	const providers = createProviders();
	describe.each(providers)(`%s ${title}`, ({ name: _name, setup }) => {
		let ctx: ProviderContext | undefined;

		const getCtx = () => {
			if (!ctx) {
				throw new Error('Test context was not initialized');
			}
			return ctx;
		};

		beforeEach(async () => {
			ctx = await setup();
		});

		afterEach(async () => {
			await ctx?.cleanup?.();
			ctx = undefined;
		});

		register(getCtx);
	});
}
