import { expect, test } from 'vitest';

import { FIXTURES, withProviders } from './parity-helpers';

withProviders('Connection normalization parity', (getCtx) => {
	test('getLatestBlockhash normalizes commitment and slots', async () => {
		const context = getCtx();
		await context.connection.getLatestBlockhash({
			commitment: 'processed',
			minContextSlot: 12,
			maxSupportedTransactionVersion: 0,
		});
		const request = context.requests.find((call) => call.method === 'getLatestBlockhash');
		const params =
			request && Array.isArray(request.params)
				? (request.params[0] as Record<string, unknown>)
				: (request?.params as Record<string, unknown>);
		expect(params?.commitment).toBe('processed');
		expect(Number(params?.minContextSlot ?? 0)).toBe(12);
		expect(params?.maxSupportedTransactionVersion).toBe(0);
	});

	test('sendRawTransaction forwards normalized options', async () => {
		const context = getCtx();
		const payload = Buffer.from([9, 9, 9, 9]);
		await context.connection.sendRawTransaction(payload, {
			skipPreflight: true,
			maxRetries: 3,
			commitment: 'processed',
		});
		const request = context.requests.find((call) => call.method === 'sendTransaction');
		const params = request?.params as unknown[];
		const options = Array.isArray(params)
			? (params[1] as Record<string, unknown>)
			: (params as Record<string, unknown>);
		expect(options?.skipPreflight).toBe(true);
		expect(Number(options?.maxRetries ?? 0)).toBe(3);
		expect(options?.preflightCommitment ?? options?.commitment).toBe('processed');
	});

	test('default commitment is confirmed when omitted', async () => {
		const context = getCtx();
		await context.connection.getSignatureStatuses([FIXTURES.signature]);
		const signatureRequest = context.requests.find((call) => call.method === 'getSignatureStatuses');
		if (signatureRequest) {
			const params = signatureRequest.params as unknown[];
			const options = Array.isArray(params)
				? (params[1] as Record<string, unknown> | undefined)
				: (params as Record<string, unknown>);
			if (options === undefined) {
				// Some clients omit the options object when using the default commitment.
				expect((context.connection as { commitment?: unknown }).commitment ?? 'confirmed').toBe('confirmed');
			} else {
				expect(options?.commitment ?? (context.connection as { commitment?: unknown }).commitment).toBe(
					'confirmed',
				);
			}
		} else {
			expect((context.connection as { commitment?: unknown }).commitment).toBe('confirmed');
		}
	});
});
