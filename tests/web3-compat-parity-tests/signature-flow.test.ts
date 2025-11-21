import { expect, test } from 'vitest';

import { FIXTURES, withProviders } from './parity-helpers';

withProviders('Connection signature parity', (getCtx) => {
	test('getSignatureStatuses normalizes numeric fields', async () => {
		const context = getCtx();
		const response = await context.connection.getSignatureStatuses([FIXTURES.signature]);
		expect(response.context.slot).toBe(Number(FIXTURES.signatureStatus.contextSlot));
		expect(response.value[0]?.confirmations).toBe(Number(FIXTURES.signatureStatus.confirmations));
		expect(response.value[0]?.slot).toBe(Number(FIXTURES.signatureStatus.slot));
	});

	test('sendRawTransaction encodes payload and returns signature', async () => {
		const context = getCtx();
		const payload = Buffer.from([1, 2, 3, 4]);
		const signature = await context.connection.sendRawTransaction(payload, {
			skipPreflight: true,
			maxRetries: 3,
			commitment: 'processed',
		});
		expect(signature).toBe(FIXTURES.signature);
		expect(context.requests.some((call) => call.method === 'sendTransaction')).toBe(true);
	});

	test('confirmTransaction resolves to the signature status', async () => {
		const context = getCtx();
		const result = await context.connection.confirmTransaction(FIXTURES.signature, 'processed');
		expect(result.value?.err).toBeNull();
		expect(result.value?.confirmationStatus).toBe(FIXTURES.signatureStatus.confirmationStatus);
		expect(result.context.slot).toBe(Number(FIXTURES.signatureStatus.contextSlot));
	});
});
