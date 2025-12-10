// @vitest-environment jsdom

import type { SolanaClientConfig } from '@solana/client';
import { createClient } from '@solana/client';
import { render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockSolanaClient } from '../test/mocks';
import { renderHookWithClient } from '../test/utils';

import { SolanaClientProvider, useSolanaClient } from './context';

vi.mock('@solana/client', async () => {
	const actual = await vi.importActual<typeof import('@solana/client')>('@solana/client');
	return {
		...actual,
		createClient: vi.fn(),
	};
});

const createClientMock = createClient as unknown as vi.MockedFunction<typeof createClient>;

describe('SolanaClientProvider', () => {
	beforeEach(() => {
		createClientMock.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('reuses the provided client instance and does not destroy it on unmount', () => {
		const client = createMockSolanaClient();
		const { result, unmount } = renderHookWithClient(() => useSolanaClient(), { client });

		expect(result.current).toBe(client);
		expect(createClientMock).not.toHaveBeenCalled();

		unmount();
		expect(client.destroy).not.toHaveBeenCalled();
	});

	it('creates a client from config and destroys it on unmount', () => {
		const client = createMockSolanaClient();
		createClientMock.mockReturnValue(client);

		const config: SolanaClientConfig = {
			endpoint: 'http://localhost:8899',
		};

		const { unmount } = render(
			<SolanaClientProvider config={config}>
				<TestConsumer />
			</SolanaClientProvider>,
		);

		expect(createClientMock).toHaveBeenCalledWith(
			expect.objectContaining({
				endpoint: 'http://localhost:8899',
				websocketEndpoint: 'ws://localhost:8899',
			}),
		);

		unmount();
		expect(client.destroy).toHaveBeenCalledTimes(1);
	});

	it('creates a default client when neither client nor config is provided and cleans up on unmount', () => {
		const client = createMockSolanaClient();
		createClientMock.mockReturnValue(client);

		const { unmount } = render(
			<SolanaClientProvider>
				<TestConsumer />
			</SolanaClientProvider>,
		);

		expect(createClientMock).toHaveBeenCalledWith(
			expect.objectContaining({
				endpoint: 'https://api.devnet.solana.com',
				websocketEndpoint: 'wss://api.devnet.solana.com',
			}),
		);

		unmount();
		expect(client.destroy).toHaveBeenCalledTimes(1);
	});

	it('throws when useSolanaClient is used outside of a provider', () => {
		expect(() => renderHook(() => useSolanaClient())).toThrowError(
			'useSolanaClient must be used within a SolanaClientProvider.',
		);
	});
});

function TestConsumer() {
	useSolanaClient();
	return null;
}
