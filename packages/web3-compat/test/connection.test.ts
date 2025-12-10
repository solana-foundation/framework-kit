import {
	Keypair,
	PublicKey,
	Transaction,
	TransactionInstruction,
	TransactionMessage,
	VersionedTransaction,
} from '@solana/web3.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@solana/client', () => ({
	createSolanaRpcClient: vi.fn(),
}));

import { createSolanaRpcClient } from '@solana/client';
import { Connection } from '../src';

const MOCK_ENDPOINT = 'http://localhost:8899';
const MOCK_WS_ENDPOINT = 'ws://localhost:8900';

function createPlan<T>(value: T) {
	return {
		send: vi.fn().mockResolvedValue(value),
	};
}

type MockFn = ReturnType<typeof vi.fn>;
type MockRpc = {
	getLatestBlockhash: MockFn;
	getBalance: MockFn;
	getAccountInfo: MockFn;
	getProgramAccounts: MockFn;
	getSignatureStatuses: MockFn;
	sendTransaction: MockFn;
	simulateTransaction: MockFn;
};

let mockRpc: MockRpc;
let accountOwner: PublicKey;
let programAccountOwner: PublicKey;
let programAccountPubkey: PublicKey;

beforeEach(() => {
	accountOwner = Keypair.generate().publicKey;
	programAccountOwner = Keypair.generate().publicKey;
	programAccountPubkey = Keypair.generate().publicKey;

	mockRpc = {
		getLatestBlockhash: vi.fn(() =>
			createPlan({
				context: { slot: 101n },
				value: {
					blockhash: 'MockBlockhash11111111111111111111111111111',
					lastValidBlockHeight: 999n,
				},
			}),
		),
		getBalance: vi.fn(() =>
			createPlan({
				context: { slot: 55n },
				value: 5000n,
			}),
		),
		getAccountInfo: vi.fn(() =>
			createPlan({
				context: { slot: 77n },
				value: {
					lamports: 1234n,
					owner: accountOwner.toBase58(),
					data: [Buffer.from('mock-data').toString('base64'), 'base64'],
					executable: false,
					rentEpoch: 88n,
				},
			}),
		),
		getProgramAccounts: vi.fn(() =>
			createPlan([
				{
					pubkey: programAccountPubkey.toBase58(),
					account: {
						lamports: 5678n,
						owner: programAccountOwner.toBase58(),
						data: [Buffer.from('program-data').toString('base64'), 'base64'],
						executable: true,
						rentEpoch: 99n,
					},
				},
			]),
		),
		getSignatureStatuses: vi.fn(() =>
			createPlan({
				context: { slot: 444n },
				value: [
					{
						err: null,
						confirmations: 2n,
						confirmationStatus: 'confirmed',
						slot: 333n,
					},
				],
			}),
		),
		sendTransaction: vi.fn(() => createPlan('MockSignature1111111111111111111111111111111111')),
		simulateTransaction: vi.fn(() =>
			createPlan({
				value: {
					err: null,
					logs: ['Program log: mock'],
				},
				context: { slot: 22n },
			}),
		),
	};

	(createSolanaRpcClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
		commitment: 'confirmed',
		endpoint: MOCK_ENDPOINT,
		rpc: mockRpc,
		rpcSubscriptions: {},
		sendAndConfirmTransaction: vi.fn(),
		simulateTransaction: vi.fn(),
		websocketEndpoint: MOCK_WS_ENDPOINT,
	});
});

describe('Connection', () => {
	it('maps getLatestBlockhash response to web3.js shape', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const result = await connection.getLatestBlockhash({
			commitment: 'processed',
			minContextSlot: 12,
			maxSupportedTransactionVersion: 0,
		});
		expect(mockRpc.getLatestBlockhash).toHaveBeenCalledWith({
			commitment: 'processed',
			maxSupportedTransactionVersion: 0,
			minContextSlot: 12n,
		});
		expect(result).toEqual({
			blockhash: 'MockBlockhash11111111111111111111111111111',
			lastValidBlockHeight: 999,
		});
	});

	it('getBalance returns number lamports and maps commitment', async () => {
		const connection = new Connection(MOCK_ENDPOINT, 'finalized');
		const pubkey = Keypair.generate().publicKey;
		const lamports = await connection.getBalance(pubkey, 'processed');
		expect(mockRpc.getBalance).toHaveBeenCalledWith(pubkey.toBase58(), { commitment: 'processed' });
		expect(lamports).toBe(5000);
	});

	it('getAccountInfo converts account fields', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const pubkey = Keypair.generate().publicKey;
		const info = await connection.getAccountInfo(pubkey, { commitment: 'processed', encoding: 'base64' });
		expect(mockRpc.getAccountInfo).toHaveBeenCalledWith(pubkey.toBase58(), {
			commitment: 'processed',
			encoding: 'base64',
		});
		expect(info?.lamports).toBe(1234);
		expect(info?.executable).toBe(false);
		expect(info?.rentEpoch).toBe(88);
		expect(info?.owner.toBase58()).toBe(accountOwner.toBase58());
		expect(info?.data.equals(Buffer.from('mock-data'))).toBe(true);
	});

	it('getProgramAccounts maps program results to PublicKey instances', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const programId = Keypair.generate().publicKey;
		const accounts = await connection.getProgramAccounts(programId, {
			commitment: 'processed',
			filters: [{ dataSize: 0 }],
		});
		expect(mockRpc.getProgramAccounts).toHaveBeenCalledWith(
			programId.toBase58(),
			expect.objectContaining({
				commitment: 'processed',
				filters: [{ dataSize: 0 }],
			}),
		);
		expect(accounts).toHaveLength(1);
		expect(accounts[0].pubkey instanceof PublicKey).toBe(true);
		expect(accounts[0].account.data.equals(Buffer.from('program-data'))).toBe(true);
	});

	it('getSignatureStatuses normalizes numeric fields', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const response = await connection.getSignatureStatuses(['MockSignature1111111111111111111111111111111111']);
		expect(mockRpc.getSignatureStatuses).toHaveBeenCalledWith(['MockSignature1111111111111111111111111111111111'], {
			commitment: 'confirmed',
			searchTransactionHistory: undefined,
		});
		expect(response.context.slot).toBe(444);
		expect(response.value[0]?.confirmations).toBe(2);
	});

	it('sendRawTransaction forwards base64 encoded payload', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const payload = Buffer.from([1, 2, 3, 4]);
		const signature = await connection.sendRawTransaction(payload, {
			skipPreflight: true,
			maxRetries: 3,
			commitment: 'processed',
		});
		expect(mockRpc.sendTransaction).toHaveBeenCalledTimes(1);
		const [encoded, options] = mockRpc.sendTransaction.mock.calls[0];
		expect(Buffer.from(encoded, 'base64').equals(payload)).toBe(true);
		expect(options).toEqual({
			encoding: 'base64',
			maxRetries: 3n,
			preflightCommitment: 'processed',
			skipPreflight: true,
		});
		expect(signature).toBe('MockSignature1111111111111111111111111111111111');
	});

	it('confirmTransaction returns signature status shape', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const result = await connection.confirmTransaction(
			'MockSignature1111111111111111111111111111111111',
			'processed',
		);
		expect(mockRpc.getSignatureStatuses).toHaveBeenCalledWith(['MockSignature1111111111111111111111111111111111'], {
			commitment: 'processed',
			searchTransactionHistory: true,
		});
		expect(result.value?.err).toBeNull();
		expect(result.value?.confirmationStatus).toBe('confirmed');
		expect(result.context.slot).toBe(444);
	});

	it('simulateTransaction returns underlying RPC value', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const dummyProgram = Keypair.generate().publicKey;
		const instruction = new TransactionInstruction({
			data: Buffer.alloc(0),
			keys: [],
			programId: dummyProgram,
		});
		const transaction = new Transaction().add(instruction);
		transaction.recentBlockhash = '11111111111111111111111111111111';
		transaction.feePayer = Keypair.generate().publicKey;
		const result = await connection.simulateTransaction(transaction, {
			commitment: 'processed',
			replaceRecentBlockhash: true,
		});
		expect(mockRpc.simulateTransaction).toHaveBeenCalledTimes(1);
		expect(result.value.logs).toEqual(['Program log: mock']);
	});

	it('simulateTransaction supports versioned transactions', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const signer = Keypair.generate();
		const dummyProgram = Keypair.generate().publicKey;
		const instruction = new TransactionInstruction({
			data: Buffer.alloc(0),
			keys: [],
			programId: dummyProgram,
		});
		const message = new TransactionMessage({
			instructions: [instruction],
			payerKey: signer.publicKey,
			recentBlockhash: '11111111111111111111111111111111',
		}).compileToV0Message();
		const tx = new VersionedTransaction(message);
		tx.sign([signer]);
		await connection.simulateTransaction(tx);
		expect(mockRpc.simulateTransaction).toHaveBeenCalledTimes(1);
	});
});

describe('Explorer usage parity', () => {
	const NAME_PROGRAM_ID = Keypair.generate().publicKey;
	const SOL_TLD_AUTHORITY = new PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx');

	async function getFilteredProgramAccounts(
		connection: Connection,
		programId: PublicKey,
		filters: Array<Record<string, unknown>>,
	) {
		const accounts = await connection.getProgramAccounts(programId, { filters });
		return accounts.map(({ account, pubkey }) => ({
			account,
			publicKey: pubkey,
		}));
	}

	async function getUserDomainAddresses(connection: Connection, userAddress: string): Promise<PublicKey[]> {
		const filters = [
			// parent
			{
				memcmp: {
					bytes: SOL_TLD_AUTHORITY.toBase58(),
					offset: 0,
				},
			},
			// owner
			{
				memcmp: {
					bytes: userAddress,
					offset: 32,
				},
			},
		];
		const accounts = await getFilteredProgramAccounts(connection, NAME_PROGRAM_ID, filters);
		return accounts.map((a) => a.publicKey);
	}

	it('invokes getProgramAccounts with explorer filters', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const ownerAddress = 'User11111111111111111111111111111111111111';
		const result = await getUserDomainAddresses(connection, ownerAddress);

		expect(mockRpc.getProgramAccounts).toHaveBeenCalledWith(NAME_PROGRAM_ID.toBase58(), {
			commitment: 'confirmed',
			dataSlice: undefined,
			encoding: undefined,
			filters: [
				{
					memcmp: {
						bytes: SOL_TLD_AUTHORITY.toBase58(),
						offset: 0,
					},
				},
				{
					memcmp: {
						bytes: ownerAddress,
						offset: 32,
					},
				},
			],
			minContextSlot: undefined,
			withContext: false,
		});
		expect(result).toHaveLength(1);
		expect(result[0]?.equals(programAccountPubkey)).toBe(true);
	});
});
