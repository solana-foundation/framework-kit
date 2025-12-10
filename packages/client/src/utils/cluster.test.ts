import { describe, expect, it } from 'vitest';

import { resolveCluster } from './cluster';

describe('resolveCluster', () => {
	it('defaults to devnet when no endpoint is provided', () => {
		const resolved = resolveCluster({});
		expect(resolved.moniker).toBe('devnet');
		expect(resolved.endpoint).toBe('https://api.devnet.solana.com');
		expect(resolved.websocketEndpoint).toBe('wss://api.devnet.solana.com');
	});

	it('infers websocket endpoint from http endpoint', () => {
		const resolved = resolveCluster({ endpoint: 'http://127.0.0.1:8899' });
		expect(resolved.moniker).toBe('custom');
		expect(resolved.endpoint).toBe('http://127.0.0.1:8899');
		expect(resolved.websocketEndpoint).toBe('ws://127.0.0.1:8899');
	});

	it('maps monikers to known endpoints', () => {
		const resolved = resolveCluster({ moniker: 'mainnet' });
		expect(resolved.endpoint).toBe('https://api.mainnet-beta.solana.com');
		expect(resolved.websocketEndpoint).toBe('wss://api.mainnet-beta.solana.com');
	});
});
