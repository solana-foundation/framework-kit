// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';

import { createAddress, createSignature } from '../test/fixtures';
import { renderHookWithClient, waitFor } from '../test/utils';

import { useClassifiedTransactions } from './useClassifiedTransactions';

vi.mock('tx-indexer', () => ({
	createIndexer: vi.fn(() => ({
		getTransactions: vi.fn(),
	})),
}));

import { createIndexer } from 'tx-indexer';

function createMockClassifiedTransaction(index: number) {
	return {
		tx: {
			signature: createSignature(index),
			slot: BigInt(1000 + index),
			blockTime: BigInt(Date.now()),
			fee: 5000,
			err: null,
			programIds: ['11111111111111111111111111111111'],
			protocol: null,
		},
		classification: {
			primaryType: 'transfer' as const,
			primaryAmount: {
				token: { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', decimals: 9 },
				amountRaw: '1000000000',
				amountUi: 1.0,
			},
			secondaryAmount: null,
			sender: createAddress(1).toString(),
			receiver: createAddress(2).toString(),
			counterparty: null,
			confidence: 0.95,
		},
		legs: [],
	};
}

describe('useClassifiedTransactions', () => {
	it('returns empty state when no address is provided', async () => {
		const { result } = renderHookWithClient(() => useClassifiedTransactions());

		expect(result.current.transactions).toEqual([]);
		expect(result.current.oldestSignature).toBeNull();
		expect(result.current.hasMore).toBe(false);
	});

	it('fetches classified transactions for an address', async () => {
		const walletAddress = createAddress(1);
		const mockTransactions = [createMockClassifiedTransaction(1), createMockClassifiedTransaction(2)];

		const mockGetTransactions = vi.fn().mockResolvedValue(mockTransactions);
		vi.mocked(createIndexer).mockReturnValue({
			getTransactions: mockGetTransactions,
		} as unknown as ReturnType<typeof createIndexer>);

		const { result } = renderHookWithClient(
			() =>
				useClassifiedTransactions({
					address: walletAddress,
					options: { limit: 10 },
				}),
			{},
		);

		await waitFor(() => {
			expect(result.current.transactions).toHaveLength(2);
		});

		expect(result.current.oldestSignature).toBe(mockTransactions[1].tx.signature);
		expect(result.current.hasMore).toBe(false);
	});

	it('returns hasMore true when result count equals limit', async () => {
		const walletAddress = createAddress(1);
		const mockTransactions = Array.from({ length: 10 }, (_, i) => createMockClassifiedTransaction(i));

		const mockGetTransactions = vi.fn().mockResolvedValue(mockTransactions);
		vi.mocked(createIndexer).mockReturnValue({
			getTransactions: mockGetTransactions,
		} as unknown as ReturnType<typeof createIndexer>);

		const { result } = renderHookWithClient(
			() =>
				useClassifiedTransactions({
					address: walletAddress,
					options: { limit: 10 },
				}),
			{},
		);

		await waitFor(() => {
			expect(result.current.transactions).toHaveLength(10);
		});

		expect(result.current.hasMore).toBe(true);
	});

	it('passes pagination cursor to getTransactions', async () => {
		const walletAddress = createAddress(1);
		const beforeSignature = createSignature(99).toString();
		const mockTransactions = [createMockClassifiedTransaction(100)];

		const mockGetTransactions = vi.fn().mockResolvedValue(mockTransactions);
		vi.mocked(createIndexer).mockReturnValue({
			getTransactions: mockGetTransactions,
		} as unknown as ReturnType<typeof createIndexer>);

		const { result } = renderHookWithClient(
			() =>
				useClassifiedTransactions({
					address: walletAddress,
					options: { limit: 10, before: beforeSignature },
				}),
			{},
		);

		await waitFor(() => {
			expect(result.current.transactions).toHaveLength(1);
		});

		expect(mockGetTransactions).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				before: beforeSignature,
				limit: 10,
			}),
		);
	});

	it('passes filter options to getTransactions', async () => {
		const walletAddress = createAddress(1);

		const mockGetTransactions = vi.fn().mockResolvedValue([]);
		vi.mocked(createIndexer).mockReturnValue({
			getTransactions: mockGetTransactions,
		} as unknown as ReturnType<typeof createIndexer>);

		renderHookWithClient(
			() =>
				useClassifiedTransactions({
					address: walletAddress,
					options: {
						filterSpam: false,
						enrichNftMetadata: false,
						enrichTokenMetadata: false,
					},
				}),
			{},
		);

		await waitFor(() => {
			expect(mockGetTransactions).toHaveBeenCalled();
		});

		expect(mockGetTransactions).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				filterSpam: false,
				enrichNftMetadata: false,
				enrichTokenMetadata: false,
			}),
		);
	});

	it('is disabled when disabled option is true', async () => {
		const walletAddress = createAddress(1);

		const mockGetTransactions = vi.fn().mockResolvedValue([]);
		vi.mocked(createIndexer).mockReturnValue({
			getTransactions: mockGetTransactions,
		} as unknown as ReturnType<typeof createIndexer>);

		const { result } = renderHookWithClient(
			() =>
				useClassifiedTransactions({
					address: walletAddress,
					disabled: true,
				}),
			{},
		);

		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(mockGetTransactions).not.toHaveBeenCalled();
		expect(result.current.transactions).toEqual([]);
	});
});
