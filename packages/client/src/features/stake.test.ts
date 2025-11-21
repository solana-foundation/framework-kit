import { address, type Blockhash, type TransactionSigner } from '@solana/kit';
import { describe, expect, it, vi } from 'vitest';
import type { SolanaClientRuntime } from '../types';
import { createStakeHelper } from './stake';

const ownerSigner: TransactionSigner<string> = {
	address: address('8beY2iKosqhApSsWwJ5JTyxzVnMqxarJbYdrHgRUKYPx'),
} satisfies Partial<TransactionSigner<string>> as TransactionSigner<string>;

const mockRentSend = vi.fn().mockResolvedValue(2_282_880n);
const mockHashSend = vi.fn().mockResolvedValue({
	value: {
		blockhash: 'HyPeRblockHash1111111111111111111111111' as Blockhash,
		lastValidBlockHeight: 123n,
	},
});

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
	});

	it('prepareStake builds a transaction with correct structure', async () => {
		const helper = createStakeHelper(mockRuntime);
		const validatorId = address('he1iusunGwqrNtafDtLdhsUQDFvo13z9sUa36PauBtk');

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
		const validatorId = address('he1iusunGwqrNtafDtLdhsUQDFvo13z9sUa36PauBtk');

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
		const validatorId = address('he1iusunGwqrNtafDtLdhsUQDFvo13z9sUa36PauBtk');
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
});
