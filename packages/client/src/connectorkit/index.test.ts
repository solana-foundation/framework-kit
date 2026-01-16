import { describe, expect, it, vi } from 'vitest';

const ConnectorClientMock = vi.hoisted(() =>
	vi.fn(() => {
		throw new Error('ConnectorClient should not be constructed in this test.');
	}),
);

vi.mock('@solana/connector/headless', () => ({
	ConnectorClient: ConnectorClientMock,
	getDefaultConfig: vi.fn((config: unknown) => config),
}));

import { connectorKit } from './index';

describe('@solana/client/connectorkit', () => {
	it('is SSR-safe and returns empty connectors when window is unavailable', () => {
		const connectors = connectorKit({ defaultConfig: {} as never });
		expect(ConnectorClientMock).not.toHaveBeenCalled();
		expect(connectors).toHaveLength(0);
		expect(connectors.client).toBeUndefined();
		expect(() => connectors.destroy()).not.toThrow();
	});

	it('respects ConnectorKit readiness in isSupported()', () => {
		const previousWindow = (globalThis as { window?: unknown }).window;
		(globalThis as { window?: unknown }).window = {};

		const client = {
			destroy: vi.fn(),
			getSnapshot: () => ({
				connectors: [
					{ features: [], id: 'wallet-standard:not-ready', name: 'Not Ready', ready: false },
					{ features: [], id: 'wallet-standard:ready', name: 'Ready', ready: true },
				],
			}),
		} as never;

		const connectors = connectorKit({ client });
		expect(connectors).toHaveLength(2);
		expect(connectors[0]?.isSupported()).toBe(false);
		expect(connectors[1]?.isSupported()).toBe(true);

		(globalThis as { window?: unknown }).window = previousWindow;
	});
});
