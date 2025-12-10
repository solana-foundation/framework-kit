import { Keypair } from '@solana/web3.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@solana/client', () => ({
	createSolanaRpcClient: vi.fn(),
}));

import { createSolanaRpcClient } from '@solana/client';
import { getUserDomainAddressesExample } from '../../examples/explorer/name-service';
import { Connection } from '../../src';

const MOCK_ENDPOINT = 'http://localhost:8899';
const MOCK_WS_ENDPOINT = 'ws://localhost:8900';

function createPlan<T>(value: T) {
	return {
		send: vi.fn().mockResolvedValue(value),
	};
}

describe('examples/explorer/name-service', () => {
	const programAccountPubkey = Keypair.generate().publicKey;

	beforeEach(() => {
		const mockRpc = {
			getProgramAccounts: vi.fn(() =>
				createPlan([
					{
						pubkey: programAccountPubkey.toBase58(),
						account: {
							lamports: 1234n,
							owner: Keypair.generate().publicKey.toBase58(),
							data: [Buffer.from('program-data').toString('base64'), 'base64'],
							executable: false,
							rentEpoch: 99n,
						},
					},
				]),
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

	it('matches explorer name service example behaviour', async () => {
		const connection = new Connection(MOCK_ENDPOINT);
		const ownerAddress = 'User11111111111111111111111111111111111111';
		const domains = await getUserDomainAddressesExample(connection, ownerAddress);

		expect(domains).toHaveLength(1);
		expect(domains[0]?.equals(programAccountPubkey)).toBe(true);

		const rpc = (createSolanaRpcClient as unknown as ReturnType<typeof vi.fn>).mock.results[0].value.rpc;
		expect(rpc.getProgramAccounts).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				filters: [
					expect.objectContaining({
						memcmp: expect.objectContaining({ offset: 0 }),
					}),
					expect.objectContaining({
						memcmp: expect.objectContaining({ offset: 32 }),
					}),
				],
			}),
		);
	});
});
