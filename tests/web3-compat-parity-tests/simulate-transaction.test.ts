import { expect, test } from 'vitest';

import { FIXTURES, withProviders } from './parity-helpers';

withProviders('Connection simulation parity', (getCtx) => {
	test('simulateTransaction returns logs', async () => {
		const context = getCtx();
		const instruction = new context.TransactionInstruction({
			data: Buffer.alloc(0),
			keys: [],
			programId: new context.PublicKey(FIXTURES.programAccount.owner),
		});
		const TransactionMessageCtor =
			context.TransactionMessage ?? (await import('@solana/web3.js')).TransactionMessage;
		const VersionedTransactionCtor =
			context.VersionedTransaction ?? (await import('@solana/web3.js')).VersionedTransaction;
		const message = new TransactionMessageCtor({
			instructions: [instruction],
			payerKey: new context.PublicKey(FIXTURES.accountInfo.owner),
			recentBlockhash: FIXTURES.latestBlockhash.blockhash,
		}).compileToV0Message();
		const tx = new VersionedTransactionCtor(message);
		const result = await context.connection.simulateTransaction(tx, {
			commitment: 'processed',
			replaceRecentBlockhash: true,
		});
		expect(result.value.logs).toEqual(FIXTURES.simulation.logs);
		expect(context.requests.some((call) => call.method === 'simulateTransaction')).toBe(true);
	});
});
