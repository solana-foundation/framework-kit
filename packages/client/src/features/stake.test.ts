import { address, type Base58EncodedBytes, type Blockhash, type TransactionSigner } from '@solana/kit';
import { describe, expect, it, vi } from 'vitest';
import type { SolanaClientRuntime } from '../types';
import { createStakeHelper, type StakeAccount } from './stake';

const VALIDATOR_ID = 'he1iusunGwqrNtafDtLdhsUQDFvo13z9sUa36PauBtk';
const WALLET = address('8beY2iKosqhApSsWwJ5JTyxzVnMqxarJbYdrHgRUKYPx');

const ownerSigner: TransactionSigner<string> = {
	address: WALLET,
} satisfies Partial<TransactionSigner<string>> as TransactionSigner<string>;

const mkStakeAccount = (voter: string): StakeAccount => ({
	pubkey: address('StakeAccount1111111111111111111111111111111'),
	account: {
		data: {
			parsed: {
				info: {
					stake: {
						delegation: {
							voter,
							stake: '1000000000',
							activationEpoch: '0',
							deactivationEpoch: '18446744073709551615',
						},
					},
					meta: {
						rentExemptReserve: '2282880',
						authorized: {
							staker: WALLET,
							withdrawer: WALLET,
						},
						lockup: {
							unixTimestamp: 0,
							epoch: 0,
							custodian: '11111111111111111111111111111111',
						},
					},
				},
			},
		},
		lamports: 1_000_000_000n,
	},
});

const VALIDATOR_STAKE_ACC = mkStakeAccount(VALIDATOR_ID);
const OTHER_STAKE_ACC = mkStakeAccount('Vote111111111111111111111111111111111111111');

const mockRentSend = vi.fn().mockResolvedValue(2_282_880n);
const mockHashSend = vi.fn().mockResolvedValue({
	value: {
		blockhash: 'HyPeRblockHash1111111111111111111111111' as Blockhash,
		lastValidBlockHeight: 123n,
	},
});
const mockProgramAccountsSend = vi.fn().mockResolvedValue([VALIDATOR_STAKE_ACC, OTHER_STAKE_ACC]);

const mockRpc = {
	getMinimumBalanceForRentExemption: vi.fn().mockReturnValue({
		send: mockRentSend,
	}),
	getLatestBlockhash: vi.fn().mockReturnValue({
		send: mockHashSend,
	}),
	sendTransaction: vi.fn().mockReturnValue({
		send: vi.fn().mockResolvedValue('mockSignature123'),
	}),
	getProgramAccounts: vi.fn().mockReturnValue({
		send: mockProgramAccountsSend,
	}),
};

const mockRuntime = {
	rpc: mockRpc,
	rpcSubscriptions: {},
} as unknown as SolanaClientRuntime;

describe('createStakeHelper', () => {
	it('creates a stake helper with correct methods', () => {
		const helper = createStakeHelper(mockRuntime);

		expect(helper).toBeDefined();
		expect(typeof helper.prepareStake).toBe('function');
		expect(typeof helper.sendPreparedStake).toBe('function');
		expect(typeof helper.sendStake).toBe('function');
		expect(typeof helper.getStakeAccounts).toBe('function');
	});

	it('prepareStake builds a transaction with correct structure', async () => {
		const helper = createStakeHelper(mockRuntime);
		const validatorId = address(VALIDATOR_ID);

		const prepared = await helper.prepareStake({
			amount: 1_000_000_000n, // 1 SOL
			authority: ownerSigner,
			validatorId,
		});

		expect(prepared).toBeDefined();
		expect(prepared.message).toBeDefined();
		expect(prepared.signer).toBe(ownerSigner);
		expect(prepared.mode).toBe('partial');
		expect(prepared.stakeAccount).toBeDefined();
		expect(prepared.lifetime).toBeDefined();
		expect(mockRpc.getMinimumBalanceForRentExemption).toHaveBeenCalledWith(BigInt(200));
		expect(mockRpc.getLatestBlockhash).toHaveBeenCalled();
	});

	it('handles different amount formats', async () => {
		const helper = createStakeHelper(mockRuntime);
		const validatorId = address(VALIDATOR_ID);

		// Test with number
		const prepared1 = await helper.prepareStake({
			amount: 1000000000, // 1 SOL as number
			authority: ownerSigner,
			validatorId,
		});
		expect(prepared1).toBeDefined();

		// Test with string
		const prepared2 = await helper.prepareStake({
			amount: '1000000000', // 1 SOL as string
			authority: ownerSigner,
			validatorId,
		});
		expect(prepared2).toBeDefined();
	});

	it('uses provided lifetime if available', async () => {
		const helper = createStakeHelper(mockRuntime);
		const validatorId = address(VALIDATOR_ID);
		const customLifetime = {
			blockhash: 'CustomBlockhash11111111111111111111111' as Blockhash,
			lastValidBlockHeight: 456n,
		};

		mockRpc.getLatestBlockhash.mockClear();

		const prepared = await helper.prepareStake({
			amount: 1_000_000_000n,
			authority: ownerSigner,
			validatorId,
			lifetime: customLifetime,
		});

		expect(prepared.lifetime).toBe(customLifetime);
		expect(mockRpc.getLatestBlockhash).not.toHaveBeenCalled();
	});

	it('getStakeAccounts returns all stake accounts for a wallet', async () => {
		const helper = createStakeHelper(mockRuntime);

		const accounts = await helper.getStakeAccounts(WALLET);

		expect(mockRpc.getProgramAccounts).toHaveBeenCalledWith(
			'Stake11111111111111111111111111111111111111',
			expect.objectContaining({
				encoding: 'jsonParsed',
				filters: [
					{
						memcmp: {
							offset: 44n,
							bytes: String(WALLET) as Base58EncodedBytes,
							encoding: 'base58',
						},
					},
				],
			}),
		);

		expect(accounts).toEqual([VALIDATOR_STAKE_ACC, OTHER_STAKE_ACC]);
	});

	it('getStakeAccounts filters by validator ID when provided', async () => {
		const helper = createStakeHelper(mockRuntime);

		const accounts = await helper.getStakeAccounts(WALLET, VALIDATOR_ID);

		expect(mockRpc.getProgramAccounts).toHaveBeenCalled();
		expect(accounts).toEqual([VALIDATOR_STAKE_ACC]);
		expect(accounts).toHaveLength(1);
	});

	it('getStakeAccounts works with Address type', async () => {
		const helper = createStakeHelper(mockRuntime);
		const validatorAddress = address(VALIDATOR_ID);

		const accounts = await helper.getStakeAccounts(WALLET, validatorAddress);

		expect(accounts).toEqual([VALIDATOR_STAKE_ACC]);
	});

	it('getStakeAccounts returns empty array when no matches', async () => {
		mockProgramAccountsSend.mockResolvedValueOnce([OTHER_STAKE_ACC]);
		const helper = createStakeHelper(mockRuntime);

		const accounts = await helper.getStakeAccounts(WALLET, VALIDATOR_ID);

		expect(accounts).toEqual([]);
	});
});
