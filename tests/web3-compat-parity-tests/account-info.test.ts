import { expect, test } from 'vitest';

import { FIXTURES, withProviders } from './parity-helpers';

withProviders('Connection account parity', (getCtx) => {
	test('getAccountInfo normalizes account fields', async () => {
		const context = getCtx();
		const pubkey = new context.PublicKey(FIXTURES.accountInfo.owner);
		const info = await context.connection.getAccountInfo(pubkey, { commitment: 'processed', encoding: 'base64' });
		expect(info?.lamports).toBe(Number(FIXTURES.accountInfo.lamports));
		expect(info?.executable).toBe(false);
		expect(info?.rentEpoch).toBe(Number(FIXTURES.accountInfo.rentEpoch));
		expect(info?.owner.toBase58()).toBe(FIXTURES.accountInfo.owner);
		expect(info?.data.equals(FIXTURES.accountInfo.data)).toBe(true);
	});

	test('getProgramAccounts returns PublicKey and Buffer instances', async () => {
		const context = getCtx();
		const programId = new context.PublicKey(FIXTURES.programAccount.owner);
		const accounts = await context.connection.getProgramAccounts(programId, {
			commitment: 'processed',
			filters: [{ dataSize: 0 }],
		});
		expect(accounts).toHaveLength(1);
		const [first] = accounts;
		expect(first.pubkey instanceof context.PublicKey).toBe(true);
		expect(first.pubkey.toBase58()).toBe(FIXTURES.programAccount.pubkey);
		expect(first.account.data.equals(FIXTURES.programAccount.data)).toBe(true);
		expect(first.account.lamports).toBe(Number(FIXTURES.programAccount.lamports));
	});
});
