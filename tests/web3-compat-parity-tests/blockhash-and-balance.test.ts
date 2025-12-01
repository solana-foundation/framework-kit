import { expect, test } from 'vitest';

import { FIXTURES, withProviders } from './parity-helpers';

withProviders('Connection blockhash and balance parity', (getCtx) => {
	test('getLatestBlockhash returns the expected shape', async () => {
		const context = getCtx();
		const result = await context.connection.getLatestBlockhash({
			commitment: 'processed',
			minContextSlot: 12,
			maxSupportedTransactionVersion: 0,
		});
		expect(result).toEqual({
			blockhash: FIXTURES.latestBlockhash.blockhash,
			lastValidBlockHeight: Number(FIXTURES.latestBlockhash.lastValidBlockHeight),
		});
		expect(context.requests.some((call) => call.method === 'getLatestBlockhash')).toBe(true);
	});

	test('getBalance returns lamports as a number', async () => {
		const context = getCtx();
		const pubkey = new context.PublicKey(FIXTURES.accountInfo.owner);
		const lamports = await context.connection.getBalance(pubkey, 'processed');
		expect(lamports).toBe(Number(FIXTURES.balance.lamports));
		expect(context.requests.some((call) => call.method === 'getBalance')).toBe(true);
	});
});
