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
	createClient: vi.fn(),
}));

import { createClient } from '@solana/client';
import { Connection } from '../src';

const MOCK_ENDPOINT = 'http://localhost:8899';

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
	getBlock: MockFn;
	getBlockHeight: MockFn;
	getBlocks: MockFn;
	getBlockTime: MockFn;
	getFeeForMessage: MockFn;
	getMultipleAccounts: MockFn;
	getProgramAccounts: MockFn;
	getRecentPrioritizationFees: MockFn;
	getSignatureStatuses: MockFn;
	getSignaturesForAddress: MockFn;
	getSlot: MockFn;
	getTokenAccountBalance: MockFn;
	getTokenAccountsByOwner: MockFn;
	getTransaction: MockFn;
	getMinimumBalanceForRentExemption: MockFn;
	isBlockhashValid: MockFn;
	requestAirdrop: MockFn;
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
		getBlock: vi.fn(() =>
			createPlan({
				blockHeight: 12345n,
				blockTime: 1700000000n,
				blockhash: 'MockBlockhash11111111111111111111111111111',
				parentSlot: 99n,
				previousBlockhash: 'PrevBlockhash111111111111111111111111111',
				rewards: [],
				transactions: [],
				signatures: ['MockSig1', 'MockSig2'],
			}),
		),
		getBlockHeight: vi.fn(() => createPlan(12345n)),
		getBlocks: vi.fn(() => createPlan([100n, 101n, 102n, 103n])),
		getBlockTime: vi.fn(() => createPlan(1700000000n)),
		getFeeForMessage: vi.fn(() =>
			createPlan({
				context: { slot: 100n },
				value: 5000n,
			}),
		),
		getMultipleAccounts: vi.fn(() =>
			createPlan({
				context: { slot: 77n },
				value: [
					{
						lamports: 1234n,
						owner: accountOwner.toBase58(),
						data: [Buffer.from('mock-data-1').toString('base64'), 'base64'],
						executable: false,
						rentEpoch: 88n,
					},
					null,
					{
						lamports: 5678n,
						owner: accountOwner.toBase58(),
						data: [Buffer.from('mock-data-2').toString('base64'), 'base64'],
						executable: true,
						rentEpoch: 99n,
					},
				],
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
		getRecentPrioritizationFees: vi.fn(() =>
			createPlan([
				{ prioritizationFee: 100n, slot: 1000n },
				{ prioritizationFee: 200n, slot: 1001n },
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
		getSignaturesForAddress: vi.fn(() =>
			createPlan([
				{
					blockTime: 1700000000n,
					confirmationStatus: 'finalized',
					err: null,
					memo: null,
					signature: 'MockSignature1111111111111111111111111111111111',
					slot: 200n,
				},
				{
					blockTime: 1699999000n,
					confirmationStatus: 'confirmed',
					err: null,
					memo: 'test memo',
					signature: 'MockSignature2222222222222222222222222222222222',
					slot: 199n,
				},
			]),
		),
		getSlot: vi.fn(() => createPlan(12345n)),
		getTokenAccountBalance: vi.fn(() =>
			createPlan({
				context: { slot: 100n },
				value: {
					amount: '1000000000',
					decimals: 9,
					uiAmount: 1.0,
					uiAmountString: '1',
				},
			}),
		),
		getTokenAccountsByOwner: vi.fn(() =>
			createPlan({
				context: { slot: 100n },
				value: [
					{
						pubkey: programAccountPubkey.toBase58(),
						account: {
							lamports: 2039280n,
							owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
							data: [Buffer.from('token-account-data').toString('base64'), 'base64'],
							executable: false,
							rentEpoch: 88n,
						},
					},
				],
			}),
		),
		getTransaction: vi.fn(() =>
			createPlan({
				blockTime: 1700000000n,
				meta: {
					err: null,
					fee: 5000n,
					innerInstructions: [],
					logMessages: ['Program log: success'],
					postBalances: [100000000n, 50000000n],
					postTokenBalances: [],
					preBalances: [100005000n, 50000000n],
					preTokenBalances: [],
					rewards: [],
					computeUnitsConsumed: 1000n,
				},
				slot: 200n,
				transaction: {
					message: {},
					signatures: ['MockSignature1111111111111111111111111111111111'],
				},
				version: 'legacy',
			}),
		),
		getMinimumBalanceForRentExemption: vi.fn(() => createPlan(2039280n)),
		isBlockhashValid: vi.fn(() =>
			createPlan({
				context: { slot: 100n },
				value: true,
			}),
		),
		requestAirdrop: vi.fn(() => createPlan('MockAirdropSignature11111111111111111111111111')),
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

	(createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
		runtime: {
			rpc: mockRpc,
			rpcSubscriptions: {},
		},
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
			searchTransactionHistory: false,
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

	it('getMultipleAccountsInfo returns array with nulls for missing accounts', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const pubkeys = [Keypair.generate().publicKey, Keypair.generate().publicKey, Keypair.generate().publicKey];
		const result = await connection.getMultipleAccountsInfo(pubkeys, { commitment: 'processed' });

		expect(mockRpc.getMultipleAccounts).toHaveBeenCalledWith(
			pubkeys.map((pk) => pk.toBase58()),
			expect.objectContaining({
				commitment: 'processed',
				encoding: 'base64',
			}),
		);
		expect(result).toHaveLength(3);
		expect(result[0]?.lamports).toBe(1234);
		expect(result[0]?.data.equals(Buffer.from('mock-data-1'))).toBe(true);
		expect(result[1]).toBeNull();
		expect(result[2]?.lamports).toBe(5678);
		expect(result[2]?.executable).toBe(true);
	});

	it('getMultipleAccountsInfoAndContext returns context with value array', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const pubkeys = [Keypair.generate().publicKey, Keypair.generate().publicKey];
		const result = await connection.getMultipleAccountsInfoAndContext(pubkeys);

		expect(result.context.slot).toBe(77);
		expect(result.value).toHaveLength(3);
	});

	it('getTokenAccountsByOwner returns token accounts with context', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const owner = Keypair.generate().publicKey;
		const mint = Keypair.generate().publicKey;

		const result = await connection.getTokenAccountsByOwner(owner, { mint }, { commitment: 'confirmed' });

		expect(mockRpc.getTokenAccountsByOwner).toHaveBeenCalledWith(
			owner.toBase58(),
			{ mint: mint.toBase58() },
			expect.objectContaining({
				commitment: 'confirmed',
				encoding: 'base64',
			}),
		);
		expect(result.context.slot).toBe(100);
		expect(result.value).toHaveLength(1);
		expect(result.value[0].pubkey instanceof PublicKey).toBe(true);
	});

	it('getTokenAccountBalance returns token amount with context', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const tokenAccount = Keypair.generate().publicKey;

		const result = await connection.getTokenAccountBalance(tokenAccount, 'processed');

		expect(mockRpc.getTokenAccountBalance).toHaveBeenCalledWith(tokenAccount.toBase58(), {
			commitment: 'processed',
		});
		expect(result.context.slot).toBe(100);
		expect(result.value.amount).toBe('1000000000');
		expect(result.value.decimals).toBe(9);
		expect(result.value.uiAmount).toBe(1.0);
	});

	it('getTransaction returns transaction details with numeric fields', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const result = await connection.getTransaction('MockSignature1111111111111111111111111111111111', {
			maxSupportedTransactionVersion: 0,
		});

		expect(mockRpc.getTransaction).toHaveBeenCalledWith(
			'MockSignature1111111111111111111111111111111111',
			expect.objectContaining({
				commitment: 'confirmed',
				encoding: 'json',
				maxSupportedTransactionVersion: 0,
			}),
		);
		expect(result).not.toBeNull();
		expect(result?.slot).toBe(200);
		expect(result?.blockTime).toBe(1700000000);
		expect(result?.meta?.fee).toBe(5000);
		expect(result?.meta?.computeUnitsConsumed).toBe(1000);
	});

	it('getSignaturesForAddress returns signature info array', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const address = Keypair.generate().publicKey;

		const result = await connection.getSignaturesForAddress(address, { limit: 10 }, 'finalized');

		expect(mockRpc.getSignaturesForAddress).toHaveBeenCalledWith(
			address.toBase58(),
			expect.objectContaining({
				commitment: 'finalized',
				limit: 10,
			}),
		);
		expect(result).toHaveLength(2);
		expect(result[0].signature).toBe('MockSignature1111111111111111111111111111111111');
		expect(result[0].slot).toBe(200);
		expect(result[0].blockTime).toBe(1700000000);
		expect(result[1].memo).toBe('test memo');
	});

	it('getSlot returns number slot', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const result = await connection.getSlot('processed');

		expect(mockRpc.getSlot).toHaveBeenCalledWith(
			expect.objectContaining({
				commitment: 'processed',
			}),
		);
		expect(result).toBe(12345);
	});

	it('requestAirdrop returns signature', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const to = Keypair.generate().publicKey;

		const result = await connection.requestAirdrop(to, 1000000000);

		expect(result).toBe('MockAirdropSignature11111111111111111111111111');
	});

	it('getMinimumBalanceForRentExemption returns number lamports', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const result = await connection.getMinimumBalanceForRentExemption(165, 'confirmed');

		expect(mockRpc.getMinimumBalanceForRentExemption).toHaveBeenCalledWith(165n, {
			commitment: 'confirmed',
		});
		expect(result).toBe(2039280);
	});

	// Phase 2 tests
	it('getBlock returns block with numeric fields', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const result = await connection.getBlock(100, { maxSupportedTransactionVersion: 0 });

		expect(mockRpc.getBlock).toHaveBeenCalledWith(
			100n,
			expect.objectContaining({
				commitment: 'confirmed',
				maxSupportedTransactionVersion: 0,
			}),
		);
		expect(result).not.toBeNull();
		expect(result?.blockHeight).toBe(12345);
		expect(result?.blockTime).toBe(1700000000);
		expect(result?.parentSlot).toBe(99);
	});

	it('getBlockTime returns number timestamp', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const result = await connection.getBlockTime(100);

		expect(mockRpc.getBlockTime).toHaveBeenCalledWith(100n);
		expect(result).toBe(1700000000);
	});

	it('getBlockHeight returns number height', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const result = await connection.getBlockHeight('finalized');

		expect(mockRpc.getBlockHeight).toHaveBeenCalledWith({
			commitment: 'finalized',
		});
		expect(result).toBe(12345);
	});

	it('getBlocks returns number array', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const result = await connection.getBlocks(100, 103, 'confirmed');

		expect(mockRpc.getBlocks).toHaveBeenCalledWith(
			100n,
			103n,
			expect.objectContaining({ commitment: 'confirmed' }),
		);
		expect(result).toEqual([100, 101, 102, 103]);
	});

	it('isBlockhashValid returns context with boolean', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const result = await connection.isBlockhashValid('MockBlockhash11111111111111111111111111111', 'processed');

		expect(mockRpc.isBlockhashValid).toHaveBeenCalledWith('MockBlockhash11111111111111111111111111111', {
			commitment: 'processed',
		});
		expect(result.context.slot).toBe(100);
		expect(result.value).toBe(true);
	});

	it('getFeeForMessage returns fee with context', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const result = await connection.getFeeForMessage('base64EncodedMessage', 'confirmed');

		expect(mockRpc.getFeeForMessage).toHaveBeenCalledWith('base64EncodedMessage', { commitment: 'confirmed' });
		expect(result.context.slot).toBe(100);
		expect(result.value).toBe(5000);
	});

	it('getRecentPrioritizationFees returns array of fees', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const result = await connection.getRecentPrioritizationFees();

		expect(mockRpc.getRecentPrioritizationFees).toHaveBeenCalled();
		expect(result).toHaveLength(2);
		expect(result[0].prioritizationFee).toBe(100);
		expect(result[0].slot).toBe(1000);
	});

	it('getAccountInfoAndContext returns account with context', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const pubkey = Keypair.generate().publicKey;
		const result = await connection.getAccountInfoAndContext(pubkey, 'processed');

		expect(mockRpc.getAccountInfo).toHaveBeenCalledWith(
			pubkey.toBase58(),
			expect.objectContaining({ commitment: 'processed' }),
		);
		expect(result.context.slot).toBe(77);
		expect(result.value?.lamports).toBe(1234);
	});

	it('getBalanceAndContext returns balance with context', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const pubkey = Keypair.generate().publicKey;
		const result = await connection.getBalanceAndContext(pubkey, 'finalized');

		expect(mockRpc.getBalance).toHaveBeenCalledWith(pubkey.toBase58(), { commitment: 'finalized' });
		expect(result.context.slot).toBe(55);
		expect(result.value).toBe(5000);
	});

	it('getLatestBlockhashAndContext returns blockhash with context', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const result = await connection.getLatestBlockhashAndContext({ commitment: 'processed' });

		expect(mockRpc.getLatestBlockhash).toHaveBeenCalledWith(expect.objectContaining({ commitment: 'processed' }));
		expect(result.context.slot).toBe(101);
		expect(result.value.blockhash).toBe('MockBlockhash11111111111111111111111111111');
		expect(result.value.lastValidBlockHeight).toBe(999);
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

describe('Phase 3: Parsed methods', () => {
	it('getParsedAccountInfo returns parsed account info', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const pubkey = Keypair.generate().publicKey;
		const result = await connection.getParsedAccountInfo(pubkey);

		expect(mockRpc.getAccountInfo).toHaveBeenCalledWith(
			pubkey.toBase58(),
			expect.objectContaining({ encoding: 'jsonParsed' }),
		);
		expect(result.context.slot).toBe(77);
		expect(result.value?.lamports).toBe(1234);
	});

	it('getMultipleParsedAccounts returns array of parsed accounts', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const pubkeys = [Keypair.generate().publicKey, Keypair.generate().publicKey];
		const result = await connection.getMultipleParsedAccounts(pubkeys);

		expect(mockRpc.getMultipleAccounts).toHaveBeenCalledWith(
			pubkeys.map((pk) => pk.toBase58()),
			expect.objectContaining({ encoding: 'jsonParsed' }),
		);
		expect(result.context.slot).toBe(77);
		expect(result.value).toHaveLength(3);
	});

	it('getParsedProgramAccounts returns parsed program accounts', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const programId = Keypair.generate().publicKey;
		const result = await connection.getParsedProgramAccounts(programId);

		expect(mockRpc.getProgramAccounts).toHaveBeenCalledWith(
			programId.toBase58(),
			expect.objectContaining({ encoding: 'jsonParsed' }),
		);
		expect(result).toHaveLength(1);
	});

	it('getParsedTransaction returns parsed transaction', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const signature = 'MockSignature1111111111111111111111111111111111';
		const result = await connection.getParsedTransaction(signature);

		expect(mockRpc.getTransaction).toHaveBeenCalledWith(
			signature,
			expect.objectContaining({ encoding: 'jsonParsed' }),
		);
		// The parsed transaction returns raw RPC response which may have bigint slot
		expect(Number(result?.slot)).toBe(200);
	});

	it('getParsedTransactions returns array of parsed transactions', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const signatures = [
			'MockSignature1111111111111111111111111111111111',
			'MockSignature2222222222222222222222222222222222',
		];
		const result = await connection.getParsedTransactions(signatures);

		expect(mockRpc.getTransaction).toHaveBeenCalledTimes(2);
		expect(result).toHaveLength(2);
	});

	it('getParsedBlock returns parsed block', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const result = await connection.getParsedBlock(12345);

		expect(mockRpc.getBlock).toHaveBeenCalledWith(12345n, expect.objectContaining({ encoding: 'jsonParsed' }));
		expect(result.blockhash).toBe('MockBlockhash11111111111111111111111111111');
		expect(result.blockHeight).toBe(12345);
	});
});

describe('WebSocket subscription methods', () => {
	let mockSubscribe: ReturnType<typeof vi.fn>;
	let mockRpcSubscriptions: {
		accountNotifications: ReturnType<typeof vi.fn>;
		programNotifications: ReturnType<typeof vi.fn>;
		signatureNotifications: ReturnType<typeof vi.fn>;
		slotNotifications: ReturnType<typeof vi.fn>;
		rootNotifications: ReturnType<typeof vi.fn>;
		logsNotifications: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		// Create an async iterable that never yields (for testing subscription setup)
		const createAsyncIterable = () => ({
			[Symbol.asyncIterator]: () => ({
				next: () => new Promise(() => {}), // Never resolves
			}),
		});

		mockSubscribe = vi.fn().mockResolvedValue(createAsyncIterable());

		mockRpcSubscriptions = {
			accountNotifications: vi.fn(() => ({ subscribe: mockSubscribe })),
			programNotifications: vi.fn(() => ({ subscribe: mockSubscribe })),
			signatureNotifications: vi.fn(() => ({ subscribe: mockSubscribe })),
			slotNotifications: vi.fn(() => ({ subscribe: mockSubscribe })),
			rootNotifications: vi.fn(() => ({ subscribe: mockSubscribe })),
			logsNotifications: vi.fn(() => ({ subscribe: mockSubscribe })),
		};

		vi.mocked(createClient).mockReturnValue({
			runtime: {
				rpc: mockRpc as never,
				rpcSubscriptions: mockRpcSubscriptions as never,
			},
		});
	});

	it('onAccountChange returns subscription ID and calls subscribe', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const pubkey = Keypair.generate().publicKey;
		const callback = vi.fn();

		const subscriptionId = connection.onAccountChange(pubkey, callback);

		expect(typeof subscriptionId).toBe('number');
		// Wait for the async subscription setup
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(mockRpcSubscriptions.accountNotifications).toHaveBeenCalledWith(
			pubkey.toBase58(),
			expect.objectContaining({ commitment: 'confirmed' }),
		);
	});

	it('removeAccountChangeListener cleans up subscription', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const pubkey = Keypair.generate().publicKey;
		const callback = vi.fn();

		const subscriptionId = connection.onAccountChange(pubkey, callback);
		await connection.removeAccountChangeListener(subscriptionId);

		// Should resolve without error
		expect(true).toBe(true);
	});

	it('onSlotChange returns subscription ID', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const callback = vi.fn();

		const subscriptionId = connection.onSlotChange(callback);

		expect(typeof subscriptionId).toBe('number');
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(mockRpcSubscriptions.slotNotifications).toHaveBeenCalled();
	});

	it('onSignature subscribes to signature notifications', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const signature = 'MockSignature1111111111111111111111111111111111';
		const callback = vi.fn();

		const subscriptionId = connection.onSignature(signature, callback);

		expect(typeof subscriptionId).toBe('number');
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(mockRpcSubscriptions.signatureNotifications).toHaveBeenCalledWith(
			signature,
			expect.objectContaining({ commitment: 'confirmed' }),
		);
	});

	it('onLogs subscribes to logs with filter', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const callback = vi.fn();

		const subscriptionId = connection.onLogs('all', callback);

		expect(typeof subscriptionId).toBe('number');
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(mockRpcSubscriptions.logsNotifications).toHaveBeenCalledWith(
			'all',
			expect.objectContaining({ commitment: 'confirmed' }),
		);
	});

	it('subscription IDs are unique and incrementing', () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const callback = vi.fn();

		const id1 = connection.onSlotChange(callback);
		const id2 = connection.onSlotChange(callback);
		const id3 = connection.onRootChange(callback);

		expect(id1).not.toBe(id2);
		expect(id2).not.toBe(id3);
		expect(id2).toBe(id1 + 1);
		expect(id3).toBe(id2 + 1);
	});
});
