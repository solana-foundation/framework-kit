// @vitest-environment jsdom

import type { SolanaClient, SolanaClientConfig } from '@solana/client';
import { createClient } from '@solana/client';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockSolanaClient } from '../test/mocks';
import { renderHookWithClient } from '../test/utils';

import { SolanaClientContext, SolanaClientProvider, useSolanaClient } from './context';

vi.mock('@solana/client', async () => {
	const actual = await vi.importActual<typeof import('@solana/client')>('@solana/client');
	return {
		...actual,
		createClient: vi.fn(),
	};
});

const createClientMock = createClient as unknown as ReturnType<typeof vi.fn>;

function createAsyncClientMock(client: ReturnType<typeof createMockSolanaClient>) {
	return Promise.resolve(client);
}

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

	it('creates a client from config and destroys it on unmount', async () => {
		const client = createMockSolanaClient();
		createClientMock.mockReturnValue(createAsyncClientMock(client));

		const config: SolanaClientConfig = {
			endpoint: 'http://localhost:8899',
		};

		// Use useContext directly to avoid the throw in useSolanaClient when client is null
		const { result, unmount } = renderHook(() => useContext(SolanaClientContext), {
			wrapper: ({ children }) => <SolanaClientProvider config={config}>{children}</SolanaClientProvider>,
		});

		expect(createClientMock).toHaveBeenCalledWith(
			expect.objectContaining({
				endpoint: 'http://localhost:8899',
				websocketEndpoint: 'ws://localhost:8899',
			}),
		);

		// Wait for async client to resolve
		await waitFor(() => {
			expect(result.current).toBe(client);
		});

		await act(async () => {
			unmount();
		});

		await waitFor(() => {
			expect(client.destroy).toHaveBeenCalledTimes(1);
		});
	});

	it('creates a default client when neither client nor config is provided and cleans up on unmount', async () => {
		const client = createMockSolanaClient();
		createClientMock.mockReturnValue(createAsyncClientMock(client));

		// Use useContext directly to avoid the throw in useSolanaClient when client is null
		const { result, unmount } = renderHook(() => useContext(SolanaClientContext), {
			wrapper: ({ children }) => <SolanaClientProvider>{children}</SolanaClientProvider>,
		});

		expect(createClientMock).toHaveBeenCalledWith(
			expect.objectContaining({
				endpoint: 'https://api.devnet.solana.com',
				websocketEndpoint: 'wss://api.devnet.solana.com',
			}),
		);

		// Wait for async client to resolve
		await waitFor(() => {
			expect(result.current).toBe(client);
		});

		await act(async () => {
			unmount();
		});

		await waitFor(() => {
			expect(client.destroy).toHaveBeenCalledTimes(1);
		});
	});

	it('throws when useSolanaClient is used outside of a provider', () => {
		expect(() => renderHook(() => useSolanaClient())).toThrowError(
			'useSolanaClient must be used within a SolanaClientProvider.',
		);
	});
});
