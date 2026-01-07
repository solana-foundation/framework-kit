// @vitest-environment jsdom

import type { WalletConnector } from '@solana/client';
import { describe, expect, it, vi } from 'vitest';

import { createWalletSession } from '../test/fixtures';
import { renderHookWithClient, waitFor } from '../test/utils';

import { useWalletConnection } from './ui';

function createConnector(id: string): WalletConnector {
	return {
		canAutoConnect: true,
		connect: vi.fn(async () => ({
			account: {
				address: 'Address1111111111111111111111111111111111',
				publicKey: new Uint8Array(),
			},
			connector: { id, name: id },
			disconnect: vi.fn(),
			signMessage: vi.fn(),
		})),
		disconnect: vi.fn(async () => undefined),
		id,
		isSupported: vi.fn(() => true),
		name: `Wallet ${id}`,
	};
}

describe('useWalletConnection', () => {
	it('returns connectors from the client registry', () => {
		const clientConnectors = [createConnector('phantom')];
		const { result } = renderHookWithClient(() => useWalletConnection(), {
			clientOptions: { connectors: clientConnectors },
		});

		expect(result.current.connectors).toEqual(clientConnectors);
	});

	it('prefers explicitly provided connectors over the client registry', () => {
		const clientConnectors = [createConnector('phantom')];
		const providedConnectors = [createConnector('custom')];
		const { result } = renderHookWithClient(() => useWalletConnection({ connectors: providedConnectors }), {
			clientOptions: { connectors: clientConnectors },
		});

		expect(result.current.connectors).toEqual(providedConnectors);
	});

	it('exposes the current connector when a wallet is selected', () => {
		const connector = createConnector('phantom');
		const { result } = renderHookWithClient(() => useWalletConnection(), {
			clientOptions: {
				connectors: [connector],
				state: {
					wallet: {
						connectorId: connector.id,
						session: createWalletSession({ connector }),
						status: 'connected',
					},
				},
			},
		});

		expect(result.current.connectorId).toBe(connector.id);
		expect(result.current.currentConnector).toEqual(connector);
	});

	it('exposes isReady which becomes true after hydration', async () => {
		const { result } = renderHookWithClient(() => useWalletConnection());

		await waitFor(() => {
			expect(result.current.isReady).toBe(true);
		});
	});

	it('returns empty connectors before hydration is complete', async () => {
		const clientConnectors = [createConnector('phantom')];
		const { result } = renderHookWithClient(() => useWalletConnection(), {
			clientOptions: { connectors: clientConnectors },
		});

		// After hydration, connectors should be available
		await waitFor(() => {
			expect(result.current.isReady).toBe(true);
			expect(result.current.connectors).toEqual(clientConnectors);
		});
	});
});
